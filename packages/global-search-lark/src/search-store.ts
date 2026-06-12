import { create } from "@lark.js/mvc";
import type { SearchResult, SearchStatus } from "@/types";
import { defaultCacheTtlSeconds, defaultDebounceMs } from "@/utils/constants";
import {
  cleanupSearchCache,
  getCachedSearch,
  setCachedSearch,
} from "@/utils/cache";
import {
  getErrorMessage,
  isAbortError,
  parseSearchResponse,
  readErrorMessage,
} from "@/utils/response";
import { areSameResults } from "@/utils/results";
import { clampActiveIndex, getSearchStatus } from "@/utils/state";

interface SearchStoreAPI {
  isOpen: boolean;
  query: string;
  trimmedQuery: string;
  results: SearchResult[];
  total: number;
  status: SearchStatus;
  errorMessage: string;
  activeIndex: number;
  fromCache: boolean;
  isRefreshing: boolean;

  openSearch: () => void;
  closeSearch: () => void;
  setQuery: (value: string) => void;
  setActiveIndex: (index: number) => void;
  selectResult: (result: SearchResult) => void;
  retry: () => void;
}

export const useSearchStore = create<SearchStoreAPI>("search", (set, get) => {
  let controller: AbortController | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let requestVersion = 0;

  function cancelRequest() {
    requestVersion += 1;
    controller?.abort();
  }

  function updateResults(items: SearchResult[], nextTotal: number) {
    set({
      results: items,
      total: nextTotal,
      activeIndex: clampActiveIndex(get().activeIndex, items.length),
    });
  }

  async function runSearch(searchTerm: string, preferCache: boolean) {
    const cacheTtlMs = defaultCacheTtlSeconds * 1000;
    const key = searchTerm.toLowerCase();

    cleanupSearchCache(cacheTtlMs);
    set({ errorMessage: "" });

    const cached = getCachedSearch(key, cacheTtlMs);
    if (preferCache && cached) {
      updateResults(cached.items, cached.total);
      set({
        status: getSearchStatus(cached.items),
        fromCache: true,
        isRefreshing: true,
      });
    } else {
      set({ status: "loading", fromCache: false, isRefreshing: false });
    }

    cancelRequest();
    controller = new AbortController();
    const currentVersion = requestVersion;

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchTerm)}`,
        { signal: controller.signal },
      );

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      const data = parseSearchResponse(await response.json());
      if (currentVersion !== requestVersion) return;

      if (!areSameResults(get().results, data.items)) {
        updateResults(data.items, data.total);
      }

      setCachedSearch(key, data.items, data.total, cacheTtlMs);
      set({
        status: getSearchStatus(data.items),
        fromCache: false,
        errorMessage: "",
      });
    } catch (error) {
      if (isAbortError(error) || currentVersion !== requestVersion) return;

      const errMsg = getErrorMessage(error);
      set({ errorMessage: errMsg });
      if (!cached) {
        updateResults([], 0);
        set({ status: "error" });
      } else {
        set({ status: getSearchStatus(cached.items) });
      }
    } finally {
      if (currentVersion === requestVersion) {
        set({ isRefreshing: false });
      }
    }
  }

  function resetSearch() {
    if (debounceTimer) clearTimeout(debounceTimer);
    cancelRequest();
    set({
      results: [],
      total: 0,
      activeIndex: clampActiveIndex(0, 0),
      status: "idle" as SearchStatus,
      errorMessage: "",
      fromCache: false,
      isRefreshing: false,
    });
  }

  function openSearch() {
    set({ isOpen: true });
  }

  function closeSearch() {
    set({ isOpen: false, activeIndex: 0 });
  }

  function setQuery(value: string) {
    const trimmed = value.trim();

    if (debounceTimer) clearTimeout(debounceTimer);

    if (trimmed.length === 0) {
      set({ query: value, trimmedQuery: "" });
      resetSearch();
      return;
    }

    set({ query: value, trimmedQuery: trimmed });

    debounceTimer = setTimeout(() => {
      void runSearch(trimmed, true);
    }, defaultDebounceMs);
  }

  function setActiveIndex(index: number) {
    set({ activeIndex: clampActiveIndex(index, get().results.length) });
  }

  function selectResult(result: SearchResult) {
    window.history.pushState(null, "", result.url);
    closeSearch();
  }

  function retry() {
    if (get().trimmedQuery.length === 0) return;
    void runSearch(get().trimmedQuery, false);
  }

  return {
    isOpen: false,
    query: "",
    trimmedQuery: "",
    results: [] as SearchResult[],
    total: 0,
    status: "idle" as SearchStatus,
    errorMessage: "",
    activeIndex: 0,
    fromCache: false,
    isRefreshing: false,
    openSearch,
    closeSearch,
    setQuery,
    setActiveIndex,
    selectResult,
    retry,
  };
});
