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
 * URL route parser for CDN requests.
 * Supports two formats:
 *   /:projectName/*filePath           → no explicit version
 *   /:projectName@:version/*filePath  → explicit version in URL
 */
import type { ParsedRoute } from "../types/index.js";

// Pattern: /projectName[@version]/filePath
const ROUTE_PATTERN =
  /^\/([a-zA-Z0-9][a-zA-Z0-9_-]*)(?:@([a-zA-Z0-9._-]+))?\/(.*)$/;

/**
 * Parse a CDN request URL path.
 * @param urlPath - The request URL path (e.g., "/admin-system@js/app.js")
 * @param cdnPrefix - The CDN route prefix (e.g., "/cdn")
 * @returns ParsedRoute or undefined if the path doesn't match
 */
export function parseRoute(
  urlPath: string,
  cdnPrefix: string,
): ParsedRoute | undefined {
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
