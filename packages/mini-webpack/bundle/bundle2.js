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

// @ts-check

(function (filePath2moduleFn) {
  /**
   *
   * @param {string} filePath
   * @returns {any}
   */
  function __webpack_require(filePath) {
    const moduleFn = filePath2moduleFn[filePath];
    if (!moduleFn) {
      return;
    }
    const __webpack_module = { exports: {} };
    moduleFn(__webpack_require, __webpack_module);
    return __webpack_module.exports;
  }

  __webpack_require("./main.js");
})({
  "./main.js": /**
   *
   * @param {(filePath: string) => any} __webpack_require
   * @param {{ exports: any }} __webpack_module
   */ function (__webpack_require, __webpack_module) {
    // main.js
    const { foo } = __webpack_require("./foo.js");
    const { bar } = __webpack_require("./bar.js");
    foo();
    bar();
    console.log("main.js");
  },

  "./foo.js": /**
   *
   * @param {(filePath: string) => any} __webpack_require
   * @param {{ exports: any }} __webpack_module
   */ function (__webpack_require, __webpack_module) {
    // foo.js
    function foo() {
      console.log("foo.js");
    }
    __webpack_module.exports = { foo };
  },

  "./bar.js": function (__webpack_require, __webpack_module) {
    // bar.js
    function bar() {
      console.log("bar.js");
    }
    __webpack_module.exports = { bar };
  },
});
