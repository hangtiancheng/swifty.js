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
import {
  capPerPage,
  cjkTokenize,
  createSearchEngine,
  makeSnippet,
} from "@/theme/lib/search";
import { SearchEntrySchema } from "@/theme/lib/content";

describe("cjkTokenize", () => {
  it("splits CJK runs into single characters plus the run", () => {
    expect(cjkTokenize("分布式缓存")).toEqual([
      "分布式缓存",
      "分",
      "布",
      "式",
      "缓",
      "存",
    ]);
  });

  it("keeps latin words whole", () => {
    expect(cjkTokenize("hello world 42")).toEqual(["hello", "world", "42"]);
  });

  it("splits latin text on hyphens into word tokens", () => {
    expect(cjkTokenize("Hello world-foo bar42")).toEqual([
      "Hello",
      "world",
      "foo",
      "bar42",
    ]);
  });

  it("handles mixed CJK/latin text", () => {
    const tokens = cjkTokenize("使用 MiniSearch 检索");
    expect(tokens).toContain("MiniSearch");
    expect(tokens).toContain("使");
    expect(tokens).toContain("检");
    expect(tokens).not.toContain("M"); // latin runs are not char-split
  });

  it("returns empty for punctuation-only input", () => {
    expect(cjkTokenize("!?…—。")).toEqual([]);
  });
});

describe("SearchEntrySchema (contentHtml required)", () => {
  it("accepts current entries carrying contentHtml", () => {
    const entry = {
      title: "Page",
      link: "/p",
      excerpt: "intro",
      contentHtml: '<h2 id="a">A</h2><p>body</p>',
    };
    expect(SearchEntrySchema.safeParse(entry).success).toBe(true);
  });

  it("rejects legacy entries without contentHtml (fail fast, regenerate)", () => {
    const legacy = {
      title: "Page",
      link: "/p",
      headings: ["A", "B"],
      excerpt: "intro",
    };
    expect(SearchEntrySchema.safeParse(legacy).success).toBe(false);
  });
});

describe("createSearchEngine (runtime section split)", () => {
  const index = [
    {
      title: "Guide",
      link: "/guide",
      excerpt: "总体介绍",
      contentHtml:
        '<p>总体介绍</p><h2 id="install">安装步骤</h2><p>先安装依赖，然后配置分布式缓存组件</p>' +
        '<h2 id="usage">使用</h2><pre><code>const uniqueCacheToken = 1;</code></pre>' +
        '<h3 id="advanced">进阶用法</h3><p>advanced body</p>',
    },
  ];

  it("hits mid-sentence Chinese terms and deep-links to the section", async () => {
    const engine = createSearchEngine(async () => index);
    const hits = await engine.search("缓存");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].link).toBe("/guide#install");
    expect(hits[0].pageTitle).toBe("Guide");
  });

  it("finds identifiers inside code blocks (full-text)", async () => {
    const engine = createSearchEngine(async () => index);
    const hits = await engine.search("uniqueCacheToken");
    expect(hits.length).toBe(1);
    expect(hits[0].link).toBe("/guide#usage");
  });

  it("builds hierarchical crumbs from h2 ancestry for h3 sections", async () => {
    const engine = createSearchEngine(async () => index);
    const hits = await engine.search("advanced");
    const h3 = hits.find((h) => h.link === "/guide#advanced");
    expect(h3).toBeDefined();
    expect(h3!.crumb).toBe("Guide › 使用");
  });

  it("counts sections, not pages", async () => {
    const engine = createSearchEngine(async () => index);
    await engine.search("缓存");
    expect(engine.size()).toBe(4); // intro + install + usage + advanced
  });

  it("invalidate() rebuilds from fresh index data (md hot update)", async () => {
    let current = index;
    const engine = createSearchEngine(async () => current);
    expect((await engine.search("brandNewWord")).length).toBe(0);

    current = [
      {
        title: "Guide",
        link: "/guide",
        excerpt: "",
        contentHtml: '<h2 id="fresh">Fresh</h2><p>brandNewWord here</p>',
      },
    ];
    // Without invalidate the stale index would keep missing the new word.
    engine.invalidate();
    const hits = await engine.search("brandNewWord");
    expect(hits.length).toBe(1);
    expect(hits[0].link).toBe("/guide#fresh");
  });
});

describe("capPerPage", () => {
  const hit = (link: string) => ({
    title: "t",
    pageTitle: "p",
    crumb: "",
    link,
    text: "",
  });

  it("limits hits per page while preserving order", () => {
    const hits = [
      hit("/a#1"),
      hit("/a#2"),
      hit("/b#1"),
      hit("/a#3"),
      hit("/a#4"),
      hit("/b#2"),
    ];
    const capped = capPerPage(hits, 2);
    expect(capped.map((h) => h.link)).toEqual(["/a#1", "/a#2", "/b#1", "/b#2"]);
  });

  it("treats the hash-less page link as the same page", () => {
    const hits = [hit("/a"), hit("/a#1"), hit("/a#2")];
    expect(capPerPage(hits, 2)).toHaveLength(2);
  });
});

describe("makeSnippet", () => {
  it("windows around the first match with ellipses", () => {
    const text = "x".repeat(100) + " target word here " + "y".repeat(100);
    const snippet = makeSnippet(text, "target");
    expect(snippet).toContain("target");
    expect(snippet.startsWith("…")).toBe(true);
    expect(snippet.endsWith("…")).toBe(true);
    expect(snippet.length).toBeLessThan(100);
  });

  it("falls back to the text head when nothing matches", () => {
    const snippet = makeSnippet("short body text", "nomatch");
    expect(snippet).toBe("short body text");
  });

  it("omits ellipses when the whole text fits", () => {
    expect(makeSnippet("short text", "short", 90)).toBe("short text");
  });

  it("returns empty string for empty text", () => {
    expect(makeSnippet("", "x")).toBe("");
  });
});
