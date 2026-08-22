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
 * 一个挂载点。setState 不做局部更新，而是把所在的根标脏、整树重渲一遍 ——
 * render（重新执行组件拿到新 VNode 树）与 reconcile（keyed diff）把真实的
 * DOM 操作收敛到变化的节点上，这正是 React 的核心分层；省掉的只是
 * 组件级剪枝与可中断调度。
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
  /** 待应用的更新队列；跨渲染共享，晚到的 setState 也不会丢 */
  queue: SetStateAction<any>[];
  /** 身份稳定，可以安全地放进 deps 或事件闭包 */
  setState: Dispatch<SetStateAction<any>>;
}

interface EffectHook {
  tag: "effect";
  create: EffectCallback;
  deps: DepList | null;
  cleanup: (() => void) | null;
  /** 本次渲染 deps 是否变化，由 commit 后的 flushEffects 消费并复位 */
  changed: boolean;
}

interface MemoHook {
  tag: "memo";
  value: any;
  deps: DepList;
}

export type Hook = StateHook | EffectHook | MemoHook;

/** 正在渲染的根，setState 通过它找到要标脏的树 */
let activeRoot: Root | null = null;
/** 正在渲染的组件的 hook 数组与游标；hook 靠调用顺序对上号（Rules of Hooks） */
let currentHooks: Hook[] | null = null;
let hookIndex = 0;

export function setActiveRoot(root: Root | null): void {
  activeRoot = root;
}

/** 执行函数组件。组件渲染是串行的（父先执行、children 随后 diff），无需栈 */
export function renderComponent(vnode: VNode): VNode[] {
  currentHooks = vnode.hooks!;
  hookIndex = 0;
  const rendered = (vnode.type as ComponentType)(vnode.props);
  currentHooks = null;
  return toChildArray(rendered);
}

/** 返回 [槽位, 是否新建]。槽位对象跨渲染复用，这就是状态的家 */
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
        // 队列为空时先急算一次，值没变就整个跳过（React 的 eager bailout）
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
 * commit 之后统一跑 effect：先把整棵树该清理的 cleanup 全部跑完，再跑
 * create，避免某个组件的 cleanup 读到别的 create 已经改过的状态。
 * 两趟都是子先父后（与 React 一致）。
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

/** 卸载一棵子树前，把里面所有组件的 effect cleanup 跑掉（子先父后） */
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
