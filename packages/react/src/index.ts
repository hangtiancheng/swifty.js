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

import { renderRoot } from "./diff";
import { createElement, Fragment } from "./element";
import type { Children } from "./element";
import { hotSwapByComponent, registerRoot, unregisterRoot } from "./hmr";
import { useCallback, useEffect, useMemo, useRef, useState } from "./hooks";
import type { Root } from "./hooks";

// Global HMR handle — THE single registration point. Auto-injected HMR
// snippets (see ./vite.ts) call it via `globalThis.__lark_react_hmr__`
// instead of importing "@lark.js/react" (an import inside an HMR callback
// would register the module as an MF shared consumer → ChunkLoadError).
const globalScope = globalThis as {
  __lark_react_hmr__?: { hotSwapByComponent: typeof hotSwapByComponent };
};
if (!globalScope.__lark_react_hmr__) {
  globalScope.__lark_react_hmr__ = { hotSwapByComponent };
}

const roots = new WeakMap<Node, Root>();

/** setState only marks the root dirty; multiple updates within the same microtask are batched into a single re-render */
const dirtyRoots = new Set<Root>();
let flushScheduled = false;

/**
 * Runaway-update guard (React's "Maximum update depth exceeded"). A cascade
 * wave is a flush that ends with new updates already scheduled — normal for
 * effect-driven follow-up state, fatal when it never settles: the microtask
 * loop would starve the event loop and freeze the page. Throwing from the
 * offending schedule call breaks the loop with a single diagnostic error.
 */
const MAX_CASCADE_WAVES = 50;
let cascadeWaves = 0;
let inFlush = false;

function scheduleFlush(): void {
  if (inFlush && cascadeWaves >= MAX_CASCADE_WAVES) {
    cascadeWaves = 0;
    dirtyRoots.clear();
    throw new Error(
      "Maximum update depth exceeded. A render body or effect schedules another update on every pass, so the tree can never settle. setState with an unchanged value bails out — make the update conditional or move it out of the render/effect path.",
    );
  }
  if (flushScheduled) {
    return;
  }
  flushScheduled = true;
  queueMicrotask(() => {
    flushScheduled = false;
    const pending = [...dirtyRoots];
    dirtyRoots.clear();
    inFlush = true;
    cascadeWaves++;
    try {
      for (const root of pending) {
        renderRoot(root);
      }
    } finally {
      inFlush = false;
      if (dirtyRoots.size === 0) {
        cascadeWaves = 0;
      }
    }
  });
}

/** The first call mounts; every subsequent call diffs against the previous instance tree; passing null unmounts */
export function render(element: Children, container: Node): void {
  let root = roots.get(container);
  if (root === undefined) {
    const created: Root = {
      container,
      element,
      children: [],
      schedule() {
        dirtyRoots.add(created);
        scheduleFlush();
      },
    };
    root = created;
    roots.set(container, root);
  }
  root.element = element;
  dirtyRoots.delete(root);
  if (element === null || element === undefined) {
    unregisterRoot(root);
  } else {
    registerRoot(root);
  }
  renderRoot(root);
}

export function createRoot(container: Node): {
  render(element: Children): void;
  unmount(): void;
} {
  return {
    render(element) {
      render(element, container);
    },
    unmount() {
      render(null, container);
    },
  };
}

export { createElement, Fragment };
export { useCallback, useEffect, useMemo, useRef, useState };
export { hotSwapByComponent };
export { createStore, useStore } from "./store";
export type { StoreApi } from "./store";
export {
  createRouter,
  matchPath,
  matchRoutes,
  RouterView,
  useBlocker,
  useRouter,
} from "./router";
export type {
  Blocker,
  Location,
  NavigateOptions,
  RouteMatch,
  RouteObject,
  RouterApi,
  RouterOptions,
  To,
} from "./router";
export { useUrlState } from "./url-state";
export type { SetUrlState } from "./url-state";
export type {
  Children,
  ComponentType,
  Key,
  Props,
  VNode,
  VNodeType,
} from "./element";
export type {
  DepList,
  Dispatch,
  EffectCallback,
  SetStateAction,
} from "./hooks";
export type { Ref } from "./jsx-runtime";
