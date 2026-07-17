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

// @ts-check

/**
 *
 * @param {string} filePath
 * @returns {any}
 */
function __webpack_require(filePath) {
  const filePath2moduleFn = new Map([
    ["./main.js", mainJs],
    ["./foo.js", fooJs],
    ["./bar.js", barJs],
  ]);
  const moduleFn = filePath2moduleFn.get(filePath);
  if (!moduleFn) {
    return;
  }
  const __webpack_module = { exports: {} };
  moduleFn(__webpack_require, __webpack_module);
  return __webpack_module.exports;
}

/**
 *
 * @param {typeof __webpack_require} __webpack_require
 * @param {{ exports: any }} __webpack_module
 */
function mainJs(__webpack_require, __webpack_module) {
  // main.js
  const { foo } = __webpack_require("./foo.js");
  const { bar } = __webpack_require("./bar.js");
  foo();
  bar();
  console.log("main.js");
}

/**
 *
 * @param {typeof __webpack_require} __webpack_require
 * @param {{ exports: any }} __webpack_module
 */
function fooJs(__webpack_require, __webpack_module) {
  // foo.js
  function foo() {
    console.log("foo.js");
  }
  __webpack_module.exports = { foo };
}

/**
 *
 * @param {typeof __webpack_require} __webpack_require
 * @param {{ exports: any }} __webpack_module
 */
function barJs(__webpack_require, __webpack_module) {
  // bar.js
  function bar() {
    console.log("bar.js");
  }
  __webpack_module.exports = { bar };
}

__webpack_require("./main.js");
