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

import { slice } from "./util";
import options from "./options";
import { NULL, UNDEFINED } from "./constants";

let vnodeId = 0;

/**
 * Create an virtual node (used for JSX)
 * @param {import('./internal').VNode["type"]} type The node name or Component constructor for this
 * virtual node
 * @param {object | null | undefined} [props] The properties of the virtual node
 * @param {Array<import('.').ComponentChildren>} [children] The children of the
 * virtual node
 * @returns {import('./internal').VNode}
 */
export function createElement(type, props, children) {
  let normalizedProps = {},
    key,
    ref,
    i;
  for (i in props) {
    if (i == "key") key = props[i];
    else if (i == "ref") ref = props[i];
    else normalizedProps[i] = props[i];
  }

  if (arguments.length > 2) {
    normalizedProps.children =
      arguments.length > 3 ? slice.call(arguments, 2) : children;
  }

  // If a Component VNode, check for and apply defaultProps
  // Note: type may be undefined in development, must never error here.
  if (typeof type == "function" && type.defaultProps != NULL) {
    for (i in type.defaultProps) {
      if (normalizedProps[i] === UNDEFINED) {
        normalizedProps[i] = type.defaultProps[i];
      }
    }
  }

  return createVNode(type, normalizedProps, key, ref, NULL);
}

/**
 * Create a VNode (used internally by Preact)
 * @param {import('./internal').VNode["type"]} type The node name or Component
 * Constructor for this virtual node
 * @param {object | string | number | null} props The properties of this virtual node.
 * If this virtual node represents a text node, this is the text of the node (string or number).
 * @param {string | number | null} key The key for this virtual node, used when
 * diffing it against its children
 * @param {import('./internal').VNode["ref"]} ref The ref property that will
 * receive a reference to its created child
 * @returns {import('./internal').VNode}
 */
export function createVNode(type, props, key, ref, original) {
  // V8 seems to be better at detecting type shapes if the object is allocated from the same call site
  // Do not inline into createElement and coerceToVNode!
  /** @type {import('./internal').VNode} */
  const vnode = {
    type,
    props,
    key,
    ref,
    _children: NULL,
    _parent: NULL,
    _depth: 0,
    _dom: NULL,
    _component: NULL,
    constructor: UNDEFINED,
    _original: original == NULL ? ++vnodeId : original,
    _index: -1,
    _flags: 0,
  };

  // Only invoke the vnode hook if this was *not* a direct copy:
  if (original == NULL && options.vnode != NULL) options.vnode(vnode);

  return vnode;
}

export function createRef() {
  return { current: NULL };
}

export function Fragment(props) {
  return props.children;
}

/**
 * Check if a the argument is a valid Preact VNode.
 * @param {*} vnode
 * @returns {vnode is VNode}
 */
export const isValidElement = (vnode) =>
  vnode != NULL && vnode.constructor === UNDEFINED;
