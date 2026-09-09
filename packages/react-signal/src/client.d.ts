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
 * Ambient type declarations for swifty-react-signal.
 *
 * This file is a SCRIPT declaration file (no top-level import/export) so its
 * `declare module "*.css"` wildcards register as ambient modules and its
 * declarations land in the global scope — a module file (with `export {}`)
 * would silently turn the wildcards into no-op augmentations.
 *
 * Scope: webpack (and other non-Vite) projects. Vite projects should rely on
 * `vite/client`, which already declares `import.meta` HMR types and `*.css` /
 * `*.module.css` modules — referencing both would produce conflicting
 * declarations. Likewise, if you already include webpack's own `ImportMeta`
 * types (`"types": ["webpack/module"]`), omit this reference.
 *
 * Declares:
 * - `__swifty_hmr__` — the global HMR handle registered by the package entry
 *   and called by auto-injected HMR snippets (see hmr-inject.ts)
 * - `import.meta.webpackHot` — used by the injected webpack snippet, which
 *   runs through ts-loader BEFORE type stripping and must typecheck
 * - `*.module.css` (`Record<string, string>`) and `*.css` (side-effect /
 *   string) module shapes for css-loader-style pipelines
 */

declare var __swifty_hmr__: {
  hotSwapByComponent: (oldFn: unknown, newFn: unknown) => boolean;
};

interface ImportMeta {
  /** Webpack HMR context (webpack dev server). Undefined in production. */
  webpackHot?: {
    accept(errorHandler?: (err: unknown) => void): void;
    dispose(cb: (data: Record<string, unknown>) => void): void;
    data?: Record<string, unknown>;
  };
}
