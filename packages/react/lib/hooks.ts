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

import { toChildArray } from "./element.ts";
import type { Children, ComponentType, VNode } from "./element.ts";

/**
 * A mount point. setState performs no partial update; instead it marks the
 * owning root dirty and re-renders the whole tree — render (re-running the
 * component to get a new VNode tree) and reconcile (the keyed diff) converge the
 * actual DOM operations onto the changed nodes. That is exactly React's core
 * layering; all we omit is component-level pruning and interruptible scheduling.
 */
export interface Root {
  container: Node;
  element: Children;
  children: VNode[];
  schedule(): void;
}

export type SetStateAction<S> = S | ((prev: S) => S);
export type Dispatch<A> = (action: A) => void;
export type EffectCallback = () => void | (() => void);
export type DepList = readonly unknown[];

interface StateHook {
  tag: "state";
  state: any;
  /** Pending update queue; shared across renders, so late-arriving setStates are never lost */
  queue: SetStateAction<any>[];
  /** Identity-stable; safe to put into deps or event closures */
  setState: Dispatch<SetStateAction<any>>;
}

interface EffectHook {
  tag: "effect";
  create: EffectCallback;
  deps: DepList | null;
  cleanup: (() => void) | null;
  /** Whether deps changed this render; consumed and reset by flushEffects after commit */
  changed: boolean;
}

interface MemoHook {
  tag: "memo";
  value: any;
  deps: DepList;
}

export type Hook = StateHook | EffectHook | MemoHook;

/** The root currently rendering; setState uses it to find the tree to mark dirty */
let activeRoot: Root | null = null;
/** The hook array and cursor of the component currently rendering; hooks line up by call order (Rules of Hooks) */
let currentHooks: Hook[] | null = null;
let hookIndex = 0;

export function setActiveRoot(root: Root | null): void {
  activeRoot = root;
}

/** Run a function component. Component rendering is serial (parent runs first, children are diffed next), so no stack is needed */
export function renderComponent(vnode: VNode): VNode[] {
  currentHooks = vnode.hooks!;
  hookIndex = 0;
  const rendered = (vnode.type as ComponentType)(vnode.props);
  currentHooks = null;
  return toChildArray(rendered);
}

/** Returns [slot, isFresh]. The slot object is reused across renders — that is where state lives */
function getSlot<H extends Hook>(create: () => H): [H, boolean] {
  if (currentHooks === null) {
    throw new Error("Hooks can only be called inside a function component.");
  }
  const index = hookIndex++;
  if (index === currentHooks.length) {
    const slot = create();
    currentHooks.push(slot);
    return [slot, true];
  }
  return [currentHooks[index] as H, false];
}

export function useState<S>(
  initialState: S | (() => S),
): [S, Dispatch<SetStateAction<S>>] {
  const [slot] = getSlot<StateHook>(() => {
    const root = activeRoot!;
    const created: StateHook = {
      tag: "state",
      state:
        typeof initialState === "function"
          ? (initialState as () => S)()
          : initialState,
      queue: [],
      setState: (action) => {
        // When the queue is empty, compute eagerly first; if the value is unchanged, skip entirely (React's eager bailout)
        if (created.queue.length === 0) {
          const eager =
            typeof action === "function"
              ? (action as (prev: S) => S)(created.state)
              : action;
          if (Object.is(eager, created.state)) {
            return;
          }
        }
        created.queue.push(action);
        root.schedule();
      },
    };
    return created;
  });

  for (const action of slot.queue) {
    slot.state = typeof action === "function" ? action(slot.state) : action;
  }
  slot.queue.length = 0;

  return [slot.state, slot.setState];
}

export function useEffect(create: EffectCallback, deps?: DepList): void {
  const [slot, mounted] = getSlot<EffectHook>(() => ({
    tag: "effect",
    create,
    deps: deps ?? null,
    cleanup: null,
    changed: true,
  }));
  if (!mounted) {
    slot.changed = !depsEqual(slot.deps, deps ?? null);
    slot.create = create;
    slot.deps = deps ?? null;
  }
}

export function useMemo<T>(factory: () => T, deps: DepList): T {
  const [slot, mounted] = getSlot<MemoHook>(() => ({
    tag: "memo",
    value: factory(),
    deps,
  }));
  if (!mounted && !depsEqual(slot.deps, deps)) {
    slot.value = factory();
    slot.deps = deps;
  }
  return slot.value as T;
}

export function useCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DepList,
): T {
  return useMemo(() => callback, deps);
}

export function useRef<T>(initialValue: T): { current: T } {
  return useMemo(() => ({ current: initialValue }), []);
}

function depsEqual(prev: DepList | null, next: DepList | null): boolean {
  if (prev === null || next === null || prev.length !== next.length) {
    return false;
  }
  return prev.every((dep, index) => Object.is(dep, next[index]));
}

/**
 * Run effects in a single pass after commit: first run every cleanup that needs
 * to run across the whole tree, then run create, so one component's cleanup never
 * reads state already mutated by another's create. Both passes run children
 * before parents (consistent with React).
 */
export function flushEffects(children: VNode[]): void {
  walk(children, (vnode) => {
    for (const slot of vnode.hooks ?? []) {
      if (slot.tag === "effect" && slot.changed && slot.cleanup) {
        slot.cleanup();
        slot.cleanup = null;
      }
    }
  });
  walk(children, (vnode) => {
    for (const slot of vnode.hooks ?? []) {
      if (slot.tag === "effect" && slot.changed) {
        slot.changed = false;
        const cleanup = slot.create();
        slot.cleanup = typeof cleanup === "function" ? cleanup : null;
      }
    }
  });
}

/** Before unmounting a subtree, run every component's effect cleanup inside it (children before parents) */
export function teardownEffects(vnode: VNode): void {
  walk(vnode.children, runCleanups);
  runCleanups(vnode);
}

function runCleanups(vnode: VNode): void {
  for (const slot of vnode.hooks ?? []) {
    if (slot.tag === "effect" && slot.cleanup) {
      slot.cleanup();
      slot.cleanup = null;
    }
  }
}

function walk(children: VNode[] | null, visit: (vnode: VNode) => void): void {
  if (children === null) {
    return;
  }
  for (const vnode of children) {
    walk(vnode.children, visit);
    visit(vnode);
  }
}
