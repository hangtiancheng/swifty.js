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

  const { app, cache } = createApp(config);

  startFileWatcher(cache);
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
