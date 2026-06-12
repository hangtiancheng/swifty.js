/**
 * @lark.js/mvc Vite Plugin for Template Compilation
 *
 * Compiles .html template files using @lark.js/mvc template syntax
 * into JS function modules at build/dev time.
 *
 * 0 configuration — just add the plugin and it works.
 * - All template operators: = (escape), ! (raw), @ (ref lookup), : (binding)
 * - @event attribute processing with $g prefix
 * - $eu (URI encoding), $eq (quote encoding), $i (reference lookup)
 * - Debug mode with line tracking
 * - View ID injection
 * - Auto variable extraction
 *
 * Usage in vite.config.ts:
 * ```ts
 * import { larkMvcPlugin } from '@lark.js/mvc/vite';
 *
 * export default defineConfig({
 *   plugins: [larkMvcPlugin()],
 * });
 * ```
 */
import type { Plugin } from "vite";
import path from "path";
import fs from "fs";
import { compileTemplate, extractGlobalVars } from "./compiler";

/** Suffix appended to resolved IDs to mark them as lark template modules */
const LARK_TEMPLATE_SUFFIX = "?lark-template";

/**
 * Create a Vite plugin that compiles .html template files.
 *
 * @param options - Plugin options
 * @param options.debug - Enable debug mode with line tracking (default: false)
 * @returns Vite plugin instance
 */
export function larkMvcPlugin(options: { debug?: boolean } = {}): Plugin {
  const { debug = false } = options;

  return {
    name: "lark-template",
    enforce: "pre",

    resolveId(source, importer) {
      if (source.endsWith(".html") && importer) {
        return (
          path.resolve(path.dirname(importer), source) + LARK_TEMPLATE_SUFFIX
        );
      }
      return undefined;
    },

    load(id) {
      if (id.endsWith(LARK_TEMPLATE_SUFFIX)) {
        const filePath = id.slice(0, -LARK_TEMPLATE_SUFFIX.length);
        const raw = fs.readFileSync(filePath, "utf-8");
        // Auto-extract variables from template for 0-config experience
        const globalVars = extractGlobalVars(raw);
        return compileTemplate(raw, { debug, globalVars });
      }
      return undefined;
    },
  };
}

export default larkMvcPlugin;
