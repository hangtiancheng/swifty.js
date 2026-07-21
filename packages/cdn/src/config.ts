/**
 * Server configuration.
 * Reads from environment variables with sensible defaults.
 */
import path from "node:path";
import type { ServerConfig } from "./types/index.js";

const defaultConfig: ServerConfig = {
  port: 3300,
  mongoUri: "mongodb://localhost:27017/cdn",
  cacheMaxSize: 128 * 1024 * 1024, // 128 MB
  cacheMaxEntrySize: 2 * 1024 * 1024, // 2 MB
  cdnPrefix: "/cdn",
  apiPrefix: "/api",
  grayscaleHeader: "x-use-gray",
  grayscaleCookiePrefix: "cdn_gray_",
  workspaceRoot: "../",
};

/**
 * Load server configuration from environment variables.
 * Environment variables take precedence over defaults.
 */
export function loadConfig(): ServerConfig {
  const env = process.env;

  return {
    port:
      env["CDN_PORT"] !== undefined
        ? parseInt(env["CDN_PORT"], 10)
        : defaultConfig.port,

    mongoUri: env["CDN_MONGO_URI"] ?? defaultConfig.mongoUri,

    cacheMaxSize:
      env["CDN_CACHE_MAX_SIZE"] !== undefined
        ? parseInt(env["CDN_CACHE_MAX_SIZE"], 10)
        : defaultConfig.cacheMaxSize,

    cacheMaxEntrySize:
      env["CDN_CACHE_MAX_ENTRY_SIZE"] !== undefined
        ? parseInt(env["CDN_CACHE_MAX_ENTRY_SIZE"], 10)
        : defaultConfig.cacheMaxEntrySize,

    cdnPrefix: env["CDN_PREFIX"] ?? defaultConfig.cdnPrefix,

    apiPrefix: env["CDN_API_PREFIX"] ?? defaultConfig.apiPrefix,

    grayscaleHeader:
      env["CDN_GRAYSCALE_HEADER"] ?? defaultConfig.grayscaleHeader,

    grayscaleCookiePrefix:
      env["CDN_GRAYSCALE_COOKIE_PREFIX"] ?? defaultConfig.grayscaleCookiePrefix,

    workspaceRoot: path.resolve(
      process.cwd(),
      env["CDN_WORKSPACE_ROOT"] ?? defaultConfig.workspaceRoot,
    ),
  };
}
