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
 * HMR alias map for function components.
 *
 * `aliasComponent(old, new)` records that `new` replaces `old`, and
 * `canonicalComponent(fn)` resolves a (possibly stale) component reference
 * through the alias chain to the latest version. The reconciler matches
 * component tags by canonical identity, so parents (or route tables)
 * holding a stale import keep matching hot-swapped instances.
 *
 * There is no string→component registry: routes hold component references
 * (or per-route `lazy()` loaders) directly, and JSX tags are always direct
 * function references.
 */
import type { Component } from "./jsx/vnode";

/** HMR replacement links: old component -> its replacement. */
const aliasMap = new WeakMap<Component, Component>();

/**
 * Resolve a component reference through the HMR alias chain to its latest
 * version. Non-aliased components resolve to themselves. (`aliasComponent`
 * guarantees the latest version has no outgoing edge, so chains are acyclic;
 * the bound is cheap insurance.)
 */
export function canonicalComponent(fn: Component): Component {
  let current = fn;
  for (let i = 0; i < 100; i++) {
    const next = aliasMap.get(current);
    if (!next || next === current) return current;
    current = next;
  }
  return current;
}

/**
 * Record that `newFn` replaces `oldFn` (HMR). `newFn` is the LATEST version,
 * so any stale forward edge from it (left by an edit-revert ping-pong like
 * A→B then B→A) is dropped first — otherwise the chain would cycle and
 * canonical resolution would depend on the starting point.
 */
export function aliasComponent(oldFn: Component, newFn: Component): void {
  if (oldFn === newFn) return;
  aliasMap.delete(newFn);
  aliasMap.set(oldFn, newFn);
}
