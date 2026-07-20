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

import { options } from "../..";
import { assign } from "./util";

let oldDiffHook = options._diff;
options._diff = (vnode) => {
  if (vnode.type && vnode.type._forwarded && vnode.ref) {
    vnode.props.ref = vnode.ref;
    vnode.ref = null;
  }
  if (oldDiffHook) oldDiffHook(vnode);
};

export const REACT_FORWARD_SYMBOL =
  (typeof Symbol != "undefined" && Symbol.for && Symbol.for("react.forward_ref")) || 0xf47;

/**
 * Pass ref down to a child. This is mainly used in libraries with HOCs that
 * wrap components. Using `forwardRef` there is an easy way to get a reference
 * of the wrapped component instead of one of the wrapper itself.
 * @param {import('./index').ForwardFn} fn
 * @returns {import('./internal').FunctionComponent}
 */
export function forwardRef(fn) {
  function Forwarded(props) {
    let clone = assign({}, props);
    delete clone.ref;
    return fn(clone, props.ref || null);
  }

  // mobx-react checks for this being present
  Forwarded.$$typeof = REACT_FORWARD_SYMBOL;
  // mobx-react heavily relies on implementation details.
  // It expects an object here with a `render` property,
  // and prototype.render will fail. Without this
  // mobx-react throws.
  Forwarded.render = fn;

  Forwarded.prototype.isReactComponent = Forwarded._forwarded = true;
  Forwarded.displayName = "ForwardRef(" + (fn.displayName || fn.name) + ")";
  return Forwarded;
}
