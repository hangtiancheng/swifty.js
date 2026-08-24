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
import { createElement, Fragment } from "./element.ts";
import type { Children } from "./element.ts";
import { useCallback, useEffect, useMemo, useRef, useState } from "./hooks.ts";
/** The first call mounts; every subsequent call diffs against the previous instance tree; passing null unmounts */
export declare function render(element: Children, container: Node): void;
export declare function createRoot(container: Node): {
    render(element: Children): void;
    unmount(): void;
};
export { createElement, Fragment };
export { useCallback, useEffect, useMemo, useRef, useState };
export type { Children, ComponentType, Props, VNode } from "./element.ts";
export type { DepList, Dispatch, EffectCallback, SetStateAction, } from "./hooks.ts";
declare const __react__: {
    createElement: typeof createElement;
    Fragment: symbol;
    render: typeof render;
    createRoot: typeof createRoot;
    useState: typeof useState;
    useEffect: typeof useEffect;
    useMemo: typeof useMemo;
    useCallback: typeof useCallback;
    useRef: typeof useRef;
};
export default __react__;
