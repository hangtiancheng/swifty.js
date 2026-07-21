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
  (typeof Symbol != "undefined" &&
    Symbol.for &&
    Symbol.for("react.forward_ref")) ||
  0xf47;

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
