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
import { extractFrontmatter, isPrivate } from "../src/node/frontmatter";

describe("extractFrontmatter", () => {
  it("parses simple frontmatter", () => {
    const { data, content } = extractFrontmatter("---\nprivate: true\ntitle: Hi\n---\n\n# Body\n");
    expect(data).toEqual({ private: true, title: "Hi" });
    expect(content).toBe("\n# Body\n");
  });

  it("tolerates trailing spaces after the closing delimiter", () => {
    const { data } = extractFrontmatter("---\nprivate: true\n---   \nbody");
    expect(isPrivate(data)).toBe(true);
  });

  it("handles empty frontmatter blocks", () => {
    const { data, content } = extractFrontmatter("---\n---\nbody");
    expect(data).toEqual({});
    expect(content).toBe("body");
  });

  it("returns everything as content without frontmatter", () => {
    const src = "# Just a doc\n";
    expect(extractFrontmatter(src)).toEqual({ data: {}, content: src });
  });

  it("treats malformed YAML as no frontmatter data", () => {
    const { data } = extractFrontmatter("---\n{ not: [valid\n---\nbody");
    expect(data).toEqual({});
  });
});

describe("isPrivate", () => {
  it.each(["true", "True", "TRUE"])("accepts private: %s", (spelling) => {
    const { data } = extractFrontmatter(`---\nprivate: ${spelling}\n---\nx`);
    expect(isPrivate(data)).toBe(true);
  });

  it.each(['"true"', "yes", "1", "false"])("rejects non-boolean private: %s", (spelling) => {
    const { data } = extractFrontmatter(`---\nprivate: ${spelling}\n---\nx`);
    expect(isPrivate(data)).toBe(false);
  });
});
