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
import { DEFAULT_REPLACE_TEXT, resolveOptions } from "@/core/options";

describe("resolveOptions", () => {
  it("fills defaults", () => {
    const resolved = resolveOptions();
    expect(resolved.mode).toBe("block");
    expect(resolved.replaceText).toBe(DEFAULT_REPLACE_TEXT);
    expect(resolved.excludeSelectors).toEqual([]);
    expect(resolved.copy).toBe(true);
    expect(resolved.keyboard).toBe(true);
    expect(resolved.contextmenu).toBe(true);
    expect(resolved.selectStyle).toBe(true);
    expect(resolved.print).toBe(true);
    expect(resolved.devtools).toBe(false);
  });

  it("defaults selectStyle off in replace mode so selection stays possible", () => {
    expect(resolveOptions({ mode: "replace" }).selectStyle).toBe(false);
    expect(resolveOptions({ mode: "replace", selectStyle: true }).selectStyle).toBe(true);
  });

  it("expands devtools: true into full defaults", () => {
    expect(resolveOptions({ devtools: true }).devtools).toEqual({
      intervalMs: 1000,
      threshold: 170,
      freeze: true,
      redirectUrl: "about:blank",
    });
  });

  it("backfills partial devtools objects", () => {
    expect(resolveOptions({ devtools: { threshold: 300 } }).devtools).toEqual({
      intervalMs: 1000,
      threshold: 300,
      freeze: true,
      redirectUrl: "about:blank",
    });
  });
});
