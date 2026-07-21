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

import { NULL } from "../constants";

/**
 * Find the closest error boundary to a thrown error and call it
 * @param {object} error The thrown value
 * @param {import('../internal').VNode} vnode The vnode that threw the error that was caught (except
 * for unmounting when this parameter is the highest parent that was being
 * unmounted)
 * @param {import('../internal').VNode} [oldVNode]
 * @param {import('../internal').ErrorInfo} [errorInfo]
 */
export function _catchError(error, vnode, oldVNode, errorInfo) {
  /** @type {import('../internal').Component} */
  let component,
    /** @type {import('../internal').ComponentType} */
    ctor,
    /** @type {boolean} */
    handled;

  for (; (vnode = vnode._parent);) {
    if ((component = vnode._component) && !component._processingException) {
      try {
        ctor = component.constructor;

        if (ctor && ctor.getDerivedStateFromError != NULL) {
          component.setState(ctor.getDerivedStateFromError(error));
          handled = component._dirty;
        }

        if (component.componentDidCatch != NULL) {
          component.componentDidCatch(error, errorInfo || {});
          handled = component._dirty;
        }

        // This is an error boundary. Mark it as having bailed out, and whether it was mid-hydration.
        if (handled) {
          return (component._pendingError = component);
        }
      } catch (e) {
        error = e;
      }
    }
  }

  throw error;
}
