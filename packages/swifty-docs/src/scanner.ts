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
 * Recursive docs directory scanner.
 *
 * Walks the filesystem to discover .md files, extracts frontmatter
 * and headings from each, and produces DocsRoute entries.
 *
 * Routing rules (no trailing slashes):
 * - Files/dirs starting with `_` or `.` are skipped
 * - `index.md` maps to the directory path without trailing slash
 *   (e.g. root index → "/docs", subdir index → "/docs/guide")
 * - Other `.md` files map to their stem (e.g. "/docs/guide/config")
 * - Directories without `index.md` get a virtual index route that
 *   points to the first page (by sidebar_position or filename order).
 */
import fs from "node:fs";
import path from "node:path";
import type { DocsRoute, PageData } from "./types";
import { extractFrontmatter } from "./markdown/frontmatter";
import { buildPageData } from "./utils/page-data";
import { getFirstRoute } from "./utils/route-sorting";

const IGNORED_PREFIXES = ["_", "."];
// Dot- and underscore-prefixed names are already skipped by
// IGNORED_PREFIXES, so only plain directory names belong here.
const IGNORED_DIRS = new Set(["node_modules", "dist"]);

interface DirInfo {
  hasIndex: boolean;
  children: DocsRoute[];
}

/**
 * Recursively scan a docs directory and return route entries.
 */
export function scanDocsDir(docsDir: string, baseUrl: string): DocsRoute[] {
  const routes: DocsRoute[] = [];
  const base = normalizeBase(baseUrl); // "/swifty-cli" or "/"
  const effectiveBase = base === "/" ? "" : base;

  // Track directory info for virtual index route generation.
  // Key: directory prefix (e.g. "", "/guide", "/markdown").
  const dirInfoMap = new Map<string, DirInfo>();

  function getOrCreateDirInfo(prefix: string): DirInfo {
    if (!dirInfoMap.has(prefix)) {
      dirInfoMap.set(prefix, { hasIndex: false, children: [] });
    }
    return dirInfoMap.get(prefix)!;
  }

  function walk(dir: string, prefix: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return; // directory doesn't exist or not readable
    }

    // readdir order is filesystem-dependent; sort by codepoint so route
    // and sidebar-group order is stable across platforms, machines, and
    // locales (localeCompare varies with ICU data).
    entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

    for (const entry of entries) {
      if (IGNORED_PREFIXES.some((p) => entry.name.startsWith(p))) continue;
      if (IGNORED_DIRS.has(entry.name)) continue;

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath, `${prefix}/${entry.name}`);
        continue;
      }

      if (!entry.name.endsWith(".md")) continue;

      const stem = entry.name.replace(/\.md$/, "");
      const isIndex = stem === "index";
      // routeSegment: "" for root index, "/guide" for subdir index,
      // "/ch1" for root file, "/guide/config" for subdir file
      const routeSegment = isIndex ? prefix : `${prefix}/${stem}`;
      // Explicit precedence: `+` binds tighter than `||`, so the original
      // `effectiveBase + routeSegment || "/"` was technically correct but
      // relied on implicit precedence. Make it obvious.
      const computedPath = effectiveBase + routeSegment;
      const fullRoutePath = computedPath || "/";

      // Read and parse
      const raw = fs.readFileSync(fullPath, "utf-8");
      const { data: frontmatter, content } = extractFrontmatter(raw);

      const relativePath = path.relative(docsDir, fullPath);
      const pageData: PageData = buildPageData(
        frontmatter,
        content,
        relativePath,
      );

      const route: DocsRoute = {
        path: fullRoutePath,
        filePath: fullPath,
        pageData,
        ...(frontmatter["protected"] === true ? { isProtected: true } : {}),
      };

      routes.push(route);

      // Track directory membership for virtual index generation
      const info = getOrCreateDirInfo(prefix);
      if (isIndex) {
        info.hasIndex = true;
      } else {
        info.children.push(route);
      }
    }
  }

  walk(docsDir, "");

  // Generate virtual index routes for directories without index.md.
  // These routes point to the first page (by sidebar_position or filename)
  // so that /docs/markdown serves content even without markdown/index.md.
  for (const [prefix, info] of dirInfoMap) {
    if (info.hasIndex) continue;
    if (info.children.length === 0) continue;

    // Non-empty children guarantee getFirstRoute returns a route.
    const firstRoute = getFirstRoute(info.children)!;

    const routeSegment = prefix; // treated as index
    const computedPath = effectiveBase + routeSegment;
    const fullRoutePath = computedPath || "/";

    const virtualRoute: DocsRoute = {
      path: fullRoutePath,
      filePath: firstRoute.filePath,
      pageData: firstRoute.pageData,
      isDirectoryIndex: true,
    };

    routes.push(virtualRoute);
  }

  // Detect route collisions (e.g. guide.md + guide/index.md both map to
  // "/guide"). The generated loaders object keys by path, so the last
  // entry silently wins — warn instead of failing so builds keep working.
  const seenPaths = new Map<string, string>();
  for (const r of routes) {
    const prev = seenPaths.get(r.path);
    if (prev !== undefined && prev !== r.filePath) {
      console.warn(
        `[@swifty.js/docs] route collision: "${r.path}" is produced by both ` +
          `${prev} and ${r.filePath} — the latter wins. Rename one of them.`,
      );
    }
    seenPaths.set(r.path, r.filePath);
  }

  return routes;
}

/**
 * Normalize baseUrl to NOT have a trailing slash.
 * "/swifty-cli/" → "/swifty-cli", "/docs/" → "/docs", "/" → "/"
 */
function normalizeBase(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/+$/, "");
  return trimmed || "/";
}
