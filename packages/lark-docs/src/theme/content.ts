/**
 * ContentView - renders the compiled markdown body.
 *
 * This view receives the pre-rendered HTML from the compiled .md module
 * and injects it into the DOM via {{!contentHtml}} (raw output).
 */

export function createContentView(View: any, template: any): any {
  return View.extend({
    template,

    init() {
      // contentHtml is set by the parent or the route's compiled .md module
      this.assign();
    },

    assign() {
      this.updater.snapshot();
      // contentHtml is passed via init params or set by the route handler
      const params = (this as any)._initParams || {};
      this.updater.set({
        contentHtml: params.contentHtml || "",
      });
      return this.updater.altered();
    },

    render() {
      this.updater.digest();
    },
  });
}
