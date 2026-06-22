/**
 * Lightweight runtime helpers for @lark.js/docs.
 *
 * This module is imported by compiled docs views at runtime.
 * It is kept small to avoid dragging build-time dependencies
 * into the browser bundle.
 */
import type { SearchEntry } from "./types";
export { slugify } from "./utils/slugify";

/**
 * Client-side full-text search over the pre-built index.
 *
 * Matches each search term against the entry's title, headings,
 * and excerpt using case-insensitive substring matching.
 * All terms must match (AND logic). Returns up to `limit` results.
 *
 * Each term is checked against individual fields (title, each heading,
 * excerpt) independently to avoid false matches across field boundaries.
 */
export function searchDocs(
  index: SearchEntry[],
  query: string,
  limit = 20,
): SearchEntry[] {
  if (!query.trim()) return [];

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);

  if (terms.length === 0) return [];

  const scored: Array<{ entry: SearchEntry; score: number }> = [];

  for (const entry of index) {
    const titleLower = entry.title.toLowerCase();
    const headingsLower = entry.headings.map((h) => h.toLowerCase());
    const excerptLower = entry.excerpt.toLowerCase();

    // Check each term against individual fields to avoid
    // false matches across field boundaries.
    const allMatch = terms.every(
      (term) =>
        titleLower.includes(term) ||
        headingsLower.some((h) => h.includes(term)) ||
        excerptLower.includes(term),
    );
    if (!allMatch) continue;

    // Score: title match > heading match > excerpt match
    let score = 0;
    for (const term of terms) {
      if (titleLower.includes(term)) score += 10;
      for (const h of headingsLower) {
        if (h.includes(term)) score += 5;
      }
      if (excerptLower.includes(term)) score += 1;
    }

    scored.push({ entry, score });
  }

  // Sort by score descending, then by title alphabetically
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.entry.title.localeCompare(b.entry.title);
  });

  return scored.slice(0, limit).map((s) => s.entry);
}
