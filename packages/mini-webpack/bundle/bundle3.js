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

(function (absoluteFilePath2moduleFn) {
  /**
   *
   * @param {string} absoluteFilePath
   * @returns {any}
   */
  function __webpack_require(absoluteFilePath) {
    const [moduleFn, relativeDepPath2absoluteDepPath] =
      absoluteFilePath2moduleFn[absoluteFilePath];
    if (!moduleFn) {
      return;
    }
    /**
     *
     * @param {string} relativeFilePath
     * @returns {any}
     */
    const __decorated_require = (relativeFilePath) => {
      const absoluteFilePath =
        relativeDepPath2absoluteDepPath[relativeFilePath];
      return __webpack_require(absoluteFilePath);
    };
    const __webpack_module = { exports: {} };
    moduleFn(__decorated_require, __webpack_module, __webpack_module.exports);
    return __webpack_module.exports;
  }

  __webpack_require(
    "/Users/usr1/github/wheel/packages/mini-webpack/src/main.js",
  );
})({
  "/Users/usr1/github/wheel/packages/mini-webpack/src/main.js": [
    /**
     *
     * @param {(absoluteFilePath: string) => any} __webpack_require
     * @param {{ exports: any }} __webpack_module
     * @param {{any}} exports
     */ function (__webpack_require, __webpack_module, exports) {
      // main.js
      const { foo } = __webpack_require("./foo.js");
      const { bar } = __webpack_require("./bar.js");
      foo();
      bar();
      console.log("main.js");
    },
    {
      "./foo.js": "/Users/usr1/github/wheel/packages/mini-webpack/src/foo.js",
      "./bar.js": "/Users/usr1/github/wheel/packages/mini-webpack/src/bar.js",
    },
  ],

  "/Users/usr1/github/wheel/packages/mini-webpack/src/foo.js": [
    /**
     *
     * @param {(absoluteFilePath: string) => any} __webpack_require
     * @param {{ exports: any }} __webpack_module
     * @param {{any}} exports
     */ function (__webpack_require, __webpack_module, exports) {
      // foo.js
      function foo() {
        console.log("foo.js");
      }
      __webpack_module.exports = { foo };
    },
    {},
  ],

  "/Users/usr1/github/wheel/packages/mini-webpack/src/bar.js": [
    /**
     *
     * @param {(absoluteFilePath: string) => any} __webpack_require
     * @param {{ exports: any }} __webpack_module
     * @param {{any}} exports
     */ function (__webpack_require, __webpack_module, exports) {
      // bar.js
      function bar() {
        console.log("bar.js");
      }
      __webpack_module.exports = { bar };
    },
    {},
  ],
});
