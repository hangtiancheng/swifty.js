"use strict";
(self.webpackChunklark_demo = self.webpackChunklark_demo || []).push([
  [63],
  {
    63(e, t, n) {
      (n.r(t),
        n.d(t, {
          CALL_BREAK_TIME: () => y,
          Cache: () => re,
          CrossSite: () => jt,
          EVENT_METHOD_REGEXP: () => a,
          EventDelegator: () => Qe,
          EventEmitter: () => ie,
          Frame: () => It,
          Framework: () => an,
          LARK_VIEW: () => s,
          Payload: () => xt,
          ROUTER_EVENTS: () => o,
          Router: () => De,
          SPLITTER: () => i,
          Service: () => Vt,
          State: () => Ee,
          TAG_NAME_REGEXP: () => m,
          Updater: () => wt,
          VIEW_EVENT_METHOD_REGEXP: () => c,
          View: () => bt,
          applyStyle: () => W,
          bindStore: () => pn,
          computed: () => un,
          create: () => hn,
          createVDomRef: () => yt,
          defineView: () => _t,
          frameworkConfig: () => We,
          getRouteMode: () => xe,
          invalidateViewClass: () => Et,
          mark: () => X,
          markBooted: () => he,
          markRouterBooted: () => je,
          nextCounter: () => v,
          registerViewClass: () => Ct,
          resetProjectsMap: () => Dt,
          safeguard: () => te,
          unmark: () => J,
          use: () => Ze,
          useUrlState: () => cn,
          vdomCreate: () => ft,
        }));
      var r = 0,
        i = String.fromCharCode(30),
        o = {
          CHANGE: "change",
          CHANGED: "changed",
          PAGE_UNLOAD: "page_unload",
        },
        s = "v-lark",
        a = new RegExp(`(?:([\\w-]+)${i})?([^(]+)\\(([\\s\\S]*?)?\\)`),
        c = /^(\$?)([\w]*)<(.*?)>(?:<([\w ,]*)>)?$/,
        f = /(?:^.*\/\/[^/]+|#.*$)/gi,
        d = /^[^#]*#?!?/,
        u = /([^=&?/#]+)=?([^&#?]*)/g,
        l = /(?!^)=|&/,
        h = /[#?].*$/,
        p = "http://www.w3.org/2000/svg",
        g = "http://www.w3.org/1998/Math/MathML",
        m = /<([a-z][^/\0>\x20\t\r\n\f]+)/i,
        y = 48,
        w = { svg: p, math: g };
      function v() {
        return ++r;
      }
      var b = {
          "&": "amp",
          "<": "lt",
          ">": "gt",
          '"': "#34",
          "'": "#39",
          "`": "#96",
        },
        _ = /[&<>"'`]/g;
      function k(e) {
        return String(e ?? "");
      }
      function C(e) {
        return String(e ?? "").replace(_, (e) => "&" + b[e] + ";");
      }
      var E = { "!": "%21", "'": "%27", "(": "%28", ")": "%29", "*": "%2A" },
        A = /[!')(*]/g;
      function S(e) {
        return encodeURIComponent(k(e)).replace(A, (e) => E[e]);
      }
      var M = /['"\\]/g;
      function R(e) {
        return k(e).replace(M, "\\$&");
      }
      function O(e, t, n) {
        for (let r = e[i]; --r; ) if (e[(n = i + r)] === t) return n;
        return ((n = i + e[i]++), (e[n] = t), n);
      }
      function I(e) {
        if (e.length < 2 || e[0] !== i) return !1;
        for (let t = 1; t < e.length; t++) {
          const n = e.charCodeAt(t);
          if (n < "0".charCodeAt(0) || n > "9".charCodeAt(0)) return !1;
        }
        return !0;
      }
      function K(e) {
        if ("object" != typeof e || null === e) return !1;
        const t = Object.getPrototypeOf(e);
        return null === t || t === Object.prototype;
      }
      function T(e) {
        return !e || ("object" != typeof e && "function" != typeof e);
      }
      function P(e) {
        return !e || "object" != typeof e;
      }
      var L = 0;
      function D(e) {
        return (e || "lark_") + L++;
      }
      function j() {}
      function x(e, t) {
        return null != e && Object.prototype.hasOwnProperty.call(e, t);
      }
      function V(e, ...t) {
        for (const n of t) if (n) for (const t in n) x(n, t) && (e[t] = n[t]);
        return e;
      }
      function $(e, t, n, r) {
        const i = Array.isArray(e) ? e : [e];
        let o;
        for (const e of i)
          try {
            o = e.apply(n, t);
          } catch (e) {
            r?.(e);
          }
        return o;
      }
      var N = new Set();
      function U(e, t, n, r) {
        let i = !1;
        for (const o in e)
          if (x(e, o)) {
            const s = e[o],
              a = t[o];
            ((T(s) && a === s) || r.has(o) || (n.add(o), (i = !0)), (t[o] = s));
          }
        return i;
      }
      function F(e, t) {
        if (P(t)) {
          const n = String(t);
          return I(n) && x(e, n) ? e[n] : t;
        }
        if (K(t) || Array.isArray(t)) {
          for (const n in t)
            if (x(t, n)) {
              const r = F(e, t[n]);
              t[n] = r;
            }
          return t;
        }
        return t;
      }
      function B(e) {
        return e
          ? "object" == typeof e
            ? e
            : document.getElementById(e)
          : null;
      }
      function H(e) {
        const t = {},
          n = e.replace(h, ""),
          r = e === n && l.test(n) ? "" : n;
        return (
          e.replace(r, "").replace(u, (e, n, r) => {
            try {
              t[n] = decodeURIComponent(r || "");
            } catch {
              t[n] = r || "";
            }
            return "";
          }),
          { path: r, params: t }
        );
      }
      function z(e, t, n) {
        const r = [];
        let i = !1;
        for (const e in t)
          if (x(t, e)) {
            const o = String(t[e] ?? "");
            (!n || o || n.has(e)) &&
              (r.push(`${e}=${encodeURIComponent(o)}`), (i = !0));
          }
        return (
          i && (e += (e && (~e.indexOf("?") ? "&" : "?")) + r.join("&")),
          e
        );
      }
      function G(e, t) {
        const n = {};
        if (!e) return n;
        for (const r of e) {
          const e = String(t ? r[t] : r);
          n[e] = t ? r : (n[e] || 0) + 1;
        }
        return n;
      }
      function q() {
        return Date.now();
      }
      var Q = new Set();
      function W(e, t) {
        if (Array.isArray(e)) {
          if (e.length % 2 != 0)
            throw new Error("Invalid array of [id, content] pairs");
          const t = [];
          for (let n = 0; n < e.length; n += 2) {
            const r = W(e[n], e[n + 1]);
            r !== j && t.push(r);
          }
          return () => {
            for (const e of t) e();
          };
        }
        if (t && !Q.has(e)) {
          Q.add(e);
          const n = document.createElement("style");
          return (
            n.setAttribute("from", "lark"),
            (n.id = e),
            (n.textContent = t),
            document.head.append(n),
            () => {
              (Q.delete(e), n.remove());
            }
          );
        }
        return j;
      }
      var Z = new WeakMap();
      function X(e, t) {
        const n = (function (e) {
          let t = Z.get(e);
          return (
            t || ((t = { signs: new Map(), deleted: !1 }), Z.set(e, t)),
            t
          );
        })(e);
        if (n.deleted) return () => !1;
        const r = (n.signs.get(t) ?? 0) + 1;
        return (
          n.signs.set(t, r),
          () => {
            const n = Z.get(e);
            return !!n && !n.deleted && n.signs.get(t) === r;
          }
        );
      }
      function J(e) {
        const t = Z.get(e);
        t
          ? ((t.deleted = !0), t.signs.clear())
          : Z.set(e, { signs: new Map(), deleted: !0 });
      }
      var Y = new Map(),
        ee = "_safe_";
      function te(e, t, n, r) {
        if (void 0 === window.__lark_Debug || !window.__lark_Debug) return e;
        if ("undefined" == typeof Proxy) return e;
        if (P(e)) return e;
        const i = (e, o) => {
          const s = (t || "") + "" + (n || ""),
            a = Y.get(o);
          if (a && a.cacheKey === s) return a.entity;
          if (Reflect.get(o, ee)) return o;
          const c = new Proxy(o, {
            set(t, r, i) {
              if (!n && !e)
                throw new Error(
                  "Avoid write back, key: " +
                    e +
                    r +
                    " value:" +
                    i +
                    " more: https://github.com/hangtiancheng/lark",
                );
              return (Reflect.set(t, r, i), n && n(e + r, i), !0);
            },
            get(n, o) {
              if (o === ee) return !0;
              const s = Reflect.get(n, o);
              return (
                !e && t && t(o),
                !r && x(n, o) && (Array.isArray(s) || K(s))
                  ? i(e + o + ".", s)
                  : s
              );
            },
          });
          return (Y.set(o, { cacheKey: s, entity: c }), c);
        };
        return i("", e);
      }
      function ne(e, t) {
        return t.frequency - e.frequency || t.lastTimestamp - e.lastTimestamp;
      }
      var re = class {
          entries = [];
          lookup = new Map();
          bufferSize;
          maxSize;
          capacity;
          onRemove;
          comparator;
          constructor(e = {}) {
            ((this.maxSize = e.maxSize ?? 20),
              (this.bufferSize = e.bufferSize ?? 5),
              (this.capacity = this.maxSize + this.bufferSize),
              (this.onRemove = e.onRemove),
              (this.comparator = e.sortComparator ?? ne));
          }
          prefixKey(e) {
            return i + e;
          }
          get(e) {
            const t = this.prefixKey(e),
              n = this.lookup.get(t);
            if (n) return (n.frequency++, (n.lastTimestamp = v()), n.value);
          }
          forEach(e) {
            for (const t of this.entries) e(t.value);
          }
          set(e, t) {
            const n = this.prefixKey(e),
              r = this.lookup.get(n);
            if (r)
              return (
                (r.value = t),
                r.frequency++,
                void (r.lastTimestamp = v())
              );
            this.entries.length >= this.capacity && this.evictEntries();
            const i = {
              originalKey: e,
              value: t,
              frequency: 1,
              lastTimestamp: v(),
            };
            (this.entries.push(i), this.lookup.set(n, i));
          }
          del(e) {
            const t = this.prefixKey(e),
              n = this.lookup.get(t);
            if (!n) return;
            this.lookup.delete(t);
            const r = this.entries.indexOf(n);
            (-1 !== r && this.entries.splice(r, 1),
              this.onRemove && this.onRemove(e));
          }
          has(e) {
            return this.lookup.has(this.prefixKey(e));
          }
          get size() {
            return this.entries.length;
          }
          clear() {
            if (this.onRemove)
              for (const e of this.entries) this.onRemove(e.originalKey);
            ((this.entries = []), this.lookup.clear());
          }
          evictEntries() {
            const e = this.entries,
              t = this.bufferSize;
            if (t <= 0 || 0 === e.length) return;
            if (e.length <= t) {
              for (const t of e)
                (this.lookup.delete(this.prefixKey(t.originalKey)),
                  this.onRemove && this.onRemove(t.originalKey));
              return void (this.entries = []);
            }
            const n = this.comparator,
              r = [];
            for (const i of e)
              if (r.length < t) {
                let e = r.length;
                for (; e > 0 && n(i, r[e - 1]) > 0; ) e--;
                r.splice(e, 0, i);
              } else if (n(i, r[t - 1]) > 0) {
                r.pop();
                let e = r.length;
                for (; e > 0 && n(i, r[e - 1]) > 0; ) e--;
                r.splice(e, 0, i);
              }
            const i = new Set(r);
            for (const e of r)
              (this.lookup.delete(this.prefixKey(e.originalKey)),
                this.onRemove && this.onRemove(e.originalKey));
            this.entries = e.filter((e) => !i.has(e));
          }
        },
        ie = class {
          listeners = new Map();
          firingDepth = 0;
          pendingCompaction;
          on(e, t) {
            const n = i + e;
            let r = this.listeners.get(n);
            return (
              r || ((r = []), this.listeners.set(n, r)),
              r.push({ handler: t, executing: 0 }),
              this
            );
          }
          off(e, t) {
            const n = i + e;
            if (t) {
              const e = this.listeners.get(n);
              if (!e) return this;
              if (this.firingDepth > 0) {
                for (const r of e)
                  if (r.handler === t) {
                    ((r.handler = j),
                      (this.pendingCompaction ??= new Set()).add(n));
                    break;
                  }
              } else {
                for (let n = 0; n < e.length; n++)
                  if (e[n].handler === t) {
                    e.splice(n, 1);
                    break;
                  }
                0 === e.length && this.listeners.delete(n);
              }
            } else
              (this.listeners.delete(n),
                Reflect.deleteProperty(
                  this,
                  `on${e[0].toUpperCase() + e.slice(1)}`,
                ));
            return this;
          }
          fire(e, t, n, r) {
            const o = i + e,
              s = this.listeners.get(o);
            (t || (t = {}), (t.type = e), this.firingDepth++);
            try {
              if (s) {
                const e = s.length;
                for (let n = 0; n < e; n++) {
                  const i = s[r ? e - 1 - n : n];
                  i &&
                    i.handler !== j &&
                    ((i.executing = 1),
                    $([i.handler], [t], this, j),
                    (i.executing = ""));
                }
              }
              const i = this[`on${e[0].toUpperCase() + e.slice(1)}`];
              ("function" == typeof i && $([i], [t], this, j),
                n && this.off(e));
            } finally {
              if (
                (this.firingDepth--,
                0 === this.firingDepth && this.pendingCompaction)
              ) {
                for (const e of this.pendingCompaction) {
                  const t = this.listeners.get(e);
                  if (t) {
                    for (let e = t.length - 1; e >= 0; e--)
                      t[e].handler === j && t.splice(e, 1);
                    0 === t.length && this.listeners.delete(e);
                  }
                }
                this.pendingCompaction = void 0;
              }
            }
            return this;
          }
        },
        oe = {},
        se = {},
        ae = new Set(),
        ce = N,
        fe = !1,
        de = {},
        ue = new ie(),
        le = !1;
      function he() {
        le = !0;
      }
      var pe = new Set();
      function ge(e) {
        pe.delete(e);
      }
      var me,
        ye,
        we,
        ve,
        be,
        _e,
        ke,
        Ce,
        Ee = {
          get(e) {
            const t = e ? oe[e] : oe;
            return void 0 !== window.__lark_Debug && window.__lark_Debug
              ? te(
                  t,
                  (e) => {
                    le &&
                      x(de, e) &&
                      de[e] !== window.location.pathname &&
                      console.warn(
                        `beware! You get state:"{State}.${e}" where it set by page:${de[e]}`,
                      );
                  },
                  (t, n) => {
                    const r = e || t;
                    !(function (e, t) {
                      pe.has(e) || (pe.add(e), console.warn(t));
                    })(
                      r,
                      `beware! You direct modify "{State}.${r}" You should call State.set() and State.digest() to notify other views`,
                    );
                  },
                )
              : t;
          },
          set(e, t) {
            if (
              ((fe = U(e, oe, ae, t || N) || fe),
              void 0 !== window.__lark_Debug && window.__lark_Debug && le)
            )
              for (const t in e) de[t] = window.location.pathname;
            return Ee;
          },
          digest(e, t) {
            if ((e && Ee.set(e, t), fe)) {
              if (void 0 !== window.__lark_Debug && window.__lark_Debug)
                for (const e of ae) ge(e);
              fe = !1;
              const e = ae;
              ((ce = e), (ae = new Set()), ue.fire(o.CHANGED, { keys: e }));
            }
          },
          diff: () => ce,
          clean: (e) => ({
            make: function () {
              const t = (function (e) {
                const t = e.split(",");
                for (const e of t) x(se, e) ? se[e]++ : (se[e] = 1);
                return t;
              })(e);
              this.on("destroy", () => {
                !(function (e) {
                  for (const t of e)
                    x(se, t) &&
                      --se[t] <= 0 &&
                      (Reflect.deleteProperty(se, t),
                      Reflect.deleteProperty(oe, t),
                      void 0 !== window.__lark_Debug &&
                        window.__lark_Debug &&
                        Reflect.deleteProperty(de, t));
                })(t);
              });
            },
          }),
          on: (e, t) => (ue.on(e, t), Ee),
          off: (e, t) => (ue.off(e, t), Ee),
          fire: (e, t, n) => (ue.fire(e, t, n), Ee),
        },
        Ae = new ie(),
        Se = new re(),
        Me = new re(),
        Re = {
          href: "",
          srcQuery: "",
          srcHash: "",
          query: { path: "", params: {} },
          hash: { path: "", params: {} },
          params: {},
          get: (e, t) => t ?? "",
        },
        Oe = 0,
        Ie = !1,
        Ke = "history",
        Te = [];
      function Pe(e, t) {
        return this.params[e] || (void 0 !== t ? t : "");
      }
      function Le(e, t) {
        if ("history" === Ke) {
          const n = e || "/";
          if (n === window.location.pathname + window.location.search) return;
          return void (t
            ? window.history.replaceState(null, "", n)
            : window.history.pushState(null, "", n));
        }
        const n = "" === e ? "" : (Ce?.hashbang || "#!") + e;
        t ? window.location.replace(n) : (window.location.hash = n);
      }
      var De = {
        parse(e) {
          e = e || window.location.href;
          const t = Se.get(e);
          if (t) return t;
          let n, r, i, o;
          if ("history" === Ke)
            try {
              const t = new URL(e, window.location.origin);
              ((n = t.pathname + t.search),
                (r = t.hash ? t.hash.replace(/^#!?/, "") : ""),
                (i = H(n)),
                (o = r ? H(r) : { path: "", params: {} }));
            } catch {
              ((n = e.replace(f, "")),
                (r = e.replace(d, "")),
                (i = H(n)),
                (o = H(r)));
            }
          else
            ((n = e.replace(f, "")),
              (r = e.replace(d, "")),
              (i = H(n)),
              (o = H(r)));
          const s = V({}, i.params, o.params),
            a = {
              href: e,
              srcQuery: n,
              srcHash: r,
              query: { path: i.path, params: i.params },
              hash: { path: o.path, params: o.params },
              params: s,
              get: Pe,
            };
          return (
            Ie &&
              ((function (e) {
                if (
                  Ce &&
                  (ye ||
                    ((ye = Ce.routes || {}),
                    (we = Ce.unmatchedView),
                    (ve = Ce.defaultView),
                    (be = Ce.defaultPath || "/"),
                    (_e = Ce.rewrite)),
                  !e.view)
                ) {
                  let t =
                    ("history" === Ke && e.query.path) ||
                    e.hash.path ||
                    be ||
                    "/";
                  (!ye[t] && "/" === t && be && "/" !== be && (t = be),
                    _e && (t = _e(t, e.params, ye)));
                  const n = ye[t] || we || ve;
                  ((e.path = t),
                    (e.view = "string" == typeof n ? n : n?.view || ""),
                    "object" == typeof n && n && V(e, n));
                }
              })(a),
              Se.set(e, a)),
            void 0 !== window.__lark_Debug &&
              window.__lark_Debug &&
              (a.params = te(a.params)),
            a
          );
        },
        diff() {
          const e = De.parse(),
            t = (function (e, t) {
              const n = e.href,
                r = t.href,
                o = n + i + r,
                s = Me.get(o);
              if (s) return s;
              let a = !1;
              const c = {},
                f = (e, t, n) => {
                  const r = t || "",
                    i = n || "";
                  r !== i && ((c[e] = { from: r, to: i }), (a = !0));
                },
                d = new Set([
                  ...Object.keys(e.params),
                  ...Object.keys(t.params),
                ]);
              for (const n of d) f(n, e.params[n], t.params[n]);
              const u = { params: c, force: !n, changed: a };
              (f("path", e.path, t.path),
                c.path && ((u.path = c.path), (u.changed = !0)));
              const l = "view";
              (f(l, e.view, t.view),
                c[l] && ((u.view = c[l]), (u.changed = !0)));
              const h = { changed: a, diff: u };
              return (Me.set(o, h), h);
            })(Re, e);
          return (
            (Re = e),
            !Oe &&
              t.changed &&
              ((me = t.diff).path && (document.title = ke || document.title),
              Ae.fire(o.CHANGED, me)),
            (Oe = 0),
            void 0 !== window.__lark_Debug &&
              window.__lark_Debug &&
              me &&
              (me = te(me)),
            me
          );
        },
        to(e, t, n, r) {
          let i,
            o = "";
          if (t || "object" != typeof e) {
            const n = H(e);
            ((o = n.path), (i = { ...n.params }), t && V(i, t));
          } else i = e;
          const s = Re.path || "",
            a = Re.params,
            c = new Set();
          for (const e in Re.query.params) x(Re.query.params, e) && c.add(e);
          if (o) {
            if ("hash" === Ke && !x(window, "history"))
              for (const e of c) x(i, e) || (i[e] = "");
          } else a && ((o = s), (i = V({}, a, i)));
          !(function (e, t, n, r, i, o) {
            (e = z(e, t, o)) !== ("history" === Ke ? n.srcQuery : n.srcHash) &&
              ((Oe = i ? 1 : 0),
              Le(e, r),
              "history" === Ke && De.notify && De.notify());
          })(o, i, Re, n, r, c);
        },
        beforeEach: (e) => (
          Te.push(e),
          () => {
            const t = Te.indexOf(e);
            -1 !== t && Te.splice(t, 1);
          }
        ),
        join(...e) {
          let t = e.join("/");
          t = t.replace(/\/\.\//g, "/");
          const n = /\/[^/]+\/\.\.\//;
          for (; n.test(t); ) t = t.replace(n, "/");
          return ((t = t.replace(/\/{2,}/g, "/")), t);
        },
        on: (e, t) => (Ae.on(e, t), De),
        off: (e, t) => (Ae.off(e, t), De),
        fire: (e, t, n) => (Ae.fire(e, t, n), De),
        _bind() {
          ke = document.title;
          let e,
            t =
              "history" === Ke
                ? window.location.pathname + window.location.search
                : De.parse().srcHash;
          const n = () => {
            if (e) return;
            Se.clear();
            const n = De.parse(),
              r = "history" === Ke ? n.srcQuery : n.srcHash;
            if (r !== t) {
              const i = {
                p: 0,
                reject: () => {
                  ((i.p = 1), (e = ""), Le(t));
                },
                resolve: () => {
                  ((i.p = 1), (t = r), (e = ""), Le(r), De.diff());
                },
                prevent: () => {
                  e = 1;
                },
              };
              if ((De.fire(o.CHANGE, i), e || i.p)) return;
              if (0 === Te.length) return void i.resolve();
              const s = Re,
                a = n,
                c = Te.slice();
              let f = Promise.resolve(!0);
              for (const e of c) f = f.then((t) => !1 !== t && e(a, s));
              f.then(
                (e) => {
                  i.p || (!1 === e ? i.reject() : i.resolve());
                },
                () => {
                  i.p || i.reject();
                },
              );
            }
          };
          ((De.notify = n),
            "history" === Ke || window.addEventListener("hashchange", n),
            window.addEventListener("popstate", n),
            window.addEventListener("beforeunload", (e) => {
              const t = {};
              De.fire(o.PAGE_UNLOAD, t);
              const n = t.msg;
              n && (e.returnValue = n);
            }),
            De.diff());
        },
        _setConfig(e) {
          ((Ce = e), (Ke = e.routeMode || "history"));
        },
      };
      function je() {
        Ie = !0;
      }
      function xe() {
        return Ke;
      }
      var Ve,
        $e = {},
        Ne = {},
        Ue = {},
        Fe = {},
        Be = 0,
        He = new re({ maxSize: 30, bufferSize: 10 });
      function ze(e, t) {
        const n = [],
          r = e.getAttribute(`@${t}`),
          i = !!Ne[t];
        if (!r && !i) return n;
        let o,
          s = e;
        if (
          (r &&
            (o = (function (e) {
              const t = He.get(e);
              if (t) return V({}, t, { value: e });
              const n = e.match(a) || [],
                r = { id: n[1] || "", name: n[2] || "", params: n[3] || "" };
              return (He.set(e, r), V({}, r, { value: e }));
            })(r)),
          (o && !o.id) || i)
        ) {
          let r = "#",
            i = 0;
          for (; s && s !== document.body; ) {
            const e = s.id;
            if (e && Ve?.(e)) {
              r = e;
              break;
            }
            s = s.parentElement;
          }
          const a = e.id;
          a && Ve?.(a) && ((i = 1), (r = a));
          let c = r;
          do {
            const r = c ? Ve?.(c) : void 0;
            if (r) {
              const s = r.view;
              if (s) {
                const r = s.eventSelectorMap[t];
                if (r)
                  for (const t of r.selectors) {
                    const r = { value: t, id: c, name: t, params: "" };
                    t ? !i && Ge(e, t) && n.push(r) : i && n.unshift(r);
                  }
                if (s.template && !i) {
                  o && !o.id && (o.id = c);
                  break;
                }
                i = 0;
              }
            }
            if (!r) break;
            c = r.parentId || "";
          } while (c);
        }
        return (
          o &&
            n.push({
              id: o.id,
              value: o.value,
              name: o.name,
              params: o.params,
            }),
          n
        );
      }
      function Ge(e, t) {
        try {
          return e.matches?.(t) ?? !1;
        } catch {
          return !1;
        }
      }
      function qe(e) {
        const t = e.target,
          n = e.type;
        let r = "",
          o = t;
        for (; o && o !== document.body; ) {
          const s = ze(o, n);
          if (s.length)
            for (const o of s) {
              const { id: s, name: a, params: c } = o;
              if (r !== s) {
                if (r && e.isPropagationStopped?.()) break;
                r = s;
              }
              const f = s ? Ve?.(s) : void 0,
                d = f?.view;
              if (d) {
                const r = a + i + n,
                  o = Reflect.get(d, r);
                if (o) {
                  const n = e;
                  ((n.eventTarget = t),
                    (n.params = c ? H(c).params : {}),
                    $(o, [n], d, j));
                }
              }
            }
          const a = o.getAttribute("data-range-fid"),
            c = o.getAttribute("data-range-guid");
          if (a && c) {
            const e = Ue[a];
            if (e?.[c]?.[n]) break;
          }
          if (e.isPropagationStopped?.()) break;
          o = o.parentElement;
        }
      }
      var Qe = {
          bind(e, t = !1) {
            const n = $e[e] || 0;
            (0 === n && document.body.addEventListener(e, qe, !0),
              ($e[e] = n + 1),
              t && (Ne[e] = (Ne[e] || 0) + 1));
          },
          unbind(e, t = !1) {
            const n = $e[e] || 0;
            if (
              (n <= 1
                ? (document.body.removeEventListener(e, qe, !0),
                  Reflect.deleteProperty($e, e))
                : ($e[e] = n - 1),
              t)
            ) {
              const t = Ne[e] || 0;
              t <= 1 ? Reflect.deleteProperty(Ne, e) : (Ne[e] = t - 1);
            }
          },
          clearRangeEvents(e) {
            (Reflect.deleteProperty(Ue, e), Reflect.deleteProperty(Fe, e));
          },
          setFrameGetter(e) {
            Ve = e;
          },
          nextElementGuid: () => ++Be,
        },
        We = {
          rootId: "root",
          routeMode: "history",
          hashbang: "#!",
          error: (e) => {
            throw e;
          },
        };
      function Ze(e, t) {
        const n = "string" == typeof e ? [e] : e,
          r = (() => {
            if (We.require) {
              const e = We.require(n);
              return e && "function" == typeof e.then ? e : Promise.resolve([]);
            }
            return Promise.all(
              n.map((e) => {
                const t = e.startsWith(".") || e.startsWith("/") ? e : `./${e}`;
                return import(t)
                  .then((e) =>
                    e && (e.__esModule || "function" == typeof e.default)
                      ? e.default
                      : e,
                  )
                  .catch((e) => {
                    const t = We.error;
                    t && t(e instanceof Error ? e : new Error(String(e)));
                  });
              }),
            );
          })();
        return (
          t &&
            r.then((e) => {
              t(...e);
            }),
          r
        );
      }
      var Xe = {
        option: [1, "<select multiple>"],
        thead: [1, "<table>"],
        col: [2, "<table><colgroup>"],
        tr: [2, "<table><tbody>"],
        td: [3, "<table><tbody><tr>"],
        area: [1, "<map>"],
        param: [1, "<object>"],
        svg: [1, '<svg xmlns="' + p + '">'],
        math: [1, '<math xmlns="' + g + '">'],
        _: [0, ""],
      };
      ((Xe.optgroup = Xe.option),
        (Xe.tbody = Xe.tfoot = Xe.colgroup = Xe.caption = Xe.thead),
        (Xe.th = Xe.td));
      var Je = document.implementation.createHTMLDocument(""),
        Ye = Je.createElement("base");
      ((Ye.href = document.location.href), Je.head.appendChild(Ye));
      var et = {
        INPUT: ["value", "checked"],
        TEXTAREA: ["value"],
        OPTION: ["selected"],
      };
      function tt(e, t) {
        if (!(t instanceof Element)) return;
        const n = t.getAttribute("id");
        n && (e.unmountZone(n), e.children().includes(n) && e.unmountFrame(n));
      }
      function nt(e) {
        if (1 !== e.nodeType) return;
        const t = e;
        if (t.compareKeyCached) return t.cachedCompareKey;
        let n = t.autoId ? "" : t.getAttribute("id") || void 0;
        if (!n) {
          const e = t.getAttribute(s);
          e && (n = H(e).path || void 0);
        }
        return ((t.compareKeyCached = 1), (t.cachedCompareKey = n || ""), n);
      }
      function rt(e, t, n, r, i) {
        let o = e.lastChild,
          s = t.firstChild,
          a = 0;
        const c = new Map(),
          f = new Map();
        for (; o; ) {
          a++;
          const e = nt(o);
          if (e) {
            let t = c.get(e);
            (t || ((t = []), c.set(e, t)), t.push(o));
          }
          o = o.previousSibling;
        }
        for (; s; ) {
          const e = nt(s);
          (e && f.set(e, (f.get(e) ?? 0) + 1), (s = s.nextSibling));
        }
        for (s = t.firstChild, o = e.firstChild; s; ) {
          a--;
          const t = s;
          s = s.nextSibling;
          const d = nt(t);
          let u = d ? c.get(d) : void 0;
          if (u && (u = u.slice()) && u.length) {
            const s = u.pop();
            for (; s !== o && o; ) {
              const t = o.nextSibling;
              (e.appendChild(o), (o = t));
            }
            if (((o = s.nextSibling), d)) {
              const e = f.get(d);
              e && f.set(d, e - 1);
            }
            it(s, t, e, n, r, i);
          } else if (o) {
            const s = o,
              d = nt(s);
            d && c.has(d) && f.get(d)
              ? (a++, (n.hasChanged = 1), n.domOps.push([8, e, t, s]))
              : ((o = o.nextSibling), it(s, t, e, n, r, i));
          } else ((n.hasChanged = 1), n.domOps.push([1, e, t]));
        }
        let d = e.lastChild;
        for (; a-- > 0; )
          d &&
            (tt(r, d),
            n.domOps.push([2, e, d]),
            (d = d.previousSibling),
            (n.hasChanged = 1));
      }
      function it(e, t, n, r, i, o) {
        const a = e instanceof Element ? e : null,
          c = t instanceof Element ? t : null,
          f = null !== a && null !== c && a.isEqualNode && a.isEqualNode(c);
        if (
          (function (e, t) {
            const n = et[e.nodeName];
            if (!n) return 0;
            const r = e,
              i = t;
            let o = 0;
            for (const e of n) r[e] !== i[e] && ((o = 1), (r[e] = i[e]));
            return o;
          })(e, t) ||
          !f
        )
          if (e.nodeType === t.nodeType && e.nodeName === t.nodeName)
            if (null !== a && null !== c) {
              const e = a,
                t = c,
                n = t.getAttribute(s);
              let f = !0;
              if (n) {
                const t = e.getAttribute("id") || "",
                  r = H(n).path,
                  i = e.getAttribute(s),
                  o = i ? H(i).path : "";
                t && r === o && (f = !1);
              }
              (!(function (e, t, n, r) {
                const i = e;
                Reflect.deleteProperty(i, "compareKeyCached");
                const o = e.attributes,
                  s = t.attributes;
                for (let i = o.length; i--; ) {
                  const s = o[i].name;
                  t.hasAttribute(s) ||
                    ("id" === s
                      ? r || n.idUpdates.push([e, ""])
                      : ((n.hasChanged = 1), e.removeAttribute(s)));
                }
                for (let t = s.length; t--; ) {
                  const r = s[t],
                    i = r.name,
                    o = r.value;
                  e.getAttribute(i) !== o &&
                    ("id" === i
                      ? n.idUpdates.push([e, o])
                      : ((n.hasChanged = 1), e.setAttribute(i, o)));
                }
              })(e, t, r, !!n),
                f && rt(e, t, r, i, o));
            } else
              e.nodeValue !== t.nodeValue &&
                ((r.hasChanged = 1), (e.nodeValue = t.nodeValue));
          else ((r.hasChanged = 1), tt(i, e), r.domOps.push([4, n, t, e]));
      }
      var ot = s,
        st = {},
        at = {},
        ct = {
          INPUT: ["value", "checked"],
          TEXTAREA: ["value"],
          OPTION: ["selected"],
        };
      function ft(e, t, n, r) {
        if (!e) return { tag: n ? i : 0, html: String(t ?? "") };
        const o = t || st,
          s = r || at,
          a = 1 === n;
        let c,
          f,
          d,
          u,
          l,
          h,
          p,
          g,
          m = "",
          y = 0,
          w = `<${e}`;
        if (n && 1 !== n)
          for (const e of n)
            (void 0 !== e.attrs
              ? (m += e.attrs + (e.selfClose ? "/>" : `>${e.html}</${e.tag}>`))
              : 0 === e.tag
                ? (m += C(e.html))
                : (m += e.html),
              0 === e.tag && g && 0 === g.tag
                ? (g.html += e.html)
                : (f || (f = []), f.push(e), (g = e)),
              e.compareKey &&
                (d || (d = {}),
                (d[e.compareKey] = (d[e.compareKey] || 0) + 1),
                y++),
              e.views && (u || (u = []), u.push(...e.views)),
              (l = l || e.larkViewKeys));
        p = r || void 0;
        for (const t in o) {
          let n = o[t];
          if (!1 !== n && null != n)
            if (
              (!0 === n && (o[t] = n = s[t] ? n : ""),
              ("#" !== t && "id" !== t && "_" !== t) ||
                c ||
                ((c = n), "id" === t))
            ) {
              if (t === ot && n) {
                const t = H(n);
                ((h = t.path),
                  u || (u = []),
                  u.push([h, o["lark-owner"], n, t.params]),
                  c || (c = e + i + h));
              }
              "$" !== t
                ? (w += ` ${t}="${n && C(n)}"`)
                : ((l = n), delete o[t]);
            } else delete o[t];
          else s[t] || delete o[t];
        }
        return {
          tag: e,
          html: m,
          attrs: w,
          attrsMap: o,
          attrsSpecials: s,
          hasSpecials: p,
          children: f,
          compareKey: c,
          reused: d,
          reusedTotal: y,
          views: u,
          selfClose: a,
          isLarkView: h,
          larkViewKeys: l,
        };
      }
      function dt(e, t) {
        return (
          (e.compareKey && t.compareKey === e.compareKey) ||
          (!e.compareKey && !t.compareKey && e.tag === t.tag) ||
          e.tag === i ||
          t.tag === i
        );
      }
      function ut(e, t, n, r, i) {
        const o = {};
        for (let s = r, a = i; s >= n; s--, a--) {
          const n = e[s].compareKey;
          n && (o[n] || (o[n] = [])).push(t[a]);
        }
        return o;
      }
      function lt(e, t, n) {
        const r = e.tag;
        if (0 === r) return document.createTextNode(e.html);
        const i = "string" == typeof r ? r : r.toString(),
          o = w[i] || t.namespaceURI,
          s = document.createElementNS(o, i);
        return (ht(s, e, n), (s.innerHTML = e.html), s);
      }
      function ht(e, t, n, r) {
        let i = 0;
        const o = t.attrsMap || st,
          s = t.attrsSpecials || at;
        if (r) {
          const t = r.attrsMap || st,
            s = r.attrsSpecials || at;
          for (const r in t)
            if (!x(o, r)) {
              i = 1;
              const t = s[r];
              t
                ? n
                  ? n.nodeProps.push([e, t, ""])
                  : (e[t] = "")
                : e.removeAttribute(r);
            }
        }
        for (const t in o) {
          const a = o[t],
            c = s[t];
          if (c) {
            const o = r?.attrsMap;
            (o && o[t] === a) ||
              ((i = 1), n ? n.nodeProps.push([e, c, a]) : (e[c] = a));
          } else {
            const n = r?.attrsMap;
            (n && n[t] === a) || ((i = 1), e.setAttribute(t, String(a ?? "")));
          }
        }
        return i;
      }
      function pt(e, t, n, r, i, o, s, a, c) {
        const f = n.tag,
          d = r.tag;
        if (0 !== f && 0 !== d)
          if (f === d) {
            const f = n.attrsMap || st,
              d = r.attrsMap || st;
            if (n.compareKey && n.compareKey === r.compareKey && !f.id && !d.id)
              return;
            let u = 0;
            (n.attrs !== r.attrs || r.hasSpecials) &&
              ((u = ht(e, r, i, n)), u && (i.changed = 1));
            let l = !0;
            if (r.isLarkView) {
              const t = e.getAttribute("id") || "",
                i = r.isLarkView,
                o = n.isLarkView || "";
              if (t && i === o) {
                l = !1;
                const e = r.larkViewKeys;
                if (e) {
                  const t = e.split(",");
                  for (const e of t)
                    if ("#" === e || x(s, e)) {
                      l = !0;
                      break;
                    }
                }
              }
            }
            (!(function (e, t) {
              const n = ct[e.nodeName];
              if (!n) return 0;
              const r = e,
                i = t;
              let o = 0;
              for (const e of n) r[e] !== i[e] && ((o = 1), (r[e] = i[e]));
            })(e, lt(r, t, i)),
              l && !r.selfClose && gt(e, n, r, i, o, s, a, c));
          } else ((i.changed = 1), tt(o, e), t.replaceChild(lt(r, t, i), e));
        else
          f === d
            ? n.html !== r.html && ((i.changed = 1), (e.nodeValue = r.html))
            : ((i.changed = 1), tt(o, e), t.replaceChild(lt(r, t, i), e));
      }
      function gt(e, t, n, r, o, s, a, c) {
        if (!t) return ((r.changed = 1), void (e.innerHTML = n.html));
        const f = t.children,
          d = n.children,
          u = f?.length || 0,
          l = d?.length || 0;
        if (0 === u && 0 === l) return;
        const h = e.childNodes;
        let p,
          g = 0,
          m = u - 1,
          y = 0,
          w = l - 1,
          v = g,
          b = m;
        const _ = t.reusedTotal || 0,
          k = n.reusedTotal || 0;
        let C = f?.[g],
          E = f?.[m],
          A = d?.[y],
          S = d?.[w];
        for (; g <= m && y <= w; )
          if (C)
            if (E)
              if (dt(A, C)) {
                if (A.tag === i || C.tag === i)
                  return ((r.changed = 1), void (e.innerHTML = n.html));
                (pt(h[v], e, C, A, r, o, s, a, c),
                  mt(p, C),
                  v++,
                  (C = f?.[++g]),
                  (A = d?.[++y]));
              } else if (dt(S, E))
                (pt(h[b], e, E, S, r, o, s, a, c),
                  mt(p, E),
                  b--,
                  (E = f?.[--m]),
                  (S = d?.[--w]));
              else if (dt(S, C)) {
                const t = h[v];
                (e.insertBefore(t, h[b + 1] || null),
                  pt(t, e, C, S, r, o, s, a, c),
                  mt(p, C),
                  v++,
                  (C = f?.[++g]),
                  (S = d?.[--w]));
              } else if (dt(A, E)) {
                const t = h[b];
                (e.insertBefore(t, h[v]),
                  pt(t, e, E, A, r, o, s, a, c),
                  mt(p, E),
                  b--,
                  (E = f?.[--m]),
                  (A = d?.[++y]));
              } else {
                !p && k > 0 && _ > 0 && (p = ut(f, h, g, m, b));
                const i = A.compareKey;
                let u, l;
                if (
                  (i &&
                    p &&
                    ((u = p[i]),
                    u && ((l = u.pop()), 0 === u.length && delete p[i])),
                  l)
                ) {
                  if (l !== h[v]) {
                    for (let e = g + 1; e <= m; e++) {
                      const t = f?.[e];
                      if (t && h[v + (e - g)] === l) {
                        f[e] = void 0;
                        break;
                      }
                    }
                    e.insertBefore(l, h[v]);
                  }
                  pt(l, e, C, A, r, o, s, a, c);
                } else if (
                  (C.compareKey &&
                    t.reused?.[C.compareKey] &&
                    n.reused?.[C.compareKey]) ||
                  (h[v]?.id &&
                    e.querySelectorAll?.(`#${h[v].id}`)?.length &&
                    !A.isLarkView)
                ) {
                  r.changed = 1;
                  const t = lt(A, e, r);
                  (e.insertBefore(t, h[v]), v--, b++);
                } else pt(h[v], e, C, A, r, o, s, a, c);
                (v++, (C = f?.[++g]), (A = d?.[++y]));
              }
            else ((E = f?.[--m]), b--);
          else ((C = f?.[++g]), v++);
        if (y <= w) {
          const t = h[b + 1] || null;
          for (let n = y; n <= w; n++) {
            ((r.changed = 1), r.asyncCount++);
            const i = lt(d[n], e, r);
            (e.insertBefore(i, t), r.asyncCount--);
          }
        }
        if (g <= m)
          for (let t = b; t >= v; t--) {
            const n = h[t];
            n && (tt(o, n), (r.changed = 1), e.removeChild(n));
          }
      }
      function mt(e, t) {
        if (!e || !t.compareKey) return;
        const n = e[t.compareKey];
        n && (n.pop(), 0 === n.length && delete e[t.compareKey]);
      }
      function yt(e) {
        return {
          viewId: e,
          viewRenders: [],
          nodeProps: [],
          asyncCount: 0,
          changed: 0,
          domOps: [],
        };
      }
      var wt = class {
          viewId;
          data;
          refData;
          changedKeys = new Set();
          hasChangedFlag = 0;
          digestingQueue = [];
          version = 0;
          snapshotVersion;
          vdom;
          constructor(e) {
            ((this.viewId = e), (this.data = { vId: e }));
            const t = {};
            ((t[i] = 1), (this.refData = t), (this.hasChangedFlag = 1));
          }
          get(e) {
            let t = this.data;
            return (
              e && (t = this.data[e]),
              "undefined" != typeof window && window.__lark_Debug ? te(t) : t
            );
          }
          set(e, t) {
            return (
              U(e, this.data, this.changedKeys, t || N) &&
                (this.version++, (this.hasChangedFlag = 1)),
              this
            );
          }
          digest(e, t, n) {
            e && this.set(e, t);
            const r = this.digestingQueue;
            (n && r.push(n),
              (r.length > 0 && null === r[0]) || this.runDigest(r));
          }
          runDigest(e) {
            const t = e.length;
            e.push(null);
            const n = this.changedKeys,
              r = this.hasChangedFlag;
            ((this.hasChangedFlag = 0), (this.changedKeys = new Set()));
            const i = It.get(this.viewId),
              o = i?.view,
              s = B(this.viewId);
            if (r && o && s && o.signature > 0 && i) {
              const e = o.template;
              if ("function" == typeof e)
                if (We.virtualDom) {
                  const t = e(
                      this.data,
                      ft,
                      this.viewId,
                      S,
                      this.refData,
                      O,
                      R,
                      Array.isArray,
                    ),
                    r = yt(this.viewId),
                    a = () => {
                      ((this.vdom = t),
                        (!r.changed && o.rendered) || o.endUpdate(this.viewId));
                      for (const [e, t, n] of r.nodeProps) e[t] = n;
                      for (const e of r.viewRenders)
                        e.render && $(e.render, [], e, j);
                    };
                  (gt(s, this.vdom, t, r, i, n, o, a),
                    0 === r.asyncCount && a());
                } else {
                  const t = {
                    idUpdates: [],
                    views: [],
                    domOps: [],
                    hasChanged: 0,
                  };
                  (rt(
                    s,
                    (function (e, t) {
                      const n = Je.createElement("div"),
                        r = t.namespaceURI;
                      let i;
                      if (r === p) i = "svg";
                      else if (r === g) i = "math";
                      else {
                        const t = m.exec(e);
                        i = t ? t[1] : "";
                      }
                      const o = Xe[i] || Xe._;
                      n.innerHTML = o[1] + e;
                      let s = o[0];
                      for (; s--; ) {
                        const e = n.lastChild;
                        e && n.replaceChildren(e);
                      }
                      return n;
                    })(
                      e(this.data, this.viewId, this.refData, C, k, S, O, R),
                      s,
                    ),
                    t,
                    i,
                    n,
                  ),
                    (function (e) {
                      for (const [t, n] of e)
                        n ? t.setAttribute("id", n) : t.removeAttribute("id");
                    })(t.idUpdates),
                    (function (e) {
                      for (const t of e)
                        switch (t[0]) {
                          case 1:
                            t[1].appendChild(t[2]);
                            break;
                          case 2:
                            t[1].removeChild(t[2]);
                            break;
                          case 4:
                            t[1].replaceChild(t[2], t[3]);
                            break;
                          case 8:
                            t[1].insertBefore(t[2], t[3]);
                        }
                    })(t.domOps));
                  for (const e of t.views) e.render && $(e.render, [], e, j);
                  (!t.hasChanged && o.rendered) || o.endUpdate(this.viewId);
                }
            }
            if (e.length > t + 1) this.runDigest(e);
            else {
              const t = e.slice();
              e.length = 0;
              for (const e of t) e && e();
            }
          }
          snapshot() {
            return ((this.snapshotVersion = this.version), this);
          }
          altered() {
            if (void 0 !== this.snapshotVersion)
              return this.version !== this.snapshotVersion;
          }
          translate(e) {
            return "string" == typeof e && I(e) && x(this.refData, e)
              ? this.refData[e]
              : e;
          }
          parse(e) {
            const t = e.trim();
            if (!t) return;
            if (/^-?\d+(?:\.\d+)?$/.test(t)) return Number(t);
            if (!/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/.test(t)) return;
            let n = this.refData;
            for (const e of t.split(".")) {
              if (null == n || "object" != typeof n) return;
              n = n[e];
            }
            return n;
          }
          getChangedKeys() {
            return this.changedKeys;
          }
        },
        vt = {};
      ("undefined" != typeof window && (vt.window = window),
        "undefined" != typeof document && (vt.document = document));
      var bt = class e {
        id = "";
        owner = 0;
        updater;
        signature = 0;
        rendered;
        template;
        locationObserved = { flag: 0, keys: [], observePath: !1 };
        observedStateKeys;
        resources = {};
        endUpdatePending;
        _events = new ie();
        get protoEventState() {
          return Object.getPrototypeOf(this);
        }
        get eventObjectMap() {
          return this.protoEventState.$evtObjMap ?? {};
        }
        get eventSelectorMap() {
          return this.protoEventState.$selMap ?? {};
        }
        get globalEventList() {
          return this.protoEventState.$globalEvtList ?? [];
        }
        init() {}
        render() {
          this.updater.digest();
        }
        on(e, t) {
          return (this._events.on(e, t), this);
        }
        off(e, t) {
          return (this._events.off(e, t), this);
        }
        fire(e, t, n, r) {
          return (this._events.fire(e, t, n, r), this);
        }
        get ownerFrame() {
          return this.owner;
        }
        beginUpdate(e) {
          this.signature > 0 &&
            void 0 !== this.endUpdatePending &&
            this.ownerFrame.unmountZone(e);
        }
        endUpdate(t, n) {
          if (this.signature > 0) {
            const r = t || this.id;
            let i;
            n
              ? (i = n)
              : ((i = this.endUpdatePending),
                (this.endUpdatePending = 1),
                (this.rendered = !0));
            const o = this.ownerFrame;
            (o.mountZone(r),
              i ||
                setTimeout(
                  this.wrapAsync(() => {
                    e.runInvokes(o);
                  }),
                  0,
                ));
          }
        }
        wrapAsync(e, t) {
          const n = this.signature;
          return (...r) => {
            if (n > 0 && n === this.signature) return e.apply(t || this, r);
          };
        }
        observeLocation(e, t = !1) {
          const n = this.locationObserved;
          if (((n.flag = 1), "object" == typeof e && !Array.isArray(e))) {
            const n = e;
            n.path && (t = !0);
            const r = n.params;
            ("string" == typeof r || Array.isArray(r)) && (e = r);
          }
          ((n.observePath = t),
            e &&
              ("string" == typeof e
                ? (n.keys = e.split(","))
                : Array.isArray(e) && (n.keys = e)));
        }
        observeState(e) {
          this.observedStateKeys = "string" == typeof e ? e.split(",") : e;
        }
        capture(t, n, r = !1) {
          const i = this.resources;
          if (!n) {
            const e = i[t];
            return e ? e.entity : void 0;
          }
          return (
            e.destroyResource(i, t, !0, n),
            (i[t] = { entity: n, destroyOnRender: r }),
            n
          );
        }
        release(t, n = !0) {
          return e.destroyResource(this.resources, t, n);
        }
        leaveTip(e, t) {
          const n = function (e) {
              const r = e.type === o.CHANGE,
                i = r ? "b" : "a";
              n[r ? "a" : "b"]
                ? (e.prevent?.(), e.reject?.())
                : t() && (e.prevent?.(), (n[i] = 1), e.resolve?.());
            },
            r = (n) => {
              t() && (n.msg = e);
            };
          (De.on(o.CHANGE, n),
            De.on(o.PAGE_UNLOAD, r),
            this.on("unload", n),
            this.on("destroy", () => {
              (De.off(o.CHANGE, n), De.off(o.PAGE_UNLOAD, r));
            }));
        }
        static makes;
        static prepare(t) {
          if (t.makes) return t.makes;
          const n = [];
          t.makes = n;
          const r = t.prototype,
            o = {},
            s = [],
            a = {},
            f = r.mixins;
          f && Array.isArray(f) && e.mergeMixins(f, t, n);
          for (const t in r) {
            if (!x(r, t)) continue;
            const n = r[t];
            if ("function" != typeof n) continue;
            const f = t.match(c);
            if (!f) continue;
            const d = f[1],
              u = f[2],
              l = f[3],
              h = f[4],
              p = {};
            if (h) for (const e of h.split(",")) p[e] = !0;
            const g = l.split(",");
            for (const c of g) {
              const f = vt[u];
              let l = 1;
              if (d) {
                if (f) {
                  s.push({
                    handler: n,
                    element: f,
                    eventName: c,
                    modifiers: p,
                  });
                  continue;
                }
                l = 2;
                let e = a[c];
                (e || (e = a[c] = { selectors: [] }),
                  e[u] || ((e[u] = 1), e.selectors.push(u)));
              }
              o[c] = (o[c] || 0) | l;
              const h = u + i + c,
                g = r[h];
              if (g) {
                if ("function" == typeof g) {
                  const i = n,
                    o = g;
                  o.marker &&
                    (i.marker
                      ? (r[h] = e.processMixinsSameEvent(i, o))
                      : x(r, t) && (r[h] = n));
                }
              } else r[h] = n;
            }
          }
          return (
            e.wrapMethod(r, "render", "$renderWrap"),
            (r.$evtObjMap = o),
            (r.$globalEvtList = s),
            (r.$selMap = a),
            n
          );
        }
        static delegateEvents(e, t = !1) {
          const n = e.eventObjectMap,
            r = e.eventSelectorMap,
            i = e.globalEventList;
          for (const e in n)
            x(n, e) && (t ? Qe.unbind(e, !!r[e]) : Qe.bind(e, !!r[e]));
          for (const n of i)
            if (t) n.element.removeEventListener(n.eventName, n.boundHandler);
            else {
              const t = n.handler,
                r = n.element,
                i = n.modifiers;
              ((n.boundHandler = function (n) {
                if (((n.eventTarget = r), i)) {
                  const e = n;
                  if (
                    (i.ctrl && !e.ctrlKey) ||
                    (i.shift && !e.shiftKey) ||
                    (i.alt && !e.altKey) ||
                    (i.meta && !e.metaKey)
                  )
                    return;
                }
                $(t, [n], e, j);
              }),
                n.element.addEventListener(n.eventName, n.boundHandler));
            }
        }
        static destroyAllResources(t, n) {
          const r = t.resources;
          for (const t in r)
            if (x(r, t)) {
              const i = r[t];
              (n || i.destroyOnRender) && e.destroyResource(r, t, !0);
            }
        }
        static runInvokes(e) {
          const t = e.invokeList;
          if (t)
            for (; t.length; ) {
              const n = t.shift();
              n && !n.removed && e.invoke(n.name, n.args);
            }
        }
        static wrapMethod(t, n, r) {
          const i = t[n];
          if ("function" != typeof i) return;
          const o = i,
            s = function (...t) {
              if (this.signature > 0) {
                (this.signature++,
                  this.fire("render"),
                  e.destroyAllResources(this, !1));
                const r = this[n],
                  i = "function" == typeof r ? r : o;
                return $(i === s ? o : i, t, this, j);
              }
            };
          ((t[n] = s), (t[r] = s));
        }
        static processMixinsSameEvent(e, t) {
          let n;
          if (t.handlerList) n = t;
          else {
            const e = function (...t) {
              $(e.handlerList ?? [], t, this, j);
            };
            ((e.handlerList = [t]), (e.marker = 1), (n = e));
          }
          return (
            (n.handlerList = (n.handlerList ?? []).concat(
              e.handlerList ?? [e],
            )),
            n
          );
        }
        static mergeMixins(t, n, r) {
          const i = n.prototype,
            o = {};
          for (const n of t)
            for (const t in n) {
              if (!x(n, t)) continue;
              const i = n[t];
              if ("function" != typeof i) continue;
              const s = i,
                a = o[t];
              "make" !== t
                ? c.test(t)
                  ? a
                    ? (o[t] = e.processMixinsSameEvent(s, a))
                    : ((s.marker = 1), (o[t] = s))
                  : a || (o[t] = s)
                : r.push(s);
            }
          for (const e in o) x(i, e) || (i[e] = o[e]);
        }
        static destroyResource(e, t, n, r) {
          const i = e[t];
          if (!i || i.entity === r) return;
          const o = i.entity;
          if (o && "object" == typeof o) {
            const e = o.destroy;
            "function" == typeof e && n && $(e, [], o, j);
          }
          return (Reflect.deleteProperty(e, t), o);
        }
        static extend(e, t) {
          const n = e ?? {},
            r = n.make,
            i = [];
          "function" == typeof r && i.push(r);
          const o = this,
            s = class extends o {
              constructor(e, t, r, o, s) {
                super(e, t, r, o, []);
                const a = this;
                for (const e in n)
                  x(n, e) && "make" !== e && "render" !== e && (a[e] = n[e]);
                ((this.id = e), (this.owner = t), (this.updater = new wt(e)));
                const c = [r, { node: o, deep: !this.template }],
                  f = i.concat(s || []);
                f.length && $(f, c, this, j);
              }
            },
            a = s.prototype;
          for (const e in n) x(n, e) && "make" !== e && (a[e] = n[e]);
          if (t) {
            const e = s;
            for (const n in t) x(t, n) && (e[n] = t[n]);
          }
          return s;
        }
        static merge(...t) {
          const n = this.makes || [];
          return (e.mergeMixins(t, this, n), this);
        }
      };
      function _t(e, t) {
        return bt.extend(e, t);
      }
      var kt = {};
      function Ct(e, t) {
        const n = H(e).path;
        n && (kt[n] = t);
      }
      function Et(e) {
        const t = H(e).path;
        t && Reflect.deleteProperty(kt, t);
      }
      var At,
        St,
        Mt = new Map(),
        Rt = [],
        Ot = new ie(),
        It = class e extends ie {
          id;
          _parentId = void 0;
          get parentId() {
            return this._parentId;
          }
          childrenMap = {};
          childrenCount = 0;
          readyCount = 0;
          readyMap = new Set();
          viewInstance;
          get view() {
            return this.viewInstance;
          }
          invokeList = [];
          signature = 1;
          hasAltered = 0;
          destroyed = 0;
          viewPath;
          originalTemplate;
          holdFireCreated = 0;
          childrenCreated = 0;
          childrenAlter = 0;
          constructor(t, n) {
            (super(),
              (this.id = t),
              n && (this._parentId = n),
              Mt.set(t, this));
            const r = document.getElementById(t);
            (r && ((r.frame = this), (r.frameBound = 1)),
              e.fire("add", { frame: this }));
          }
          mountView(e, t) {
            const n = document.getElementById(this.id),
              r = this.parentId;
            (!this.hasAltered &&
              n &&
              ((this.hasAltered = 1), (this.originalTemplate = n.innerHTML)),
              this.unmountView(),
              (this.destroyed = 0));
            const o = H(e || ""),
              s = o.path;
            if (!n || !s) return;
            this.viewPath = e;
            const a = o.params;
            !(function (e, t, n) {
              const r = Mt.get(e),
                o = r?.view;
              if (!o) return;
              const s = o.updater.refData;
              if (s && t.indexOf(i) > 0) {
                F(s, n);
                const e = n[i];
                e &&
                  "object" == typeof e &&
                  (V(n, e), Reflect.deleteProperty(n, i));
              }
            })(r || this.id, e, a);
            const c = { ...a };
            t && V(c, t);
            const f = this.signature,
              d = kt[s];
            d
              ? this.doMountView(d, c, n, f)
              : Ze(s, (e) => {
                  if (f === this.signature)
                    if ("function" == typeof e) {
                      const t = e;
                      (Ct(s, t), this.doMountView(t, c, n, f));
                    } else {
                      const e = new Error(`Cannot load view: ${s}`),
                        t = We.error;
                      t && t(e);
                    }
                });
          }
          doMountView(e, t, n, r) {
            if (r !== this.signature) return;
            const i = bt.prepare(e),
              o = new e(this.id, this, t, n, i);
            ((this.viewInstance = o), (o.signature = 1), bt.delegateEvents(o));
            const s = $(o.init, [t, { node: n, deep: !o.template }], o, j),
              a = ++this.signature;
            Promise.resolve(s).then(() => {
              a === this.signature &&
                (o.template
                  ? o.render()
                  : ((this.hasAltered = 0),
                    o.endUpdatePendingFlag || o.endUpdate()));
            });
          }
          unmountView() {
            const e = this.view;
            if (((this.invokeList = []), !e)) return;
            (St || (St = { id: this.id }),
              (this.destroyed = 1),
              this.unmountZone(),
              Tt(this, St),
              e.signature > 0 && e.fire("destroy", void 0, !0, !0),
              Qe.clearRangeEvents(this.id),
              delete this.viewInstance);
            const t = document.getElementById(this.id);
            (t &&
              this.originalTemplate &&
              (t.innerHTML = this.originalTemplate),
              (St = void 0),
              J(e));
          }
          mountFrame(t, n, r) {
            Tt(this, { id: t });
            let i = Mt.get(t);
            var o, s, a;
            return (
              i ||
                (this.childrenMap[t] || this.childrenCount++,
                (this.childrenMap[t] = t),
                (i = Rt.pop()),
                i
                  ? ((o = i),
                    (s = t),
                    (a = this.id),
                    Reflect.set(o, "id", s),
                    (o._parentId = a),
                    (o.childrenMap = {}),
                    (o.childrenCount = 0),
                    (o.readyCount = 0),
                    (o.signature = 1),
                    (o.readyMap = new Set()),
                    (o.invokeList = []),
                    Mt.set(s, o))
                  : (i = new e(t, this.id))),
              i.mountView(n, r),
              i
            );
          }
          unmountFrame(e) {
            const t = e ? this.childrenMap[e] : this.id,
              n = Mt.get(t);
            if (!n) return;
            const r = n.readyCount > 0,
              i = n.parentId;
            (n.unmountView(),
              (function (e, t) {
                const n = Mt.get(e);
                if (!n) return;
                (Mt.delete(e), It.fire("remove", { frame: n, fcc: t }));
                const r = document.getElementById(e);
                r && ((r.frameBound = 0), Reflect.deleteProperty(r, "frame"));
              })(t, r),
              (function (e) {
                (Reflect.set(e, "id", ""),
                  (e._parentId = void 0),
                  (e.childrenMap = {}),
                  (e.readyMap = new Set()));
              })(n),
              Rt.length < 64 && Rt.push(n));
            const o = Mt.get(i || "");
            o &&
              o.childrenMap[t] &&
              (Reflect.deleteProperty(o.childrenMap, t),
              o.childrenCount--,
              Kt(o));
          }
          mountZone(e) {
            const t = e || this.id;
            this.holdFireCreated = 1;
            const n = document.getElementById(t);
            if (!n) return;
            const r = n.querySelectorAll(`[${s}]`),
              i = [];
            r.forEach((e) => {
              if (!(e instanceof HTMLElement)) return;
              if (e.frameBound) return;
              const t = (function (e) {
                const t = e.getAttribute("id");
                if (t) return t;
                e.autoId = 1;
                const n = D("frame_");
                return ((e.id = n), n);
              })(e);
              e.frameBound = 1;
              const n =
                ((r = e),
                (o = s),
                Element.prototype.getAttribute.call(r, o) ?? "");
              var r, o;
              i.push([t, n]);
            });
            for (const [e, t] of i) this.mountFrame(e, t);
            ((this.holdFireCreated = 0), Kt(this));
          }
          unmountZone(e) {
            for (const t in this.childrenMap)
              x(this.childrenMap, t) &&
                ((e && t === e) || this.unmountFrame(t));
            Kt(this);
          }
          children() {
            const e = [];
            for (const t in this.childrenMap)
              x(this.childrenMap, t) && e.push(t);
            return e;
          }
          parent(e = 1) {
            let t,
              n = this.parentId,
              r = e >>> 0 || 1;
            for (; n && r--; ) ((t = Mt.get(n)), (n = t?.parentId));
            return t;
          }
          invoke(e, t) {
            let n;
            const r = this.view;
            if (r && r.rendered) {
              const i = r[e];
              "function" == typeof i && (n = $(i, t || [], r, j));
            } else {
              const n = i + e;
              let r;
              for (const e of this.invokeList)
                if (e.key === n) {
                  r = e;
                  break;
                }
              r && (r.removed = t === r.args);
              const o = { name: e, args: t || [], key: n };
              this.invokeList.push(o);
            }
            return n;
          }
          invokeTyped(e, t) {
            return this.invoke(e, t);
          }
          static get(e) {
            return Mt.get(e);
          }
          static getAll() {
            return Mt;
          }
          static getRoot() {
            return At;
          }
          static createRoot(t) {
            if (!At) {
              t = t || "root";
              let n = document.getElementById(t);
              (n || ((n = document.body), (n.id = t)), (At = new e(t)));
            }
            return At;
          }
          static on(t, n) {
            return (Ot.on(t, n), e);
          }
          static off(t, n) {
            return (Ot.off(t, n), e);
          }
          static fire(e, t) {
            Ot.fire(e, t);
          }
        };
      function Kt(e) {
        if (
          !e.childrenCreated &&
          !e.holdFireCreated &&
          e.childrenCount === e.readyCount
        ) {
          e.childrenCreated ||
            ((e.childrenCreated = 1), (e.childrenAlter = 0), e.fire("created"));
          const t = e.parentId;
          if (t) {
            const n = Mt.get(t);
            n &&
              !n.readyMap.has(e.id) &&
              (n.readyMap.add(e.id), n.readyCount++, Kt(n));
          }
        }
      }
      function Tt(e, t) {
        if (!e.childrenAlter && e.childrenCreated) {
          ((e.childrenCreated = 0), (e.childrenAlter = 1), e.fire("alter", t));
          const n = e.parentId;
          if (n) {
            const r = Mt.get(n);
            r &&
              r.readyMap.has(e.id) &&
              (r.readyCount--, r.readyMap.delete(e.id), Tt(r, t));
          }
        }
      }
      var Pt = {},
        Lt = null;
      function Dt() {
        Lt = null;
      }
      var jt = bt.extend({
          template: (e, t) => {
            let n = "<div>Loading...</div>";
            if (e && "object" == typeof e) {
              const t = e.skeleton;
              "string" == typeof t && (n = t);
            }
            return `<div id="mf_${t}">${n}</div>`;
          },
          init(e) {
            ((this.$sign = 0),
              this.on("destroy", () => {
                this.$sign = -1;
              }),
              this.assign?.(e));
          },
          assign(e) {
            this.$view = "string" == typeof e.view ? e.view : "";
            const t = e.params,
              n = t && "object" == typeof t ? t : {};
            return (
              (this.$params = { ...e, ...n }),
              this.updater.set({
                skeleton: e.skeleton,
                skeletonParams: e.skeletonParams || {},
                bizCode: e.bizCode,
              }),
              this.$sign > 0 && this.updateView(),
              !1
            );
          },
          async updateView() {
            const e = ++this.$sign,
              t = this.updater.get().bizCode;
            try {
              await (function (e, t) {
                const n = We.crossConfigs || window.crossConfigs,
                  r = We.projectName || "",
                  i = e.indexOf("/"),
                  o = i > -1 ? e.substring(0, i) : e;
                if (o === r) return Promise.resolve();
                if (!Pt[o]) {
                  if (!Lt) {
                    const e = G(n || [], "projectName");
                    Lt = e;
                  }
                  if (!Lt[o])
                    return Promise.reject(
                      new Error(`Cannot find ${o} from crossConfigs`),
                    );
                  Pt[o] = Ze(`${o}/prepare`)
                    .then((e) => {
                      let n = e[0];
                      if (n && "object" == typeof n && null !== n) {
                        const e = n;
                        e.__esModule && (n = e.default);
                      }
                      if ("function" == typeof n) return n({ bizCode: t });
                    })
                    .catch((e) => {
                      throw (Reflect.deleteProperty(Pt, o), e);
                    });
                }
                return Pt[o];
              })(this.$view, t);
            } catch (e) {
              const t = document.getElementById("mf_" + this.id);
              if (t) {
                const n = e instanceof Error ? e : new Error(String(e));
                t.innerHTML = n.message || String(n);
              }
            }
            if (this.$sign !== e) return;
            const n = It.get("mf_" + this.id),
              r = H(this.$view).path,
              i = n?.viewPath ? H(n.viewPath).path : "",
              o = n?.view;
            if (r === i && o && "function" == typeof o.assign)
              return void ($(o.assign, [this.$params], o, j) && o.render());
            const s = this.owner;
            s &&
              "number" != typeof s &&
              s.mountFrame("mf_" + this.id, this.$view, this.$params);
          },
          render() {
            const e = this.$params;
            (this.updater.digest({ skeleton: e?.skeleton }), this.updateView());
          },
          callView(e, ...t) {
            const n = It.get("mf_" + this.id);
            return n?.invoke(e, t);
          },
        }),
        xt = class {
          data;
          cacheInfo;
          constructor(e = {}) {
            this.data = e;
          }
          get(e) {
            return this.data[e];
          }
          set(e, t) {
            return (
              "string" == typeof e ? (this.data[e] = t) : V(this.data, e),
              this
            );
          }
        },
        Vt = class {
          id = "";
          busy = 0;
          destroyed = 0;
          taskQueue = [];
          prevArgs = [];
          _emitter = new ie();
          constructor() {
            this.id = D("service");
          }
          get emitter() {
            return this._emitter;
          }
          get internals() {
            const e = this.constructor;
            return {
              metaList: e._metaList,
              payloadCache: e._payloadCache,
              pendingCacheKeys: e._pendingCacheKeys,
              syncFn: e._syncFn,
              staticEmitter: e._staticEmitter,
            };
          }
          get type() {
            return this.constructor;
          }
          all(e, t) {
            return (Ft(this, e, t, 1, !1), this);
          }
          one(e, t) {
            return (Ft(this, e, t, 2, !1), this);
          }
          save(e, t) {
            return (Ft(this, e, t, 1, !0), this);
          }
          enqueue(e) {
            return (
              this.destroyed ||
                (this.taskQueue.push(e), this.dequeue(...this.prevArgs)),
              this
            );
          }
          dequeue(...e) {
            this.busy ||
              this.destroyed ||
              ((this.busy = 1),
              setTimeout(() => {
                if (((this.busy = 0), !this.destroyed)) {
                  const t = this.taskQueue.shift();
                  t && ((this.prevArgs = e), $(t, e, this, j));
                }
              }, 0));
          }
          destroy() {
            ((this.destroyed = 1), (this.taskQueue = []));
          }
          on(e, t) {
            return (this._emitter.on(e, t), this);
          }
          off(e, t) {
            return (this._emitter.off(e, t), this);
          }
          fire(e, t) {
            return (this._emitter.fire(e, t), this);
          }
          static _metaList = {};
          static _payloadCache = new re({ maxSize: 20, bufferSize: 5 });
          static _pendingCacheKeys = {};
          static _syncFn = j;
          static _staticEmitter = new ie();
          static _cacheMax = 20;
          static _cacheBuffer = 5;
          static add(e) {
            Array.isArray(e) || (e = [e]);
            for (const t of e)
              if (t) {
                const e = t.name,
                  n = t.cache;
                ((t.cache = n ? 0 | n : 0), (this._metaList[e] = t));
              }
          }
          static meta(e) {
            const t = "string" == typeof e ? e : String(e.name ?? "");
            return this._metaList[t] || e;
          }
          static create(e) {
            const t = this.meta(e),
              n = Ut(e.cache) || t.cache || 0,
              r = new xt();
            (r.set(t),
              (r.cacheInfo = {
                name: t.name,
                after: "function" == typeof t.after ? t.after : void 0,
                cleans: "string" == typeof t.cleanKeys ? t.cleanKeys : void 0,
                key: n ? Nt(t, e) : "",
                time: 0,
              }),
              null !== e && r.set(e));
            const i = t.before;
            return (
              "function" == typeof i && $(i, [r], r, j),
              this._staticEmitter.fire("begin", { payload: r }),
              r
            );
          }
          static get(e, t) {
            let n,
              r = !1;
            return (
              t || (n = this.cached(e)),
              n || ((n = this.create(e)), (r = !0)),
              { entity: n, needsUpdate: r }
            );
          }
          static cached(e) {
            const t = this.meta(e),
              n = Ut(e.cache) || t.cache || 0;
            let r = "";
            if ((n && (r = Nt(t, e)), r)) {
              const e = this._pendingCacheKeys[r];
              if (e) {
                const t = e.entity;
                return t instanceof xt ? t : void 0;
              }
              const t = this._payloadCache.get(r);
              if (t && t.cacheInfo)
                return q() - t.cacheInfo.time > n
                  ? void this._payloadCache.del(r)
                  : t;
            }
          }
          static clear(e) {
            const t = new Set(
                ("string" == typeof e ? e : e.join(",")).split(","),
              ),
              n = [];
            this._payloadCache.forEach((e) => {
              const r = e?.cacheInfo;
              r && r.key && t.has(r.name) && n.push(r.key);
            });
            for (const e of n) this._payloadCache.del(e);
          }
          static on(e, t) {
            this._staticEmitter.on(e, t);
          }
          static off(e, t) {
            this._staticEmitter.off(e, t);
          }
          static fire(e, t) {
            this._staticEmitter.fire(e, t);
          }
          static extend(e, t, n) {
            const r = this;
            class i extends r {
              static _metaList = {};
              static _payloadCache = new re({
                maxSize: t || r._cacheMax,
                bufferSize: n || r._cacheBuffer,
              });
              static _pendingCacheKeys = {};
              static _syncFn = e;
              static _staticEmitter = new ie();
              static _cacheMax = t || r._cacheMax;
              static _cacheBuffer = n || r._cacheBuffer;
            }
            return i;
          }
        },
        $t = new WeakMap();
      function Nt(e, t) {
        return (
          JSON.stringify(t) +
          i +
          (function (e) {
            let t = $t.get(e);
            return (void 0 === t && ((t = JSON.stringify(e)), $t.set(e, t)), t);
          })(e)
        );
      }
      function Ut(e) {
        if ("number" == typeof e) return 0 | e;
        if ("string" == typeof e) {
          const t = Number(e);
          return Number.isFinite(t) ? 0 | t : 0;
        }
        return 0;
      }
      function Ft(e, t, n, r, i) {
        if (e.destroyed) return;
        if (e.busy) {
          const o = () => Ft(e, t, n, r, i);
          return void e.enqueue(o);
        }
        let o;
        ((e.busy = 1),
          (o =
            "string" == typeof t ? [{ name: t }] : Array.isArray(t) ? t : [t]));
        const s = e.internals,
          { syncFn: a, pendingCacheKeys: c, staticEmitter: f } = s;
        let d = 0;
        const u = o.length,
          l = new Array(u + 1),
          h = [],
          p = (t, i) => {
            const o = l[t + 1];
            let s = !1;
            if (
              (i
                ? ((h[t] = i), f.fire("fail", { payload: o, error: i }))
                : ((s = !0), f.fire("done", { payload: o })),
              !e.destroyed)
            ) {
              const s = d === u;
              (s && ((e.busy = 0), 1 === r && ((l[0] = h), $(n, l, e, j))),
                2 === r && $(n, [i || null, o, s, t], e, j));
            }
            s && f.fire("end", { payload: o, error: i });
          };
        for (const t of o) {
          if (!t) continue;
          const n = "string" == typeof t ? { name: t } : t,
            r = e.type.get(n, i),
            o = r.entity,
            f = o.cacheInfo?.key || "";
          l[d + 1] = o;
          const u = p.bind(null, d++);
          if (f && c[f]) c[f].push(u);
          else if (r.needsUpdate)
            if (f) {
              const e = [u];
              ((e.entity = o),
                (c[f] = e),
                a(o, () => {
                  const e = c[f],
                    t = e.entity;
                  (t instanceof xt &&
                    t.cacheInfo &&
                    ((t.cacheInfo.time = q()), s.payloadCache.set(f, t)),
                    Reflect.deleteProperty(c, f));
                  for (const t of e) "function" == typeof t && t();
                }));
            } else a(o, u);
          else u();
        }
      }
      function Bt(e) {
        const t = e.eventObjectMap,
          n = t ? Object.keys(t) : [],
          r = e.resources ? Object.keys(e.resources) : [],
          i = "function" == typeof e.assign;
        let o = null;
        try {
          const t = e.updater?.refData;
          if (t && "object" == typeof t) {
            o = {};
            for (const e of Object.keys(t)) {
              const n = t[e];
              o[e] = null === n || "object" != typeof n ? n : `[${typeof n}]`;
            }
          }
        } catch {}
        return {
          id: e.id,
          rendered: !!e.rendered,
          signature: e.signature,
          observedStateKeys: e.observedStateKeys ?? null,
          locationObserved: {
            flag: e.locationObserved.flag,
            keys: e.locationObserved.keys,
            observePath: e.locationObserved.observePath,
          },
          hasTemplate: !!e.template,
          eventMethodKeys: n,
          resourceKeys: r,
          hasAssign: i,
          updaterData: o,
        };
      }
      function Ht(e) {
        const t = It.get(e);
        if (!t) return null;
        const n = t.view,
          r = [];
        for (const e of t.children()) {
          const t = Ht(e);
          t && r.push(t);
        }
        return {
          id: t.id,
          parentId: t.parentId ?? null,
          viewPath: t.viewPath ?? null,
          childrenCount: t.childrenCount,
          readyCount: t.readyCount,
          childrenCreated: t.childrenCreated,
          childrenAlter: t.childrenAlter,
          destroyed: t.destroyed,
          view: n ? Bt(n) : null,
          children: r,
        };
      }
      function zt() {
        const e = It.getRoot();
        if (!e)
          return {
            root: null,
            totalFrames: 0,
            timestamp: Date.now(),
            rootId: "",
          };
        const t = Ht(e.id);
        let n = 0;
        const r = (e) => {
          if (e) {
            n++;
            for (const t of e.children) r(t);
          }
        };
        return (
          r(t),
          { root: t, totalFrames: n, timestamp: Date.now(), rootId: e.id }
        );
      }
      var Gt = !1,
        qt = "";
      function Qt() {
        if (window === window.parent) return;
        const e = zt(),
          t = JSON.stringify(e);
        t !== qt &&
          ((qt = t),
          window.parent.postMessage(
            { type: "LARK_DEVTOOL_TREE_DELTA", data: e },
            "*",
          ));
      }
      var Wt = !1,
        Zt = [],
        Xt = 0,
        Jt = !1;
      function Yt(e) {
        const t = !!e,
          n = q();
        for (;;) {
          const r = Zt[Xt];
          if (!r) return ((Zt.length = 0), (Xt = 0), void (Jt = !1));
          if (t && e) {
            if (e.timeRemaining() <= 0) return void en();
          } else if (q() - n > y && Zt.length > Xt + 3) return void en();
          const i = Zt[Xt + 1];
          ($(r, Zt[Xt + 2], i, j), (Xt += 3));
        }
      }
      function en() {
        const e = window.scheduler;
        e && "function" == typeof e.postTask
          ? e.postTask(() => Yt(), { priority: "background" })
          : "function" == typeof window.requestIdleCallback
            ? window.requestIdleCallback(Yt)
            : setTimeout(Yt, 0);
      }
      var tn = 0;
      function nn(e) {
        return (
          !!e &&
          ("object" == typeof e || "function" == typeof e) &&
          "function" == typeof e.then
        );
      }
      function rn(e) {
        const t = e.locationObserved;
        let n = !1;
        if (t.flag) {
          if (t.observePath) {
            const e = De.diff();
            n = !!e?.path;
          }
          if (!n && t.keys.length) {
            const e = De.diff(),
              r = e?.params;
            if (r) for (const e of t.keys) if (((n = x(r, e)), n)) break;
          }
        }
        return n;
      }
      function on(e, t) {
        const n = e.observedStateKeys;
        if (!n) return !1;
        for (const e of n) if (t.has(e)) return !0;
        return !1;
      }
      function sn(e) {
        const t = It.getRoot();
        if (!t) return;
        const n = e.view;
        if (n) {
          const e = String("object" == typeof n && null !== n ? n.to || "" : n);
          t.mountView(e);
        } else
          (tn++,
            (function (e, t) {
              const n = (e) => {
                for (; e.length > 0; ) {
                  const r = e.pop(),
                    i = r,
                    o = r.view;
                  if (!o || i.dispatcherUpdateTag === tn || o.signature <= 1)
                    continue;
                  let s;
                  if (((i.dispatcherUpdateTag = tn), t ? on(o, t) : rn(o))) {
                    const e = $(o.renderMethod ?? o.render, [], o, j);
                    nn(e) && (s = e);
                  }
                  const a = r.children();
                  if (s)
                    s.then(() => {
                      const e = [];
                      for (let t = a.length - 1; t >= 0; t--) {
                        const n = It.get(a[t]);
                        n && e.push(n);
                      }
                      n(e);
                    });
                  else
                    for (let t = a.length - 1; t >= 0; t--) {
                      const n = It.get(a[t]);
                      n && e.push(n);
                    }
                }
              };
              n([e]);
            })(t, e.keys));
      }
      var an = {
        getConfig: function (e) {
          return void 0 === e ? We : We[e];
        },
        setConfig: (e) => (e && "object" == typeof e && V(We, e), We),
        config: (e) =>
          e ? ("string" == typeof e ? We[e] : (V(We, e), We)) : We,
        boot(e) {
          (e && "object" == typeof e && V(We, e),
            De._setConfig(We),
            Qe.setFrameGetter((e) => It.get(e)),
            De.on(o.CHANGED, (e) => {
              e && sn(e);
            }),
            Ee.on(o.CHANGED, (e) => {
              e && sn(e);
            }),
            (Wt = !0),
            he(),
            je(),
            Gt ||
              ("undefined" != typeof window &&
                ((Gt = !0),
                window.addEventListener("message", (e) => {
                  const t = e.data;
                  if (!t || "object" != typeof t) return;
                  const n = t.type;
                  if ("LARK_DEVTOOL_PING" === n) {
                    const t = e.source;
                    return void (
                      t &&
                      t.postMessage(
                        { type: "LARK_DEVTOOL_PONG" },
                        { targetOrigin: "*" },
                      )
                    );
                  }
                  if ("LARK_DEVTOOL_REQUEST_TREE" === n) {
                    const t = zt(),
                      n = e.source;
                    n &&
                      n.postMessage(
                        { type: "LARK_DEVTOOL_TREE", data: t },
                        { targetOrigin: "*" },
                      );
                  }
                }),
                It.on("add", () => {
                  Qt();
                }),
                It.on("remove", () => {
                  Qt();
                }))));
          const t = It.createRoot(We.rootId);
          De._bind();
          const n = We.defaultView || "";
          n && !t.view && t.mountView(n);
        },
        isBooted: () => Wt,
        mark: X,
        unmark: J,
        dispatch: function (e, t, n) {
          const r = new CustomEvent(t, { bubbles: !0, cancelable: !0, ...n });
          e.dispatchEvent(r);
        },
        task: function (e, t, n) {
          (Zt.push(e, n, t || []), Jt || ((Jt = !0), en()));
        },
        delay: (e) => new Promise((t) => setTimeout(t, e)),
        use: Ze,
        waitZoneViewsRendered: function (e, t) {
          null == t && (t = 3e4);
          const n = It.get(e),
            r = q() + t;
          return new Promise((e) => {
            const t = () => {
              q() > r || !n
                ? e(0)
                : n.childrenCount === n.readyCount
                  ? e(1)
                  : setTimeout(t, 9);
            };
            setTimeout(t, 9);
          });
        },
        WAIT_OK: 1,
        WAIT_TIMEOUT_OR_NOT_FOUND: 0,
        toMap: G,
        toTry: $,
        toUrl: z,
        parseUrl: H,
        mix: V,
        has: x,
        keys: function (e) {
          const t = [];
          for (const n in e) x(e, n) && t.push(n);
          return t;
        },
        inside: function (e, t) {
          const n = "string" == typeof e ? document.getElementById(e) : e,
            r = "string" == typeof t ? document.getElementById(t) : t;
          if (!n || !r) return !1;
          if (n === r) return !0;
          try {
            return !(16 & ~r.compareDocumentPosition(n));
          } catch {
            return !1;
          }
        },
        node: B,
        applyStyle: W,
        guid: D,
        guard: te,
        Cache: re,
        nodeId: (e) => (e.id || (e.id = D("l_")), e.id),
        Base: ie,
        Router: De,
        State: Ee,
        View: bt,
        Frame: It,
      };
      function cn(e, t) {
        const n = t ? Object.keys(t) : [];
        n.length > 0 && e.observeLocation(n);
        const r = () => {
          const e = De.parse(),
            r = { ...(t || {}) };
          for (const t of n) {
            const n = e.get(t);
            n && (r[t] = n);
          }
          return r;
        };
        return [
          r(),
          (e) => {
            const t = r(),
              n = "function" == typeof e ? e(t) : e;
            De.to(n);
          },
        ];
      }
      "undefined" != typeof window &&
        ((window.__lark_Framework = an),
        (window.__lark_State = Ee),
        (window.__lark_Router = De),
        (window.__lark_Frame = It),
        (window.__lark_View = bt),
        (window.__lark_invalidateViewClass = Et),
        (window.__lark_getViewClassRegistry = function () {
          return kt;
        }),
        (window.__lark_registerViewClass = Ct));
      var fn = Symbol("lark-store-computed");
      function dn(e) {
        return null !== e && "object" == typeof e && !0 === e[fn];
      }
      function un(e, t) {
        return { [fn]: !0, deps: e, fn: t };
      }
      var ln = new Map();
      function hn(e, t) {
        const n = new Set(),
          r = new Map(),
          i = new Set(),
          o = new Set();
        let s,
          a = !1;
        const c = () => s,
          f = (e) => {
            if (a) return;
            const t = s,
              r = "function" == typeof e ? e(t) : e,
              c = { ...t };
            let f = !1;
            for (const e in r)
              if (
                Object.prototype.hasOwnProperty.call(r, e) &&
                !i.has(e) &&
                !o.has(e)
              ) {
                const n = r[e];
                Object.is(t[e], n) || ((c[e] = n), (f = !0));
              }
            if (f) {
              ((s = c), d(t));
              for (const e of n) e(s, t);
            }
          },
          d = (e) => {
            if (0 === r.size) return;
            const t = new Set();
            for (const n of Object.keys(s)) Object.is(s[n], e[n]) || t.add(n);
            for (const [e, n] of r)
              if (n.deps.some((e) => t.has(e))) {
                const t = n.fn();
                Object.is(s[e], t) || (s[e] = t);
              }
          },
          u = {
            getState: c,
            setState: f,
            subscribe: (e) => (
              n.add(e),
              () => {
                n.delete(e);
              }
            ),
            destroy: () => {
              ((a = !0), n.clear(), ln.delete(e));
            },
          },
          l = t(f, c),
          h = {},
          p = {};
        for (const e of Object.keys(l)) {
          const t = l[e];
          dn(t)
            ? (r.set(e, t), i.add(e), (h[e] = void 0))
            : "function" == typeof t
              ? ((p[e] = t), o.add(e))
              : (h[e] = t);
        }
        s = { ...h, ...p };
        for (const [e, t] of r) s[e] = t.fn();
        return (ln.set(e, u), u);
      }
      function pn(e, t, n) {
        if (
          !(function (e) {
            if (!e || "object" != typeof e) return !1;
            const t = e.updater;
            return (
              null !== t &&
              "object" == typeof t &&
              "function" == typeof t.set &&
              "function" == typeof t.digest
            );
          })(e)
        )
          return () => {};
        const r = (e) => {
          if (n) return n(e);
          const t = {};
          for (const n in e)
            Object.prototype.hasOwnProperty.call(e, n) &&
              "function" != typeof e[n] &&
              (t[n] = e[n]);
          return t;
        };
        (e.updater.set(r(t.getState())), e.updater.digest());
        const i = t.subscribe((t) => {
          (e.updater.set(r(t)), e.updater.digest());
        });
        return (e.on("destroy", i), i);
      }
    },
  },
]);
//# sourceMappingURL=63.95afb770.js.map
