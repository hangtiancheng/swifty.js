/**
 * Vite plugin for @lark.js/docs.
 *
 * Transforms .md file imports into JS modules that export lark-mvc Views.
 *
 * Usage:
 * ```ts
 * import { larkDocPlugin } from "@lark.js/docs/vite";
 *
 * export default defineConfig({
 *   plugins: [larkDocPlugin({ config: docConfig })],
 * });
 * ```
 */
import path from "node:path";
import fs from "node:fs";
import type { DocConfig } from "./types";
import { compileMarkdown } from "./compiler/compile-markdown";

export interface LarkDocVitePluginOptions {
  /** Full doc config. */
  config: DocConfig;
  /** Enable debug mode. */
  debug?: boolean;
}

interface VitePlugin {
  name: string;
  enforce: "pre" | "post";
  resolveId?(source: string, importer?: string): string | null;
  load?(id: string): Promise<string | null> | string | null;
}

const SUFFIX = "?lark-docs";

export function larkDocPlugin(options: LarkDocVitePluginOptions): VitePlugin {
  const { config, debug } = options;

  return {
    name: "lark-docs",
    enforce: "pre",

    resolveId(source, importer) {
      if (!source.endsWith(".md")) return null;

      // Resolve relative to importer
      const resolved = importer
        ? path.resolve(path.dirname(importer), source)
        : path.resolve(source);

      return resolved + SUFFIX;
    },

    async load(id) {
      if (!id.endsWith(SUFFIX)) return null;

      const filePath = id.slice(0, -SUFFIX.length);
      const source = fs.readFileSync(filePath, "utf-8");

      return await compileMarkdown(source, {
        config,
        filePath,
        debug,
      });
    },
  };
}
