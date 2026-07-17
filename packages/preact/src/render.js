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

import { EMPTY_OBJ, NULL } from "./constants";
import { commitRoot, diff } from "./diff/index";
import { createElement, Fragment } from "./create-element";
import options from "./options";
import { slice } from "./util";

/**
 * Render a Preact virtual node into a DOM element
 * @param {import('./internal').ComponentChild} vnode The virtual node to render
 * @param {import('./internal').PreactElement} parentDom The DOM element to render into
 * @param {import('./internal').PreactElement | object} [replaceNode] Optional: Attempt to re-use an
 * existing DOM tree rooted at `replaceNode`
 */
export function render(vnode, parentDom, replaceNode) {
  // https://github.com/preactjs/preact/issues/3794
  if (parentDom == document) {
    parentDom = document.documentElement;
  }

  if (options._root) options._root(vnode, parentDom);

  // We abuse the `replaceNode` parameter in `hydrate()` to signal if we are in
  // hydration mode or not by passing the `hydrate` function instead of a DOM
  // element..
  let isHydrating = typeof replaceNode == "function";

  // To be able to support calling `render()` multiple times on the same
  // DOM node, we need to obtain a reference to the previous tree. We do
  // this by assigning a new `_children` property to DOM nodes which points
  // to the last rendered tree. By default this property is not present, which
  // means that we are mounting a new tree for the first time.
  let oldVNode = isHydrating
    ? NULL
    : (replaceNode && replaceNode._children) || parentDom._children;

  vnode = ((!isHydrating && replaceNode) || parentDom)._children =
    createElement(Fragment, NULL, [vnode]);

  // List of effects that need to be called after diffing.
  let commitQueue = [],
    refQueue = [];
  diff(
    parentDom,
    // Determine the new vnode tree and store it on the DOM element on
    // our custom `_children` property.
    vnode,
    oldVNode || EMPTY_OBJ,
    EMPTY_OBJ,
    parentDom.namespaceURI,
    !isHydrating && replaceNode
      ? [replaceNode]
      : oldVNode
        ? NULL
        : parentDom.firstChild
          ? slice.call(parentDom.childNodes)
          : NULL,
    commitQueue,
    !isHydrating && replaceNode
      ? replaceNode
      : oldVNode
        ? oldVNode._dom
        : parentDom.firstChild,
    isHydrating,
    refQueue,
  );

  // Flush all queued effects
  commitRoot(commitQueue, vnode, refQueue);

  // The live children are tracked on _children after diffing.
  vnode.props.children = NULL;
}

/**
 * Update an existing DOM element with data from a Preact virtual node
 * @param {import('./internal').ComponentChild} vnode The virtual node to render
 * @param {import('./internal').PreactElement} parentDom The DOM element to update
 */
export function hydrate(vnode, parentDom) {
  render(vnode, parentDom, hydrate);
}
