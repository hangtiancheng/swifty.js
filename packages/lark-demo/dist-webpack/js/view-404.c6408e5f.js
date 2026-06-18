"use strict";
(self.webpackChunklark_demo = self.webpackChunklark_demo || []).push([
  [7],
  {
    308(e, t, n) {
      (n.r(t), n.d(t, { default: () => o }));
      var s = n(622),
        r = n(892),
        a = n(258);
      function l(e, t, n) {
        return ((e, t, n, s) => {
          n || (n = e);
          let r = "";
          return (
            (r +=
              '\x3c!-- 404 View Template --\x3e\n<div class="flex min-h-screen items-center justify-center bg-emerald-50/30 p-6">\n  <div class="max-w-md text-center">\n    <div class="mb-4 text-7xl tracking-tight text-emerald-300">404</div>\n    <h1 class="mb-4 text-xl font-normal text-emerald-800">Page Not Found</h1>\n    <p class="mb-8 text-sm text-emerald-600/80">\n      The path\n      <code\n        class="rounded border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 font-mono text-xs text-emerald-700"\n        >' +
              s(e.path) +
              '</code\n      >\n      does not exist\n    </p>\n\n    <div\n      class="mx-auto mb-6 max-w-xs rounded-lg border border-emerald-200/60 bg-white/80 p-5 text-left"\n    >\n      <h3 class="mb-3 text-sm font-normal text-emerald-700">Suggestions</h3>\n      <ul class="ml-4 list-disc space-y-1.5 text-xs text-emerald-600/80">\n        <li>Check if the URL is correct</li>\n        <li>Return to home</li>\n        <li>Contact administrator</li>\n      </ul>\n    </div>\n\n    <button\n      @click="' +
              t +
              'goHome()"\n      class="rounded-md bg-emerald-500 px-6 py-2 text-xs font-normal text-white transition-colors hover:bg-emerald-600"\n    >\n      Back to Home\n    </button>\n  </div>\n</div>\n'),
            r
          );
        })(e || {}, t || "", n, a.M6, a.Ni, a.tX, a.IW, a.pu);
      }
      n.dn(l);
      const o = r.A.extend({
        template: l,
        init(e) {
          this.assign?.(e);
        },
        assign(e) {
          this.updater.snapshot();
          const t = s.Router.parse();
          return (
            this.updater.set({ path: t.path || "Unknown path" }),
            this.updater.altered()
          );
        },
        render() {
          this.updater.digest();
        },
        "goHome<click>"() {
          s.Router.to("/home");
        },
      });
    },
  },
]);
//# sourceMappingURL=view-404.c6408e5f.js.map
