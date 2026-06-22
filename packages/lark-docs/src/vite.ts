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
import { compileMarkdown } from "./compiler/compile-markdown";
import type { Plugin } from "vite";

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
      if (source.endsWith(".md") && !source.includes("?")) {
        return source + MD_SUFFIX;
      }
      return null;
    },

    async load(id: string) {
      if (!id.endsWith(MD_SUFFIX)) return null;

      const filePath = id.slice(0, -MD_SUFFIX.length);
      const source = fs.readFileSync(filePath, "utf-8");

      return await compileMarkdown(source, {
        config,
        filePath,
        debug,
      });
    },
  };
}
