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
 * Type-safe configuration helper with automatic route generation.
 *
 * Scans the docs directory, generates sidebar, and writes a runtime module
 * to `.swifty-docs/generated/` so that `boot.ts` can import routes and site
 * data via the `@swifty-docs/generated` alias.
 *
 * The generated file is a plain `.js` runtime module. Type declarations for
 * `@swifty-docs/generated` are provided by `src/shims.d.ts` (ambient module
 * declaration), so IDE type-checking works without a generated `.d.ts` file.
 *
 * Usage:
 * ```ts
 * import { defineConfig } from "@swifty.js/docs";
 *
 * export default defineConfig({
 *   docs: "docs",
 *   baseUrl: "/docs/",
 *   title: "My Library",
 * });
 * ```
 *
 * The optional second argument `projectRoot` controls path resolution
 * for the `docs` directory and the generated output. Defaults to
 * `process.cwd()`, which is the project root in most Vite
 * setups.
 */
import type { DocsConfig, NavItem, SidebarConfig, SidebarItem } from "./types";
import { scanDocsDir } from "./scanner";
import { generateSidebar } from "./sidebar-generator";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ejs from "ejs";

const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);

const fileContentTemplate = readFileSync(
  resolve(_dirname, "file-content.ejs"),
  "utf-8",
);

export function defineConfig(
  config: DocsConfig,
  projectRoot: string = process.cwd(),
): DocsConfig {
  generateRoutesFile(config, projectRoot);
  return config;
}

/**
 * Prefix an internal link with the site baseUrl.
 *
 * Idempotent and conservative: external URLs (`https://…`), protocol-relative
 * URLs, hash links, and links already carrying the baseUrl prefix are
 * returned unchanged, so existing configs that hand-wrote the prefix keep
 * working. Relative paths ("guide/intro") are treated as site paths and made
 * absolute — left relative, the browser would resolve them against the
 * CURRENT page and every click would append another segment.
 */
function joinBase(baseUrl: string, link: string): string {
  if (!link) return link;
  if (/^[a-z][a-z0-9+.-]*:/i.test(link)) return link;
  if (link.startsWith("//") || link.startsWith("#")) return link;
  const abs = link.startsWith("/") ? link : "/" + link;
  const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  if (base === "" || base === "/") return abs;
  if (abs === base || abs.startsWith(base + "/")) return abs;
  return base + abs;
}

function prefixNavItems(baseUrl: string, items: NavItem[]): NavItem[] {
  return items.map((item) => ({
    ...item,
    link: joinBase(baseUrl, item.link),
    ...(item.items ? { items: prefixNavItems(baseUrl, item.items) } : {}),
  }));
}

function prefixSidebarItems(
  baseUrl: string,
  items: SidebarItem[],
): SidebarItem[] {
  return items.map((item) => ({
    ...item,
    ...(item.link ? { link: joinBase(baseUrl, item.link) } : {}),
    ...(item.items ? { items: prefixSidebarItems(baseUrl, item.items) } : {}),
  }));
}

/**
 * Generate a runtime module into `{projectRoot}/.swifty-docs/generated/`.
 *
 * Outputs `index.js` — runtime code (loaders, loadContent, routes, docsConfig,
 * getSearchIndex) rendered from `file-content.ejs`.
 *
 * Written to `.swifty-docs/` (a dot directory at project root, similar to
 * `.vitepress/` or `.docusaurus/`) so it can be gitignored. Consumers import
 * it via a Vite resolve alias `@swifty-docs/generated`.
 */
function generateRoutesFile(config: DocsConfig, projectRoot: string): void {
  const docsDir = isAbsolute(config.docs)
    ? config.docs
    : resolve(projectRoot, config.docs);

  const routes = scanDocsDir(docsDir, config.baseUrl);

  // Build sidebar. "auto" prefixes are matched against generated routes
  // (which include baseUrl), manual items get baseUrl prepended to links.
  const sidebar: Record<string, SidebarConfig> = {};
  if (config.sidebar) {
    for (const [prefix, sidebarConfig] of Object.entries(config.sidebar)) {
      if (sidebarConfig === "auto") {
        sidebar[prefix] = generateSidebar(
          routes,
          joinBase(config.baseUrl, prefix),
        );
      } else {
        sidebar[prefix] = prefixSidebarItems(config.baseUrl, sidebarConfig);
      }
    }
  }

  const generatedDir = resolve(projectRoot, ".swifty-docs/generated");

  // Generate dynamic-import loaders: route path -> () => import(filePath).
  // Each .md is compiled by the Vite plugin (swiftyDocsPlugin) into a module
  // exporting { pageData, contentHtml }. The layout view calls loadContent()
  // on navigation to fetch the matching page.
  // Use relative paths so the generated file is portable across machines.
  // Absolute paths leak the developer's local directory and break on CI or
  // when the repo is cloned elsewhere.
  const loaderEntries = routes
    .map((r) => {
      const rel = relative(generatedDir, r.filePath).replace(/\\/g, "/");
      const specifier = rel.startsWith(".") ? rel : "./" + rel;
      return `${JSON.stringify(r.path)}: () => import(${JSON.stringify(specifier)}),`;
    })
    .join("\n");

  // Canonical paths of real content routes (excluding virtual index routes
  // and password-protected pages, which must not enter the search index).
  // Used by getSearchIndex() to avoid duplicate/leaking search entries.
  const searchablePaths = routes
    .filter((r) => !r.isDirectoryIndex && !r.isProtected)
    .map((r) => r.path);

  // Compose runtime docsConfig. searchIndex is NOT included here — it is
  // lazily built at runtime by getSearchIndex() (loading all .md modules on
  // first search) to keep this generated file small.
  const runtimeConfig: Omit<DocsConfig, "docs"> = {
    title: config.title,
    description: config.description || "",
    baseUrl: config.baseUrl,
    nav: prefixNavItems(config.baseUrl, config.nav || []),
    sidebar,
  };

  // Render the runtime JS module from the EJS template.
  const fileContent = ejs.render(fileContentTemplate, {
    generatedAt: new Date().toISOString(),
    loaderEntries,
    searchablePathsJson: JSON.stringify(searchablePaths),
    docsConfigJson: JSON.stringify(runtimeConfig, null, 2),
  });

  // Write generated module to .swifty-docs/generated/
  mkdirSync(generatedDir, { recursive: true });
  writeFileSync(resolve(generatedDir, "index.js"), fileContent, "utf-8");
}
