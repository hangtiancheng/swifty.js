/**
 * Counter View
 * Demonstrates v-lark nested sub-components
 */
import { Router } from "@lark.js/mvc";
import View from "../view";
import template from "./counter.html";

export default View.extend({
  template,

  "navigateTo<click>"(e: Record<string, unknown>) {
    const params = e["params"] as Record<string, string> | undefined;
    if (params?.["path"]) {
      Router.to(params["path"]);
    }
  },
});
