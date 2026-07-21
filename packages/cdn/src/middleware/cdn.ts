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

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { createReadStream } from "node:fs";
import type { Context, Next } from "koa";
import mime from "mime-types";
import { Cache, ByteView } from "@swifty.js/cache";
import type { CacheKey, ServerConfig } from "../types/index.js";
import { getProjectConfig } from "../services/config-store.js";
import { parseRoute } from "../utils/route-parser.js";
import { resolveVersion } from "../utils/grayscale.js";
import {
  resolveSafePath,
  hasFileExtension,
  normalizeFilePath,
  buildCacheKey,
} from "../utils/path-security.js";
import {
  PrefixIndex,
  serializeCacheEntry,
  deserializeCacheEntry,
} from "../services/cache-utils.js";
import type { CacheEntry } from "../types/index.js";

const HASHED_FILE_RE = /[.-][a-f0-9]{8,}\.\w+$/;

// Memoizes deserialization per stored ByteView so cache hits skip the
// JSON.parse on every request. Entries vanish with the ByteView on eviction.
const entryMemo = new WeakMap<ByteView, CacheEntry>();

function getCachedEntry(view: ByteView): CacheEntry {
  let entry = entryMemo.get(view);
  if (entry === undefined) {
    entry = deserializeCacheEntry(view);
    entryMemo.set(view, entry);
  }
  return entry;
}

function computeETag(content: Buffer): string {
  return `"${crypto.createHash("md5").update(content).digest("hex")}"`;
}

function computeWeakETag(size: number, mtimeMs: number): string {
  return `W/"${size.toString(16)}-${Math.round(mtimeMs).toString(16)}"`;
}

/** RFC 9110 If-None-Match: supports "*", comma-separated lists, weak tags. */
function etagMatches(ifNoneMatch: string, etag: string): boolean {
  if (ifNoneMatch === "") return false;
  if (ifNoneMatch.trim() === "*") return true;
  const opaque = etag.replace(/^W\//, "");
  return ifNoneMatch.split(",").some((tag) => tag.trim().replace(/^W\//, "") === opaque);
}

function getCacheControl(filePath: string): string {
  const basename = path.basename(filePath);
  if (basename === "index.html" || basename === "index.htm") {
    return "no-cache";
  }
  if (HASHED_FILE_RE.test(basename)) {
    return "public, max-age=31536000, immutable";
  }
  return "public, max-age=3600";
}

export function createCdnMiddleware(
  cache: Cache,
  prefixIndex: PrefixIndex,
  config: ServerConfig,
): (ctx: Context, next: Next) => Promise<void> {
  const serveCached = (ctx: Context, entry: CacheEntry, version: string, source: string): void => {
    ctx.set("Content-Type", entry.contentType);
    ctx.set("Cache-Control", entry.cacheControl);
    ctx.set("ETag", entry.etag);
    ctx.set("X-Cache", "HIT-MEMORY");
    ctx.set("X-CDN-Version", version);
    ctx.set("X-Resolution-Source", source);
    if (etagMatches(ctx.get("If-None-Match"), entry.etag)) {
      ctx.status = 304;
      return;
    }
    ctx.body = entry.content;
  };

  return async (ctx: Context, next: Next): Promise<void> => {
    const parsed = parseRoute(ctx.path, config.cdnPrefix);
    if (parsed === undefined) {
      return next();
    }

    // Preflight is handled by the global CORS middleware; guard plain OPTIONS.
    if (ctx.method === "OPTIONS") {
      ctx.status = 204;
      return;
    }

    const { projectName, explicitVersion, filePath } = parsed;

    const projectConfig = getProjectConfig(projectName);
    if (projectConfig === undefined) {
      ctx.status = 404;
      ctx.body = { error: `Project "${projectName}" not found` };
      return;
    }

    const headers: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(ctx.headers)) {
      headers[key] = typeof value === "string" ? value : undefined;
    }

    const resolved = resolveVersion(
      projectConfig,
      explicitVersion,
      headers,
      config.grayscaleHeader,
      config.grayscaleCookiePrefix,
    );
    if (resolved === undefined) {
      ctx.status = 404;
      ctx.body = { error: `No available version for project "${projectName}"` };
      return;
    }

    const versionConfig = resolved.config;
    const normalizedPath = normalizeFilePath(filePath);

    const safePath = resolveSafePath(versionConfig.distPath, normalizedPath);
    if (safePath === undefined) {
      ctx.status = 403;
      ctx.body = { error: "Path traversal detected" };
      return;
    }

    // L1 cache lookup with the normalized request path
    const cacheKey: CacheKey = buildCacheKey(projectName, versionConfig.version, normalizedPath);
    const [cachedView, found] = cache.get(cacheKey);
    if (found && cachedView !== null) {
      serveCached(ctx, getCachedEntry(cachedView), versionConfig.version, resolved.source);
      return;
    }

    // Disk read with SPA fallback
    let finalPath: string | undefined = safePath;
    let statResult: { size: number; mtimeMs: number } | undefined;

    try {
      const stat = await fs.stat(safePath);
      if (stat.isDirectory()) {
        const indexPath = path.resolve(safePath, "index.html");
        try {
          const indexStat = await fs.stat(indexPath);
          finalPath = indexPath;
          statResult = { size: indexStat.size, mtimeMs: indexStat.mtimeMs };
        } catch {
          finalPath = undefined;
        }
      } else {
        statResult = { size: stat.size, mtimeMs: stat.mtimeMs };
      }
    } catch {
      if (!hasFileExtension(normalizedPath)) {
        const indexPath = resolveSafePath(versionConfig.distPath, "index.html");
        if (indexPath !== undefined) {
          try {
            const indexStat = await fs.stat(indexPath);
            finalPath = indexPath;
            statResult = {
              size: indexStat.size,
              mtimeMs: indexStat.mtimeMs,
            };
          } catch {
            finalPath = undefined;
          }
        }
      } else {
        finalPath = undefined;
      }
    }

    if (finalPath === undefined || statResult === undefined) {
      ctx.status = 404;
      ctx.body = { error: `File not found: ${filePath}` };
      return;
    }

    // Cache under the canonical resolved path so every SPA route that falls
    // back to index.html shares one entry instead of caching N copies.
    const canonicalPath = normalizeFilePath(
      path.relative(versionConfig.distPath, finalPath).split(path.sep).join("/"),
    );
    const canonicalKey: CacheKey = buildCacheKey(projectName, versionConfig.version, canonicalPath);
    if (canonicalKey !== cacheKey) {
      const [fallbackView, fallbackFound] = cache.get(canonicalKey);
      if (fallbackFound && fallbackView !== null) {
        serveCached(ctx, getCachedEntry(fallbackView), versionConfig.version, resolved.source);
        return;
      }
    }

    const contentType = mime.lookup(finalPath) || "application/octet-stream";
    const cacheControl = getCacheControl(finalPath);

    ctx.set("Content-Type", contentType);
    ctx.set("Content-Length", statResult.size.toString());
    ctx.set("Cache-Control", cacheControl);
    ctx.set("Last-Modified", new Date(statResult.mtimeMs).toUTCString());
    ctx.set("X-CDN-Version", versionConfig.version);
    ctx.set("X-Resolution-Source", resolved.source);

    if (statResult.size < config.cacheMaxEntrySize) {
      const content = await fs.readFile(finalPath);
      const etag = computeETag(content);

      ctx.set("ETag", etag);
      ctx.set("X-Cache", "MISS");

      const entry: CacheEntry = {
        content,
        contentType,
        cacheControl,
        etag,
        cachedAt: Date.now(),
        size: statResult.size,
      };
      const serialized = serializeCacheEntry(entry);
      cache.add(canonicalKey, new ByteView(serialized));
      prefixIndex.add(canonicalKey);

      if (etagMatches(ctx.get("If-None-Match"), etag)) {
        ctx.status = 304;
        return;
      }
      ctx.body = content;
    } else {
      const etag = computeWeakETag(statResult.size, statResult.mtimeMs);
      ctx.set("ETag", etag);
      ctx.set("X-Cache", "MISS-STREAM");

      if (etagMatches(ctx.get("If-None-Match"), etag)) {
        ctx.status = 304;
        return;
      }
      ctx.body = createReadStream(finalPath);
    }
  };
}
