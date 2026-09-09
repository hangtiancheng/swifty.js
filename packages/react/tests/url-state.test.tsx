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

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createRouter, render, useUrlState } from "@lark.js/react";
import type { NavigateOptions, RouterApi } from "@lark.js/react";

function poll(predicate: () => boolean, timeout = 1000): Promise<void> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = (): void => {
      if (predicate()) return resolve();
      if (Date.now() - started > timeout) return reject(new Error("poll timeout"));
      setTimeout(tick, 5);
    };
    tick();
  });
}

let host: HTMLElement;
let router: RouterApi;

type Patch =
  | Record<string, string>
  | ((prev: Record<string, string>) => Record<string, string>);
let lastSet: ((patch: Patch, options?: NavigateOptions) => void) | undefined;
const setterIdentities: Array<(patch: Patch, options?: NavigateOptions) => void> = [];

function Pager(props: { defaults?: Record<string, string> }) {
  const [params, setParams] = useUrlState(
    props.defaults as Record<string, string> | undefined,
  );
  lastSet = setParams;
  setterIdentities.push(setParams);
  return <p>{JSON.stringify(params)}</p>;
}

function mountPager(defaults?: Record<string, string>): void {
  render(<Pager defaults={defaults} />, host);
}

function shown(): Record<string, string> {
  return JSON.parse(host.querySelector("p")!.textContent!) as Record<string, string>;
}

beforeEach(() => {
  globalThis.history.replaceState(null, "", "/");
  router = createRouter([]);
  host = document.createElement("div");
  document.body.appendChild(host);
  lastSet = undefined;
  setterIdentities.length = 0;
});

afterEach(() => {
  render(null, host);
  host.remove();
  router.dispose();
});

describe("useUrlState (component hook)", () => {
  it("throws outside a component body (real hook)", () => {
    expect(() => useUrlState({ page: "1" })).toThrow(/inside a function component/);
  });

  it("returns defaults when the URL has no params", () => {
    mountPager({ page: "1", size: "20" });
    expect(shown()).toEqual({ page: "1", size: "20" });
  });

  it("URL params override defaults", async () => {
    await router.navigate("/list?page=3");
    mountPager({ page: "1", size: "20" });
    expect(shown()).toEqual({ page: "3", size: "20" });
  });

  it("without defaults, returns every current search param", async () => {
    await router.navigate("/list?a=1&b=2");
    mountPager();
    expect(shown()).toEqual({ a: "1", b: "2" });
  });

  it("re-renders the component on URL changes", async () => {
    await router.navigate("/list?page=1");
    mountPager({ page: "1" });
    expect(shown()).toEqual({ page: "1" });
    await router.navigate("/list?page=2");
    expect(shown()).toEqual({ page: "2" });
  });

  it("setValue patches params, preserving pathname and unrelated params", async () => {
    await router.navigate("/list?page=1&keep=yes");
    mountPager({ page: "1" });
    lastSet!({ page: "2" });
    await poll(() => router.location.search === "?page=2&keep=yes");
    expect(router.location.pathname).toBe("/list");
    expect(shown()).toEqual({ page: "2" });
  });

  it("setValue accepts an updater reading the previous value", async () => {
    await router.navigate("/list?page=4");
    mountPager({ page: "1" });
    lastSet!((prev) => ({ page: String(Number(prev["page"]) + 1) }));
    await poll(() => router.location.search === "?page=5");
  });

  it("null/undefined values delete the param", async () => {
    await router.navigate("/list?page=2&tmp=x");
    mountPager();
    lastSet!({ tmp: undefined as unknown as string });
    await poll(() => router.location.search === "?page=2");
  });

  it("supports replace navigation", async () => {
    await router.navigate("/list?page=1");
    mountPager({ page: "1" });
    const before = globalThis.history.length;
    lastSet!({ page: "2" }, { replace: true });
    await poll(() => router.location.search === "?page=2");
    expect(globalThis.history.length).toBe(before);
  });

  it("the setter is STABLE across re-renders", async () => {
    await router.navigate("/list?page=1");
    mountPager({ page: "1" });
    await router.navigate("/list?page=2"); // triggers a re-render
    expect(host.innerHTML).toContain('"page":"2"');
    expect(setterIdentities.length).toBeGreaterThan(1);
    expect(new Set(setterIdentities).size).toBe(1); // one identity, every render
  });
});
