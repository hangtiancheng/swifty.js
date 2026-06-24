/**
 * Home View
 * Demonstrates basic Lark View + zustand-style store
 */
import { Router, bindStore } from "@lark.js/mvc";
import View from "../view";
import template from "./home.html";
import useCountStore from "../store/count";

export default View.extend({
  template,

  init(options: unknown) {
    this.assign?.(options);

    bindStore(this, useCountStore, (s) => ({ count: s.count, step: s.step }));
  },

  assign(options: unknown) {
    this.updater.snapshot();

    const { count, step } = useCountStore.getState();

    this.updater.set({
      title: "Welcome to Lark Framework",
      description: "This is a minimal @lark.js/mvc example",
      appName: "Lark MVC Demo",
      currentTime: new Date().toLocaleString(),
      count,
      step,
    });

    return this.updater.altered();
  },

  render() {
    this.updater.digest();
  },

  "navigateTo<click>"(e: Record<string, unknown>) {
    const params = e["params"] as Record<string, string> | undefined;
    const path = params?.path;
    if (path) {
      Router.to(path);
    }
  },

  "showInfo<click>"(e: Record<string, unknown>) {
    const params = e["params"] as Record<string, string> | undefined;
    if (params) {
      alert(`${params.title}\n\n${params.message}`);
    }
  },
});
