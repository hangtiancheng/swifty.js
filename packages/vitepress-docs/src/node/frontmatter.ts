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

import { load } from "js-yaml";

// The main regex requires at least one line between the delimiters, so an
// empty block (`---` immediately followed by `---`) is handled separately.
// Trailing spaces/tabs after the closing delimiter are tolerated so an
// invisible trailing space cannot silently disable a `private: true` flag.
const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---[^\S\r\n]*(?:\r?\n|$)/;
const EMPTY_FRONTMATTER_RE = /^---\r?\n---[^\S\r\n]*(?:\r?\n|$)/;

export interface ExtractedFrontmatter {
  data: Record<string, unknown>;
  content: string;
}

export function extractFrontmatter(src: string): ExtractedFrontmatter {
  if (EMPTY_FRONTMATTER_RE.test(src)) {
    return { data: {}, content: src.replace(EMPTY_FRONTMATTER_RE, "") };
  }
  const match = src.match(FRONTMATTER_RE);
  if (!match) return { data: {}, content: src };

  let data: Record<string, unknown> = {};
  try {
    const parsed = load(match[1] ?? "");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      data = parsed as Record<string, unknown>;
    }
  } catch {
    // Malformed YAML — treat as if the file had no frontmatter.
  }
  return { data, content: src.slice(match[0].length) };
}

/**
 * YAML-parsed check so every spelling YAML treats as true (`true`, `True`,
 * `TRUE`) is caught. A regex-only check would let such pages ship
 * unencrypted.
 */
export function isPrivate(data: Record<string, unknown>): boolean {
  return data["private"] === true;
}
