"use strict";
(self.rspackChunklark_demo = self.rspackChunklark_demo || []).push([
  [2],
  {
    159(t, e, r) {
      (r.r(e), r.d(e, { default: () => c }));
      var n = r(521),
        s = r(954),
        o = r(286);
      function a(t, e) {
        (null == e || e > t.length) && (e = t.length);
        for (var r = 0, n = Array(e); r < e; r++) n[r] = t[r];
        return n;
      }
      function u(t, e, r, n, s, o, a) {
        try {
          var u = t[o](a),
            i = u.value;
        } catch (t) {
          r(t);
          return;
        }
        u.done ? e(i) : Promise.resolve(i).then(n, s);
      }
      function i(t) {
        return (
          (function (t) {
            if (Array.isArray(t)) return a(t);
          })(t) ||
          (function (t) {
            if (
              ("u" > typeof Symbol && null != t[Symbol.iterator]) ||
              null != t["@@iterator"]
            )
              return Array.from(t);
          })(t) ||
          (function (t) {
            if (t) {
              if ("string" == typeof t) return a(t, void 0);
              var e = Object.prototype.toString.call(t).slice(8, -1);
              if (
                ("Object" === e && t.constructor && (e = t.constructor.name),
                "Map" === e || "Set" === e)
              )
                return Array.from(e);
              if (
                "Arguments" === e ||
                /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e)
              )
                return a(t, void 0);
            }
          })(t) ||
          (function () {
            throw TypeError(
              "Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
            );
          })()
        );
      }
      let c = n.A.extend({
        template: function (t, e, r) {
          let n = s.vdomCreate;
          return ((t, e, r, s, o, a, u) => {
            let i, c, l, p, h, d, y, f, b, x, m, v, g, k, w, j, A;
            r || (r = t);
            let S = t.count,
              C = t.step,
              I = t.history,
              O = [];
            ((i = []),
              (c = []).push(n(0, "\n    updater.set().digest()\n  ")),
              i.push(
                n(
                  "div",
                  {
                    class:
                      "mb-3 text-[10px] font-normal tracking-widest text-sky-400 uppercase",
                  },
                  c,
                ),
              ),
              (l = []),
              (p = []).push(n(0, s(S))),
              l.push(
                n("div", { class: "text-4xl font-normal tracking-tight" }, p),
              ),
              (h = []).push(n(0, "current count")),
              l.push(n("div", { class: "text-[10px] opacity-60" }, h)),
              i.push(
                n(
                  "div",
                  {
                    class:
                      "mb-5 rounded-md bg-sky-500 py-6 text-center text-white",
                  },
                  l,
                ),
              ),
              (d = []),
              (y = []).push(n(0, "Step")),
              d.push(
                n(
                  "label",
                  { class: "text-xs font-normal text-emerald-600" },
                  y,
                ),
              ));
            let H = {
              type: "number",
              value: s(C),
              "@change": e + "\x1estepChange()",
              min: "1",
              max: "100",
              class:
                "w-14 rounded-md border border-sky-200 bg-sky-50/40 px-2 py-1 text-xs text-sky-700 transition-colors outline-none focus:border-sky-400",
            };
            if (
              (d.push(n("input", H, 1)),
              i.push(n("div", { class: "mb-4 flex items-center gap-2" }, d)),
              (f = []),
              (b = []).push(n(0, "\n      - ")),
              b.push(n(0, s(C))),
              f.push(
                n(
                  "button",
                  {
                    "@click": e + "\x1edecrement()",
                    class:
                      "rounded-md bg-sky-500 px-5 py-2 text-xs font-normal text-white transition-colors hover:bg-sky-600",
                  },
                  b,
                ),
              ),
              (x = []).push(n(0, "\n      Reset\n    ")),
              f.push(
                n(
                  "button",
                  {
                    "@click": e + "\x1ereset()",
                    class:
                      "rounded-md border border-sky-200 bg-white px-5 py-2 text-xs font-normal text-sky-500 transition-colors hover:bg-sky-50",
                  },
                  x,
                ),
              ),
              (m = []).push(n(0, "\n      + ")),
              m.push(n(0, s(C))),
              f.push(
                n(
                  "button",
                  {
                    "@click": e + "\x1eincrement()",
                    class:
                      "rounded-md bg-sky-500 px-5 py-2 text-xs font-normal text-white transition-colors hover:bg-sky-600",
                  },
                  m,
                ),
              ),
              i.push(n("div", { class: "mb-4 flex justify-center gap-3" }, f)),
              (v = []),
              (g = []).push(n(0, "History")),
              v.push(
                n(
                  "span",
                  {
                    class:
                      "text-[10px] font-normal tracking-widest text-sky-400 uppercase",
                  },
                  g,
                ),
              ),
              (k = []).push(n(0, "\n      Clear\n    ")),
              v.push(
                n(
                  "button",
                  {
                    "@click": e + "\x1eclearHistory()",
                    class:
                      "rounded border border-sky-200 px-2.5 py-1 text-[10px] text-sky-500 transition-colors hover:bg-sky-50",
                  },
                  k,
                ),
              ),
              i.push(
                n("div", { class: "flex items-center justify-between" }, v),
              ),
              I.length > 0)
            ) {
              w = [];
              for (let t = 0, e = I.length; t < e; t++) {
                let e = I[t],
                  r = {
                    class:
                      "rounded border border-sky-100 bg-sky-50/40 px-3 py-2 font-mono text-[10px] text-sky-600",
                  };
                ((j = []).push(n(0, s(e))), w.push(n("li", r, j)));
              }
              i.push(
                n(
                  "ul",
                  { class: "mt-3 max-h-48 space-y-2 overflow-y-auto" },
                  w,
                ),
              );
            } else
              ((A = []).push(n(0, "No history")),
                i.push(
                  n(
                    "p",
                    { class: "mt-3 text-center text-[10px] text-sky-300" },
                    A,
                  ),
                ));
            return (
              O.push(
                n(
                  "div",
                  { class: "rounded-lg border border-sky-100 bg-white p-6" },
                  i,
                ),
              ),
              n(e, 0, O)
            );
          })(t || {}, e || "", r, o.Ni, o.IW, o.tX, o.pu);
        },
        render: function () {
          var t;
          return ((t = function () {
            return (function (t, e) {
              var r,
                n,
                s,
                o = {
                  label: 0,
                  sent: function () {
                    if (1 & s[0]) throw s[1];
                    return s[1];
                  },
                  trys: [],
                  ops: [],
                },
                a = Object.create(
                  ("function" == typeof Iterator ? Iterator : Object).prototype,
                ),
                u = Object.defineProperty;
              return (
                u(a, "next", { value: i(0) }),
                u(a, "throw", { value: i(1) }),
                u(a, "return", { value: i(2) }),
                "function" == typeof Symbol &&
                  u(a, Symbol.iterator, {
                    value: function () {
                      return this;
                    },
                  }),
                a
              );
              function i(u) {
                return function (i) {
                  var c = [u, i];
                  if (r) throw TypeError("Generator is already executing.");
                  for (; a && ((a = 0), c[0] && (o = 0)), o; )
                    try {
                      if (
                        ((r = 1),
                        n &&
                          (s =
                            2 & c[0]
                              ? n.return
                              : c[0]
                                ? n.throw || ((s = n.return) && s.call(n), 0)
                                : n.next) &&
                          !(s = s.call(n, c[1])).done)
                      )
                        return s;
                      switch (((n = 0), s && (c = [2 & c[0], s.value]), c[0])) {
                        case 0:
                        case 1:
                          s = c;
                          break;
                        case 4:
                          return (o.label++, { value: c[1], done: !1 });
                        case 5:
                          (o.label++, (n = c[1]), (c = [0]));
                          continue;
                        case 7:
                          ((c = o.ops.pop()), o.trys.pop());
                          continue;
                        default:
                          if (
                            !(s = (s = o.trys).length > 0 && s[s.length - 1]) &&
                            (6 === c[0] || 2 === c[0])
                          ) {
                            o = 0;
                            continue;
                          }
                          if (
                            3 === c[0] &&
                            (!s || (c[1] > s[0] && c[1] < s[3]))
                          ) {
                            o.label = c[1];
                            break;
                          }
                          if (6 === c[0] && o.label < s[1]) {
                            ((o.label = s[1]), (s = c));
                            break;
                          }
                          if (s && o.label < s[2]) {
                            ((o.label = s[2]), o.ops.push(c));
                            break;
                          }
                          (s[2] && o.ops.pop(), o.trys.pop());
                          continue;
                      }
                      c = e.call(t, o);
                    } catch (t) {
                      ((c = [6, t]), (n = 0));
                    } finally {
                      r = s = 0;
                    }
                  if (5 & c[0]) throw c[1];
                  return { value: c[0] ? c[1] : void 0, done: !0 };
                };
              }
            })(this, function (t) {
              return (
                this.updater.digest({ count: 0, step: 1, history: [] }),
                [2]
              );
            });
          }),
          function () {
            var e = this,
              r = arguments;
            return new Promise(function (n, s) {
              var o = t.apply(e, r);
              function a(t) {
                u(o, n, s, a, i, "next", t);
              }
              function i(t) {
                u(o, n, s, a, i, "throw", t);
              }
              a(void 0);
            });
          }).call(this);
        },
        "increment<click>": function () {
          var t = this.updater.get(),
            e = t.count,
            r = t.step,
            n = t.history,
            s = e + r;
          this.updater
            .set({
              count: s,
              history: ["+".concat(r, " → ").concat(s)].concat(i(n)),
            })
            .digest();
        },
        "decrement<click>": function () {
          var t = this.updater.get(),
            e = t.count,
            r = t.step,
            n = t.history,
            s = e - r;
          this.updater
            .set({
              count: s,
              history: ["-".concat(r, " → ").concat(s)].concat(i(n)),
            })
            .digest();
        },
        "reset<click>": function () {
          this.updater
            .set({
              count: 0,
              history: ["Reset → 0"].concat(i(this.updater.get("history"))),
            })
            .digest();
        },
        "stepChange<change>": function (t) {
          var e = t.target,
            r = parseInt(null == e ? void 0 : e.value) || 1;
          this.updater.set({ step: r }).digest();
        },
        "clearHistory<click>": function () {
          this.updater.set({ history: [] }).digest();
        },
      });
    },
  },
]);
//# sourceMappingURL=comp-counter-updater.6df3abb5.js.map
