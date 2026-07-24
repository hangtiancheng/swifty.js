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

import { beforeEach, expect, test } from "vitest";
import Registry from "@/registry";
import { Registration } from "@/dependency-container";
import Lifecycle from "@/types/lifecycle";

let registry: Registry;
beforeEach(() => {
  registry = new Registry();
});

test("getAll returns all registrations of a given key", () => {
  const registration1: Registration = {
    options: { lifecycle: Lifecycle.Singleton },
    provider: { useValue: "provider" },
  };
  const registration2: Registration = {
    options: { lifecycle: Lifecycle.Singleton },
    provider: { useValue: "provider" },
  };

  registry.set("Foo", registration1);
  registry.set("Foo", registration2);

  expect(registry.has("Foo")).toBeTruthy();

  const all = registry.getAll("Foo");
  expect(Array.isArray(all)).toBeTruthy();
  expect(all.length).toBe(2);
  expect(all[0]).toStrictEqual(registration1);
  expect(all[1]).toStrictEqual(registration2);
});

test("get returns the last registration", () => {
  const registration1: Registration = {
    options: { lifecycle: Lifecycle.Singleton },
    provider: { useValue: "provider" },
  };
  const registration2: Registration = {
    options: { lifecycle: Lifecycle.Singleton },
    provider: { useValue: "provider" },
  };

  registry.set("Bar", registration1);
  registry.set("Bar", registration2);

  expect(registry.has("Bar")).toBeTruthy();
  expect(registry.get("Bar")).toStrictEqual(registration2);
});

test("get returns null when there is no registration", () => {
  expect(registry.has("FooBar")).toBeFalsy();
  expect(registry.get("FooBar")).toBeNull();
});

test("clear removes all registrations", () => {
  const registration: Registration = {
    options: { lifecycle: Lifecycle.Singleton },
    provider: { useValue: "provider" },
  };

  registry.set("Foo", registration);
  expect(registry.has("Foo")).toBeTruthy();

  registry.clear();
  expect(registry.has("Foo")).toBeFalsy();
});

test("setAll replaces everything with new value", () => {
  const registration: Registration = {
    options: { lifecycle: Lifecycle.Transient },
    provider: { useValue: "provider" },
  };

  expect(registry.has("Foo")).toBeFalsy();

  registry.set("Foo", registration);
  const fooArray = registry.getAll("Foo");
  registry.setAll("Foo", [registration]);

  expect(fooArray === registry.getAll("Foo")).toBeFalsy();
});
