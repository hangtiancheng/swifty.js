/**
 * 404 Page View
 * Displayed when route is not matched
 */
import { Router } from "@lark.js/mvc";
import View from "../view";
import template from "./404.html";

export default View.extend({
  template,

  init(options: unknown) {
    this.assign?.(options);
  },

  assign(options: unknown) {
    this.updater.snapshot();

    const loc = Router.parse();

    this.updater.set({
      path: loc.path || "Unknown path",
    });

    return this.updater.altered();
  },

  render() {
    this.updater.digest();
  },

  "goHome<click>"() {
    Router.to("/home");
  },
});
