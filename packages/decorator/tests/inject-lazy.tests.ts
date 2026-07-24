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
import { delay, DelayedConstructor } from "@/lazy-helpers";
import { A02 } from "./fixtures/02-test-case-A02-lazy-injects-B02";
import { B02 } from "./fixtures/02-test-case-B02-lazy-injects-A02";

test("DelayedConstructor delays creation until first usage", () => {
  let created = false;
  class Foo {
    sum(...args: number[]): number {
      return args.reduce((x, y) => x + y, 0);
    }
    constructor() {
      created = true;
    }
  }
  const delayedConstructor = delay(() => Foo);
  expect(delayedConstructor).toBeInstanceOf(DelayedConstructor);
  const foo: Foo = delayedConstructor.createProxy((Target) => new Target());
  expect(created).toBe(false);
  expect(foo).toBeInstanceOf(Foo);
  expect(created).toBe(true);
  expect(foo.sum(1, 2, 3, 4)).toBe(10);
});

test("Lazy creation with proxies allow circular dependencies", () => {
  const a = globalContainer.resolve(A02);
  const b = globalContainer.resolve(B02);
  b.prop["defined"] = true;
  expect(a).toBeInstanceOf(A02);
  expect(a.b).toBeInstanceOf(B02);
  expect(b.a).toBeInstanceOf(A02);
  expect(a.b.prop["defined"]).toBe(true);
  expect(a.b.name).toBe("B02");
});

test("Lazily created proxy allows iterating over keys of the original service", () => {
  const a = globalContainer.resolve(A02);
  const b = globalContainer.resolve(B02);
  expect(a).toBeInstanceOf(A02);
  expect(b).toBeInstanceOf(B02);
  expect(Object.keys(a)).toStrictEqual(["b"]);
  expect(Object.keys(b)).toStrictEqual(["a", "name", "prop"]);
  expect(Object.getOwnPropertyNames(a)).toStrictEqual(["b"]);
  expect(Object.getOwnPropertyNames(b)).toStrictEqual(["a", "name", "prop"]);
});
