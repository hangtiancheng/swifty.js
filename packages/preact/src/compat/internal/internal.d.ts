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

import {
  Component as PreactComponent,
  VNode as PreactVNode,
  FunctionComponent as PreactFunctionComponent,
  PreactElement,
  // @ts-ignore
} from "../../internal.d.ts";
// @ts-ignore
import { SuspenseProps } from "./suspense.d.ts";

export { ComponentChildren } from "../..";

export { PreactElement };

export interface Component<P = {}, S = {}> extends PreactComponent<P, S> {
  isReactComponent?: object;
  isPureReactComponent?: true;
  _patchedLifecycles?: true;

  // Suspense internal properties
  _childDidSuspend?(error: Promise<void>, suspendingVNode: VNode): void;
  _suspended: (vnode: VNode) => (unsuspend: () => void) => void;
  _onResolve?(): void;

  // Portal internal properties
  _temp: any;
  _container: PreactElement;
}

export interface FunctionComponent<P = {}> extends PreactFunctionComponent<P> {
  shouldComponentUpdate?(nextProps: Readonly<P>): boolean;
  _forwarded?: boolean;
  _patchedLifecycles?: true;
}

export interface VNode<T = any> extends PreactVNode<T> {
  $$typeof?: symbol | string;
  preactCompatNormalized?: boolean;
}

export interface SuspenseState {
  _suspended?: null | VNode<any>;
}

export interface SuspenseComponent extends PreactComponent<
  SuspenseProps,
  SuspenseState
> {
  _pendingSuspensionCount: number;
  _suspenders: Component[];
  _detachOnNextRender: null | VNode<any>;
  _mask?: [number, number];
}
