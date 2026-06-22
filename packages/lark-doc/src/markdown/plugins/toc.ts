/**
 * Custom markdown-it plugin: [[toc]] directive.
 *
 * Replaces `[[toc]]` in markdown content with a `<div v-lark="theme/toc">`
 * placeholder that gets mounted as a TocView at runtime.
 */
import type MarkdownIt from "markdown-it";

export interface TocOptions {
  /** Heading levels to include. Default: [2, 3] */
  level?: number[];
}

export function tocPlugin(md: MarkdownIt, _options?: TocOptions): void {
  // Register inline rule to match [[toc]]
  md.inline.ruler.before("emphasis", "toc", (state, silent) => {
    if (silent) return false;

    const src = state.src.slice(state.pos);
    const match = src.match(/^\[\[toc\]\]/i);
    if (!match) return false;

    if (!silent) {
      const token = state.push("toc_placeholder", "", 0);
      token.markup = match[0];
    }

    state.pos += match[0].length;
    return true;
  });

  // Render the [[toc]] placeholder as a v-lark mount point
  // Render the [[toc]] placeholder as a v-lark mount point
  md.renderer.rules["toc_placeholder"] = () => {
    return '<div v-lark="theme/toc"></div>';
  };
}
