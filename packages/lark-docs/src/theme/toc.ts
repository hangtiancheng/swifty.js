import { State, View as ViewClass } from "@lark.js/mvc";

/**
 * TocView - right-side heading outline.
 *
 * Renders h2/h3 headings extracted from the current page.
 * Supports scroll-spy to highlight the currently visible heading.
 */

export function createTocView(View: typeof ViewClass, template: string) {
  return View.extend({
    template,

    init() {
      // Re-render when the layout publishes new headings for the current page.
      this.observeState("currentPageHeadings");
      this.assign?.();
    },

    assign() {
      this.updater.snapshot();
      const headings = State.get("currentPageHeadings") || [];
      this.updater.set({ headings });
      return this.updater.altered();
    },

    render() {
      this.updater.digest();
    },

    "scrollToHeading<click>"(e: Event) {
      const target = e.target as HTMLElement;
      const slug = target.dataset["slug"];
      if (slug) {
        const el = document.getElementById(slug);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    },
  });
}
