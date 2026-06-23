/**
 * SearchView - client-side full-text search dialog (local provider).
 *
 * Uses MiniSearch (same engine as VitePress) for prefix matching, fuzzy
 * matching, and field-weighted scoring. The search index is built at
 * compile time (buildSearchIndex) and embedded in docsConfig.searchIndex;
 * this view lazily constructs a MiniSearch instance on first query.
 *
 * Open/close state is driven by State.searchOpen so the layout's navbar
 * button can toggle this sub-view without a direct reference.
 */
import MiniSearch, { type SearchResult } from "minisearch";
import {
  State,
  Router,
  View as ViewClass,
  type ViewInterface,
} from "@lark.js/mvc";
import { icons as defaultIcons } from "./icons";
import type { DocsConfig, SearchEntry } from "../types";

/**
 * Shape of `this` inside SearchView methods. Custom state (_mini) and helper
 * (_ensureMiniSearch) are not on ViewInterface, so they must be declared
 * explicitly via a `this:` parameter annotation.
 */
interface SearchViewThis extends ViewInterface {
  _mini: MiniSearch | null;
  _ensureMiniSearch(): Promise<MiniSearch | null>;
}

export function createSearchView(View: typeof ViewClass, template: unknown) {
  return View.extend({
    template,

    init(this: SearchViewThis) {
      this.updater.set({
        icons: defaultIcons,
        results: [],
        hasSearched: false,
        query: "",
      });
      this._mini = null;
      // Re-render when the layout toggles searchOpen via State.
      this.observeState("searchOpen");
      this.assign?.();
    },

    /**
     * Pull isOpen from State. Only updates isOpen — results/hasSearched/query
     * are managed by onSearchInput so they survive open/close cycles.
     */
    assign() {
      this.updater.snapshot();
      const isOpen = !!State.get("searchOpen");
      this.updater.set({ isOpen });
      return this.updater.altered();
    },

    render() {
      // observeState triggers render (not assign), so re-read State here
      // to refresh isOpen before digesting.
      this.assign?.();
      this.updater.digest();
      if (this.updater.get("isOpen")) {
        // Focus the input after the modal opens.
        requestAnimationFrame(() => {
          const input = document.getElementById(
            "docs-search-input",
          ) as HTMLInputElement | null;
          input?.focus();
        });
      }
    },

    "onModalClick<click>"(e: { eventTarget?: HTMLElement }) {
      // Only close when the click lands on the modal backdrop itself,
      // not on content inside the modal-box (input, results, etc.).
      if (e.eventTarget?.id === "docs-search-modal") {
        State.set({ searchOpen: false }).digest();
      }
    },

    "noop<click>"() {
      // Prevent click propagation from modal-box to modal overlay.
    },

    async "onSearchInput<input>"(this: SearchViewThis, e: Event) {
      const input = e.target as HTMLInputElement;
      const query = input?.value || "";

      if (!query.trim()) {
        this.updater
          .set({ results: [], hasSearched: false, query: "" })
          .digest();
        return;
      }

      const mini = await this._ensureMiniSearch();

      let raw: (SearchResult & Partial<SearchEntry>)[] = [];
      if (mini) {
        try {
          raw = mini.search(query);
        } catch {
          raw = [];
        }
      }

      const results = raw.map((r) => ({
        title: r.title || "",
        link: r.link || "",
        excerpt: r.excerpt || "",
        highlightedTitle: highlightMatch(r.title || "", query),
        highlightedExcerpt: highlightMatch(r.excerpt || "", query),
      }));

      this.updater.set({ results, hasSearched: true, query }).digest();
    },

    "goToResult<click>"(e: Event) {
      // The click may land on a child element (<p>, <mark>) inside the <a>,
      // so walk up to find the element carrying data-href.
      let target = e.target as HTMLElement | null;
      while (target && !target.dataset["href"]) {
        target = target.parentElement;
      }
      const href = target?.dataset["href"];
      if (href) {
        Router.to(href);
        State.set({ searchOpen: false }).digest();
      }
    },

    /**
     * Lazily build the MiniSearch instance. The search index is built on
     * first query by loading all .md modules (via getSearchIndex from State)
     * and extracting pageData — no build-time searchIndex serialization.
     * MiniSearch requires a unique `id` field, synthesized from array index.
     */
    async _ensureMiniSearch(this: SearchViewThis): Promise<MiniSearch | null> {
      if (this._mini) return this._mini;
      const getSearchIndex = State.get("getSearchIndex") as
        | (() => Promise<
            {
              title: string;
              link: string;
              headings: string[];
              excerpt: string;
            }[]
          >)
        | undefined;
      if (!getSearchIndex) return null;
      const index = await getSearchIndex();
      if (!index.length) return null;

      const docs = index.map((entry, i) => ({
        ...entry,
        id: i,
      }));
      this._mini = new MiniSearch({
        fields: ["title", "headings", "excerpt"],
        storeFields: ["title", "link", "headings", "excerpt"],
        searchOptions: {
          prefix: true,
          fuzzy: 0.2,
          boost: { title: 2, headings: 1.5 },
        },
      });
      this._mini.addAll(docs);
      return this._mini;
    },
  });
}

/**
 * Wrap each query term occurrence in <mark> for highlighting.
 * Used with the raw {{!}} output operator in the template.
 */
function highlightMatch(text: string, query: string): string {
  if (!text) return "";
  if (!query) return text;
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);
  let result = text;
  for (const term of terms) {
    const regex = new RegExp(`(${escapeRegExp(term)})`, "gi");
    result = result.replace(regex, "<mark>$1</mark>");
  }
  return result;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
