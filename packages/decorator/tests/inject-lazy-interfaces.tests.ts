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

import { expect, test } from "vitest";
import { instance as globalContainer } from "@/dependency-container";
import { A03 } from "./fixtures/03-test-case-A03-lazy-injects-B03-interface";
import { B03 } from "./fixtures/03-test-case-B03-lazy-injects-A03-interface";

test("Lazy creation with proxies allow circular dependencies using interfaces", () => {
  const a = globalContainer.resolve(A03);
  const b = globalContainer.resolve(B03);
  expect(a).toBeInstanceOf(A03);
  expect(a.b).toBeInstanceOf(B03);
  expect(b.a).toBeInstanceOf(A03);
  expect(a.b.name).toBe("B03");
});
