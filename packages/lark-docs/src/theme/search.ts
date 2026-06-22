/**
 * SearchView - client-side full-text search dialog.
 *
 * Renders a modal search dialog. The search index is loaded lazily
 * when the dialog first opens. Uses the searchDocs() runtime helper.
 */

export function createSearchView(View: any, template: any): any {
  return View.extend({
    template,

    init() {
      this.searchIndex = null;
      this.assign();
    },

    assign() {
      this.updater.snapshot();
      this.updater.set({
        isOpen: false,
        results: [],
        hasSearched: false,
      });
      return this.updater.altered();
    },

    render() {
      this.updater.digest();
    },

    "openSearch<click>"() {
      this.updater
        .set({ isOpen: true, results: [], hasSearched: false })
        .digest();
      // Focus the input after the modal renders
      setTimeout(() => {
        const input = document.getElementById(
          "docs-search-input",
        ) as HTMLInputElement;
        input?.focus();
      }, 100);
    },

    "closeSearch<click>"() {
      this.updater
        .set({ isOpen: false, results: [], hasSearched: false })
        .digest();
    },

    "noop<click>"() {
      // Prevent click propagation from modal-box to modal overlay
    },

    "onSearchInput<input>"(e: Event) {
      const input = e.target as HTMLInputElement;
      const query = input?.value || "";

      if (!query.trim()) {
        this.updater.set({ results: [], hasSearched: false }).digest();
        return;
      }

      // Lazy-load search index
      if (!this.searchIndex) {
        const State = (this.owner as any)?.constructor?.State;
        this.searchIndex = State?.get?.("searchIndex") || [];
      }

      // Import searchDocs at runtime to avoid circular dependency
      // The searchDocs function is simple enough to inline here
      const results = simpleSearch(this.searchIndex, query);
      this.updater.set({ results, hasSearched: true }).digest();
    },

    "goToResult<click>"(e: Event) {
      const target = e.target as HTMLElement;
      const href = target.dataset.href;
      if (href) {
        const Router = (this.owner as any)?.constructor?.Router;
        Router?.to?.(href);
        this.updater
          .set({ isOpen: false, results: [], hasSearched: false })
          .digest();
      }
    },
  });
}

/**
 * Simple inline search function to avoid importing the runtime module.
 * Matches all terms (AND) against title + headings + excerpt.
 */
function simpleSearch(
  index: Array<{
    title: string;
    link: string;
    headings: string[];
    excerpt: string;
  }>,
  query: string,
): Array<{ title: string; link: string; headings: string[]; excerpt: string }> {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);

  if (terms.length === 0) return [];

  return index
    .filter((entry) => {
      const haystack = [entry.title, ...entry.headings, entry.excerpt]
        .join(" ")
        .toLowerCase();
      return terms.every((term) => haystack.includes(term));
    })
    .slice(0, 20);
}
