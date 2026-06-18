"use strict";
(self.rspackChunklark_demo = self.rspackChunklark_demo || []).push([
  [437],
  {
    820(e, t, r) {
      r.r(t);
      var n = r(954);
      function o(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var r = 0, n = Array(t); r < t; r++) n[r] = e[r];
        return n;
      }
      function a(e, t, r, n, o, a, i) {
        try {
          var u = e[a](i),
            l = u.value;
        } catch (e) {
          r(e);
          return;
        }
        u.done ? t(l) : Promise.resolve(l).then(n, o);
      }
      function i(e) {
        return function () {
          var t = this,
            r = arguments;
          return new Promise(function (n, o) {
            var i = e.apply(t, r);
            function u(e) {
              a(i, n, o, u, l, "next", e);
            }
            function l(e) {
              a(i, n, o, u, l, "throw", e);
            }
            u(void 0);
          });
        };
      }
      function u(e) {
        return (
          (function (e) {
            if (Array.isArray(e)) return o(e);
          })(e) ||
          (function (e) {
            if (
              ("u" > typeof Symbol && null != e[Symbol.iterator]) ||
              null != e["@@iterator"]
            )
              return Array.from(e);
          })(e) ||
          (function (e) {
            if (e) {
              if ("string" == typeof e) return o(e, void 0);
              var t = Object.prototype.toString.call(e).slice(8, -1);
              if (
                ("Object" === t && e.constructor && (t = e.constructor.name),
                "Map" === t || "Set" === t)
              )
                return Array.from(t);
              if (
                "Arguments" === t ||
                /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)
              )
                return o(e, void 0);
            }
          })(e) ||
          (function () {
            throw TypeError(
              "Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
            );
          })()
        );
      }
      function l(e, t) {
        var r,
          n,
          o,
          a = {
            label: 0,
            sent: function () {
              if (1 & o[0]) throw o[1];
              return o[1];
            },
            trys: [],
            ops: [],
          },
          i = Object.create(
            ("function" == typeof Iterator ? Iterator : Object).prototype,
          ),
          u = Object.defineProperty;
        return (
          u(i, "next", { value: l(0) }),
          u(i, "throw", { value: l(1) }),
          u(i, "return", { value: l(2) }),
          "function" == typeof Symbol &&
            u(i, Symbol.iterator, {
              value: function () {
                return this;
              },
            }),
          i
        );
        function l(u) {
          return function (l) {
            var c = [u, l];
            if (r) throw TypeError("Generator is already executing.");
            for (; i && ((i = 0), c[0] && (a = 0)), a; )
              try {
                if (
                  ((r = 1),
                  n &&
                    (o =
                      2 & c[0]
                        ? n.return
                        : c[0]
                          ? n.throw || ((o = n.return) && o.call(n), 0)
                          : n.next) &&
                    !(o = o.call(n, c[1])).done)
                )
                  return o;
                switch (((n = 0), o && (c = [2 & c[0], o.value]), c[0])) {
                  case 0:
                  case 1:
                    o = c;
                    break;
                  case 4:
                    return (a.label++, { value: c[1], done: !1 });
                  case 5:
                    (a.label++, (n = c[1]), (c = [0]));
                    continue;
                  case 7:
                    ((c = a.ops.pop()), a.trys.pop());
                    continue;
                  default:
                    if (
                      !(o = (o = a.trys).length > 0 && o[o.length - 1]) &&
                      (6 === c[0] || 2 === c[0])
                    ) {
                      a = 0;
                      continue;
                    }
                    if (3 === c[0] && (!o || (c[1] > o[0] && c[1] < o[3]))) {
                      a.label = c[1];
                      break;
                    }
                    if (6 === c[0] && a.label < o[1]) {
                      ((a.label = o[1]), (o = c));
                      break;
                    }
                    if (o && a.label < o[2]) {
                      ((a.label = o[2]), a.ops.push(c));
                      break;
                    }
                    (o[2] && a.ops.pop(), a.trys.pop());
                    continue;
                }
                c = t.call(e, a);
              } catch (e) {
                ((c = [6, e]), (n = 0));
              } finally {
                r = o = 0;
              }
            if (5 & c[0]) throw c[1];
            return { value: c[0] ? c[1] : void 0, done: !0 };
          };
        }
      }
      console.log("Initializing Lark application...");
      var c = {
          home: function () {
            return Promise.all([r.e(461), r.e(875), r.e(280)]).then(
              r.bind(r, 316),
            );
          },
          about: function () {
            return Promise.all([r.e(725), r.e(875), r.e(280)]).then(
              r.bind(r, 678),
            );
          },
          counter: function () {
            return Promise.all([r.e(456), r.e(875)]).then(r.bind(r, 233));
          },
          404: function () {
            return Promise.all([r.e(916), r.e(875)]).then(r.bind(r, 520));
          },
          "components/counter-store": function () {
            return Promise.all([r.e(298), r.e(875), r.e(280)]).then(
              r.bind(r, 968),
            );
          },
          "components/counter-updater": function () {
            return Promise.all([r.e(2), r.e(875)]).then(r.bind(r, 159));
          },
        },
        s = {
          counter: ["components/counter-store", "components/counter-updater"],
        };
      (n.Framework.boot({
        defaultPath: "/home",
        defaultView: "home",
        routes: { "/home": "home", "/about": "about", "/counter": "counter" },
        unmatchedView: "404",
        rootId: "app",
        virtualDom: !0,
        error: function (e) {
          console.error("Lark application error:", e);
        },
        require: function (e) {
          return i(function () {
            var t, r, o, a, f, p, h, m, d, y, b, v, w;
            return l(this, function (k) {
              switch (k.label) {
                case 0:
                  ((t = []), (r = !0), (o = !1), (a = void 0));
                  try {
                    for (
                      f = e[Symbol.iterator]();
                      !(r = (p = f.next()).done);
                      r = !0
                    )
                      if ((h = s[p.value])) {
                        ((m = !0), (d = !1), (y = void 0));
                        try {
                          for (
                            b = h[Symbol.iterator]();
                            !(m = (v = b.next()).done);
                            m = !0
                          )
                            ((w = v.value),
                              e.includes(w) || t.includes(w) || t.push(w));
                        } catch (e) {
                          ((d = !0), (y = e));
                        } finally {
                          try {
                            m || null == b.return || b.return();
                          } finally {
                            if (d) throw y;
                          }
                        }
                      }
                  } catch (e) {
                    ((o = !0), (a = e));
                  } finally {
                    try {
                      r || null == f.return || f.return();
                    } finally {
                      if (o) throw a;
                    }
                  }
                  return [
                    4,
                    Promise.all(
                      u(e)
                        .concat(u(t))
                        .map(function (e) {
                          return i(function () {
                            var r, o;
                            return l(this, function (a) {
                              switch (a.label) {
                                case 0:
                                  if (!(r = c[e]))
                                    return (
                                      console.warn(
                                        "[Lark] Unknown view path: ".concat(e),
                                      ),
                                      [2, { name: e, ViewClass: void 0 }]
                                    );
                                  return [4, r()];
                                case 1:
                                  return (
                                    (o = (function (e) {
                                      return e &&
                                        (void 0 === e
                                          ? "undefined"
                                          : e &&
                                              "u" > typeof Symbol &&
                                              e.constructor === Symbol
                                            ? "symbol"
                                            : typeof e) == "object" &&
                                        "function" == typeof e.default
                                        ? e.default
                                        : e;
                                    })(a.sent())),
                                    t.includes(e) &&
                                      "function" == typeof o &&
                                      (0, n.registerViewClass)(e, o),
                                    [2, { name: e, ViewClass: o }]
                                  );
                              }
                            });
                          })();
                        }),
                    ),
                  ];
                case 1:
                  return [
                    2,
                    k
                      .sent()
                      .filter(function (t) {
                        return e.includes(t.name);
                      })
                      .map(function (e) {
                        return e.ViewClass;
                      }),
                  ];
              }
            });
          })();
        },
      }),
        console.log("@lark.js/mvc application started (chunk-split mode)!"),
        console.log("Visit http://localhost:3000 to get started"));
    },
  },
]);
//# sourceMappingURL=437.48c4d839.js.map
