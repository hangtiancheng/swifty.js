/**
 * Counter Store Component
 * Demonstrates zustand-style store state management
 */
import { bindStore } from "@lark.js/mvc";
import View from "../view";
import template from "./counter-store.html";
import useCountStore from "../store/count";

export default View.extend({
  template,

  init() {
    bindStore(this, useCountStore);
  },

  "increment<click>"() {
    useCountStore.getState().increment();
  },

  "decrement<click>"() {
    useCountStore.getState().decrement();
  },

  "reset<click>"() {
    useCountStore.getState().reset();
  },

  "stepChange<change>"(e: Event) {
    const target = e.target as HTMLInputElement;
    const newStep = parseInt(target.value) || 1;
    useCountStore.getState().setStep(newStep);
  },

  "clearHistory<click>"() {
    useCountStore.getState().clearHistory();
  },
});
