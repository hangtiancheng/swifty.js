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
 * Shared slugify utility.
 *
 * Converts arbitrary text into a URL-safe slug string.
 * Used by the scanner, compiler, anchor plugin, and runtime.
 */

/**
 * Create a slug from heading text for anchor links.
 *
 * Uses Unicode property escapes (\p{L} for letters, \p{N} for numbers)
 * so that CJK, Cyrillic, Arabic, and other non-ASCII scripts are preserved.
 *
 * Rules:
 * - Lowercase the text
 * - Replace non-letter/number/space/dash characters with a dash (preserves
 *   word boundaries — "Hello!World" → "hello-world", not "helloworld")
 * - Replace whitespace sequences with a single dash
 * - Collapse consecutive dashes
 * - Trim leading/trailing dashes
 * - Prefix a leading digit with underscore so the slug is a valid CSS
 *   selector (querySelector("#123") is invalid; "#_123" is valid)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/^(\d)/, "_$1");
}
