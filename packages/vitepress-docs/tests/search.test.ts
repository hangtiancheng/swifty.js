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
import type { MarkdownEnv } from "vitepress";
import { excludePrivatePages, type MarkdownItLike } from "../src/node/search";

function fakeMd(frontmatter: Record<string, unknown>): MarkdownItLike {
  return {
    render: (_src: string, env?: unknown) => {
      (env as MarkdownEnv).frontmatter = frontmatter;
      return "<h1>rendered</h1>";
    },
  };
}

function env(): MarkdownEnv {
  return { path: "/x.md", relativePath: "x.md", cleanUrls: false };
}

describe("excludePrivatePages", () => {
  it("returns rendered html for normal pages", () => {
    expect(excludePrivatePages("# x", env(), fakeMd({}))).toBe("<h1>rendered</h1>");
  });

  it("returns empty string for private pages", () => {
    expect(excludePrivatePages("# x", env(), fakeMd({ private: true }))).toBe("");
  });

  it("keeps supporting search: false", () => {
    expect(excludePrivatePages("# x", env(), fakeMd({ search: false }))).toBe("");
  });
});
