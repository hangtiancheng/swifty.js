/**
 * URL route parser for CDN requests.
 * Supports two formats:
 *   /:projectName/*filePath           → no explicit version
 *   /:projectName@:version/*filePath  → explicit version in URL
 */
import type { ParsedRoute } from "../types/index.js";

// Pattern: /projectName[@version]/filePath
const ROUTE_PATTERN = /^\/([a-zA-Z0-9][a-zA-Z0-9_-]*)(?:@([a-zA-Z0-9._-]+))?\/(.*)$/;

/**
 * Parse a CDN request URL path.
 * @param urlPath - The request URL path (e.g., "/admin-system@js/app.js")
 * @param cdnPrefix - The CDN route prefix (e.g., "/cdn")
 * @returns ParsedRoute or undefined if the path doesn't match
 */
export function parseRoute(urlPath: string, cdnPrefix: string): ParsedRoute | undefined {
  const prefix = cdnPrefix.startsWith("/") ? cdnPrefix : `/${cdnPrefix}`;
  if (!urlPath.startsWith(prefix)) return undefined;
  const pathWithoutPrefix = urlPath.slice(prefix.length);

  const match = ROUTE_PATTERN.exec(pathWithoutPrefix);
  if (match === null) return undefined;

  const [, projectName, explicitVersion, filePath] = match;
  if (projectName === undefined) return undefined;

  return {
    projectName,
    explicitVersion: explicitVersion ?? undefined,
    filePath: filePath ?? "",
  };
}
