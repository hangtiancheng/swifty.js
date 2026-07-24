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
 * YAML frontmatter extraction.
 *
 * Splits a .md file into:
 * - data: parsed YAML frontmatter object
 * - content: markdown body with frontmatter stripped
 *
 * This is a minimal, zero-dependency replacement for the unmaintained
 * gray-matter library. The logic is straightforward:
 * 1. Match the opening `---` delimiter
 * 2. Find the closing `---` delimiter
 * 3. Parse the YAML between them
 * 4. Return the rest as content
 */
import { load as yamlLoad } from "js-yaml";
import type { FrontmatterResult } from "@/types";

// The closing `---` may immediately follow the opening `---\n` for an
// empty frontmatter block, so the separator before the closing `---` is
// optional (\r?\n?). This also tolerates a missing trailing newline.
const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n?---\r?\n?/;

/**
 * Extract YAML frontmatter from a markdown source string.
 *
 * If the source has no frontmatter (no `---` delimiters at the start),
 * returns an empty data object and the full content.
 */
export function extractFrontmatter(source: string): FrontmatterResult {
  const match = source.match(FRONTMATTER_REGEX);

  if (!match) {
    return { data: {}, content: source };
  }

  const yamlStr = match[1];
  const content = source.slice(match[0].length);

  let data: Record<string, unknown> = {};
  try {
    const parsed = yamlLoad(yamlStr);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      data = parsed as Record<string, unknown>;
    }
  } catch {
    // If YAML parsing fails, return empty data and the full source
    return { data: {}, content: source };
  }

  return { data, content };
}
