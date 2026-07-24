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
 * Custom markdown-it plugin: heading anchor IDs and permalink symbols.
 *
 * Adds `id="slug"` to heading tokens and optionally injects a `#` permalink
 * anchor link for h1-h3 headings.
 */
import type MarkdownIt from "markdown-it";
import { slugify } from "../../utils/slugify";
import type { StateCore } from "markdown-it/index.js";

export interface AnchorOptions {
  /** Add a permalink `#` symbol after headings. Default: true */
  permalink?: boolean;
}

export function anchorPlugin(md: MarkdownIt, options?: AnchorOptions): void {
  const addPermalink = options?.permalink ?? true;

  md.core.ruler.push("heading_anchors", (state: StateCore) => {
    const slugs = new Set<string>();

    for (let i = 0; i < state.tokens.length; i++) {
      const token = state.tokens[i];
      if (token.type !== "heading_open") continue;

      const level = parseInt(token.tag.slice(1), 10);
      const nextToken = state.tokens[i + 1];
      const text =
        nextToken?.children
          ?.filter((t) => t.type === "text" || t.type === "code_inline")
          .map((t) => t.content)
          .join("") ?? "";

      let slug = slugify(text);

      // Deduplicate slugs within the same document
      if (slugs.has(slug)) {
        let counter = 1;
        while (slugs.has(`${slug}-${counter}`)) counter++;
        slug = `${slug}-${counter}`;
      }
      slugs.add(slug);

      token.attrSet("id", slug);

      // Inject permalink anchor for h1-h3
      if (addPermalink && level <= 3 && nextToken?.children) {
        const anchorToken = new state.Token("html_inline", "", 0);
        anchorToken.content = ` <a class="header-anchor" href="#${slug}" aria-label="Link to this section">#</a>`;
        nextToken.children.push(anchorToken);
      }
    }
  });
}
