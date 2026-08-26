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
 * Regions excluded from protection by default in @swifty.js/docs sites: code blocks (`.codeblock` chrome incl. the copy
 * button), dialogs such as the search palette, and editable controls.
 */
export const DOCS_DEFAULT_EXCLUDES = [
  ".codeblock",
  "[role='dialog']",
  "input",
  "textarea",
  "[contenteditable='true']",
];

function stripTrailingSlash(path: string): string {
  const stripped = path.replace(/\/+$/, "");
  return stripped === "" ? "/" : stripped;
}

/**
 * Whether `path` matches one of the exempt route patterns. A string matches
 * when the current path equals it or starts with it followed by `/` (trailing
 * slashes on either side are ignored); a RegExp is tested against the full
 * path.
 */
export function isPathExcluded(path: string, patterns: (string | RegExp)[]): boolean {
  const current = stripTrailingSlash(path);
  return patterns.some((pattern) => {
    if (typeof pattern !== "string") return pattern.test(path);
    const prefix = stripTrailingSlash(pattern);
    return current === prefix || current.startsWith(`${prefix}/`);
  });
}
