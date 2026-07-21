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
import { z } from "zod";
import type { ServerConfig } from "./types/index.js";

const PrefixSchema = z
  .string()
  .min(1)
  .transform((p) => (p.startsWith("/") ? p : `/${p}`));

const EnvSchema = z.object({
  CDN_PORT: z.coerce.number().int().min(1).max(65535).default(3300),
  CDN_MONGO_URI: z.string().default("mongodb://localhost:27017/cdn"),
  CDN_CACHE_MAX_SIZE: z.coerce
    .number()
    .int()
    .positive()
    .default(128 * 1024 * 1024),
  CDN_CACHE_MAX_ENTRY_SIZE: z.coerce
    .number()
    .int()
    .positive()
    .default(2 * 1024 * 1024),
  CDN_PREFIX: PrefixSchema.default("/cdn"),
  CDN_API_PREFIX: PrefixSchema.default("/api"),
  CDN_GRAYSCALE_HEADER: z.string().min(1).default("x-use-gray"),
  CDN_GRAYSCALE_COOKIE_PREFIX: z.string().min(1).default("cdn_gray_"),
  CDN_WORKSPACE_ROOT: z.string().min(1).default("../"),
});

/**
 * Load server configuration from environment variables.
 * Environment variables take precedence over defaults.
 * Empty-string variables are treated as unset (defaults apply).
 * Throws with a readable message when a variable is invalid (e.g. CDN_PORT=abc).
 */
export function loadConfig(): ServerConfig {
  const rawEnv: Record<string, string> = {};
  for (const key of Object.keys(EnvSchema.shape)) {
    const value = process.env[key];
    if (value !== undefined && value !== "") rawEnv[key] = value;
  }

  const parsed = EnvSchema.safeParse(rawEnv);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration — ${details}`);
  }
  const env = parsed.data;

  return {
    port: env.CDN_PORT,
    mongoUri: env.CDN_MONGO_URI,
    cacheMaxSize: env.CDN_CACHE_MAX_SIZE,
    cacheMaxEntrySize: env.CDN_CACHE_MAX_ENTRY_SIZE,
    cdnPrefix: env.CDN_PREFIX,
    apiPrefix: env.CDN_API_PREFIX,
    grayscaleHeader: env.CDN_GRAYSCALE_HEADER.toLowerCase(),
    grayscaleCookiePrefix: env.CDN_GRAYSCALE_COOKIE_PREFIX,
    workspaceRoot: path.resolve(process.cwd(), env.CDN_WORKSPACE_ROOT),
  };
}
