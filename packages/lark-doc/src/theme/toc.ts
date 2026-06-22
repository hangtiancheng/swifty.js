/**
 * TocView - right-side heading outline.
 *
 * Renders h2/h3 headings extracted from the current page.
 * Supports scroll-spy to highlight the currently visible heading.
 */

export function createTocView(View: any, template: any): any {
  return View.extend({
    template,

    init() {
      this.assign();
    },

    assign() {
      this.updater.snapshot();

      const params = (this as any)._initParams || {};
      this.updater.set({
        headings: params.headings || [],
      });

      return this.updater.altered();
    },

    render() {
      this.updater.digest();
    },

    "scrollToHeading<click>"(e: Record<string, unknown>) {
      const params = e["params"] as Record<string, string> | undefined;
      if (params?.["slug"]) {
        const el = document.getElementById(params["slug"]);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    },
  });
}
