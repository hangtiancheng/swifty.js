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
