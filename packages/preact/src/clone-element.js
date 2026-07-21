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

import { assign, slice } from "./util";
import { createVNode } from "./create-element";
import { NULL, UNDEFINED } from "./constants";

/**
 * Clones the given VNode, optionally adding attributes/props and replacing its
 * children.
 * @param {import('./internal').VNode} vnode The virtual DOM element to clone
 * @param {object} props Attributes/props to add when cloning
 * @param {Array<import('./internal').ComponentChildren>} rest Any additional arguments will be used
 * as replacement children.
 * @returns {import('./internal').VNode}
 */
export function cloneElement(vnode, props, children) {
  let normalizedProps = assign({}, vnode.props),
    key,
    ref,
    i;

  let defaultProps;

  if (vnode.type && vnode.type.defaultProps) {
    defaultProps = vnode.type.defaultProps;
  }

  for (i in props) {
    if (i == "key") key = props[i];
    else if (i == "ref") ref = props[i];
    else if (props[i] === UNDEFINED && defaultProps != UNDEFINED) {
      normalizedProps[i] = defaultProps[i];
    } else {
      normalizedProps[i] = props[i];
    }
  }

  if (arguments.length > 2) {
    normalizedProps.children =
      arguments.length > 3 ? slice.call(arguments, 2) : children;
  }

  return createVNode(
    vnode.type,
    normalizedProps,
    key || vnode.key,
    ref || vnode.ref,
    NULL,
  );
}
