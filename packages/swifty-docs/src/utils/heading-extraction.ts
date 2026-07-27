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

/**
 * Heading and excerpt extraction from markdown content.
 *
 * Uses markdown-it (already a project dependency) to parse content into a
 * token stream, then walks the tokens to collect plain text — no fragile
 * regex stripping of inline syntax. Code blocks are naturally excluded
 * because fence/code_block tokens are never heading_open or inline tokens,
 * so heading-like or emphasis-like text inside code blocks is ignored.
 *
 * Everything (first h1, TOC headings, excerpt) is collected in a SINGLE
 * parse via extractPageMeta — this runs per file in both the scanner and
 * the compiler, so avoiding repeated parses matters.
 */
import MarkdownIt from "markdown-it";
import type { Token } from "markdown-it/index.js";
import type { HeadingInfo } from "@/types";
import { createSlugger } from "./slugify";

// Shared parser instance — parsing is on the hot path in the scanner.
const md = new MarkdownIt({ html: true, linkify: true });

/**
 * Collect plain text from an inline token's children.
 *
 * Walks the inline token's children and concatenates `text` and
 * `code_inline` content. Bold/italic/link markers are naturally stripped
 * because markdown-it emits them as separate open/close tokens wrapping
 * the text, not as part of the text content.
 *
 * Shared with the anchor plugin so rendered heading `id`s and extracted
 * TOC `slug`s are guaranteed to derive from identical text.
 */
export function inlineText(token: Token | undefined): string {
  if (!token || !token.children) return "";
  return token.children
    .filter((t) => t.type === "text" || t.type === "code_inline")
    .map((t) => t.content)
    .join("");
}

/** Metadata extracted from a markdown body in a single parse. */
export interface PageMeta {
  /** Text of the first h1 heading, if any. */
  firstHeading?: string;
  /** h2/h3 headings with deduplicated slugs for TOC generation. */
  headings: HeadingInfo[];
  /** Plain-text excerpt of non-heading body content. */
  excerpt: string;
}

/**
 * Extract the first h1, the h2/h3 TOC headings, and a plain-text excerpt
 * from markdown content in one markdown-it parse.
 *
 * Every heading level runs through the slugger (not just h2/h3) so the
 * dedup counters match the anchor plugin, which slugs all headings.
 */
export function extractPageMeta(
  content: string,
  excerptMaxLen = 200,
): PageMeta {
  const tokens = md.parse(content, {});
  const slugger = createSlugger();
  let firstHeading: string | undefined;
  let sawH1 = false;
  const headings: HeadingInfo[] = [];
  const excerptParts: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    if (t.type === "heading_open") {
      const text = inlineText(tokens[i + 1]);
      const slug = slugger(text);
      // Only the FIRST h1 counts as the page-title candidate, even when
      // its text is empty (e.g. an image-only heading) — matching the
      // historical extractFirstHeading behavior of stopping at the first h1.
      if (t.tag === "h1" && !sawH1) {
        sawH1 = true;
        firstHeading = text || undefined;
      }
      if ((t.tag === "h2" || t.tag === "h3") && text) {
        headings.push({ level: t.tag === "h2" ? 2 : 3, text, slug });
      }
      continue;
    }

    if (t.type === "inline") {
      // Skip the inline token that carries a heading's text — excerpts
      // should reflect body content, not section titles.
      const prev = tokens[i - 1];
      if (prev && prev.type === "heading_open") continue;
      const text = inlineText(t);
      if (text) excerptParts.push(text);
    }
  }

  const excerpt = excerptParts
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, excerptMaxLen);

  return { firstHeading, headings, excerpt };
}
