/**
 * Copyright (c) 2026 hangtiancheng
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import type { Server } from "node:http";
import mongoose from "mongoose";
import { loadConfig } from "./config.js";
import { createApp } from "./app.js";
import { refreshConfig } from "./services/config-store.js";
import { startFileWatcher, stopFileWatcher } from "./services/file-watcher.js";
import { logger } from "./utils/logger.js";

async function main(): Promise<void> {
  const config = loadConfig();

  logger.info({ uri: config.mongoUri }, "Connecting to MongoDB");
  await mongoose.connect(config.mongoUri);
  logger.info("MongoDB connected");

  await refreshConfig();
  logger.info("Config loaded into memory");

  const { app, cache, prefixIndex } = createApp(config);

  startFileWatcher(cache, prefixIndex);
  logger.info("File watcher started");

  const server: Server = app.listen(config.port, () => {
    logger.info(
      { port: config.port, cdn: config.cdnPrefix, api: config.apiPrefix },
      "Server running",
    );
  });

  let shuttingDown = false;
  const shutdown = async (): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info("Shutting down...");
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
      server.closeAllConnections?.();
    });
    await stopFileWatcher();
    cache.close();
    await mongoose.disconnect();
    logger.info("Shutdown complete");
    process.exit(0);
  };

  process.on("SIGTERM", () => void shutdown());
  process.on("SIGINT", () => void shutdown());
}

main().catch((err: unknown) => {
  logger.fatal(err, "Failed to start");
  process.exit(1);
});
