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
 * @swifty.js/react-signal Vite Plugin.
 *
 * Zero-config integration for JSX views:
 *
 * 1. **JSX transform defaults** — configures the oxc automatic JSX runtime
 *    with `jsxImportSource: "@swifty.js/react-signal"` (unless the user already set one),
 *    so `.tsx` / `.jsx` files compile against `@swifty.js/react-signal/jsx-runtime`
 *    without any tsconfig/vite tweaking.
 * 2. **Component HMR** — auto-injects state-preserving HMR into every
 *    `.tsx` / `.jsx` module with a default export. Editing a component
 *    hot-swaps all live instances in place (`useSignal`/`useRef` state
 *    survives) — no `import.meta.hot` boilerplate required.
 *
 * Usage in vite.config.ts:
 * ```ts
 * import { swiftyReactSignalPlugin } from '@swifty.js/react-signal/vite';
 *
 * export default defineConfig({
 *   plugins: [swiftyReactSignalPlugin()],
 * });
 * ```
 */
import type { Plugin } from "vite";
import { injectComponentHmrSnippet, isSwiftyComponentSource } from "./hmr-inject";

/**
 * Module ids eligible for component-HMR injection. Components are JSX
 * function components, so only `.tsx` / `.jsx` files are transformed; the
 * runtime guards inside the snippet make non-component default exports a
 * no-op.
 */
const COMPONENT_MODULE_ID_REGEXP = /\.[jt]sx$/;

/**
 * Create the swifty-react-signal Vite plugin.
 *
 * @returns Vite plugin instance
 */
export function swiftyReactSignalPlugin(): Plugin {
  let isBuild = false;
  return {
    name: "swifty-react-signal",
    enforce: "pre",

    configResolved(config): void {
      isBuild = config.command === "build";
    },

    /**
     * Transform hook: inject component HMR into `.tsx`/`.jsx` modules with a
     * default export. Dev-server only — the snippet is dead code in
     * production, so builds skip the rewrite entirely.
     *
     * When a component file changes, the auto-injected snippet captures the
     * old default export (via dispose) and the new one (via accept), then
     * calls `hotSwapByComponent(old, new)` to hot-swap all live instances —
     * `useSignal`/`useRef` state survives.
     */
    transform(code, id) {
      if (isBuild) return undefined;
      // Only process JSX modules (query-suffixed ids excluded)
      if (!COMPONENT_MODULE_ID_REGEXP.test(id.split("?")[0])) return undefined;
      if (id.includes("node_modules")) return undefined;
      // Fast-path: skip modules without a default export. Returning the
      // unchanged string would be treated as a transformation by Rolldown,
      // triggering [SOURCEMAP_BROKEN] warnings when build.sourcemap is true.
      if (!isSwiftyComponentSource(code)) return undefined;
      const transformed = injectComponentHmrSnippet(code, "vite");
      // Idempotency guard may return the source unchanged — skip the no-op.
      if (transformed === code) return undefined;
      // Return { code, map: null } so Rolldown knows we don't emit a
      // sourcemap for the HMR injection, suppressing SOURCEMAP_BROKEN.
      return { code: transformed, map: null };
    },
  };
}

export default swiftyReactSignalPlugin;
