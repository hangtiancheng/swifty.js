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

// @vitest-environment jsdom

// 魔法注释, 指定 jsdom 环境
// pnpm test utils/is-browser.test.ts
import { describe, expect, it } from "vitest";

import isBrowser from "./is-browser.js";

describe("window globals in jsdom environment", () => {
  it("typeof window should be 'object' instead of 'undefined'", () => {
    expect(typeof window).not.toBe("undefined");
    expect(typeof window).toBe("object");
  });

  it("window.document should exist and be an object", () => {
    expect(window.document).toBeDefined();
    expect(typeof window.document).toBe("object");
  });

  it("window.document.createElement should be a function", () => {
    expect(window.document.createElement).toBeDefined();
    expect(typeof window.document.createElement).toBe("function");
    // Verify actual invocation
    const div = window.document.createElement("div");
    expect(div.tagName).toBe("DIV");
  });

  it("window.navigator should exist and contain userAgent", () => {
    expect(window.navigator).toBeDefined();
    expect(typeof window.navigator).toBe("object");
    expect(window.navigator.userAgent).toBeDefined();
    // jsdom userAgent includes 'jsdom' identifier
    expect(window.navigator.userAgent).toContain("jsdom");
  });

  it("isBrowser should be true in jsdom environment", () => {
    expect(isBrowser).toBe(true);
  });
});

describe("isBrowser condition breakdown", () => {
  it("all three conditions should be satisfied in jsdom", () => {
    const cond1 = typeof window !== "undefined";
    const cond2 = !!window.document;
    const cond3 = !!window.document?.createElement;
    expect(cond1).toBe(true);
    expect(cond2).toBe(true);
    expect(cond3).toBe(true);
  });
});
