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
import type { VNode } from "./element.ts";
import type { Root } from "./hooks.ts";
/**
 * Render a root: diff a fresh instance tree, commit it synchronously, then
 * flush effects in a single pass. Non-interruptible — a single call runs
 * start to finish.
 */
export declare function renderRoot(root: Root): void;
/**
 * Same-level child diff, built on React's three assumptions (reducing O(n^3)
 * to O(n)):
 *   1. Only compare within the same level; any cross-level move is treated as
 *      "unmount + create";
 *   2. A changed type means the entire subtree is non-reusable;
 *   3. A key identifies "the same node" within a level; without keys it falls
 *      back to index-based comparison.
 *
 * Two passes: the first compares positionally left to right and stops at the
 * first key mismatch; the second indexes the remaining old nodes into a
 * key -> index Map and consumes them in new-list order. Both passes share the
 * lastPlacedIndex watermark to decide whether a reused node must be moved.
 *
 * @param parentDom   The host parent that contains these children
 * @param oldChildren The previous child instances (carrying dom / hooks)
 * @param newChildren The normalized new descriptors
 * @param anchor      The host node immediately to the right of this run of
 *                    children, or null to append at the end
 * @returns The new list of child instances
 */
export declare function diffChildren(parentDom: Node, oldChildren: VNode[], newChildren: VNode[], anchor: Node | null): VNode[];
/** Mount a new subtree, inserting the produced host nodes before anchor */
export declare function mount(desc: VNode, parentDom: Node, anchor: Node | null): VNode;
/** Unmount: run every effect cleanup in the subtree first, then detach the topmost host node */
export declare function unmount(vnode: VNode): void;
