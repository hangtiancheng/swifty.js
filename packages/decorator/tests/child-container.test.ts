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

afterEach(() => {
  globalContainer.reset();
});

test("child container resolves even when parent doesn't have registration", () => {
  interface IFoo {}
  class Foo implements IFoo {}

  const container = globalContainer.createChildContainer();
  container.register("IFoo", { useClass: Foo });

  const myFoo = container.resolve<Foo>("IFoo");

  expect(myFoo instanceof Foo).toBeTruthy();
});

test("child container resolves using parent's registration when child container doesn't have registration", () => {
  interface IFoo {}
  class Foo implements IFoo {}

  globalContainer.register("IFoo", { useClass: Foo });
  const container = globalContainer.createChildContainer();

  const myFoo = container.resolve<Foo>("IFoo");

  expect(myFoo instanceof Foo).toBeTruthy();
});

test("child container resolves all even when parent doesn't have registration", () => {
  interface IFoo {}
  class Foo implements IFoo {}

  const container = globalContainer.createChildContainer();
  container.register("IFoo", { useClass: Foo });

  const myFoo = container.resolveAll<IFoo>("IFoo");

  expect(Array.isArray(myFoo)).toBeTruthy();
  expect(myFoo.length).toBe(1);
  expect(myFoo[0] instanceof Foo).toBeTruthy();
});

test("child container resolves all using parent's registration when child container doesn't have registration", () => {
  interface IFoo {}
  class Foo implements IFoo {}

  globalContainer.register("IFoo", { useClass: Foo });
  const container = globalContainer.createChildContainer();

  const myFoo = container.resolveAll<IFoo>("IFoo");

  expect(Array.isArray(myFoo)).toBeTruthy();
  expect(myFoo.length).toBe(1);
  expect(myFoo[0] instanceof Foo).toBeTruthy();
});

test("isRegistered check parent containers recursively", () => {
  class A {}

  globalContainer.registerType(A, A);
  const child = globalContainer.createChildContainer();

  expect(globalContainer.isRegistered(A)).toBeTruthy();
  expect(child.isRegistered(A)).toBeFalsy();
  expect(child.isRegistered(A, true)).toBeTruthy();
});
