"use strict";
(self.webpackChunklark_demo = self.webpackChunklark_demo || []).push([
  [77],
  {
    77(e, o, t) {
      t.r(o);
      var n = t(622);
      (t(457), console.log("Initializing Lark application..."));
      const r = {
          home: () =>
            Promise.all([t.e(724), t.e(99), t.e(660)]).then(t.bind(t, 298)),
          about: () =>
            Promise.all([t.e(996), t.e(99), t.e(660)]).then(t.bind(t, 279)),
          counter: () => Promise.all([t.e(467), t.e(99)]).then(t.bind(t, 552)),
          404: () => Promise.all([t.e(7), t.e(99)]).then(t.bind(t, 308)),
          "components/counter-store": () =>
            Promise.all([t.e(705), t.e(99), t.e(660)]).then(t.bind(t, 602)),
          "components/counter-updater": () =>
            Promise.all([t.e(57), t.e(99)]).then(t.bind(t, 402)),
        },
        a = {
          counter: ["components/counter-store", "components/counter-updater"],
        },
        s = {
          defaultPath: "/home",
          defaultView: "home",
          routes: { "/home": "home", "/about": "about", "/counter": "counter" },
          unmatchedView: "404",
          rootId: "app",
          virtualDom: !0,
          error(e) {
            console.error("Lark application error:", e);
          },
          require: async (e) => {
            const o = [];
            for (const t of e) {
              const n = a[t];
              if (n)
                for (const t of n) e.includes(t) || o.includes(t) || o.push(t);
            }
            const t = [...e, ...o];
            return (
              await Promise.all(
                t.map(async (e) => {
                  const t = r[e];
                  if (!t)
                    return (
                      console.warn(`[Lark] Unknown view path: ${e}`),
                      { name: e, ViewClass: void 0 }
                    );
                  const a = (function (e) {
                    if (e && "object" == typeof e) {
                      const o = e;
                      if ("function" == typeof o.default) return o.default;
                    }
                    return e;
                  })(await t());
                  return (
                    o.includes(e) &&
                      "function" == typeof a &&
                      (0, n.registerViewClass)(e, a),
                    { name: e, ViewClass: a }
                  );
                }),
              )
            )
              .filter((o) => e.includes(o.name))
              .map((e) => e.ViewClass);
          },
        };
      (n.Framework.boot(s),
        console.log("@lark.js/mvc application started (chunk-split mode)!"),
        console.log("Visit http://localhost:3000 to get started"));
    },
  },
]);
//# sourceMappingURL=77.1055ae72.js.map
