"use strict";
(self.webpackChunklark_demo = self.webpackChunklark_demo || []).push([
  [660],
  {
    660(t, e, s) {
      s.d(e, { A: () => o });
      const o = (0, s(622).create)("count", (t, e) => ({
        count: 0,
        step: 1,
        history: [],
        increment() {
          const { count: s, step: o } = e();
          t({ count: s + o, history: [...e().history, `+${o} → ${s + o}`] });
        },
        decrement() {
          const { count: s, step: o } = e();
          t({ count: s - o, history: [...e().history, `-${o} → ${s - o}`] });
        },
        reset() {
          t({ count: 0, history: [...e().history, "Reset → 0"] });
        },
        setStep(e) {
          t({ step: e });
        },
        clearHistory() {
          t({ history: [] });
        },
      }));
    },
  },
]);
//# sourceMappingURL=660.1ef4dafc.js.map
