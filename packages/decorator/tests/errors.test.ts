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

import { afterEach, expect, test } from "vitest";
import { instance as globalContainer } from "@/dependency-container";
import { inject, injectable } from "@/decorators";
import { A01 } from "./fixtures/01-test-case-A01-injects-B01";
import errorMatch from "./utils/error-match";
afterEach(() => {
  globalContainer.reset();
});

test("Error message composition", () => {
  class Ok {}

  @injectable()
  class C {
    constructor(public s: any) {}
  }

  @injectable()
  class B {
    constructor(public c: C) {}
  }

  @injectable()
  class A {
    constructor(
      public d: Ok,
      public b: B,
    ) {}
  }

  expect(() => {
    globalContainer.resolve(A);
  }).toThrow(
    errorMatch([
      /Cannot inject the dependency "b" at position #1 of "A" constructor\. Reason:/,
      /Cannot inject the dependency "c" at position #0 of "B" constructor\. Reason:/,
      /Cannot inject the dependency "s" at position #0 of "C" constructor\. Reason:/,
      /TypeInfo not known for "Object"/,
    ]),
  );
});

test("Param position", () => {
  @injectable()
  class A {
    constructor(@inject("missing") public j: any) {}
  }

  expect(() => {
    globalContainer.resolve(A);
  }).toThrow(
    errorMatch([
      /Cannot inject the dependency "j" at position #0 of "A" constructor\. Reason:/,
      /Attempted to resolve unregistered dependency token: "missing"/,
    ]),
  );
});

test("Detect circular dependency", () => {
  expect(() => {
    globalContainer.resolve(A01);
  }).toThrow(
    errorMatch([
      /Cannot inject the dependency "b" at position #0 of "A01" constructor\. Reason:/,
      /Cannot inject the dependency "a" at position #0 of "B01" constructor\. Reason:/,
      // SWC's decorator metadata guards circular refs with a fallback to
      // Object instead of leaving them undefined like tsc does
      /TypeInfo not known for "Object"/,
    ]),
  );
});
