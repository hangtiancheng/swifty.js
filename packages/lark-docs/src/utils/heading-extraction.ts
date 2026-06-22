/**
 * Shared heading and title extraction from markdown content.
 *
 * Both the scanner and compiler need to extract headings and titles
 * from raw markdown. These utilities strip code blocks first to avoid
 * false matches on heading-like syntax inside fenced code blocks.
 */
import type { HeadingInfo } from "../types";
import { slugify } from "./slugify";

/**
 * Strip fenced code blocks (``` ... ```) from markdown content.
 *
 * Prevents regex-based heading extraction from matching lines like
 * `# npm install` inside a code block. Only fenced code blocks are
 * stripped; indented code blocks are left as-is (rare in practice).
 */
export function stripCodeBlocks(content: string): string {
  return content.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, "");
}

/**
 * Extract the first h1 heading from markdown content.
 *
 * Code blocks are stripped first so that headings inside fenced
 * code blocks are not mistaken for real document headings.
 */
export function extractFirstHeading(content: string): string | undefined {
  const stripped = stripCodeBlocks(content);
  const match = stripped.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim();
}

/**
 * Extract h2/h3 headings from markdown content for TOC generation.
 *
 * Code blocks are stripped first so that headings inside fenced
 * code blocks do not appear in the table of contents.
 */
export function extractHeadings(content: string): HeadingInfo[] {
  const stripped = stripCodeBlocks(content);
  const headings: HeadingInfo[] = [];
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(stripped)) !== null) {
    const rawText = m[2].trim();
    headings.push({
      level: m[1].length,
      text: rawText,
      slug: slugify(rawText),
    });
  }
  return headings;
}
