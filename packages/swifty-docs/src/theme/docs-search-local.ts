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
 * Local search client adapter for Algolia DocSearch.
 *
 * Bridges the local search index (built at runtime by getSearchIndex) with DocSearch's
 * UI widget. DocSearch expects an Algolia-compatible search client; this module
 * provides one that queries the local index instead of Algolia's hosted API.
 *
 * No Algolia account or API key is required.
 */
import type { SearchEntry } from "@/types";

/**
 * Algolia-compatible search client that queries a local SearchEntry index.
 *
 * DocSearch calls `search(requests)` with an array of query requests.
 * Each request has `params.query` (the search string) and `params.hitsPerPage`.
 * The response must wrap hits in `{ results: [{ hits, nbHits, ... }] }`.
 *
 * Scoring (per matched term):
 *   title match  = 10 pts
 *   heading match = 5 pts
 *   excerpt match = 1 pt
 * All terms must match (AND logic). Results are sorted by score descending.
 */
export function createLocalSearchClient(index: SearchEntry[]) {
  return {
    async search(
      requests: Array<{
        indexName: string;
        params: { query: string; hitsPerPage?: number };
      }>,
    ) {
      const results = requests.map((request) => {
        const { query, hitsPerPage = 20 } = request.params;

        if (!query?.trim()) {
          return emptyResult();
        }

        const entries = searchLocalIndex(index, query, hitsPerPage);
        const hits = entries.map((e, i) => toDocSearchHit(e, i));

        return {
          hits,
          nbHits: hits.length,
          page: 0,
          nbPages: Math.ceil(hits.length / hitsPerPage),
          hitsPerPage,
          processingTimeMS: 0,
          query,
          params: "",
        };
      });

      return { results };
    },
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function emptyResult() {
  return {
    hits: [],
    nbHits: 0,
    page: 0,
    nbPages: 0,
    hitsPerPage: 20,
    processingTimeMS: 0,
    query: "",
    params: "",
  };
}

/**
 * Score and filter local index entries against a query string.
 * Returns up to `limit` results sorted by relevance.
 */
function searchLocalIndex(
  index: SearchEntry[],
  query: string,
  limit: number,
): SearchEntry[] {
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

    // All terms must match at least one field (AND logic)
    const allMatch = terms.every(
      (term) =>
        titleLower.includes(term) ||
        headingsLower.some((h) => h.includes(term)) ||
        excerptLower.includes(term),
    );
    if (!allMatch) continue;

    // Score: title > heading > excerpt
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

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.entry.title.localeCompare(b.entry.title);
  });

  return scored.slice(0, limit).map((s) => s.entry);
}

/**
 * Convert a SearchEntry into the DocSearch hit format.
 *
 * DocSearch groups results by `hierarchy.lvl0` (page title) and displays
 * `hierarchy.lvl1` (first heading) as the result subtitle. The `url` field
 * is used for navigation on click.
 *
 * `_highlightResult` and `_snippetResult` provide the highlighted text
 * that DocSearch renders in the result list.
 */
function toDocSearchHit(entry: SearchEntry, index: number) {
  const firstHeading = entry.headings[0] || "";

  return {
    objectID: String(index),
    url: entry.link,
    content: entry.excerpt || null,
    hierarchy: {
      lvl0: entry.title,
      lvl1: firstHeading || null,
      lvl2: null,
      lvl3: null,
      lvl4: null,
      lvl5: null,
      lvl6: null,
    },
    _highlightResult: {
      hierarchy: {
        lvl0: highlightValue(entry.title),
        lvl1: firstHeading ? highlightValue(firstHeading) : undefined,
      },
    },
    _snippetResult: {
      content: entry.excerpt
        ? { value: entry.excerpt, matchLevel: "full" as const }
        : undefined,
      hierarchy: {
        lvl0: { value: entry.title, matchLevel: "full" as const },
        lvl1: firstHeading
          ? { value: firstHeading, matchLevel: "full" as const }
          : undefined,
      },
    },
  };
}

function highlightValue(value: string) {
  return { value, matchLevel: "full" as const };
}
