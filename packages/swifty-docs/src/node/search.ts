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

import type { MarkdownEnv } from "vitepress";

/**
 * Minimal structural view of markdown-it. Using the concrete MarkdownIt
 * type here breaks assignability to `_render` whenever the workspace
 * resolves two copies of @types/markdown-it.
 */
export interface MarkdownItLike {
  render(src: string, env?: unknown): string;
}

/**
 * Drop-in `_render` for VitePress local search that keeps private pages out
 * of the search index. The local search plugin reads markdown straight from
 * disk, so the encryption transform alone cannot protect it.
 *
 * ```ts
 * themeConfig: {
 *   search: {
 *     provider: "local",
 *     options: { _render: excludePrivatePages },
 *   },
 * },
 * ```
 *
 * Mirrors the default implementation, including `search: false` support.
 */
export function excludePrivatePages(src: string, env: MarkdownEnv, md: MarkdownItLike): string {
  const html = md.render(src, env);
  const frontmatter = env.frontmatter ?? {};
  if (frontmatter["private"] === true || frontmatter["search"] === false) {
    return "";
  }
  return html;
}
