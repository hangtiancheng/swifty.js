"use strict";
(self.rspackChunklark_demo = self.rspackChunklark_demo || []).push([
  [875],
  {
    521(e, t, n) {
      var r = n(954);
      let o = r.View.extend({
        make: function () {
          var e = this;
          (console.log("View instance created: ".concat(this.id)),
            this.updater.set({
              appName: "Lark Demo",
              currentTime: new Date().toLocaleString(),
            }),
            this.on("destroy", function () {
              console.log("View destroyed: ".concat(e.id));
            }));
        },
        alert: function (e, t) {
          alert("".concat(e, "\n\n").concat(t));
        },
        navigate: function (e, t) {
          r.Router.to(e, t);
        },
        getUrlParams: function () {
          return r.Router.parse().params;
        },
      });
      n.d(t, {}, { A: o });
    },
    286(e, t, n) {
      function r(e) {
        return String(null == e ? "" : e);
      }
      (n.d(t, { pu: () => l, tX: () => s, IW: () => i, Ni: () => u }),
        RegExp("(?:([\\w-]+)\x1e)?([^(]+)\\(([\\s\\S]*?)?\\)"));
      var o = { "!": "%21", "'": "%27", "(": "%28", ")": "%29", "*": "%2A" },
        a = /[!')(*]/g,
        c = /['"\\]/g;
      function i(e, t, n) {
        let r = e["\x1e"];
        for (let o = r; --o; ) if (e[(n = "\x1e" + o)] === t) return n;
        return ((n = "\x1e" + e["\x1e"]++), (e[n] = t), n);
      }
      var u = r,
        s = function (e) {
          return encodeURIComponent(r(e)).replace(a, (e) => o[e]);
        },
        l = function (e) {
          return r(e).replace(c, "\\$&");
        };
    },
  },
]);
//# sourceMappingURL=875.3a55c5ef.js.map
