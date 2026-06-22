import { icons as defaultIcons } from "./icons";
import { createLocalSearchClient } from "./docsearch-local";
import type { DocsConfig } from "@/types";

export interface DocsLayoutViewDef {
  template: unknown;
  init(): void;
  assign(): boolean | undefined;
  render(): void;
}

/**
 * DocsLayout view definition factory.
 *
 * Call this with the compiled template and lark-mvc View class
 * to produce a registered view.
 *
 * Icons are set once in init() (not in assign()) because they are static
 * data that does not change between renders. The icons object is passed
 * to updater.set() so the template can reference them via {{!icons.name}}.
 *
 * Usage in user's boot.ts:
 * ```ts
 * import { createDocsLayoutView, icons } from "@lark.js/docs";
 * import template from "@lark.js/docs/theme/docs-layout.html";
 * import { View } from "@lark.js/mvc";
 *
 * registerViewClass("theme/docs-layout", createDocsLayoutView(View, template));
 * ```
 */
export function createDocsLayoutView(View: any, template: any): any {
  return View.extend({
    template,

    init() {
      // Icons are static data -- set once in init(), not in assign()
      this.updater.set({ icons: defaultIcons });

      // Observe path changes so layout re-renders on navigation
      this.observeLocation([], true);
      this.assign();

      // Initialize DocSearch widget if configured
      const State = (this.owner as any)?.constructor?.State;
      const docsConfig = State?.get?.("docsConfig") || {};
      if (docsConfig.search?.provider === "docsearch") {
        this._initDocSearch(State, docsConfig);
      }
    },

    assign() {
      this.updater.snapshot();

      // Read site data from State (set during boot)
      const State = (this.owner as any)?.constructor?.State;
      const docsConfig = State?.get?.("docsConfig") || {};

      this.updater.set({
        siteTitle: docsConfig.title || "Documentation",
        navItems: docsConfig.nav || [],
        searchProvider: docsConfig.search?.provider || "local",
        prevPage: null,
        nextPage: null,
      });

      return this.updater.altered();
    },

    render() {
      this.updater.digest();
    },

    "navigateTo<click>"(e: Event) {
      const target = e.target as HTMLElement;
      const href = target.dataset["href"];
      if (href) {
        // Delegate to lark-mvc Router via the Framework
        const Router = (this.owner as any)?.constructor?.Router;
        Router?.to?.(href);
      }
    },

    "navigateHome<click>"() {
      const Router = (this.owner as any)?.constructor?.Router;
      Router?.to?.("/");
    },

    "openSearch<click>"() {
      const State = (this.owner as any)?.constructor?.State;
      State?.set?.({ searchOpen: true })?.digest?.();
    },

    /**
     * Initialize the Algolia DocSearch widget with local search index.
     *
     * Dynamically imports @docsearch/js and @docsearch/css, then mounts
     * the widget into #docsearch-container. The widget provides its own
     * styled button and search modal with keyboard shortcut (Ctrl+K).
     *
     * Uses createLocalSearchClient() to query the pre-built search index
     * instead of Algolia's hosted API -- no credentials required.
     */
    _initDocSearch(State: any, docsConfig: DocsConfig) {
      const searchIndex = State?.get?.("docsConfig")?.searchIndex || [];
      const localClient = createLocalSearchClient(searchIndex);

      import("@docsearch/css");
      import("@docsearch/js")
        .then(({ default: docsearch }) => {
          const container = document.getElementById("docsearch-container");
          if (!container) return;

          docsearch({
            container,
            // Dummy credentials -- the actual search is handled by our local
            // client injected via transformSearchClient below.
            appId: "local",
            apiKey: "local",
            indexName: "local",
            transformSearchClient: (client) => {
              // Replace the Algolia search method with our local index search
              (client as any).search = localClient.search;
              return client;
            },
          });
        })
        .catch((e: unknown) => {
          console.warn("[@lark.js/docs] Failed to initialize DocSearch:", e);
        });
    },
  });
}
