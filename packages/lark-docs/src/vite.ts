/**
 * Vite plugin for @lark.js/docs.
 *
 * Transforms `.md` file imports into JS modules that export lark-mvc Views.
 * Any `import ... from "./foo.md"` is intercepted and compiled through
 * the full markdown pipeline (frontmatter, markdown-it, Shiki).
 *
 * Usage:
 * ```ts
 * import { larkDocsPlugin } from "@lark.js/docs/vite";
 *
 * export default defineConfig({
 *   plugins: [larkDocsPlugin({ config: docsConfig })],
 * });
 * ```
 */
import fs from "node:fs";
import type { DocsConfig } from "./types";
import { compileMarkdown } from "./compile-markdown";
import type { Plugin } from "vite";

// Re-export build-time utilities for use in vite.config
// (avoids importing from main entry which pulls in lucide-static SVG ?raw imports)
export { defineConfig } from "./define-config";
export { scanDocsDir } from "./scanner";
export { generateRouteMap, generateBootModule } from "./route-map";
export { generateSidebar } from "./sidebar-generator";
export { buildSearchIndex } from "./search-index";
export type { DocsConfig, SidebarConfig } from "./types";

export interface LarkDocsVitePluginOptions {
  /** Full docs config. */
  config: DocsConfig;
  /** Enable debug mode. */
  debug?: boolean;
}

// Suffix used to mark compiled .md files in the module graph
const MD_SUFFIX = "?lark-docs";

export function larkDocsPlugin(options: LarkDocsVitePluginOptions): Plugin {
  const { config, debug } = options;

  return {
    name: "lark-docs",
    enforce: "pre",

    resolveId(source: string) {
      // Strip query params (Vite 8 may add ?import, ?url, etc.)
      const cleanSource = source.split("?")[0];
      if (cleanSource.endsWith(".md")) {
        return cleanSource + MD_SUFFIX;
      }
      return null;
    },

    async load(id: string) {
      // Vite may add extra query params (e.g. ?import&lark-docs),
      // so check if lark-docs is in the query, not just endsWith.
      const qIdx = id.indexOf("?");
      const query = qIdx >= 0 ? id.slice(qIdx + 1) : "";
      if (!query.split("&").includes("lark-docs")) return null;

      // Extract file path: strip query params
      let filePath = qIdx >= 0 ? id.slice(0, qIdx) : id;

      // Strip Vite's @fs prefix (used for files outside the root)
      if (filePath.startsWith("/@fs")) {
        filePath = filePath.slice("/@fs".length); // "/@fs/path" → "/path"
      }

      const source = fs.readFileSync(filePath, "utf-8");

      return await compileMarkdown(source, {
        config,
        filePath,
        debug,
      });
    },
  };
}
