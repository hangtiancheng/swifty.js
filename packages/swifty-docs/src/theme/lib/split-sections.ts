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
 * Split compiled page HTML into search sections at h1-h3 boundaries.
 *
 * Operates on this package's own compiler output (the anchor plugin sets
 * `id="slug"` on every heading and appends an `<a class="header-anchor">`
 * inside it), so a string-level split is reliable. Fence content is
 * HTML-escaped by the pipeline, so heading-like text inside code blocks can
 * never match — and stripping tags keeps code text searchable (full-text,
 * including code blocks). Pure function: usable in the browser and in node
 * tests.
 */

export interface ContentSection {
  /** Heading slug ("" for the intro text before the first heading). */
  slug: string;
  /** Heading text ("" for the intro section). */
  title: string;
  /** Heading level 1-3 (0 for the intro section). */
  level: number;
  /** Plain text of the section body (tags stripped, entities decoded). */
  text: string;
}

const HEADING_REGEXP = /<h([1-3])\b[^>]*\bid="([^"]*)"[^>]*>([\s\S]*?)<\/h\1>/g;
const HEADER_ANCHOR_REGEXP = /<a\b[^>]*\bclass="header-anchor"[\s\S]*?<\/a>/g;

function decodeNumericEntity(_m: string, dec?: string, hex?: string): string {
  const code = dec ? parseInt(dec, 10) : parseInt(hex ?? "", 16);
  return Number.isFinite(code) ? String.fromCodePoint(code) : "";
}

function htmlToText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#(\d+);|&#x([0-9a-fA-F]+);/g, decodeNumericEntity)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitContentSections(contentHtml: string): ContentSection[] {
  const sections: ContentSection[] = [];
  let lastIndex = 0;
  let current: Omit<ContentSection, "text"> = { slug: "", title: "", level: 0 };

  const push = (bodyHtml: string): void => {
    const text = htmlToText(bodyHtml);
    // Keep every real heading (even with an empty body — it is still a
    // navigation target); drop only an empty intro.
    if (current.level === 0 && !text) return;
    sections.push({ ...current, text });
  };

  HEADING_REGEXP.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = HEADING_REGEXP.exec(contentHtml)) !== null) {
    push(contentHtml.slice(lastIndex, match.index));
    current = {
      slug: match[2],
      title: htmlToText(match[3].replace(HEADER_ANCHOR_REGEXP, "")),
      level: Number(match[1]),
    };
    lastIndex = match.index + match[0].length;
  }
  push(contentHtml.slice(lastIndex));

  return sections;
}
