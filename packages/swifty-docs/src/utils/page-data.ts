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
 * Shared PageData construction.
 *
 * The scanner and the compiler both derive PageData from the same inputs
 * (frontmatter + markdown body + relative path). Keeping the fallback
 * chains in one place prevents the two pipelines from drifting — a drift
 * here would make sidebar labels disagree with compiled page titles.
 */
import type { PageData } from "@/types";
import { deriveTitleFromPath } from "./derive-title";
import { extractPageMeta } from "./heading-extraction";

// Frontmatter values come from user-authored YAML, so a `title: 123` is a
// number at runtime even though the field is typed string. Coerce scalars
// instead of casting — an uncoerced number would later crash the search
// index (`toLowerCase` on a number).
function asString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

/**
 * Build PageData from extracted frontmatter, the markdown body, and the
 * file path relative to the docs dir. Single markdown parse per call.
 */
export function buildPageData(
  frontmatter: Record<string, unknown>,
  content: string,
  relativePath: string,
): PageData {
  const derivedTitle = deriveTitleFromPath(relativePath);
  const meta = extractPageMeta(content);

  return {
    title: asString(frontmatter["title"]) || meta.firstHeading || derivedTitle,
    description: asString(frontmatter["description"]) || derivedTitle,
    excerpt: meta.excerpt,
    sidebarPosition: asNumber(frontmatter["sidebar_position"]),
    sidebarLabel: asString(frontmatter["sidebar_label"]) || undefined,
    draft: frontmatter["draft"] === true || undefined,
    headings: meta.headings,
    relativePath,
  };
}
