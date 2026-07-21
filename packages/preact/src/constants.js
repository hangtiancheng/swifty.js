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

/** Normal hydration that attaches to a DOM tree but does not diff it. */
export const MODE_HYDRATE = 1 << 5;
/** Signifies this VNode suspended on the previous render */
export const MODE_SUSPENDED = 1 << 7;
/** Indicates that this node needs to be inserted while patching children */
export const INSERT_VNODE = 1 << 2;
/** Indicates a VNode has been matched with another VNode in the diff */
export const MATCHED = 1 << 1;

/** Reset all mode flags */
export const RESET_MODE = ~(MODE_HYDRATE | MODE_SUSPENDED);

export const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
export const XHTML_NAMESPACE = "http://www.w3.org/1999/xhtml";
export const MATH_NAMESPACE = "http://www.w3.org/1998/Math/MathML";

export const NULL = null;
export const UNDEFINED = undefined;
export const EMPTY_OBJ = /** @type {any} */ ({});
export const EMPTY_ARR = [];
export const IS_NON_DIMENSIONAL =
  /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
