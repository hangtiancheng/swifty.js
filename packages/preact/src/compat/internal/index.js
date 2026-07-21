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
  createElement,
  render as preactRender,
  cloneElement as preactCloneElement,
  createRef,
  Component,
  createContext,
  Fragment,
  options,
} from "../..";
import {
  useState,
  useId,
  useReducer,
  useEffect,
  useLayoutEffect,
  useRef,
  useImperativeHandle,
  useMemo,
  useCallback,
  useContext,
  useDebugValue,
} from "../../hooks";
import {
  useInsertionEffect,
  startTransition,
  useDeferredValue,
  useSyncExternalStore,
  useTransition,
} from "./hooks";
import { PureComponent } from "./pure-component";
import { memo } from "./memo";
import { forwardRef } from "./forward-ref";
import { Children } from "./children";
import { Suspense, lazy } from "./suspense";
import { SuspenseList } from "./suspense-list";
import { createPortal } from "./portals";
import {
  hydrate,
  render,
  REACT_ELEMENT_TYPE,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
} from "./render";

const version = "18.3.1"; // trick libraries to think we are react

/**
 * Legacy version of createElement.
 * @param {import('./internal').VNode["type"]} type The node name or Component constructor
 */
function createFactory(type) {
  return createElement.bind(null, type);
}

/**
 * Check if the passed element is a valid (p)react node.
 * @param {*} element The element to check
 * @returns {boolean}
 */
function isValidElement(element) {
  return !!element && element.$$typeof === REACT_ELEMENT_TYPE;
}

/**
 * Check if the passed element is a Fragment node.
 * @param {*} element The element to check
 * @returns {boolean}
 */
function isFragment(element) {
  return isValidElement(element) && element.type === Fragment;
}

/**
 * Check if the passed element is a Memo node.
 * @param {*} element The element to check
 * @returns {boolean}
 */
function isMemo(element) {
  return (
    !!element &&
    typeof element.displayName == "string" &&
    element.displayName.indexOf("Memo(") == 0
  );
}

/**
 * Wrap `cloneElement` to abort if the passed element is not a valid element and apply
 * all vnode normalizations.
 * @param {import('./internal').VNode} element The vnode to clone
 * @param {object} props Props to add when cloning
 * @param {Array<import('./internal').ComponentChildren>} rest Optional component children
 */
function cloneElement(element) {
  if (!isValidElement(element)) return element;
  return preactCloneElement.apply(null, arguments);
}

/**
 * Remove a component tree from the DOM, including state and event handlers.
 * @param {import('./internal').PreactElement} container
 * @returns {boolean}
 */
function unmountComponentAtNode(container) {
  if (container._children) {
    preactRender(null, container);
    return true;
  }
  return false;
}

/**
 * Get the matching DOM node for a component
 * @param {import('./internal').Component} component
 * @returns {import('./internal').PreactElement | null}
 */
function findDOMNode(component) {
  return (
    (component &&
      (component.base || (component.nodeType === 1 && component))) ||
    null
  );
}

/**
 * Deprecated way to control batched rendering inside the reconciler, but we
 * already schedule in batches inside our rendering code
 * @template Arg
 * @param {(arg: Arg) => void} callback function that triggers the updated
 * @param {Arg} [arg] Optional argument that can be passed to the callback
 */
// eslint-disable-next-line camelcase
const unstable_batchedUpdates = (callback, arg) => callback(arg);

/**
 * In React, `flushSync` flushes the entire tree and forces a rerender.
 * @template Arg
 * @template Result
 * @param {(arg: Arg) => Result} callback function that runs before the flush
 * @param {Arg} [arg] Optional argument that can be passed to the callback
 * @returns
 */
const flushSync = (callback, arg) => {
  const prevDebounce = options.debounceRendering;
  options.debounceRendering = (cb) => cb();
  const res = callback(arg);
  options.debounceRendering = prevDebounce;
  return res;
};

// compat to react-is
export const isElement = isValidElement;

export * from "../../hooks";
export {
  version,
  Children,
  render,
  hydrate,
  unmountComponentAtNode,
  createPortal,
  createElement,
  createContext,
  createFactory,
  cloneElement,
  createRef,
  Fragment,
  isValidElement,
  isFragment,
  isMemo,
  findDOMNode,
  Component,
  PureComponent,
  memo,
  forwardRef,
  flushSync,
  useInsertionEffect,
  startTransition,
  useDeferredValue,
  useSyncExternalStore,
  useTransition,
  // eslint-disable-next-line camelcase
  unstable_batchedUpdates,
  Fragment as StrictMode,
  Suspense,
  SuspenseList,
  lazy,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
};

// React copies the named exports to the default one.
export default {
  useState,
  useId,
  useReducer,
  useEffect,
  useLayoutEffect,
  useInsertionEffect,
  useTransition,
  useDeferredValue,
  useSyncExternalStore,
  startTransition,
  useRef,
  useImperativeHandle,
  useMemo,
  useCallback,
  useContext,
  useDebugValue,
  version,
  Children,
  render,
  hydrate,
  unmountComponentAtNode,
  createPortal,
  createElement,
  createContext,
  createFactory,
  cloneElement,
  createRef,
  Fragment,
  isValidElement,
  isElement,
  isFragment,
  isMemo,
  findDOMNode,
  Component,
  PureComponent,
  memo,
  forwardRef,
  flushSync,
  unstable_batchedUpdates,
  StrictMode: Fragment,
  Suspense,
  SuspenseList,
  lazy,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
};
