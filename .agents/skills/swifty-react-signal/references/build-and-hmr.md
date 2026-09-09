# Build Integration, Config, HMR

Source of truth: `src/vite.ts`, `src/webpack.ts`, `src/hmr-inject.ts`,
`src/hmr.ts`, `src/component-registry.ts`.

## TypeScript setup (required)

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@swifty.js/react-signal",
  },
}
```

Add `"@swifty.js/react-signal/client"` to `types` (or a triple-slash reference) so
`*.css` module imports and the HMR globals type-check.

## Bundler plugins

There is no template compilation — JSX goes through the standard automatic
runtime. The plugins do two things: JSX transform defaults (Vite only) and
auto-injected component HMR.

### Vite (8+)

```ts
// vite.config.ts
import { swiftyReactSignalPlugin } from "@swifty.js/react-signal/vite";
export default defineConfig({
  plugins: [swiftyReactSignalPlugin()],
});
```

- Defaults `oxc.jsx = { runtime: "automatic", importSource: "@swifty.js/react-signal" }`
  (user-provided oxc settings win; `oxc: false` / `jsx: "preserve"` respected).
- Injects component HMR into every `.tsx`/`.jsx` module with a line-leading
  `export default` (runtime guards make non-component exports a no-op).

> `file:`-linked swifty-react-signal? Vite's dep pre-bundle cache is keyed by the
> lockfile, not dep contents — after rebuilding swifty-react-signal run `vite --force`
> (or delete `node_modules/.vite`).

### Webpack — plugin form (recommended, zero config)

```ts
import { SwiftyReactSignalPlugin } from "@swifty.js/react-signal/webpack";
export default {
  plugins: [new SwiftyReactSignalPlugin()],
};
// Options: { test? (default /\.[jt]sx$/), exclude? (default /node_modules/) }
```

The plugin registers one `enforce: "pre"` rule that injects component HMR
before SWC/ts-loader/babel. The JSX transform itself comes from your
existing TS/SWC/Babel loader reading the tsconfig above. Manual loader form:
`{ test: /\.[jt]sx$/, exclude: /node_modules/, enforce: "pre", loader: "@swifty.js/react-signal/webpack" }`.

Both plugins skip HMR injection in production builds (Vite: `command ===
"build"`; Webpack: `mode === "production"` — plugin skips the rule, loader
passes sources through).

## App boot (no Framework object)

There is NO Framework/boot/config object. A routed app is a router instance
plus the outlet component:

```tsx
const router = createRouter(routes, { basename: "/app" }); // options optional
render(<RouterView router={router} />, document.getElementById("root")!);
```

```ts
interface RouteObject {
  path: string; // "/users/:id", "/files/*", "*"
  component?: Component; // eager reference
  lazy?: () => Promise<Component | { default: Component }>;
}
```

Removed config surface: `Framework.boot`/`getConfig`/`setConfig`/`isBooted`,
`FrameworkConfig`, `rootId`/`container` resolution (pass the element to
`render` yourself — nothing mutates `document.body`), `routeMode`/`hashbang`
(history only), `defaultView`/`defaultPath`/`unmatchedView`/`rewrite` (use
`"/"` and `"*"` routes), `require` (→ per-route `lazy`), `error` (errors
BUBBLE — no global sink).

Route dispatch: `<RouterView/>`'s body reads `router.match.value` (tracked)
and returns the matched component with **no props** — components read URL
data via `useRouter().params.value` etc. Same component → same instance
(hook state survives param-only changes); lazy loads are deduped in flight
and cached on the route, and a stale load can never overwrite a newer route
(the body re-reads the CURRENT match).

## Lazy loading & Module Federation

Per-route `lazy()` replaces the string-route registry and `config.require`:

```tsx
const router = createRouter([
  { path: "/", component: Home },
  // Code splitting: plain dynamic import
  { path: "/admin", lazy: () => import("./views/admin") },
  // Module Federation: import from the remote container
  { path: "/remote/*", lazy: () => import("remote_app/views/detail") },
]);
render(<RouterView router={router} />, container);
```

`lazy()` resolves a component (or `{ default }` module); loads are deduped
in flight and the result is cached on the route object, so later matches
render synchronously. Share `@swifty.js/react-signal` as a singleton in the MF
`shared` config — router state is per instance (factory), and the "active
router" pointer used by `useRouter` lives in the shared singleton. There is
no `registerComponent` — routes hold component references, and JSX tags are
always direct imports.

## HMR (auto-injected — never hand-write it)

On module update, the module's default export self-accepts →
`globalThis.__swifty_hmr__.hotSwapByComponent(old, new)`. The injected
rewrite aliases the default export as `__swifty_component__`: named
function/class declarations KEEP their declaration (module-scope references
like `component: App` stay valid; the alias + export are appended at EOF);
any other default expression is const-wrapped in place. Then:

1. `aliasComponent(old, new)` — parents (or route tables) holding the stale
   import keep matching live instances (the reconciler compares CANONICAL
   identities through the alias chain in `src/component-registry.ts`).
2. Every live instance of the old function swaps in place
   (`swapInstanceFn`): **`useSignal`/`useRef` slots survive**; closure-bound
   slots (useEffect/useSignalEffect/useComputed) are disposed and
   recreated by the next render — old effects clean up, new effects run
   against the swapped DOM. The instance re-renders via its invalidate
   signal.

Because the gate is broad (any `.tsx`/`.jsx` default export), the runtime
guards carry the filtering: the snippet checks `typeof === "function"`, and
`hotSwapByComponent` no-ops for values with no live instances — a `.tsx`
file default-exporting a config object self-accepts harmlessly.

Bundler differences (`src/hmr-inject.ts` — important when debugging HMR):

- Vite: `import.meta.hot.accept(cb)` — cb gets the new module.
- Webpack: `import.meta.webpackHot.accept(cb)`'s cb is an **error**
  handler, so the snippet uses self-accept + a top-level
  `import.meta.webpackHot.data.oldComponent` check on re-execution.
- Swap functions are reached via `globalThis.__swifty_hmr__` — registered
  ONCE at the package entry (`src/index.ts` top level) — instead of
  importing `@swifty.js/react-signal`: importing inside an HMR callback would register
  the module as an MF shared consumer and cause ChunkLoadError.

## Project scaffolding conventions

```
src/
  main.tsx                    createRouter(routes) + render(<RouterView/>, el)
                              — or render(<App/>, el) for router-less apps
  views/{name}.tsx            route components (default export = function)
  views/{name}.module.css     CSS module imported by the component
  components/{name}.tsx       child components (imported as JSX tags)
  store/{name}.ts             createStore definitions
index.html                    <div id="root"></div> + module script for main.ts
```

Routes hold imported component references (or `lazy()` loaders) — there are
no path-string components anywhere.
