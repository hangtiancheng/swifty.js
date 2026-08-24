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
import type { Hook } from "./hooks.ts";
export type Key = string | number;
export interface Props {
    [name: string]: any;
}
/** Function components only — no class components */
export type ComponentType<P extends Props = Props> = (props: P) => Children;
export type VNodeType = string | ComponentType | symbol;
/** The child node forms allowed in JSX */
export type Children = VNode | string | number | boolean | null | undefined | Children[];
/**
 * type / key / props are the immutable "descriptor", produced by createElement;
 * dom / children / hooks are "instance" fields, filled in by the renderer on
 * mount / update.
 *
 * The descriptor is never mutated by the renderer (React's element immutability
 * principle); each diff produces fresh instance objects. Only the hooks array is
 * shared across renders — that is where component state lives.
 */
export interface VNode {
    readonly type: VNodeType;
    readonly key: string | null;
    readonly props: Props;
    /** Host DOM; function components and Fragments produce no DOM of their own, so this is always null */
    dom: Node | null;
    /** Normalized child instances; for function components this holds their render output */
    children: VNode[] | null;
    /** Owned by function components only; keeps the same array reference across renders */
    hooks: Hook[] | null;
}
export declare const Fragment: unique symbol;
export declare const Text: unique symbol;
export declare function createElement(type: VNodeType, config?: (Props & {
    key?: Key;
}) | null, ...children: Children[]): VNode;
/**
 * Normalize children: wrap strings/numbers into text VNodes, discard
 * null / undefined / boolean, and flatten nested arrays. After normalization a
 * level contains only VNodes, so the diff needs no further branching.
 *
 * Note: flattening does not rewrite keys, so keys must not collide across
 * multiple arrays at the same level.
 */
export declare function toChildArray(children: Children, target?: VNode[]): VNode[];
