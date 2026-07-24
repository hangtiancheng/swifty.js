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

import { expect, test, vi } from "vitest";
import { instance as globalContainer } from "@/dependency-container";

// beforeResolution .resolve() tests
test("beforeResolution interceptor gets called correctly", () => {
  class Bar {}
  const interceptorFn = vi.fn();

  globalContainer.beforeResolution(Bar, interceptorFn);
  globalContainer.resolve(Bar);

  expect(interceptorFn).toHaveBeenCalled();
});

test("beforeResolution interceptor using default options gets called correctly", () => {
  class Bar {}
  const interceptorFn = vi.fn();
  globalContainer.beforeResolution(Bar, interceptorFn);
  globalContainer.resolve(Bar);

  expect(interceptorFn).toBeCalled();
});

test("beforeResolution interceptor does not get called when resolving other types", () => {
  class Bar {}
  class Foo {}
  const interceptorFn = vi.fn();
  globalContainer.beforeResolution(Bar, interceptorFn);
  globalContainer.resolve(Foo);

  expect(interceptorFn).not.toHaveBeenCalled();
});

test("beforeResolution one-time interceptor only gets called once", () => {
  class Bar {}
  const interceptorFn = vi.fn();
  globalContainer.beforeResolution(Bar, interceptorFn, {
    frequency: "Once",
  });
  globalContainer.resolve(Bar);
  globalContainer.resolve(Bar);

  expect(interceptorFn).toBeCalledTimes(1);
});

test("beforeResolution always run interceptor gets called on each resolution", () => {
  class Bar {}
  const interceptorFn = vi.fn();
  globalContainer.beforeResolution(Bar, interceptorFn, {
    frequency: "Always",
  });
  globalContainer.resolve(Bar);
  globalContainer.resolve(Bar);

  expect(interceptorFn).toBeCalledTimes(2);
});

test("beforeResolution multiple interceptors get called correctly", () => {
  class Bar {}
  const interceptorFn1 = vi.fn();
  const interceptorFn2 = vi.fn();
  globalContainer.beforeResolution(Bar, interceptorFn1, {
    frequency: "Once",
  });
  globalContainer.beforeResolution(Bar, interceptorFn2, {
    frequency: "Once",
  });
  globalContainer.resolve(Bar);

  expect(interceptorFn1).toBeCalled();
  expect(interceptorFn2).toBeCalled();
});

test("beforeResolution multiple interceptors get per their options", () => {
  class Bar {}
  const interceptorFn1 = vi.fn();
  const interceptorFn2 = vi.fn();
  globalContainer.beforeResolution(Bar, interceptorFn1, {
    frequency: "Once",
  });
  globalContainer.beforeResolution(Bar, interceptorFn2, {
    frequency: "Always",
  });
  globalContainer.resolve(Bar);
  globalContainer.resolve(Bar);

  expect(interceptorFn1).toBeCalledTimes(1);
  expect(interceptorFn2).toBeCalledTimes(2);
});

// beforeResolution .resolveAll() tests
test("beforeResolution interceptor gets called correctly on resolveAll()", () => {
  class Bar {}
  const interceptorFn = vi.fn();
  globalContainer.beforeResolution(Bar, interceptorFn);
  globalContainer.resolveAll(Bar);

  expect(interceptorFn).toBeCalledWith(expect.any(Function), "All");
});

// afterResolution .resolve() tests
test("afterResolution interceptor gets called correctly", () => {
  class Bar {}
  const interceptorFn = vi.fn();

  globalContainer.afterResolution(Bar, interceptorFn, {
    frequency: "Always",
  });
  globalContainer.resolve(Bar);

  expect(interceptorFn).toHaveBeenCalled();
});

test("afterResolution interceptor passes object of correct type", () => {
  class Bar {}
  const interceptorFn = vi.fn();

  globalContainer.afterResolution(Bar, interceptorFn, {
    frequency: "Always",
  });
  globalContainer.resolve(Bar);

  expect(interceptorFn).toBeCalledWith(
    expect.any(Function),
    expect.any(Object),
    "Single",
  );
});

test("afterResolution interceptor gets called correctly with default options", () => {
  class Bar {}
  const interceptorFn = vi.fn();
  globalContainer.afterResolution(Bar, interceptorFn);
  globalContainer.resolve(Bar);

  expect(interceptorFn).toBeCalled();
});

test("afterResolution interceptor does not get called when resolving other types", () => {
  class Bar {}
  class Foo {}
  const interceptorFn = vi.fn();
  globalContainer.afterResolution(Bar, interceptorFn);
  globalContainer.resolve(Foo);

  expect(interceptorFn).not.toHaveBeenCalled();
});

test("afterResolution one-time interceptor only gets called once", () => {
  class Bar {}
  const interceptorFn = vi.fn();
  globalContainer.afterResolution(Bar, interceptorFn, {
    frequency: "Once",
  });
  globalContainer.resolve(Bar);
  globalContainer.resolve(Bar);

  expect(interceptorFn).toBeCalledTimes(1);
});

test("afterResolution always run interceptor gets called on each resolution", () => {
  class Bar {}
  const interceptorFn = vi.fn();
  globalContainer.afterResolution(Bar, interceptorFn, {
    frequency: "Always",
  });
  globalContainer.resolve(Bar);
  globalContainer.resolve(Bar);

  expect(interceptorFn).toBeCalledTimes(2);
});

test("afterResolution multiple interceptors get called correctly", () => {
  class Bar {}
  const interceptorFn1 = vi.fn();
  const interceptorFn2 = vi.fn();
  globalContainer.afterResolution(Bar, interceptorFn1, {
    frequency: "Once",
  });
  globalContainer.afterResolution(Bar, interceptorFn2, {
    frequency: "Once",
  });
  globalContainer.resolve(Bar);

  expect(interceptorFn1).toBeCalled();
  expect(interceptorFn2).toBeCalled();
});

test("beforeResolution multiple interceptors get per their options", () => {
  class Bar {}
  const interceptorFn1 = vi.fn();
  const interceptorFn2 = vi.fn();
  globalContainer.afterResolution(Bar, interceptorFn1, {
    frequency: "Once",
  });
  globalContainer.afterResolution(Bar, interceptorFn2, {
    frequency: "Always",
  });
  globalContainer.resolve(Bar);
  globalContainer.resolve(Bar);

  expect(interceptorFn1).toBeCalledTimes(1);
  expect(interceptorFn2).toBeCalledTimes(2);
});

// afterResolution resolveAll() tests
test("afterResolution interceptor gets called correctly on resolveAll()", () => {
  class Bar {}
  const interceptorFn = vi.fn();
  globalContainer.afterResolution(Bar, interceptorFn);
  globalContainer.resolveAll(Bar);

  expect(interceptorFn).toBeCalledWith(
    expect.any(Function),
    expect.any(Object),
    "All",
  );
});
