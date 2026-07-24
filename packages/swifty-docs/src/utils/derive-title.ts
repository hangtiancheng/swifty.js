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
 * Shared title derivation utilities.
 *
 * Used by both the scanner and compiler to ensure consistent
 * title generation across the build pipeline.
 */

/**
 * Derive a human-readable title from a file path.
 *
 * Rules:
 * - "index.md" uses the parent directory name (e.g. "guide/index" -> "Guide")
 * - If there is no parent directory, falls back to "Home"
 * - Other files: replace dashes with spaces and capitalize words
 *   (e.g. "getting-started" -> "Getting Started")
 */
export function deriveTitleFromPath(filePath: string): string {
  const segments = filePath.split("/");
  const fileName = segments[segments.length - 1] || "index";
  const name = fileName.replace(/\.md$/, "");
  if (name === "index") {
    const parent = segments[segments.length - 2];
    if (!parent) return "Home";
    return parent
      .replace(/-/g, " ")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
