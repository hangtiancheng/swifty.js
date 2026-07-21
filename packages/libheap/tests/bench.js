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

// Benchmark for the N-API addon, run via `pnpm bench` (vitest bench).
//
// Compared paths:
//   1. addon Heap class, native comparator   (stateful, no JS callbacks)
//   2. addon Heap class, JS comparator       (stateful, JS callback per cmp)
//   3. addon function API, native comparator (stateless, full copy per op)

import { bench } from "vitest";
import { Heap, heappush, heappop } from "../index.js";

const N = 100_000;

function makeInput(n) {
  // Deterministic pseudo-random doubles
  const arr = new Array(n);
  let x = 123456789;
  for (let i = 0; i < n; i++) {
    x = (x * 1103515245 + 12345) % 2147483648;
    arr[i] = x / 2147483648;
  }
  return arr;
}

const input = makeInput(N);

bench("addon Heap class (native comparator): push+pop all", () => {
  const h = new Heap();
  for (let i = 0; i < N; i++) h.push(input[i]);
  for (let i = 0; i < N; i++) h.pop();
});

bench("addon Heap class (JS comparator): push+pop all", () => {
  const h = new Heap([], (a, b) => a - b);
  for (let i = 0; i < N; i++) h.push(input[i]);
  for (let i = 0; i < N; i++) h.pop();
});

// The stateless API is O(n) per op; cap the size to keep each iteration fast
// enough for vitest to collect multiple samples.
const M = 1_000;
bench(
  `addon function API (native cmp, stateless, n=${M}): push+pop all`,
  () => {
    const arr = [];
    for (let i = 0; i < M; i++) heappush(arr, input[i]);
    for (let i = 0; i < M; i++) heappop(arr);
  },
);
