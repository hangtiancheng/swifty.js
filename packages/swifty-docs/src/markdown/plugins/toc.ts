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
 * Custom markdown-it plugin: [[toc]] directive.
 *
 * Replaces `[[toc]]` in markdown content with a `<div data-swifty-toc>`
 * placeholder. At runtime the Preact ContentRenderer mounts an inline
 * Toc component into every placeholder.
 */
import type MarkdownIt from "markdown-it";

export function tocPlugin(md: MarkdownIt): void {
  // Register inline rule to match [[toc]]
  md.inline.ruler.before("emphasis", "toc", (state, silent) => {
    const src = state.src.slice(state.pos);
    const match = src.match(/^\[\[toc\]\]/i);
    if (!match) return false;

    // During the silent probe phase, report a match so downstream inline
    // rules (e.g. emphasis) do not consume the leading "[" of [[toc]].
    if (silent) return true;

    const token = state.push("toc_placeholder", "", 0);
    token.markup = match[0];
    state.pos += match[0].length;
    return true;
  });

  // Render the [[toc]] placeholder as a mount point for the Preact Toc.
  md.renderer.rules["toc_placeholder"] = () => {
    return "<div data-swifty-toc></div>";
  };
}
