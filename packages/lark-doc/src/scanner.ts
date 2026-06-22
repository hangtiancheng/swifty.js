/**
 * Recursive docs directory scanner.
 *
 * Walks the filesystem to discover .md files, extracts frontmatter
 * and headings from each, and produces DocRoute entries.
 */
import fs from "node:fs";
import path from "node:path";
import type { DocRoute, PageData } from "./types";
import { extractFrontmatter } from "./markdown/frontmatter";
import { deriveTitleFromPath } from "./utils/derive-title";
import {
  extractFirstHeading,
  extractHeadings,
} from "./utils/heading-extraction";

const IGNORED_PREFIXES = ["_", "."];
const IGNORED_DIRS = new Set([
  "node_modules",
  "__tests__",
  "__fixtures__",
  ".git",
  ".vitepress",
  ".lark-doc",
  "dist",
]);

/**
 * Recursively scan a docs directory and return route entries.
 *
 * Routing rules:
 * - Files/dirs starting with `_` or `.` are skipped
 * - `index.md` maps to the directory root (e.g. `/guide/`)
 * - Other `.md` files map to their stem (e.g. `/guide/config`)
 * - Files with `draft: true` in frontmatter are excluded when `excludeDrafts` is set
 */
export function scanDocsDir(
  docsDir: string,
  baseUrl: string,
  options?: { excludeDrafts?: boolean },
): DocRoute[] {
  const routes: DocRoute[] = [];
  const normalizedBase = normalizeBase(baseUrl);

  function walk(dir: string, prefix: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return; // directory doesn't exist or not readable
    }

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
      const routePath = stem === "index" ? `${prefix}/` : `${prefix}/${stem}`;
      const fullRoutePath = normalizedBase + routePath.replace(/^\//, "");
      const viewId = generateViewId(routePath);

      // Read and parse
      const raw = fs.readFileSync(fullPath, "utf-8");
      const { data: frontmatter, content } = extractFrontmatter(raw);

      if (options?.excludeDrafts && frontmatter["draft"]) continue;

      const relativePath = path.relative(docsDir, fullPath);

      const pageData: PageData = {
        title:
          (frontmatter["title"] as string) ||
          extractFirstHeading(content) ||
          deriveTitleFromPath(relativePath),
        description: frontmatter["description"] as string | undefined,
        sidebarPosition: frontmatter["sidebar_position"] as number | undefined,
        sidebarLabel: frontmatter["sidebar_label"] as string | undefined,
        sidebarGroup: frontmatter["sidebar_group"] as string | undefined,
        draft: frontmatter["draft"] as boolean | undefined,
        headings: extractHeadings(content),
        relativePath,
        lastUpdated: fs.statSync(fullPath).mtimeMs,
      };

      routes.push({
        path: fullRoutePath,
        viewId,
        filePath: fullPath,
        pageData,
      });
    }
  }

  walk(docsDir, "");
  return routes;
}

function normalizeBase(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/+$/, "");
  return trimmed ? trimmed + "/" : "/";
}

function generateViewId(routePath: string): string {
  return (
    routePath
      .replace(/^\//, "")
      .replace(/\/$/, "-index")
      .replace(/\//g, "-")
      .replace(/[^a-zA-Z0-9-]/g, "") || "index"
  );
}
