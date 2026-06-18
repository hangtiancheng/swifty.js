"use strict";
(self.rspackChunklark_demo = self.rspackChunklark_demo || []).push([
  [461],
  {
    316(e, t, s) {
      (s.r(t), s.d(t, { default: () => l }));
      var a = s(954),
        r = s(521),
        n = s(286),
        o = s(83);
      let l = r.A.extend({
        template: function (e, t, s) {
          var r, o, l;
          let i,
            p,
            u,
            d,
            c,
            h,
            m,
            x,
            b,
            g,
            f,
            v,
            k,
            w,
            y,
            T,
            C,
            S,
            A,
            N,
            I,
            V,
            L,
            R,
            j,
            D,
            F,
            M,
            W,
            _,
            z,
            E,
            H,
            U = a.vdomCreate,
            X = n.Ni;
          return (
            (r = e || {}),
            (o = t || ""),
            (l = s),
            n.IW,
            n.tX,
            n.pu,
            l || (l = r),
            (F = r.title),
            (M = r.description),
            (W = r.count),
            (_ = r.step),
            (z = r.appName),
            (E = r.currentTime),
            (H = []),
            (i = []),
            (p = []),
            (u = []).push(U(0, X(F))),
            p.push(
              U(
                "h1",
                {
                  class:
                    "mb-2 text-2xl font-normal tracking-tight text-emerald-800",
                },
                u,
              ),
            ),
            (d = []).push(U(0, X(M))),
            p.push(U("p", { class: "mb-6 text-xs text-emerald-500" }, d)),
            (c = []),
            (h = []).push(U(0, "Navigation")),
            c.push(
              U(
                "h2",
                { class: "mb-3 text-base font-normal text-emerald-700" },
                h,
              ),
            ),
            (m = []),
            (x = []).push(U(0, "\n          About\n        ")),
            m.push(
              U(
                "button",
                {
                  "@click": o + "\x1enavigateTo(path=/about)",
                  class:
                    "rounded-md bg-emerald-500 px-5 py-2 text-xs font-normal text-white transition-colors hover:bg-emerald-600",
                },
                x,
              ),
            ),
            (b = []).push(U(0, "\n          Counter\n        ")),
            m.push(
              U(
                "button",
                {
                  "@click": o + "\x1enavigateTo(path=/counter)",
                  class:
                    "rounded-md bg-sky-500 px-5 py-2 text-xs font-normal text-white transition-colors hover:bg-sky-600",
                },
                b,
              ),
            ),
            c.push(U("div", { class: "flex gap-3" }, m)),
            p.push(
              U(
                "div",
                {
                  class:
                    "mb-6 rounded-lg border border-emerald-100 bg-white p-5",
                },
                c,
              ),
            ),
            (g = []),
            (f = []),
            (v = []).push(U(0, "Store State")),
            f.push(
              U("h2", { class: "text-base font-normal text-emerald-700" }, v),
            ),
            (k = []).push(U(0, "\n          modify\n        ")),
            f.push(
              U(
                "a",
                {
                  "@click": o + "\x1enavigateTo(path=/counter)",
                  class:
                    "cursor-pointer text-xs text-emerald-400 underline decoration-emerald-200 underline-offset-2 transition-colors hover:text-emerald-600",
                },
                k,
              ),
            ),
            g.push(
              U("div", { class: "mb-3 flex items-center justify-between" }, f),
            ),
            (w = []),
            (y = []),
            (T = []).push(U(0, X(W))),
            y.push(
              U("div", { class: "text-3xl font-normal tracking-tight" }, T),
            ),
            (C = []).push(U(0, "count")),
            y.push(U("div", { class: "text-[10px] opacity-60" }, C)),
            w.push(
              U(
                "div",
                {
                  class:
                    "flex-1 rounded-md bg-emerald-500 py-6 text-center text-white",
                },
                y,
              ),
            ),
            (S = []),
            (A = []).push(U(0, X(_))),
            S.push(
              U("div", { class: "text-3xl font-normal tracking-tight" }, A),
            ),
            (N = []).push(U(0, "step")),
            S.push(U("div", { class: "text-[10px] opacity-60" }, N)),
            w.push(
              U(
                "div",
                {
                  class:
                    "flex-1 rounded-md bg-sky-500 py-6 text-center text-white",
                },
                S,
              ),
            ),
            g.push(U("div", { class: "flex items-center gap-4" }, w)),
            p.push(
              U(
                "div",
                {
                  class:
                    "mb-6 rounded-lg border border-emerald-100 bg-white p-5",
                },
                g,
              ),
            ),
            (I = []),
            (V = []).push(U(0, "Interaction")),
            I.push(
              U(
                "h2",
                { class: "mb-3 text-base font-normal text-emerald-700" },
                V,
              ),
            ),
            (L = []).push(U(0, "\n        Show Alert\n      ")),
            I.push(
              U(
                "button",
                {
                  "@click":
                    o +
                    "\x1eshowInfo(title=Notice&message=You clicked the button!)",
                  class:
                    "rounded-md bg-emerald-500 px-5 py-2 text-xs font-normal text-white transition-colors hover:bg-emerald-600",
                },
                L,
              ),
            ),
            p.push(
              U(
                "div",
                {
                  class:
                    "mb-6 rounded-lg border border-emerald-100 bg-white p-5",
                },
                I,
              ),
            ),
            (R = []),
            (j = []).push(U(0, "App: ")),
            j.push(U(0, X(z))),
            R.push(
              U("p", { class: "mb-1 text-xs font-normal text-emerald-700" }, j),
            ),
            (D = []).push(U(0, "Time: ")),
            D.push(U(0, X(E))),
            R.push(U("p", { class: "text-xs text-emerald-500" }, D)),
            p.push(
              U(
                "div",
                {
                  class:
                    "rounded-lg border border-emerald-100 bg-emerald-50/50 p-4",
                },
                R,
              ),
            ),
            i.push(U("div", { class: "mx-auto max-w-3xl" }, p)),
            H.push(U("div", { class: "min-h-screen bg-emerald-50/30 p-6" }, i)),
            U(o, 0, H)
          );
        },
        init: function (e) {
          var t;
          (null == (t = this.assign) || t.call(this, e),
            (0, a.bindStore)(this, o.A, function (e) {
              return { count: e.count, step: e.step };
            }));
        },
        assign: function (e) {
          this.updater.snapshot();
          var t = o.A.getState(),
            s = t.count,
            a = t.step;
          return (
            this.updater.set({
              title: "Welcome to Lark Framework",
              description: "This is a minimal @lark.js/mvc example",
              features: [
                {
                  name: "MVC Architecture",
                  desc: "Clear separation of View / Updater / Frame",
                },
                { name: "Routing System", desc: "Hash-based frontend routing" },
                { name: "Componentization", desc: "Reusable View components" },
                {
                  name: "Template Engine",
                  desc: "Supports conditionals, loops, and more",
                },
              ],
              appName: "Lark MVC Demo",
              currentTime: new Date().toLocaleString(),
              count: s,
              step: a,
            }),
            this.updater.altered()
          );
        },
        render: function () {
          this.updater.digest();
        },
        "navigateTo<click>": function (e) {
          var t = e.params,
            s = null == t ? void 0 : t.path;
          s && a.Router.to(s);
        },
        "showInfo<click>": function (e) {
          var t = e.params;
          t && alert("".concat(t.title, "\n\n").concat(t.message));
        },
      });
    },
  },
]);
//# sourceMappingURL=view-home.1f9a6ccc.js.map
