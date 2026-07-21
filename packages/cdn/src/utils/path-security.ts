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
 * Path security utilities.
 * Prevents path traversal attacks when serving files from disk.
 */
import path from "node:path";

/**
 * Resolve a file path within a base directory and verify it doesn't escape.
 * @param baseDir - The allowed base directory (e.g., distPath)
 * @param filePath - The relative file path from the request
 * @returns The safe absolute path, or undefined if traversal detected
 */
export function resolveSafePath(baseDir: string, filePath: string): string | undefined {
  // Normalize the base directory
  const normalizedBase = path.resolve(baseDir);

  // Resolve the file path relative to the base directory
  const resolved = path.resolve(normalizedBase, filePath);

  // Verify the resolved path is still under the base directory
  if (!resolved.startsWith(normalizedBase + path.sep) && resolved !== normalizedBase) {
    return undefined;
  }

  return resolved;
}

/**
 * Check if a path has a file extension (used for SPA fallback detection).
 * @param filePath - The file path to check
 * @returns true if the path has a file extension
 */
export function hasFileExtension(filePath: string): boolean {
  const basename = path.basename(filePath);
  return basename.includes(".");
}

/**
 * Normalize a URL file path for cache-key purposes: collapse duplicate
 * slashes and "." segments, strip leading slashes. "a//b", "./a/b" and
 * "a/b" all map to the same key. Returns "" for the dist root.
 */
export function normalizeFilePath(filePath: string): string {
  if (filePath === "") return "";
  const normalized = path.posix.normalize(filePath).replace(/^\/+/, "");
  return normalized === "." ? "" : normalized;
}

/**
 * Build a cache key from project, version, and file path.
 * Format: "projectName@version:filePath"
 */
export function buildCacheKey(
  projectName: string,
  version: string,
  filePath: string,
): `${string}@${string}:${string}` {
  return `${projectName}@${version}:${filePath}`;
}
