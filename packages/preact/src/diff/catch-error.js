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

  for (; (vnode = vnode._parent); ) {
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
