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
 * Custom markdown-it plugin: admonition containers.
 *
 * Supports the `::: type` syntax for tip, warning, danger, and details
 * blocks. Uses markdown-it-container for parsing, with render functions
 * that emit the theme's .callout components (styled by client.css).
 */
import type MarkdownIt from "markdown-it";
import container from "markdown-it-container";
import type { Token } from "markdown-it/index.js";
import { ChevronRight, Info, OctagonAlert, TriangleAlert } from "lucide-static";

const CONTAINER_TYPES = ["tip", "warning", "danger", "details"] as const;

/** Decorative lucide glyphs per container type (sized by .callout-title css). */
const ICONS: Record<string, string> = {
  tip: decorative(Info),
  warning: decorative(TriangleAlert),
  danger: decorative(OctagonAlert),
  details: decorative(ChevronRight),
};

function decorative(svg: string): string {
  return svg.replace("<svg", '<svg aria-hidden="true"');
}

export interface ContainerOptions {
  [type: string]: { label: string };
}

export function containerPlugin(
  md: MarkdownIt,
  options?: ContainerOptions,
): void {
  for (const type of CONTAINER_TYPES) {
    const label = options?.[type]?.label ?? type.toUpperCase();

    md.use(container, type, {
      render(tokens: Token[], idx: number): string {
        if (tokens[idx].nesting === 1) {
          const customTitle = tokens[idx].info.trim().slice(type.length).trim();
          const title = customTitle || label;
          const escapedTitle = escapeHtml(title);
          const icon = ICONS[type] ?? "";

          if (type === "details") {
            return `
            <details class="callout callout-details">
              <summary class="callout-title">${icon}${escapedTitle}</summary>`;
          }
          return `
          <div class="callout callout-${type}" role="note">
            <p class="callout-title">${icon}${escapedTitle}</p>`;
        }
        return type === "details" ? "</details>" : "</div>";
      },
    });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
