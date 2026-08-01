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
import { splitContentSections } from "@/theme/lib/split-sections";
import { compileMarkdown } from "@/compile-markdown";
import type { DocsConfig } from "@/types";

const config: DocsConfig = { docs: "docs", baseUrl: "/", title: "Test" };

/** Extract contentHtml from a compiled module string. */
function htmlOf(module: string): string {
  const m = module.match(/export const contentHtml = ("(?:[^"\\]|\\.)*");/);
  expect(m).not.toBeNull();
  return JSON.parse(m![1]) as string;
}

describe("splitContentSections", () => {
  it("splits real compiler output at h1-h3 with matching slugs", async () => {
    const md =
      "intro before\n\n# Page\n\nlead\n\n## Alpha\n\nalpha body\n\n### Beta\n\nbeta body\n";
    const html = htmlOf(
      await compileMarkdown(md, { config, filePath: "docs/x.md" }),
    );
    const sections = splitContentSections(html);

    expect(sections.map((s) => [s.slug, s.title, s.level])).toEqual([
      ["", "", 0],
      ["page", "Page", 1],
      ["alpha", "Alpha", 2],
      ["beta", "Beta", 3],
    ]);
    expect(sections[0].text).toBe("intro before");
    expect(sections[1].text).toBe("lead");
    expect(sections[2].text).toBe("alpha body");
    expect(sections[3].text).toBe("beta body");
  });

  it("keeps code block text searchable (full text)", async () => {
    const md =
      "## Usage\n\nsome prose\n\n```ts\nconst uniqueIdentifier = createSwiftyCache();\n```\n";
    const html = htmlOf(
      await compileMarkdown(md, { config, filePath: "docs/x.md" }),
    );
    const [usage] = splitContentSections(html);
    expect(usage.title).toBe("Usage");
    expect(usage.text).toContain("uniqueIdentifier");
    expect(usage.text).toContain("createSwiftyCache");
  });

  it("does not split on heading-like text inside code fences", async () => {
    const md = "## Alpha\n\n```\n## not a heading\n```\n\ntail\n";
    const html = htmlOf(
      await compileMarkdown(md, { config, filePath: "docs/x.md" }),
    );
    const sections = splitContentSections(html);
    expect(sections.map((s) => s.title)).toEqual(["Alpha"]);
    expect(sections[0].text).toContain("not a heading");
    expect(sections[0].text).toContain("tail");
  });

  it("strips the header-anchor from section titles", async () => {
    const md = "## Alpha\n\nbody\n";
    const html = htmlOf(
      await compileMarkdown(md, { config, filePath: "docs/x.md" }),
    );
    expect(html).toContain("header-anchor");
    const sections = splitContentSections(html);
    expect(sections[0].title).toBe("Alpha");
  });

  it("keeps empty heading sections and drops an empty intro", () => {
    const html = '<h2 id="a">A</h2><h2 id="b">B</h2><p>body</p>';
    expect(splitContentSections(html).map((s) => [s.title, s.text])).toEqual([
      ["A", ""],
      ["B", "body"],
    ]);
  });

  it("decodes named and numeric entities", () => {
    const html =
      '<h2 id="x">X</h2><p>a &amp;&amp; b &lt;T&gt; it&#39;s &#x4e2d;</p>';
    const [x] = splitContentSections(html);
    expect(x.text).toBe("a && b <T> it's 中");
  });

  it("h4+ headings fold into the enclosing section", async () => {
    const md = "## Alpha\n\nbody a\n\n#### Deep\n\ndeep body\n";
    const html = htmlOf(
      await compileMarkdown(md, { config, filePath: "docs/x.md" }),
    );
    const sections = splitContentSections(html);
    expect(sections).toHaveLength(1);
    expect(sections[0].text).toContain("Deep");
    expect(sections[0].text).toContain("deep body");
  });
});
