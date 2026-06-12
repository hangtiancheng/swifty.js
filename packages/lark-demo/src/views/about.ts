/**
 * About Page View
 * Demonstrates route navigation + shared store state
 */
import { Router, bindStore } from "@lark.js/mvc";
import View from "../view";
import template from "./about.html";
import useCountStore from "../store/count";

export default View.extend({
  template,

  init(options: unknown) {
    this.assign?.(options);

    bindStore(this, useCountStore, (s) => ({ count: s.count, step: s.step }));
  },

  assign(options: unknown) {
    this.updater.snapshot();

    const params = Router.parse().params;
    const { count, step } = useCountStore.getState();

    this.updater.set({
      title: "About Lark",
      content: "Lark is a TypeScript MVC framework",
      author: (params as Record<string, string>)["author"] || "Anonymous",
      version: (params as Record<string, string>)["version"] || "1.0",
      count,
      step,
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
