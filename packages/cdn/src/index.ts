/**
 * Copyright 2026 hangtiancheng
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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

  const shutdown = async (): Promise<void> => {
    logger.info("Shutting down...");
    server.close();
    await stopFileWatcher();
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
