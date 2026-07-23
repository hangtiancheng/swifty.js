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
