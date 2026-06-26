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
import type { Plugin as Plugin7 } from "vite7";
import { dirname, isAbsolute, join, resolve } from "path";
import { existsSync, readFileSync } from "fs";
import { compileTemplate, extractGlobalVars } from "./compiler";
import { injectTemplateHmr, injectViewClassHmr } from "./hmr-inject";

export interface LarkMvcVitePluginOptions {
  /** Enable debug mode with line tracking (default: false) */
  debug?: boolean;
  /** Enable virtual DOM output (default: false) */
  virtualDom?: boolean;
  /**
   * Enable JSX/TSX compilation to vdomCreate calls (default: true).
   *
   * When enabled, `.tsx` and `.jsx` files are transformed by esbuild with
   * `jsxImportSource: "@lark.js/mvc"`, so users can write TSX templates:
   *
   * ```tsx
   * export default defineView((ctx) => ({
   *   template(data) {
   *     return <div class="app"><h1>{data.title}</h1></div>;
   *   },
   * }));
   * ```
   *
   * The compiled output calls `jsx("div", { ... })` from
   * `@lark.js/mvc/jsx-runtime`, which bridges to `vdomCreate`.
   */
  jsx?: boolean;
}

/** Suffix appended to resolved IDs to mark them as lark template modules */
const LARK_TEMPLATE_SUFFIX = "?lark-template";

/**
 * Create a Vite plugin that compiles .html template files.
 *
 * @param options - Plugin options
 * @param options.virtualDom - Generate VDOM output instead of HTML string (default: false)
 * @returns Vite plugin instance
 */
export function larkMvcPlugin(options: LarkMvcVitePluginOptions = {}): Plugin {
  const { debug = false, virtualDom = false, jsx = true } = options;
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
        let resolved = resolve(dirname(importerPath), sourcePath);

        // Strip Vite's @fs prefix (used for files outside the root)
        if (resolved.startsWith("/@fs")) {
          resolved = resolved.slice("/@fs".length); // "/@fs/path" → "/path"
        }

        // Handle URL-style paths from Rolldown scanner (e.g. /src/main.ts):
        // path.isAbsolute returns true for /src on Unix, but it's not a
        // real filesystem path — fall back to joining with project root.
        if (!isAbsolute(resolved) || !existsSync(resolved)) {
          const rootResolved = join(root, resolved);
          if (existsSync(rootResolved)) {
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

        // Strip Vite's @fs prefix (used for files outside the root)
        if (filePath.startsWith("/@fs")) {
          filePath = filePath.slice(4); // "/@fs/path" → "/path"
        }

        // Handle URL-style paths from Rolldown dependency scanner (Vite 8)
        if (!isAbsolute(filePath) || !existsSync(filePath)) {
          const rootResolved = join(root, filePath);
          if (existsSync(rootResolved)) {
            filePath = rootResolved;
          }
        }
        if (!existsSync(filePath)) return undefined;
        const raw = readFileSync(filePath, "utf-8");
        // Auto-extract variables from template for 0-config experience
        const globalVars = await extractGlobalVars(raw);
        const compiled = await compileTemplate(raw, {
          debug,
          globalVars,
          virtualDom,
        });
        // Auto-inject HMR: the compiled template module self-accepts, so
        // .html changes hot-swap the template on all mounted views without
        // a full page reload — no user-side code required (like React/Vue).
        return injectTemplateHmr(compiled, "vite");
      }
      return undefined;
    },

    /**
     * Transform hook: inject view-class HMR into .ts files that import .html,
     * and compile JSX/TSX to vdomCreate calls.
     *
     * Two responsibilities:
     * 1. **View-class HMR**: When a .ts view file changes, the auto-injected
     *    HMR snippet captures the old View class (via dispose) and the new one
     *    (via accept), then calls `hotSwapByClass(old, new)` to swap the
     *    prototype on all mounted instances — preserving state.
     * 2. **JSX compilation**: When `jsx: true` (default), .tsx/.jsx files are
     *    compiled by Vite's built-in esbuild with `jsxImportSource` set to
     *    `@lark.js/mvc`. This means users can write TSX templates that
     *    compile to `jsx(...)` calls from `@lark.js/mvc/jsx-runtime`, which
     *    bridges to `vdomCreate`.
     *
     * This gives Lark the same zero-config HMR + JSX DX as React/Vue.
     */
    transform(code, id) {
      // Only process .ts/.tsx/.jsx files (skip .html, node_modules, etc.)
      if (!/\.[tc]sx?$/.test(id)) return undefined;
      if (id.includes("node_modules")) return undefined;

      // For .tsx/.jsx files with JSX enabled, Vite's esbuild already handles
      // the JSX → js calls transformation. We just need to ensure the
      // jsxImportSource is set. This is done via the `esbuild` config option
      // in `configResolved` below.
      //
      // For .ts files (no JSX), just inject view-class HMR.
      return injectViewClassHmr(code, "vite");
    },

    /**
     * Configure esbuild to use Lark's JSX runtime for .tsx/.jsx files.
     *
     * This is the key to zero-config JSX: users don't need to set
     * `jsxImportSource` in their tsconfig — the plugin does it for them.
     */
    config() {
      if (!jsx) return undefined;
      return {
        esbuild: {
          jsxImportSource: "@lark.js/mvc",
          jsx: "automatic",
        },
      };
    },
  };
}

export default larkMvcPlugin;

export function larkMvcPluginLegacy(
  options: {
    debug?: boolean;
    virtualDom?: boolean;
  } = {},
): Plugin {
  const { debug = false, virtualDom = false } = options;

  return {
    name: "lark-template",
    enforce: "pre",

    resolveId(source, importer) {
      if (source.endsWith(".html") && importer) {
        return resolve(dirname(importer), source) + LARK_TEMPLATE_SUFFIX;
      }
      return undefined;
    },

    async load(id) {
      if (id.endsWith(LARK_TEMPLATE_SUFFIX)) {
        const filePath = id.slice(0, -LARK_TEMPLATE_SUFFIX.length);
        const raw = readFileSync(filePath, "utf-8");
        // Auto-extract variables from template for 0-config experience
        const globalVars = await extractGlobalVars(raw);
        return compileTemplate(raw, { debug, globalVars, virtualDom });
      }
      return undefined;
    },
  };
}

export function larkMvcPlugin7(
  options: {
    debug?: boolean;
    virtualDom?: boolean;
  } = {},
): Plugin7 {
  return larkMvcPlugin(options) as Plugin7;
}

export function larkMvcPluginLegacy7(
  options: {
    debug?: boolean;
    virtualDom?: boolean;
  } = {},
): Plugin7 {
  return larkMvcPluginLegacy(options) as Plugin7;
}
