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
// 2.2.6 一个 promise 的 then 方法可以多次调用

const promise = new Promise((resolve) => {
  console.log("promise is pending");
  setTimeout(() => {
    resolve("promise is fulfilled");
  }, 3000);
});

promise.then((value) => {
  console.log("first .then() callback:", value);
});

promise.then((value) => {
  console.log("second .then() callback:", value);
});

promise.then((value) => {
  console.log("third .then() callback:", value);
});

setTimeout(() => {
  console.log("after 2s");
  promise.then((value) => {
    console.log("fourth .then() callback:", value);
    return "fourth then";
  });
}, 5000);
