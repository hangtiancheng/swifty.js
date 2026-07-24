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
import { extractFrontmatter } from "@/markdown/frontmatter";

describe("extractFrontmatter", () => {
  it("extracts YAML frontmatter from markdown", () => {
    const source = `---
title: Hello World
description: A test page
sidebar_position: 1
---

# Hello World

Some content here.
`;
    const result = extractFrontmatter(source);

    expect(result.data["title"]).toBe("Hello World");
    expect(result.data["description"]).toBe("A test page");
    expect(result.data["sidebar_position"]).toBe(1);
    expect(result.content).toContain("# Hello World");
    expect(result.content).toContain("Some content here.");
  });

  it("returns empty data when no frontmatter present", () => {
    const source = "# Just a heading\n\nSome content.";
    const result = extractFrontmatter(source);

    expect(result.data).toEqual({});
    expect(result.content).toContain("# Just a heading");
  });

  it("handles empty source", () => {
    const result = extractFrontmatter("");
    expect(result.data).toEqual({});
    expect(result.content).toBe("");
  });

  it("extracts draft flag", () => {
    const source = `---
title: Draft Page
draft: true
---

Draft content.
`;
    const result = extractFrontmatter(source);
    expect(result.data["draft"]).toBe(true);
  });

  it("extracts sidebar_label and sidebar_group", () => {
    const source = `---
title: Config
sidebar_label: Configuration
sidebar_group: Guide
sidebar_position: 3
---

Content.
`;
    const result = extractFrontmatter(source);
    expect(result.data["sidebar_label"]).toBe("Configuration");
    expect(result.data["sidebar_group"]).toBe("Guide");
    expect(result.data["sidebar_position"]).toBe(3);
  });
});
