"use strict";
(self.webpackChunklark_demo = self.webpackChunklark_demo || []).push([
  [705],
  {
    602(e, t, n) {
      (n.r(t), n.d(t, { default: () => d }));
      var r = n(622),
        a = n(892),
        l = n(258);
      function o(e, t, n) {
        return ((e, t, n, r) => {
          n || (n = e);
          let a = "",
            l = e.count,
            o = e.step,
            s = e.history;
          if (
            ((a +=
              '\x3c!-- Counter Component (create version) --\x3e\n<div class="rounded-lg border border-emerald-100 bg-white p-6">\n  <div\n    class="mb-3 text-[10px] font-normal tracking-widest text-emerald-400 uppercase"\n  >\n    create\n  </div>\n  <div class="mb-5 rounded-md bg-emerald-500 py-6 text-center text-white">\n    <div class="text-4xl font-normal tracking-tight">' +
              r(l) +
              '</div>\n    <div class="text-[10px] opacity-60">current count</div>\n  </div>\n\n  <div class="mb-4 flex items-center gap-2">\n    <label class="text-xs font-normal text-emerald-600">Step</label>\n    <input\n      type="number"\n      value="' +
              r(o) +
              '"\n      @change="' +
              t +
              'stepChange()"\n      min="1"\n      max="100"\n      class="w-14 rounded-md border border-emerald-200 bg-emerald-50/40 px-2 py-1 text-xs text-emerald-700 transition-colors outline-none focus:border-emerald-400"\n    />\n  </div>\n\n  <div class="mb-4 flex justify-center gap-3">\n    <button\n      @click="' +
              t +
              'decrement()"\n      class="rounded-md bg-emerald-500 px-5 py-2 text-xs font-normal text-white transition-colors hover:bg-emerald-600"\n    >\n      - ' +
              r(o) +
              '\n    </button>\n    <button\n      @click="' +
              t +
              'reset()"\n      class="rounded-md border border-emerald-200 bg-white px-5 py-2 text-xs font-normal text-emerald-500 transition-colors hover:bg-emerald-50"\n    >\n      Reset\n    </button>\n    <button\n      @click="' +
              t +
              'increment()"\n      class="rounded-md bg-emerald-500 px-5 py-2 text-xs font-normal text-white transition-colors hover:bg-emerald-600"\n    >\n      + ' +
              r(o) +
              '\n    </button>\n  </div>\n\n  <div class="flex items-center justify-between">\n    <span\n      class="text-[10px] font-normal tracking-widest text-emerald-400 uppercase"\n      >History</span\n    >\n    <button\n      @click="' +
              t +
              'clearHistory()"\n      class="rounded border border-emerald-200 px-2.5 py-1 text-[10px] text-emerald-500 transition-colors hover:bg-emerald-50"\n    >\n      Clear\n    </button>\n  </div>\n  '),
            s.length > 0)
          ) {
            a +=
              '\n  <ul class="mt-3 max-h-56 space-y-2 overflow-y-auto">\n    ';
            for (let e = 0, t = s.length; e < t; e++)
              a +=
                '\n    <li\n      class="rounded border border-emerald-100 bg-emerald-50/40 px-3 py-2 font-mono text-[10px] text-emerald-600"\n    >\n      ' +
                r(s[e]) +
                "\n    </li>\n    ";
            a += "\n  </ul>\n  ";
          } else
            a +=
              '\n  <p class="mt-3 text-center text-[10px] text-emerald-300">No history</p>\n  ';
          return ((a += "\n</div>\n"), a);
        })(e || {}, t || "", n, l.M6, l.Ni, l.tX, l.IW, l.pu);
      }
      n.dn(o);
      var s = n(660);
      const d = a.A.extend({
        template: o,
        init() {
          (0, r.bindStore)(this, s.A);
        },
        "increment<click>"() {
          s.A.getState().increment();
        },
        "decrement<click>"() {
          s.A.getState().decrement();
        },
        "reset<click>"() {
          s.A.getState().reset();
        },
        "stepChange<change>"(e) {
          const t = e.target,
            n = parseInt(t.value) || 1;
          s.A.getState().setStep(n);
        },
        "clearHistory<click>"() {
          s.A.getState().clearHistory();
        },
      });
    },
  },
]);
//# sourceMappingURL=comp-counter-store.c4f2f0a3.js.map
