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
import type { Children, VNode } from "./element.ts";
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
export declare function setActiveRoot(root: Root | null): void;
/** Run a function component. Component rendering is serial (parent runs first, children are diffed next), so no stack is needed */
export declare function renderComponent(vnode: VNode): VNode[];
export declare function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
export declare function useEffect(create: EffectCallback, deps?: DepList): void;
export declare function useMemo<T>(factory: () => T, deps: DepList): T;
export declare function useCallback<T extends (...args: any[]) => any>(callback: T, deps: DepList): T;
export declare function useRef<T>(initialValue: T): {
    current: T;
};
/**
 * Run effects in a single pass after commit: first run every cleanup that needs
 * to run across the whole tree, then run create, so one component's cleanup never
 * reads state already mutated by another's create. Both passes run children
 * before parents (consistent with React).
 */
export declare function flushEffects(children: VNode[]): void;
/** Before unmounting a subtree, run every component's effect cleanup inside it (children before parents) */
export declare function teardownEffects(vnode: VNode): void;
export {};
