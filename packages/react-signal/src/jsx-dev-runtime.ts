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
 * JSX automatic DEV runtime for `@swifty.js/react-signal`.
 *
 * Bundlers import `jsxDEV` from `<jsxImportSource>/jsx-dev-runtime` in
 * development mode (e.g. Vite dev server, vitest). The extra debug arguments
 * (`isStaticChildren`, `source`, `self`) are accepted and ignored — the
 * produced VNode is identical to the production runtime's.
 */

import { createVNode, type Component, type VNode } from "./jsx/vnode";

export * from "./jsx-runtime";

/**
 * Create a JSX element (dev-runtime entry).
 *
 * @param type - Tag name, functional component, or `Fragment`
 * @param props - Props object (children under `props.children`)
 * @param key - The JSX `key` (third argument per automatic-runtime convention)
 * @param _isStaticChildren - Debug info (ignored)
 * @param _source - Debug source location (ignored)
 * @param _self - Debug `this` reference (ignored)
 */
export function jsxDEV(
  type: string | Component | symbol,
  props: Record<string, unknown> | null | undefined,
  key?: unknown,
  _isStaticChildren?: boolean,
  _source?: unknown,
  _self?: unknown,
): VNode {
  return createVNode(type, props, key);
}
