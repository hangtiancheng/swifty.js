import { View } from "@lark.js/mvc";
import template from "./search.html";
import type { SearchResult } from "@/types";
import { useSearchStore } from "@/search-store";
import { getNextActiveIndex, getPreviousActiveIndex } from "@/utils/state";
import { highlightText } from "@/utils/highlight";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
  });
}

export default View.extend({
  template,

  init() {
    const syncToView = () => {
      const s = useSearchStore.getState();
      const trimmedQuery = s.trimmedQuery || "";
      const status = s.status || "idle";

      const displayResults = (s.results || []).map((item: SearchResult) => ({
        ...item,
        highlightedTitle: highlightText(item.title, trimmedQuery),
        highlightedDescription: highlightText(item.description, trimmedQuery),
        formattedDate: formatDate(item.updatedAt),
      }));

      this.updater.digest({
        isOpen: s.isOpen || false,
        query: s.query || "",
        trimmedQuery,
        results: displayResults,
        total: s.total || 0,
        status,
        errorMessage: s.errorMessage || "",
        activeIndex: s.activeIndex || 0,
        fromCache: s.fromCache || false,
        isRefreshing: s.isRefreshing || false,
        isLoading: status === "loading",
        canShowResults:
          s.isOpen && trimmedQuery.length > 0 && status !== "idle",
      });

      if (s.isOpen) {
        const safeFocus = this.wrapAsync(() => {
          const input = document.getElementById(
            "search-input",
          ) as HTMLInputElement | null;
          if (input) input.focus();
        });
        setTimeout(safeFocus, 80);
      }
    };

    const off = useSearchStore.subscribe(syncToView);
    this.on("destroy", off);
    syncToView();
  },

  "$document<keydown>"(e: Record<string, unknown>) {
    const key = e.key as string;
    if ((e.metaKey || e.ctrlKey) && key.toLowerCase() === "p") {
      (e as unknown as Event).preventDefault();
      useSearchStore.getState().openSearch();
      return;
    }

    const s = useSearchStore.getState();
    if (!s.isOpen) return;

    if (key === "Escape") {
      (e as unknown as Event).preventDefault();
      s.closeSearch();
      return;
    }

    if (key === "ArrowDown") {
      (e as unknown as Event).preventDefault();
      s.setActiveIndex(getNextActiveIndex(s.activeIndex, s.results.length));
      return;
    }

    if (key === "ArrowUp") {
      (e as unknown as Event).preventDefault();
      s.setActiveIndex(getPreviousActiveIndex(s.activeIndex, s.results.length));
      return;
    }

    if (key === "Enter") {
      const selectedResult = s.results[s.activeIndex];
      if (selectedResult) {
        (e as unknown as Event).preventDefault();
        s.selectResult(selectedResult);
      }
    }
  },

  "$document<pointerdown>"(e: Record<string, unknown>) {
    const target = e.eventTarget as Node | null;
    if (!target) return;
    const root = document.getElementById(this.id);
    if (root && root.contains(target)) return;

    const input = document.getElementById(
      "search-input",
    ) as HTMLInputElement | null;
    if (input) input.blur();
    useSearchStore.getState().closeSearch();
  },

  "onQueryInput<input>"() {
    const input = document.getElementById(
      "search-input",
    ) as HTMLInputElement | null;
    if (input) {
      useSearchStore.getState().setQuery(input.value);
    }
  },

  "onSearchFocus<focusin>"() {
    useSearchStore.getState().openSearch();
  },

  "onClearQuery<click>"() {
    useSearchStore.getState().setQuery("");
  },

  "onSelectResult<click>"(e: Record<string, unknown>) {
    const params = e.params as Record<string, string> | undefined;
    if (!params) return;
    const id = params.id;
    const s = useSearchStore.getState();
    const result = s.results.find((r: SearchResult) => r.id === id);
    if (result) s.selectResult(result);
  },

  "onHoverResult<mouseenter>"(e: Record<string, unknown>) {
    const params = e.params as Record<string, string> | undefined;
    if (!params) return;
    const index = Number(params.index);
    if (!isNaN(index)) useSearchStore.getState().setActiveIndex(index);
  },

  "onRetry<click>"() {
    useSearchStore.getState().retry();
  },
});
