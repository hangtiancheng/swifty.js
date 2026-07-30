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
import { buildPageData } from "@/utils/page-data";

describe("buildPageData", () => {
  it("coerces numeric frontmatter title to string", () => {
    const pd = buildPageData({ title: 123 }, "body", "guide/x.md");
    expect(pd.title).toBe("123");
  });

  it("accepts quoted sidebar_position numbers", () => {
    const pd = buildPageData({ sidebar_position: "3" }, "", "guide/x.md");
    expect(pd.sidebarPosition).toBe(3);
  });

  it("drops non-numeric sidebar_position", () => {
    const pd = buildPageData({ sidebar_position: "abc" }, "", "guide/x.md");
    expect(pd.sidebarPosition).toBeUndefined();
  });

  it("falls back through first h1 then derived title", () => {
    expect(buildPageData({}, "# Real Title\n\nbody", "guide/x.md").title).toBe(
      "Real Title",
    );
    expect(buildPageData({}, "just body", "guide/some-page.md").title).toBe(
      "Some Page",
    );
  });

  it("only considers the FIRST h1 as title candidate", () => {
    // First h1 is image-only (empty text) — do not fall through to the
    // second h1; use the derived title like the historical behavior.
    const content = "# ![logo](x.png)\n\n# Second Title\n";
    expect(buildPageData({}, content, "guide/some-page.md").title).toBe(
      "Some Page",
    );
  });

  it("keeps TOC slugs deduplicated against all heading levels", () => {
    const pd = buildPageData({}, "# Setup\n\n## Setup\n\n## Setup\n", "x.md");
    expect(pd.headings.map((h) => h.slug)).toEqual(["setup-1", "setup-2"]);
  });
});
