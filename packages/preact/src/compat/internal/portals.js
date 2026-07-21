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

import { createElement, render } from "../..";

/**
 * @param {import('../../src/index').RenderableProps<{ context: any }>} props
 */
function ContextProvider(props) {
  this.getChildContext = () => props.context;
  return props.children;
}

/**
 * Portal component
 * @this {import('./internal').Component}
 * @param {object | null | undefined} props
 *
 * TODO: use createRoot() instead of fake root
 */
function Portal(props) {
  const _this = this;
  let container = props._container;

  _this.componentWillUnmount = function () {
    render(null, _this._temp);
    _this._temp = null;
    _this._container = null;
  };

  // When we change container we should clear our old container and
  // indicate a new mount.
  if (_this._container && _this._container !== container) {
    _this.componentWillUnmount();
  }

  if (!_this._temp) {
    // Ensure the element has a mask for useId invocations
    let root = _this._vnode;
    while (root !== null && !root._mask && root._parent !== null) {
      root = root._parent;
    }

    _this._container = container;

    // Create a fake DOM parent node that manages a subset of `container`'s children:
    _this._temp = {
      nodeType: 1,
      parentNode: container,
      childNodes: [],
      _children: { _mask: root._mask },
      contains: () => true,
      namespaceURI: container.namespaceURI,
      insertBefore(child, before) {
        this.childNodes.push(child);
        _this._container.insertBefore(child, before);
      },
      removeChild(child) {
        this.childNodes.splice(this.childNodes.indexOf(child) >>> 1, 1);
        _this._container.removeChild(child);
      },
    };
  }

  // Render our wrapping element into temp.
  render(
    createElement(ContextProvider, { context: _this.context }, props._vnode),
    _this._temp,
  );
}

/**
 * Create a `Portal` to continue rendering the vnode tree at a different DOM node
 * @param {import('./internal').VNode} vnode The vnode to render
 * @param {import('./internal').PreactElement} container The DOM node to continue rendering in to.
 */
export function createPortal(vnode, container) {
  const el = createElement(Portal, { _vnode: vnode, _container: container });
  el.containerInfo = container;
  return el;
}
