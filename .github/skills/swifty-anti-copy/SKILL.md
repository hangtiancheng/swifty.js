---
name: swifty-anti-copy
description: Authoritative reference for @swifty.js/anti-copy (packages/anti-copy, MIT), a framework-agnostic browser copy/print/DevTools protection SDK plus per-framework docs-site integrations, shipped as an ESM+CJS dual build with four subpath entries — `.` (core), `./vitepress`, `./swifty-docs`, `./lark-docs`. Use this skill whenever the user reads, writes, debugs, reviews, or extends code under `packages/anti-copy/src/**`, imports from `@swifty.js/anti-copy` or any subpath, or works with copy-protection concepts. Trigger eagerly on these symbols and tokens — `createAntiCopy`, `AntiCopyInstance`, `AntiCopyOptions`, `AntiCopyMode`, `DevtoolsOptions`, `ViolationEvent`, `ViolationType`, `DEFAULT_REPLACE_TEXT`, `isBrowser`, `applyAntiCopy` (VitePress + lark-docs), the renderless `AntiCopy` React component (swifty-docs), `AntiCopyHandle`, `SwiftyDocsAntiCopyProps`, `LarkDocsAntiCopyOptions`, `isPathExcluded`, `excludePaths`, `excludeSelectors`, `VITEPRESS_DEFAULT_EXCLUDES`, `SWIFTY_DOCS_DEFAULT_EXCLUDES`, `LARK_DOCS_DEFAULT_EXCLUDES`, options `mode`/`replaceText`/`copy`/`keyboard`/`contextmenu`/`selectStyle`/`print`/`devtools`/`onViolation`/`target`, `mode: "block"`/`"replace"`, devtools `intervalMs`/`threshold`/`freeze`/`redirectUrl`, violation types `copy`/`cut`/`drag`/`selection`/`keyboard`/`contextmenu`/`print`/`devtools`, and the `copyable: true` VitePress frontmatter. Also trigger on phrases like "disable right-click", "block copy/paste", "prevent copying", "detect DevTools", "anti-copy", "protect docs content". Do NOT use for the ACTUAL text-selection/copy features of a docs site (that is swifty-docs / lark-docs / lark-mvc), for the Go sibling repo skills (swifty-http, swifty-rpc, swifty-orm, swifty-cache Go), or for @swifty.js/cache; route between the anti-copy CORE (`createAntiCopy`, framework-agnostic) and the correct per-framework integration entry (`./vitepress` for VitePress `enhanceApp`, `./swifty-docs` for the React `<AntiCopy>` component, `./lark-docs` for the lark-docs `applyAntiCopy` boot call).
---

# @swifty.js/anti-copy — Browser Copy / Print / DevTools Protection

## 1. Summary

`@swifty.js/anti-copy` (`packages/anti-copy`, published as `@swifty.js/anti-copy`, v0.0.4, MIT) is a client-side deterrent that raises the effort required to copy, print, drag-out, or DevTools-inspect page content in a browser.

**IMPORTANT — deterrent, not a security boundary.** This is stated in the source itself (`src/index.ts` JSDoc, `src/core/devtools.ts`, README disclaimer). Content remains fully accessible via view-source, `curl`/direct HTTP requests, reader mode, or with JavaScript disabled. Never present it as access control or DRM. Anything the browser renders can be extracted; this package only obstructs casual copying.

- **Runtime requirement:** a browser DOM. Every entry is SSR-safe — in a non-browser runtime `createAntiCopy` returns an inert no-op instance (see §4) and the integrations skip their navigation hooks.
- **Module format:** `"type": "module"`, `"sideEffects": false`, dual ESM + CJS. `main: ./dist/index.cjs`, `module: ./dist/index.js`, `types: ./dist/index.d.ts`. Four subpath entries, each with `types`/`import`/`require`: `.`, `./vitepress`, `./swifty-docs`, `./lark-docs`.
- **Peer deps (ALL optional via `peerDependenciesMeta`):** `react` (`^18.0.0 || ^19.0.0`), `vue` (`>=3.0.0`), `vitepress` (`>=1.0.0`), `@swifty.js/docs` (`>=0.0.11`), `@lark.js/mvc` (`>=0.0.26`). The core (`.`) needs none of them; each integration entry pulls in only its own framework. No `engines` field; no environment variables.
- **Intended uses:** deter copy/right-click/print/DevTools on marketing pages, paid docs, or any browser project (React, Vue, plain HTML).
- **Unsuitable uses:** enforcing content secrecy, licensing, or paywalls; protecting API responses; anything requiring a real trust boundary.

## 2. Architecture: options → feature-list → attach/detach pipeline

The library has two layers.

**Core layer (`src/index.ts` + `src/core/*`, exported from `.`):** framework-agnostic, DOM-only.
- `src/core/options.ts` — `resolveOptions()` normalizes an `AntiCopyOptions` into a fully-populated `ResolvedOptions` (fills every default, including mode-dependent ones). Exports `DEFAULT_REPLACE_TEXT`.
- `buildFeatures(options)` (in `index.ts`) resolves options, then pushes one `Feature` per enabled toggle, in this order: `selectStyle` → `copy` → `keyboard` → `contextmenu` → `print` → `devtools`. A `Feature` is just `{ attach(): void; detach(): void }`.
- Feature modules, each `create*Feature(resolved): Feature`:
  - `src/core/style.ts` — injects a `user-select: none !important` stylesheet (attr `swifty-anti-copy`) + iOS `-webkit-touch-callout: none`, and a capture-phase `selectstart` blocker (the `selectstart` listener is skipped in `"replace"` mode).
  - `src/core/clipboard.ts` — capture-phase `copy` / `cut` / `dragstart` on `window`.
  - `src/core/keyboard.ts` — capture-phase `keydown` for copy/export/DevTools/view-source shortcuts.
  - `src/core/contextmenu.ts` — capture-phase `contextmenu` suppression.
  - `src/core/print.ts` — `@media print { body { display: none !important; } }` stylesheet (attr `swifty-anti-print`) + `beforeprint` reporting.
  - `src/core/devtools.ts` — DevTools detection (size heuristic + `debugger` probe) and countermeasures (freeze loop, redirect).
  - `src/core/utils.ts` — `isBrowser`, `eventElement`, `isExcluded` (via `Element.closest`, shadow-DOM aware), `isEditable`, `isSelectionExcluded`, `escapeHtml`.
  - `src/core/types.ts` — all public + internal types.

**Integration layer (build on the core, one entry each):**
- `src/vitepress.ts` (`./vitepress`) — Vue/VitePress `enhanceApp` wiring.
- `src/swifty-docs.ts` (`./swifty-docs`) — renderless React `<AntiCopy>` component for `@swifty.js/docs`.
- `src/lark-docs.ts` (`./lark-docs`) — `applyAntiCopy()` boot call for `@lark.js/docs`.
- `src/common.ts` — shared `DOCS_DEFAULT_EXCLUDES` array and `isPathExcluded()`, used by both docs integrations.

Build: `rollup.config.js` compiles the 4 inputs to `.js` (ESM) + `.cjs` (CJS) + `.d.ts`. It aliases `@` → `src/`, marks `react`/`vue`/`@lark.js/*`/`@swifty.js/*` external, and runs terser with `drop_debugger: false` (critical: otherwise the DevTools CSP-fallback `debugger` probe would be stripped). `tsconfig.build.json` emits from `src` only.

## 3. Public API & configuration surface

### 3.1 Core entry `@swifty.js/anti-copy` (`.`)

Exports: `createAntiCopy`, `DEFAULT_REPLACE_TEXT` (= `"Copying is not allowed on this page."`), `isBrowser`, and the types `AntiCopyInstance`, `AntiCopyMode`, `AntiCopyOptions`, `DevtoolsOptions`, `ViolationEvent`, `ViolationType`.

```ts
function createAntiCopy(options?: AntiCopyOptions): AntiCopyInstance;
```

`AntiCopyInstance`:
- `enable(): void` — attach all configured protections. Idempotent (no-op if already enabled or destroyed).
- `disable(): void` — detach all listeners, remove injected styles, stop detectors. Idempotent.
- `destroy(): void` — `disable()` then permanently retire; further `enable`/`update` are no-ops (`features` cleared).
- `isEnabled(): boolean`.
- `update(patch: Partial<AntiCopyOptions>): void` — rebuild with merged options (see §4).

### 3.2 `AntiCopyOptions` — every field with its EXACT default

| Option | Type | Default | Behavior |
| --- | --- | --- | --- |
| `mode` | `"block" \| "replace"` | `"block"` | `"block"` cancels copy/cut; `"replace"` lets it proceed but swaps the clipboard payload for `replaceText`. |
| `replaceText` | `string \| ((selection: string) => string)` | `DEFAULT_REPLACE_TEXT` = `"Copying is not allowed on this page."` | Payload used in `"replace"` mode. Function receives current selection text. |
| `excludeSelectors` | `string[]` | `[]` | CSS selectors for regions where protection is bypassed; the event target is matched via `Element.closest`. Invalid selectors are dropped, never fatal. |
| `copy` | `boolean` | `true` | Intercept `copy` / `cut` events and text/image drag-out (`dragstart`). |
| `keyboard` | `boolean` | `true` | Intercept copy-related, export, DevTools, and view-source keyboard shortcuts. |
| `contextmenu` | `boolean` | `true` | Suppress the context menu. |
| `selectStyle` | `boolean` | **mode-dependent:** `true` in `"block"` mode, `false` in `"replace"` mode | Inject `user-select: none` stylesheet + block `selectstart`. Resolved as `options.selectStyle ?? options.mode !== "replace"` (replacement needs a live selection). |
| `print` | `boolean` | `true` | Hide `body` in print output via `@media print`, report via `beforeprint`, and block `Ctrl/Cmd+P` / `Ctrl/Cmd+S`. |
| `devtools` | `boolean \| DevtoolsOptions` | `false` | Enable DevTools detection + countermeasures. `true` uses all `DevtoolsOptions` defaults. |
| `onViolation` | `(event: ViolationEvent) => void` | `undefined` | Called every time a protection rule fires. |
| `target` | `Document` | `document` | Document to attach to; injectable for tests/iframes. |

`DevtoolsOptions` (used when `devtools` is an object; `devtools: true` uses all defaults):

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `intervalMs` | `number` | `1000` | Poll interval (ms) for the slow detection loop. |
| `threshold` | `number` | `170` | Min px difference between window outer and inner size treated as "DevTools docked". |
| `freeze` | `boolean` | `true` | Re-run the anonymous `debugger` probe in a tight loop to stall the page while DevTools is open. |
| `redirectUrl` | `string \| false` | `"about:blank"` | Page to navigate to when a confirmed stall is neutralized while DevTools stays open. Requires `freeze`; `false` disables the redirect fallback. |

### 3.3 `ViolationType` and `ViolationEvent`

```ts
type ViolationType =
  | "copy" | "cut" | "drag" | "selection"
  | "keyboard" | "contextmenu" | "print" | "devtools";

interface ViolationEvent {
  type: ViolationType;
  originalEvent?: Event; // absent for "devtools" and "print" detections
  key?: string;          // e.g. "Ctrl+Shift+I", "F12", "Ctrl+C", "Cmd+P", "Insert" — keyboard only
}
```

### 3.4 `./vitepress` entry

Exports: `applyAntiCopy`, `VITEPRESS_DEFAULT_EXCLUDES`, and types `AntiCopyHandle`.

```ts
function applyAntiCopy(ctx: EnhanceAppContext, options?: AntiCopyOptions): AntiCopyHandle;
interface AntiCopyHandle { instance: AntiCopyInstance; stop(): void; }
```

`VITEPRESS_DEFAULT_EXCLUDES` (prepended to any user `excludeSelectors`):
```
'div[class*="language-"]', "button.copy", "input", "textarea", "[contenteditable='true']", ".VPLocalSearchBox"
```
Behavior: enabled site-wide by default. Watches `ctx.router.route.data?.frontmatter?.copyable` (with `{ immediate: true }`) — a page with `copyable: true` in frontmatter calls `instance.disable()`, otherwise `instance.enable()`. `stop()` stops the watcher and calls `instance.destroy()`. During SSR/SSG it returns early with a no-op `stop()`.

### 3.5 `./swifty-docs` entry

Exports: the renderless React component `AntiCopy`, `SWIFTY_DOCS_DEFAULT_EXCLUDES` (= `DOCS_DEFAULT_EXCLUDES`), `isPathExcluded`, and type `SwiftyDocsAntiCopyProps`.

```tsx
interface SwiftyDocsAntiCopyProps extends AntiCopyOptions {
  excludePaths?: (string | RegExp)[]; // default []
}
function AntiCopy(props: SwiftyDocsAntiCopyProps): null;
```
`AntiCopy` reads the current path via `useLocation()` from `@swifty.js/docs`. It creates the instance once with `useMemo(..., [])` — so **options changes require a remount** (only `excludePaths`/`path` retrigger enable/disable). A `useEffect` keyed on `path` + a serialized `excludePaths` key calls `disable()` when `isPathExcluded(path, excludePaths)` else `enable()`; a cleanup effect calls `instance.disable()` on unmount. Mount it inside `<LocationProvider>`.

### 3.6 `./lark-docs` entry

Exports: `applyAntiCopy`, `LARK_DOCS_DEFAULT_EXCLUDES` (= `DOCS_DEFAULT_EXCLUDES`), `isPathExcluded`, and types `LarkDocsAntiCopyOptions`, `AntiCopyHandle`.

```ts
interface LarkDocsAntiCopyOptions extends AntiCopyOptions {
  excludePaths?: (string | RegExp)[]; // full paths incl. baseUrl; default []
}
function applyAntiCopy(options?: LarkDocsAntiCopyOptions): AntiCopyHandle;
```
Behavior: enabled site-wide by default. Subscribes `Router.on("changed", sync)` (from `@lark.js/mvc`) and runs `sync()` once immediately; `sync` reads `globalThis.location.pathname` (lark-docs uses history mode) and disables when the path is excluded, else enables. `stop()` calls `Router.off("changed", sync)` and `instance.destroy()`. In non-browser it returns early with a no-op `stop()`.

### 3.7 `DOCS_DEFAULT_EXCLUDES` and `isPathExcluded` (`src/common.ts`)

Shared by both docs integrations:
```
DOCS_DEFAULT_EXCLUDES = [".codeblock", "[role='dialog']", "input", "textarea", "[contenteditable='true']"]
```
`isPathExcluded(path, patterns)` matching semantics:
- Strings: both `path` and the pattern are stripped of trailing slashes (empty → `"/"`). Matches when `current === prefix` **or** `current.startsWith(prefix + "/")` (prefix match at a path segment boundary — `/docs` matches `/docs/x` but not `/docsx`).
- RegExp: tested with `pattern.test(path)` against the **original, non-stripped** path.

## 4. Internal implementation details affecting correct usage

- **Enable rollback on partial attach failure** (`index.ts` `enable()`): each feature is pushed to an `attached` list *before* its `attach()` runs; if any `attach()` throws, every already-tracked feature is `detach()`-ed (best-effort, detach is idempotent) and the error rethrown, so a half-attached run never leaks listeners or an orphan stylesheet. `enabled` stays `false`. Verified by the lifecycle test.
- **`disable()` detaches all features even if one throws**, remembering the first error and rethrowing it after every `detach()` has run.
- **`update()` ordering** (`disable → merge → rebuild → enable`): captures `wasEnabled`, calls `disable()`, deep-merges options via `mergeOptions` (spread merge, plus a nested spread-merge of the `devtools` object when both current and patch have object `devtools`), rebuilds the feature list with `buildFeatures`, then re-`enable()`s **only if it was enabled before**. So `update()` on a disabled instance keeps it disabled. `update()` after `destroy()` is a no-op. Note `mergeOptions` replaces all non-`devtools` fields wholesale (arrays like `excludeSelectors` are overwritten, not concatenated).
- **`excludeSelectors` matching** uses `el.closest(selector)` walking up ancestors and across open shadow-root hosts (`isExcluded` in `utils.ts`). For copy/cut, `isSelectionExcluded` is preferred: a selection spanning excluded + protected content is NOT exempt (every range must be inside an excluded region); it returns `null` (fall back to target check) when there is no non-collapsed selection. Editable controls (`<input>` text types, `<textarea>`, `contenteditable`) always keep native behavior. Invalid selectors are silently skipped.
- **Which changes require a remount:** in the `./swifty-docs` `<AntiCopy>` component the instance is memoized with an empty dep array, so any `AntiCopyOptions` prop change (e.g. `mode`, `devtools`, `replaceText`) is ignored until the component remounts; only `excludePaths` and route `path` are reactive. VitePress/lark-docs `applyAntiCopy` build the instance once per call — change options by tearing down (`stop()`) and re-applying, or use `instance.update()` directly.
- **SSR no-op instance** (`NOOP_INSTANCE` in `index.ts`): when `isBrowser()` is false, `createAntiCopy` returns a shared object whose `enable`/`disable`/`destroy`/`update` are no-ops and `isEnabled()` returns `false`. `isBrowser()` = `typeof window !== "undefined" && typeof document !== "undefined"`.
- **Capture-phase on `window`** (`doc.defaultView ?? doc`): clipboard, keyboard, contextmenu, and selectstart listeners register with `capture: true` on the outermost target so page scripts on `document` cannot pre-empt protection. A script that registers on `window` *before* this library still can.
- **`"replace"` mode specifics** (`clipboard.ts`): sets both `text/plain` and escaped `text/html` on `clipboardData` and calls `preventDefault()` (mandatory, else the browser re-fills the payload). The keyboard feature deliberately lets `Ctrl/Cmd+C` and `Ctrl+Insert` through in replace mode so the `copy` event can run the substitution.
- **DevTools detection/countermeasures** (`devtools.ts`, `PAUSE_THRESHOLD_MS=100`, `GUARD_INTERVAL_MS=20`, `BYPASS_MAX_TICKS=25` ≈ 500ms): the slow poll (`intervalMs`) combines a size heuristic (`outerWidth/Height - innerWidth/Height > threshold`, but disabled when `outerWidth < 800` or pointer is coarse) with a `debugger` probe timing. Only a **probe-confirmed pause** escalates to the tight guard loop (freeze) and the eventual redirect. A **size-only** detection (browser zoom, unusual chrome) is report-only via `onViolation({ type: "devtools" })` and never freezes or redirects. The probe is built via `Function("debugger")` (shows as `(function anonymous() { debugger })`), falling back to a literal `debugger;` statement under CSP. Redirect targets `(view.top ?? view).location.href`, falling back to `view.location.href` for cross-origin top windows.

## 5. Operational guidance & lifecycle ordering

- **Core / framework-agnostic:** call `enable()` after mount; call `disable()`/`destroy()` on teardown. Toggle per view yourself. Use `update()` to change config on the fly (respects prior enabled state).
- **VitePress:** call `applyAntiCopy(ctx, options)` inside the theme's `enhanceApp(ctx)`. Keep the returned handle if you need `stop()` (tests, HMR). The frontmatter watcher toggles across SPA navigations automatically. When consuming raw TS sources in a workspace, add `optimizeDeps.exclude` + `ssr.noExternal` for `@swifty.js/anti-copy` (README).
- **@swifty.js/docs:** mount `<AntiCopy .../>` once inside `<LocationProvider>` (alongside `<Router>`). Unmounting disables it. Change options by remounting (see §4).
- **@lark.js/docs:** call `applyAntiCopy(options)` once in `app/boot.ts`, before or after `Framework.boot()`. Call the handle's `stop()` to unsubscribe from `Router` and destroy.

## 6. Pitfalls / known limitations

- **Not a security boundary.** View-source, `curl`, disabled JS, and reader mode bypass everything. Behavior: obstruction only. Avoid: do not rely on it for confidentiality.
- **Pre-registered `window` listeners win.** A page script that adds capture-phase listeners before this library can pre-empt it. Load anti-copy as early as possible.
- **DevTools false positives from zoom / window chrome.** Behavior: size heuristic may fire `onViolation({type:"devtools"})`; why: outer/inner delta shifts with zoom; avoid: such detections are report-only and never freeze/redirect (only probe-confirmed pauses do).
- **Undocked DevTools with breakpoints deactivated are undetectable.** Behavior: no detection; why: neither size delta nor probe pause is observable.
- **`freeze: true` stalls the whole page while DevTools is open** (repeated `debugger`). This is intentional but hostile to legitimate debugging; disable `devtools` in development or set `freeze: false` for report-only.
- **`redirectUrl` can evict the page on a sustained neutralized stall** (default `"about:blank"`). Set `redirectUrl: false` to keep only the stall, or `freeze: false` for detection-only.
- **`update()` overwrites arrays wholesale.** `excludeSelectors` in a patch replaces the previous array (only `devtools` is deep-merged). Re-pass the full list.
- **`<AntiCopy>` options are frozen after first render.** Non-`excludePaths` prop changes need a remount (memoized with `[]`).
- **`"replace"` mode disables `selectStyle` by default**, because replacement needs a live selection. If you force `selectStyle: true` in replace mode, users can't select and nothing gets replaced.
- **Docs integration default excludes differ from VitePress.** swifty-docs/lark-docs use `.codeblock` + `[role='dialog']`; VitePress uses `div[class*="language-"]` + `button.copy` + `.VPLocalSearchBox`. Match the selectors to your theme's DOM.

## 7. Quick recipes

**Framework-agnostic core:**
```ts
import { createAntiCopy } from "@swifty.js/anti-copy";

const antiCopy = createAntiCopy({
  mode: "replace",
  replaceText: (sel) => `${sel.slice(0, 60)}… — © example.com`,
  excludeSelectors: ["pre code"],
  devtools: true,
  onViolation: (e) => console.warn("[anti-copy]", e.type, e.key ?? ""),
});
antiCopy.enable();
// later: antiCopy.update({ mode: "block" }); antiCopy.disable(); antiCopy.destroy();
```

**VitePress** (`.vitepress/theme/index.ts`):
```ts
import DefaultTheme from "vitepress/theme";
import { applyAntiCopy } from "@swifty.js/anti-copy/vitepress";

export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    applyAntiCopy(ctx, { mode: "replace", devtools: true });
  },
};
// opt a page out with frontmatter:  copyable: true
```

**@swifty.js/docs** (renderless component inside `<LocationProvider>`):
```tsx
import { AntiCopy } from "@swifty.js/anti-copy/swifty-docs";

<LocationProvider>
  <AntiCopy mode="replace" excludePaths={["/playground"]} devtools />
  <Router>{/* ... */}</Router>
</LocationProvider>;
```

**@lark.js/docs** (`app/boot.ts`):
```ts
import { applyAntiCopy } from "@swifty.js/anti-copy/lark-docs";

applyAntiCopy({ mode: "replace", excludePaths: ["/docs/playground"], devtools: true });
// Framework.boot(config);
```
