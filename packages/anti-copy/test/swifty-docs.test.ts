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

import { describe, expect, it } from "vitest";
import { isPathExcluded } from "@/swifty-docs";

describe("isPathExcluded", () => {
  it("matches exact paths", () => {
    expect(isPathExcluded("/playground", ["/playground"])).toBe(true);
    expect(isPathExcluded("/docs", ["/playground"])).toBe(false);
  });

  it("ignores trailing slashes on either side", () => {
    expect(isPathExcluded("/playground", ["/playground/"])).toBe(true);
    expect(isPathExcluded("/playground/", ["/playground"])).toBe(true);
    expect(isPathExcluded("/playground/", ["/playground/"])).toBe(true);
  });

  it("matches sub-paths by segment prefix only", () => {
    expect(isPathExcluded("/playground/demo", ["/playground"])).toBe(true);
    // A plain string prefix must not match unrelated segments.
    expect(isPathExcluded("/playground-notes", ["/playground"])).toBe(false);
  });

  it("treats the root pattern as exact", () => {
    expect(isPathExcluded("/", ["/"])).toBe(true);
    expect(isPathExcluded("/docs", ["/"])).toBe(false);
  });

  it("tests RegExp patterns against the full path", () => {
    expect(isPathExcluded("/de/docs", [/^\/(de|fr)\//])).toBe(true);
    expect(isPathExcluded("/en/docs", [/^\/(de|fr)\//])).toBe(false);
  });
});
