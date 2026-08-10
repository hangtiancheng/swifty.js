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
 * Client-side full-text search engine (local provider).
 *
 * MiniSearch (same engine as VitePress) with prefix matching, fuzzy
 * matching, and field-weighted scoring. The index is built lazily on the
 * first query by loading every page module via getSearchIndex().
 */
import MiniSearch, { type SearchResult } from "minisearch";
import { z } from "zod";
import {
  GetSearchIndexSchema,
  SearchEntrySchema,
  type GetSearchIndexFn,
  type RuntimeSearchEntry,
} from "./content";
import { buildSectionDocs } from "./split-sections";

export interface SearchHit {
  title: string;
  pageTitle: string;
  /** Hierarchical context, e.g. "Page › H2" for an h3 section. */
  crumb: string;
  link: string;
  text: string;
}

export interface SearchEngine {
  search(query: string): Promise<SearchHit[]>;
  /** Total number of indexed sections (available after first build). */
  size(): number;
  /** Drop the built index (md hot update) — next search rebuilds fresh. */
  invalidate(): void;
}

const CJK_CHAR = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;

/**
 * CJK-aware tokenizer (used for both indexing and querying). MiniSearch's
 * default splitter treats a whole CJK sentence as one token, so Chinese
 * text was only matchable by sentence-prefix. Word runs containing CJK are
 * additionally split into single characters (plus the run itself).
 */
export function cjkTokenize(text: string): string[] {
  const runs = text.match(/[\p{L}\p{N}]+/gu) ?? [];
  const tokens: string[] = [];
  for (const run of runs) {
    tokens.push(run);
    if (CJK_CHAR.test(run)) {
      for (const ch of run) tokens.push(ch);
    }
  }
  return tokens;
}

export function createSearchEngine(
  getSearchIndex: GetSearchIndexFn | null,
): SearchEngine {
  let mini: MiniSearch | null = null;
  let pending: Promise<MiniSearch | null> | null = null;
  let docCount = 0;
  // Bumped by invalidate(); an in-flight build from an older generation is
  // discarded instead of being cached as the (stale) index.
  let generation = 0;

  function ensure(): Promise<MiniSearch | null> {
    if (mini) return Promise.resolve(mini);
    if (pending) return pending;

    const myGeneration = generation;
    const build = (async () => {
      const fnParse = GetSearchIndexSchema.safeParse(getSearchIndex);
      if (!fnParse.success) {
        console.warn(
          "[@swifty.js/docs] getSearchIndex not injected — search is unavailable.",
        );
        return null;
      }
      const raw = await fnParse.data();
      const indexParse = z.array(SearchEntrySchema).safeParse(raw);
      if (!indexParse.success) {
        console.warn(
          "[@swifty.js/docs] search index failed validation — search is unavailable.",
        );
        return null;
      }
      const index: RuntimeSearchEntry[] = indexParse.data;
      if (index.length === 0) return null;

      // Section-level granularity: split each page's compiled HTML at
      // h1-h3 boundaries so results deep-link to /route#slug (full text —
      // code blocks included), with a hierarchical breadcrumb from the
      // section's h1/h2 ancestry.
      const docs = buildSectionDocs(index);
      if (docs.length === 0) return null;

      const m = new MiniSearch({
        fields: ["title", "pageTitle", "text"],
        storeFields: ["title", "pageTitle", "crumb", "link", "text"],
        tokenize: cjkTokenize,
        searchOptions: {
          prefix: true,
          fuzzy: 0.2,
          boost: { title: 2, pageTitle: 1.5 },
        },
      });
      m.addAll(docs);
      if (myGeneration !== generation) return null; // superseded mid-build
      docCount = docs.length;
      mini = m;
      return m;
    })().finally(() => {
      if (pending === build) pending = null;
    });
    pending = build;
    return pending;
  }

  return {
    async search(query: string): Promise<SearchHit[]> {
      const m = await ensure();
      if (!m) return [];
      let raw: (SearchResult & Partial<SearchHit>)[] = [];
      try {
        raw = m.search(query);
      } catch {
        raw = [];
      }
      return raw.map((r) => ({
        title: r.title || "",
        pageTitle: r.pageTitle || r.title || "",
        crumb: r.crumb || "",
        link: r.link || "",
        text: r.text || "",
      }));
    },
    size: () => docCount,
    invalidate: () => {
      generation++;
      mini = null;
      pending = null;
    },
  };
}

export type HighlightSegment = { text: string; mark: boolean };

/**
 * Limit hits per page (link without the #hash) while preserving ranking
 * order — one section-rich page must not flood the result list.
 */
export function capPerPage(hits: SearchHit[], max: number): SearchHit[] {
  const perPage = new Map<string, number>();
  const out: SearchHit[] = [];
  for (const hit of hits) {
    const page = hit.link.split("#")[0];
    const n = perPage.get(page) ?? 0;
    if (n >= max) continue;
    perPage.set(page, n + 1);
    out.push(hit);
  }
  return out;
}

/**
 * Cut a display snippet from section text, centered on the earliest
 * occurrence of any query term; falls back to the text head. Ellipses mark
 * truncated edges. Pair with highlightSegments for term marking.
 */
export function makeSnippet(text: string, query: string, span = 90): string {
  if (!text) return "";
  const lower = text.toLowerCase();
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);

  let hitIdx = -1;
  for (const t of terms) {
    const idx = lower.indexOf(t);
    if (idx >= 0 && (hitIdx < 0 || idx < hitIdx)) hitIdx = idx;
  }

  const start = hitIdx < 0 ? 0 : Math.max(0, hitIdx - 20);
  const end = Math.min(text.length, start + span);
  return (
    (start > 0 ? "…" : "") +
    text.slice(start, end) +
    (end < text.length ? "…" : "")
  );
}

/**
 * Split text into plain/marked segments for each query term occurrence.
 * Rendered as <mark> elements in React — no innerHTML involved.
 */
export function highlightSegments(
  text: string,
  query: string,
): HighlightSegment[] {
  if (!text) return [];
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);
  if (terms.length === 0) return [{ text, mark: false }];

  const pattern = terms
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const regex = new RegExp(`(${pattern})`, "gi");
  const parts = text.split(regex);
  const segments: HighlightSegment[] = [];
  for (const part of parts) {
    if (!part) continue;
    const mark = terms.some((t) => part.toLowerCase() === t);
    const last = segments[segments.length - 1];
    if (last && last.mark === mark) {
      last.text += part;
    } else {
      segments.push({ text: part, mark });
    }
  }
  return segments;
}
