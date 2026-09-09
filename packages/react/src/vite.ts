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
 * @lark.js/react Vite plugin — zero-config JSX + state-preserving HMR.
 *
 * 1. **JSX transform defaults** — configures the esbuild automatic JSX
 *    runtime with `jsxImportSource: "@lark.js/react"` (unless the user
 *    already set one), so `.tsx` / `.jsx` files compile against
 *    `@lark.js/react/jsx-runtime` without tsconfig/vite tweaking.
 * 2. **Component HMR** — auto-injects state-preserving HMR into every
 *    `.tsx` / `.jsx` module with a line-leading default export. Editing a
 *    component hot-swaps all live instances in place (`useState`/`useRef`
 *    state survives) — no `import.meta.hot` boilerplate required.
 *
 * There is no compile-time "is this a component?" marker (components are
 * plain functions), so the gate is intentionally broad and the RUNTIME is the
 * guard: the snippet checks `typeof === "function"`, and `hotSwapByComponent`
 * no-ops on non-functions. A `.tsx` file default-exporting a config object
 * simply self-accepts and does nothing.
 *
 * Usage in vite.config.ts:
 * ```ts
 * import { larkReactPlugin } from "@lark.js/react/vite";
 *
 * export default defineConfig({
 *   plugins: [larkReactPlugin()],
 * });
 * ```
 */
import type { Plugin, UserConfig } from "vite";

import { injectComponentHmrSnippet as injectShared } from "./hmr-inject";

/** Module ids eligible for component-HMR injection (JSX modules only) */
const COMPONENT_MODULE_ID_REGEXP = /\.[jt]sx$/;

/**
 * Transform a component module source to add Vite component HMR.
 *
 * Thin wrapper over the shared bundler-agnostic injector (./hmr-inject) —
 * kept as the public 1-arg API of "@lark.js/react/vite".
 */
export function injectComponentHmrSnippet(source: string): string {
  return injectShared(source, "vite");
}

/**
 * Create the @lark.js/react Vite plugin.
 *
 * @returns Vite plugin instance
 */
export function larkReactPlugin(): Plugin {
  let isBuild = false;
  return {
    name: "lark-react",
    enforce: "pre",

    /**
     * Default the esbuild JSX transform to the Lark automatic runtime.
     * User-provided settings always win; `esbuild: false` disables the
     * transform entirely and `jsx: "preserve"` is respected.
     */
    config(userConfig): UserConfig | undefined {
      const esbuild = userConfig.esbuild;
      if (esbuild === false) return undefined;
      if (esbuild?.jsx === "preserve") return undefined;
      const patch: { jsx?: "automatic"; jsxImportSource?: string } = {};
      if (!esbuild?.jsx) patch.jsx = "automatic";
      if (!esbuild?.jsxImportSource) patch.jsxImportSource = "@lark.js/react";
      if (Object.keys(patch).length === 0) return undefined;
      return { esbuild: patch };
    },

    configResolved(config): void {
      isBuild = config.command === "build";
    },

    /**
     * Inject component HMR into `.tsx`/`.jsx` modules with a default export.
     * Dev-server only — the snippet would be dead code in production, so
     * builds skip the rewrite entirely.
     */
    transform(code, id) {
      if (isBuild) return undefined;
      // Only process JSX modules (query-suffixed ids excluded)
      if (!COMPONENT_MODULE_ID_REGEXP.test(id.split("?")[0])) return undefined;
      if (id.includes("node_modules")) return undefined;
      const transformed = injectComponentHmrSnippet(code);
      // Skip the no-op: returning an unchanged string counts as a transform
      // and would break sourcemaps.
      if (transformed === code) return undefined;
      // map: null tells the bundler no sourcemap exists for the injection
      return { code: transformed, map: null };
    },
  };
}

export default larkReactPlugin;
