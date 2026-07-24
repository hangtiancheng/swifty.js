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

import { describe, it, expect } from "vitest";
import { slugify } from "../src/utils/slugify";

describe("slugify", () => {
  it("converts text to URL-safe slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces special characters with dashes", () => {
    expect(slugify("What's New?!")).toBe("what-s-new");
  });

  it("preserves CJK characters", () => {
    expect(slugify("路由导航")).toBe("路由导航");
    expect(slugify("Getting Started 入门")).toBe("getting-started-入门");
  });

  it("prefixes leading digits for CSS selector safety", () => {
    expect(slugify("123 Release")).toBe("_123-release");
    expect(slugify("v2.0 Changes")).toBe("v2-0-changes");
  });

  it("collapses multiple dashes", () => {
    expect(slugify("a -- b")).toBe("a-b");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("handles already-slugged text", () => {
    expect(slugify("already-slugged")).toBe("already-slugged");
  });

  it("trims leading dashes", () => {
    expect(slugify("-leading")).toBe("leading");
    expect(slugify("--leading")).toBe("leading");
  });

  it("trims trailing dashes", () => {
    expect(slugify("trailing-")).toBe("trailing");
    expect(slugify("trailing--")).toBe("trailing");
  });

  it("trims both leading and trailing dashes", () => {
    expect(slugify("-both-")).toBe("both");
    expect(slugify("-- -already- --")).toBe("already");
  });
});
