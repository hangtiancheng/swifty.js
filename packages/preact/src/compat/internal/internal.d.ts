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

export interface SuspenseComponent extends PreactComponent<SuspenseProps, SuspenseState> {
  _pendingSuspensionCount: number;
  _suspenders: Component[];
  _detachOnNextRender: null | VNode<any>;
  _mask?: [number, number];
}
