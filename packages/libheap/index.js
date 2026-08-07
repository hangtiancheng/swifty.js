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

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const candidates = [
  `./prebuilds/${process.platform}-${process.arch}/heap.node`,
  "./build/Release/heap.node",
];

let binding;
for (const candidate of candidates) {
  try {
    binding = require(candidate);
    break;
  } catch {}
}

if (!binding) {
  throw new Error(
    `@swifty.js/libheap: heap.node not found (searched: ${candidates.join(", ")})`,
  );
}

export const { heapify, heappop, heappush, heappushpop, heapreplace, Heap } =
  binding;
