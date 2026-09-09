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
 * Hot Module Replacement (HMR) with state preservation.
 *
 * `hotSwapByComponent(oldFn, newFn)` records `old → new` in an alias map and
 * re-renders every live root. That alone preserves state, because:
 *
 * 1. the reconciler compares component tags by CANONICAL identity
 *    (`sameType` in diff.ts), so instances created from stale descriptors
 *    (a `root.element` captured at boot, a `useMemo`-cached element) keep
 *    matching — their hooks array survives;
 * 2. `renderComponent` (hooks.ts) always CALLS the canonical function, so the
 *    reused instance executes the NEW body against its OLD hooks.
 *
 * No instance-tree walking is needed: setState already re-renders the whole
 * root tree. `hmrActive` stays false until the first swap, so production
 * renders never pay the alias lookups.
 *
 * The swap function is exposed on `globalThis.__lark_react_hmr__` (registered
 * once at the package entry, src/index.ts) so auto-injected HMR snippets
 * (see ./vite.ts) can call it WITHOUT importing "@lark.js/react" — under
 * Module Federation any import of a shared singleton inside an HMR callback
 * registers the module as a shared consumer, causing ChunkLoadError.
 */

import type { ComponentType } from "./element";
import type { Root } from "./hooks";

/** HMR replacement links: old component -> its replacement. */
const aliasMap = new WeakMap<ComponentType, ComponentType>();

/** Flipped by the first hot swap; guards all canonical lookups. */
export let hmrActive = false;

/** Mounted roots — a hot swap re-renders all of them. */
const liveRoots = new Set<Root>();

export function registerRoot(root: Root): void {
  liveRoots.add(root);
}

export function unregisterRoot(root: Root): void {
  liveRoots.delete(root);
}

/**
 * Resolve a component reference through the HMR alias chain to its latest
 * version. Non-aliased components resolve to themselves. (`hotSwapByComponent`
 * guarantees the latest version has no outgoing edge, so chains are acyclic;
 * the bound is cheap insurance.)
 */
export function canonical(fn: ComponentType): ComponentType {
  let current = fn;
  for (let i = 0; i < 100; i++) {
    const next = aliasMap.get(current);
    if (next === undefined || next === current) {
      return current;
    }
    current = next;
  }
  return current;
}

/**
 * Component HMR entry point. Runtime-guarded: non-function arguments no-op
 * safely, so the broad injection gate (any `.tsx`/`.jsx` default export)
 * cannot break non-component modules. `newFn`'s stale forward edge is dropped
 * first — otherwise an edit-revert ping-pong (A→B then B→A) would cycle the
 * alias chain.
 *
 * @returns whether a swap was recorded
 */
export function hotSwapByComponent(oldFn: unknown, newFn: unknown): boolean {
  if (
    typeof oldFn !== "function" ||
    typeof newFn !== "function" ||
    oldFn === newFn
  ) {
    return false;
  }
  aliasMap.delete(newFn as ComponentType);
  aliasMap.set(oldFn as ComponentType, newFn as ComponentType);
  hmrActive = true;
  for (const root of liveRoots) {
    root.schedule();
  }
  return true;
}
