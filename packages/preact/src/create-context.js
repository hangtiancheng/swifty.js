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

import { enqueueRender } from "./component";
import { NULL } from "./constants";

export let i = 0;

export function createContext(defaultValue) {
  function Context(props) {
    if (!this.getChildContext) {
      /** @type {Set<import('./internal').Component> | null} */
      let subs = new Set();
      let ctx = {};
      ctx[Context._id] = this;

      this.getChildContext = () => ctx;

      this.componentWillUnmount = () => {
        subs = NULL;
      };

      this.shouldComponentUpdate = function (_props) {
        // @ts-expect-error even
        if (this.props.value != _props.value) {
          subs.forEach((c) => {
            c._force = true;
            enqueueRender(c);
          });
        }
      };

      this.sub = (c) => {
        subs.add(c);
        let old = c.componentWillUnmount;
        c.componentWillUnmount = () => {
          if (subs) {
            subs.delete(c);
          }
          if (old) old.call(c);
        };
      };
    }

    return props.children;
  }

  Context._id = "__cC" + i++;
  Context._defaultValue = defaultValue;

  /** @type {import('./internal').FunctionComponent} */
  Context.Consumer = (props, contextValue) => {
    return props.children(contextValue);
  };

  // we could also get rid of _contextRef entirely
  Context.Provider =
    Context._contextRef =
    Context.Consumer.contextType =
      Context;

  return Context;
}
