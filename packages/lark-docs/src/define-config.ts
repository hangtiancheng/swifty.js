/**
 * Type-safe configuration helper with automatic route generation.
 *
 * Scans the docs directory, generates sidebar, and writes a runtime module
 * to `.lark-docs/generated/` so that `boot.ts` can import routes and site
 * data via the `@lark-docs/generated` alias.
 *
 * The generated file is a plain `.js` (runtime) + `.d.ts` (types). A static
 * fallback `generated.d.ts` ships with the package so IDE type-checking works
 * even before the dev server / build has generated the real file.
 *
 * Usage:
 * ```ts
 * import { defineConfig } from "@lark.js/docs";
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
 * `process.cwd()`, which is the project root in most Vite/Webpack/Rspack
 * setups.
 */
import type { DocsConfig, SidebarConfig } from "./types";
import { scanDocsDir } from "./scanner";
import { generateSidebar } from "./sidebar-generator";
import { isAbsolute, resolve } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";
import ejs from "ejs";
import fileContentTemplate from "./file-content.ejs?raw";
import generatedDts from "./generated.d.ts?raw";

export function defineConfig(
  config: DocsConfig,
  projectRoot: string = process.cwd(),
): DocsConfig {
  generateRoutesFile(config, projectRoot);
  return config;
}

/**
 * Generate a runtime module into `{projectRoot}/.lark-docs/generated/`.
 *
 * Outputs two files:
 *   - `index.js`  — runtime code (loaders, loadContent, routes, docsConfig,
 *                   getSearchIndex) rendered from `file-content.ejs`
 *   - `index.d.ts` — static type declarations (copied from `generated.d.ts`)
 *
 * Written to `.lark-docs/` (a dot directory at project root, similar to
 * `.vitepress/` or `.docusaurus/`) so it can be gitignored. Consumers import
 * it via a Vite resolve alias `@lark-docs/generated`.
 */
function generateRoutesFile(config: DocsConfig, projectRoot: string): void {
  const docsDir = isAbsolute(config.docs)
    ? config.docs
    : resolve(projectRoot, config.docs);

  const routes = scanDocsDir(docsDir, config.baseUrl);

  // Build sidebar
  const sidebar: Record<string, SidebarConfig> = {};
  if (config.sidebar) {
    for (const [prefix, sidebarConfig] of Object.entries(config.sidebar)) {
      if (sidebarConfig === "auto") {
        sidebar[prefix] = generateSidebar(routes, prefix, config.baseUrl);
      } else {
        sidebar[prefix] = sidebarConfig;
      }
    }
  }

  const generatedDir = resolve(projectRoot, ".lark-docs/generated");

  // Generate dynamic-import loaders: route path -> () => import(filePath).
  // Each .md is compiled by the bundler plugin (larkDocsPlugin) into a module
  // exporting { pageData, contentHtml }. The layout view calls loadContent()
  // on navigation to fetch the matching page.
  const loaderEntries = routes
    .map(
      (r) =>
        `// @ts-ignore
      ${JSON.stringify(r.path)}: () => import(${JSON.stringify(r.filePath)}),`,
    )
    .join("\n");

  // Compose runtime docsConfig. searchIndex is NOT included here — it is
  // lazily built at runtime by getSearchIndex() (loading all .md modules on
  // first search) to keep this generated file small.
  const runtimeConfig = {
    title: config.title,
    description: config.description || "",
    lang: config.lang || "en-US",
    nav: config.nav || [],
    sidebar,
  };

  // Render the runtime JS module from the EJS template.
  const fileContent = ejs.render(fileContentTemplate, {
    generatedAt: new Date().toISOString(),
    loaderEntries,
    docsConfigJson: JSON.stringify(runtimeConfig, null, 2),
  });

  // Write generated module to .lark-docs/generated/
  mkdirSync(generatedDir, { recursive: true });
  writeFileSync(resolve(generatedDir, "index.js"), fileContent, "utf-8");
  writeFileSync(resolve(generatedDir, "index.d.ts"), generatedDts, "utf-8");
}
