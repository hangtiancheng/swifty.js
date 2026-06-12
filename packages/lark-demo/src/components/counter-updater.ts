/**
 * Counter Updater Component
 * Demonstrates updater.set().digest() manual state management
 */
import View from "../view";
import template from "./counter-updater.html";

interface CounterState {
  count: number;
  step: number;
  history: string[];
}

export default View.extend({
  template,

  async render() {
    this.updater.digest({
      count: 0,
      step: 1,
      history: [],
    });
  },

  "increment<click>"() {
    const { count, step, history } = this.updater.get<CounterState>();
    const newCount = count + step;
    this.updater
      .set({
        count: newCount,
        history: [`+${step} → ${newCount}`, ...history],
      })
      .digest();
  },

  "decrement<click>"() {
    const { count, step, history } = this.updater.get<CounterState>();
    const newCount = count - step;
    this.updater
      .set({
        count: newCount,
        history: [`-${step} → ${newCount}`, ...history],
      })
      .digest();
  },

  "reset<click>"() {
    this.updater
      .set({
        count: 0,
        history: ["Reset → 0", ...this.updater.get<string[]>("history")],
      })
      .digest();
  },

  "stepChange<change>"(e: Event) {
    const target = e.target as HTMLInputElement;
    const newStep = parseInt(target?.value) || 1;
    this.updater.set({ step: newStep }).digest();
  },

  "clearHistory<click>"() {
    this.updater.set({ history: [] }).digest();
  },
});
