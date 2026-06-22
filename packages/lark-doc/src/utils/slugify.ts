/**
 * Shared slugify utility.
 *
 * Converts arbitrary text into a URL-safe slug string.
 * Used by the scanner, compiler, anchor plugin, and runtime.
 */

/**
 * Create a slug from heading text for anchor links.
 *
 * Rules:
 * - Lowercase the text
 * - Remove non-word characters (except spaces and dashes)
 * - Replace whitespace sequences with a single dash
 * - Collapse consecutive dashes
 * - Trim leading/trailing dashes
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
