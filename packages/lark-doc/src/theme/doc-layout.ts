import { icons as defaultIcons } from "./icons";

export interface DocLayoutViewDef {
  template: unknown;
  init(): void;
  assign(): boolean | undefined;
  render(): void;
}

/**
 * DocLayout view definition factory.
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
 * import { createDocLayoutView, icons } from "@lark.js/docs";
 * import template from "@lark.js/docs/theme/doc-layout.html";
 * import { View } from "@lark.js/mvc";
 *
 * registerViewClass("theme/doc-layout", createDocLayoutView(View, template));
 * ```
 */
export function createDocLayoutView(View: any, template: any): any {
  return View.extend({
    template,

    init() {
      // Icons are static data -- set once in init(), not in assign()
      this.updater.set({ icons: defaultIcons });

      // Observe path changes so layout re-renders on navigation
      this.observeLocation([], true);
      this.assign();
    },

    assign() {
      this.updater.snapshot();

      // Read site data from State (set during boot)
      const State = (this.owner as any)?.constructor?.State;
      const siteData = State?.get?.("siteData") || {};

      this.updater.set({
        siteTitle: siteData.title || "Documentation",
        navItems: siteData.nav || [],
        prevPage: null,
        nextPage: null,
      });

      return this.updater.altered();
    },

    render() {
      this.updater.digest();
    },

    "navigateTo<click>"(e: Record<string, unknown>) {
      const params = e["params"] as Record<string, string> | undefined;
      if (params?.["href"]) {
        // Delegate to lark-mvc Router via the Framework
        const Router = (this.owner as any)?.constructor?.Router;
        Router?.to?.(params["href"]);
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
  });
}
