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
 * @param options.virtualDom - Generate VDOM output instead of HTML string (default: false)
 * @returns Vite plugin instance
 */
export function larkMvcPlugin(
  options: {
    debug?: boolean;
    virtualDom?: boolean;
    useSwc?: boolean;
  } = {},
): Plugin {
  const { debug = false, virtualDom = false, useSwc = false } = options;
  let root = __dirname;

  return {
    name: "lark-template",
    enforce: "pre",

    configResolved(config) {
      root = config.root;
    },

    resolveId(source, importer) {
      // Strip query params from source (Vite may add ?url, ?raw, etc.)
      const sourcePath = source.split("?")[0];
      if (sourcePath.endsWith(".html") && importer) {
        const importerPath = importer.split("?")[0];
        let resolved = path.resolve(path.dirname(importerPath), sourcePath);
        // Handle URL-style paths from Rolldown scanner (e.g. /src/main.ts):
        // path.isAbsolute returns true for /src on Unix, but it's not a
        // real filesystem path — fall back to joining with project root.
        if (!fs.existsSync(resolved)) {
          const rootResolved = path.join(root, resolved);
          if (fs.existsSync(rootResolved)) {
            resolved = rootResolved;
          }
        }
        return resolved + LARK_TEMPLATE_SUFFIX;
      }
      return undefined;
    },

    async load(id) {
      // Match lark-template modules. Vite may add ?import before our suffix,
      // producing ?import&lark-template, so use includes instead of endsWith.
      const qIdx = id.indexOf("?");
      const query = qIdx >= 0 ? id.slice(qIdx + 1) : "";
      if (query.split("&").includes("lark-template")) {
        let filePath = qIdx >= 0 ? id.slice(0, qIdx) : id;
        // Handle URL-style paths from Rolldown dependency scanner
        if (!fs.existsSync(filePath)) {
          const rootResolved = path.join(root, filePath);
          if (fs.existsSync(rootResolved)) {
            filePath = rootResolved;
          }
        }
        if (!fs.existsSync(filePath)) return undefined;
        const raw = fs.readFileSync(filePath, "utf-8");
        // Auto-extract variables from template for 0-config experience
        const globalVars = await extractGlobalVars(raw);
        return compileTemplate(raw, { debug, globalVars, virtualDom, useSwc });
      }
      return undefined;
    },
  };
}

export default larkMvcPlugin;

export function larkMvcPluginLegacy(
  options: {
    debug?: boolean;
    virtualDom?: boolean;
    useSwc?: boolean;
  } = {},
): Plugin {
  const { debug = false, virtualDom = false, useSwc = false } = options;

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

    async load(id) {
      if (id.endsWith(LARK_TEMPLATE_SUFFIX)) {
        const filePath = id.slice(0, -LARK_TEMPLATE_SUFFIX.length);
        const raw = fs.readFileSync(filePath, "utf-8");
        // Auto-extract variables from template for 0-config experience
        const globalVars = await extractGlobalVars(raw);
        return compileTemplate(raw, { debug, globalVars, virtualDom, useSwc });
      }
      return undefined;
    },
  };
}
