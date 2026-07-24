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
 * Custom markdown-it renderer that produces the theme's content HTML.
 *
 * The rendered HTML is embedded into the compiled page module as
 * `contentHtml` and injected into the article element by the SolidJS
 * ContentRenderer at runtime. Internal links use `data-swifty-nav`
 * attributes (intercepted for SPA navigation), and code blocks are
 * pre-rendered at build time.
 */
import type MarkdownIt from "markdown-it";
import type { Token } from "markdown-it/index.js";

/**
 * Render markdown-it tokens to an HTML string.
 *
 * The output is static HTML — all content comes from the .md file at
 * build time. Dynamic data (page title, TOC headings, sidebar state)
 * flows through Solid signals in the theme instead.
 */
export function renderToSwiftyTemplate(
  tokens: Token[],
  md: MarkdownIt,
): string {
  // Use the default renderer (which has our plugin overrides applied).
  // The plugins handle link interception, heading anchors, containers,
  // and code blocks through their render rule overrides.
  return md.renderer.render(tokens, md.options, {});
}
