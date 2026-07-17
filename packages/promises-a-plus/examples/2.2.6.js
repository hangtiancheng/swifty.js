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
