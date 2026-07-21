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

// Intentionally not using a relative path to take advantage of
// the TS version resolution mechanism
export { Fragment } from "..";
import {
  ComponentType,
  ComponentChild,
  ComponentChildren,
  VNode,
  Attributes,
  // @ts-ignore
} from "../index.d.ts";
// @ts-ignore
import { JSXInternal } from "../jsx.d.ts";

export function jsx(
  type: string,
  props: JSXInternal.HTMLAttributes &
    JSXInternal.SVGAttributes &
    Record<string, any> & { children?: ComponentChild },
  key?: string,
): VNode<any>;
export function jsx<P>(
  type: ComponentType<P>,
  props: Attributes & P & { children?: ComponentChild },
  key?: string,
): VNode<any>;

export function jsxs(
  type: string,
  props: JSXInternal.HTMLAttributes &
    JSXInternal.SVGAttributes &
    Record<string, any> & { children?: ComponentChild[] },
  key?: string,
): VNode<any>;
export function jsxs<P>(
  type: ComponentType<P>,
  props: Attributes & P & { children?: ComponentChild[] },
  key?: string,
): VNode<any>;

export function jsxDEV(
  type: string,
  props: JSXInternal.HTMLAttributes &
    JSXInternal.SVGAttributes &
    Record<string, any> & { children?: ComponentChildren },
  key?: string,
): VNode<any>;
export function jsxDEV<P>(
  type: ComponentType<P>,
  props: Attributes & P & { children?: ComponentChildren },
  key?: string,
): VNode<any>;

// These are not expected to be used manually, but by a JSX transform
export function jsxTemplate(
  template: string[],
  ...expressions: any[]
): VNode<any>;
export function jsxAttr(name: string, value: any): string | null;
export function jsxEscape<T>(
  value: T,
): string | null | VNode<any> | Array<string | null | VNode>;

export { JSXInternal as JSX };
