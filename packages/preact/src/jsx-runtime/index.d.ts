/**
 * Copyright 2026 hangtiancheng
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
