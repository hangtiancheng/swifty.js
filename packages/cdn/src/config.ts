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
