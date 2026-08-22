# @swifty.js/anti-copy

Framework-agnostic copy-protection SDK for browsers, with VitePress, @swifty.js/docs and @lark.js/docs integrations.

> **Disclaimer**: client-side copy protection is a _deterrent_, not a
> security boundary. Content remains accessible via view-source, disabled
> JavaScript, or direct HTTP requests.

## Features

- Intercepts `copy` / `cut` / `dragstart` events (capture phase, on `window`)
- Blocks copy shortcuts by **physical key** (`e.code`), so non-Latin keyboard
  layouts cannot bypass: `Ctrl/Cmd + C/X/A`, `Ctrl+Insert`, and DevTools /
  view-source shortcuts (`F12`, `Ctrl+Shift+I/J/C`, `Cmd+Opt+I/J/C`, `Ctrl+U`,
  `Cmd+Opt+U`)
- Blocks export shortcuts (`Ctrl/Cmd + S/P`) and hides content in print
  output via `@media print` (menu-initiated printing included)
- Disables the context menu and `selectstart`
- Injects a `user-select: none !important` stylesheet incl.
  `-webkit-touch-callout: none` for iOS long-press
- `replace` mode: swaps clipboard payload (text + escaped HTML flavor) with a
  copyright notice instead of blocking
- DevTools protection: detects open DevTools (window size delta + `debugger`
  probe timing, which also catches undocked windows), stalls the page with an
  anonymous `(function anonymous() { debugger })` probe loop while open, and
  redirects to a blank page when the stall is neutralized (e.g. by a
  userscript)
- Region exemptions via CSS selectors, judged against the **whole selection**
  (a selection spanning excluded and protected content stays blocked);
  editable controls always keep native behavior, incl. inside open shadow roots

## Core usage (framework agnostic)

The framework-agnostic core (`src/index.ts`, the package root export) has
zero framework dependencies and integrates into any browser project — React,
Vue, plain HTML, ...:

```ts
import { createAntiCopy } from "@swifty.js/anti-copy";

const antiCopy = createAntiCopy({
  mode: "replace", // "block" | "replace"
  replaceText: (selection) => `${selection.slice(0, 60)}… — © example.com`,
  excludeSelectors: ["pre code"],
  devtools: true,
  onViolation: (e) => console.warn("[anti-copy]", e.type),
});

antiCopy.enable();
// antiCopy.disable(); antiCopy.destroy(); antiCopy.update({...});
```

`createAntiCopy` is SSR-safe: in non-browser environments it returns an
inert no-op instance.

### Options

| Option             | Default    | Description                                                                        |
| ------------------ | ---------- | ---------------------------------------------------------------------------------- |
| `mode`             | `"block"`  | Cancel copying, or replace the clipboard payload                                   |
| `replaceText`      | built-in   | String or `(selection) => string` for replace mode                                 |
| `excludeSelectors` | `[]`       | Regions where protection is bypassed (invalid selectors are dropped, never fatal)  |
| `copy`             | `true`     | Intercept `copy` / `cut` / `dragstart` events                                      |
| `keyboard`         | `true`     | Intercept copy, export & DevTools shortcuts                                        |
| `contextmenu`      | `true`     | Disable right-click menu                                                           |
| `selectStyle`      | mode-aware | `user-select: none` + `selectstart`; `true` in block mode, `false` in replace mode |
| `print`            | `true`     | `@media print` hiding, `beforeprint` reporting, `Ctrl/Cmd+S/P` blocking            |
| `devtools`         | `false`    | `true` or `{ intervalMs, threshold, freeze, redirectUrl }`                         |
| `onViolation`      | —          | Callback fired on every protection trigger                                         |
| `target`           | `document` | Document to protect; injectable for tests and iframes                              |

Violation types: `copy`, `cut`, `drag`, `selection`, `keyboard`,
`contextmenu`, `print`, `devtools`.

`update(patch)` deep-merges the nested `devtools` object; other fields are
replaced wholesale.

### DevTools protection

`devtools: true` enables the full protection chain:

1. **Detection** — polls the window outer/inner size delta (docked DevTools)
   and the elapsed time around an anonymous `(function anonymous() { debugger })`
   probe, which only takes measurable time while a debugger is attached. The
   probe also catches undocked DevTools windows the size heuristic cannot see.
2. **Stall (`freeze: true` by default)** — once DevTools is detected, a tight
   guard loop keeps running the probe, so execution pauses over and over and
   the page is effectively frozen until DevTools is closed.
3. **Blank-page redirect (`redirectUrl: "about:blank"` by default)** — if
   DevTools stays open while the probe no longer pauses (the stall was
   neutralized, e.g. by a userscript hooking `Function`, "never pause here" or
   deactivated breakpoints), the page is redirected to the blank page after a
   short grace window. Set `redirectUrl: false` to keep only the stall, or
   `freeze: false` for report-only detection via `onViolation`.

## VitePress integration

```ts
// .vitepress/theme/index.ts
import DefaultTheme from "vitepress/theme";
import { applyAntiCopy } from "@swifty.js/anti-copy/vitepress";

export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    applyAntiCopy(ctx, { mode: "replace", devtools: true });
  },
};
```

- Enabled site-wide by default; code blocks, the copy button, inputs and the
  local search box are exempt (`VITEPRESS_DEFAULT_EXCLUDES`).
- Opt out per page with frontmatter:

  ```yaml
  ---
  copyable: true
  ---
  ```

- Toggles automatically across SPA navigations via the reactive route data.
- Returns `{ instance, stop }` — call `stop()` to remove the watcher and all
  listeners (useful in tests or HMR-heavy setups).

When consuming the package as raw TypeScript sources inside a workspace,
add to the VitePress `vite` config:

```ts
vite: {
  optimizeDeps: { exclude: ["@swifty.js/anti-copy"] },
  ssr: { noExternal: ["@swifty.js/anti-copy"] },
}
```

## @swifty.js/docs integration

Mount the renderless `AntiCopy` component anywhere inside @swifty.js/docs's
`<LocationProvider>`:

```tsx
import { AntiCopy } from "@swifty.js/anti-copy/swifty-docs";

<LocationProvider>
  <AntiCopy mode="replace" excludePaths={["/playground"]} devtools />
  <Router>...</Router>
</LocationProvider>;
```

- Code blocks (`.codeblock`), dialogs (`[role="dialog"]`, incl. the search
  palette) and editable controls are exempt (`SWIFTY_DOCS_DEFAULT_EXCLUDES`).
- Opt out per route with `excludePaths` (string prefix or RegExp; trailing
  slashes are normalized on both sides); protection toggles automatically on
  client-side navigation.

## @lark.js/docs integration

Call `applyAntiCopy()` once from `app/boot.ts` (the lark-docs equivalent of
VitePress's `enhanceApp`):

```ts
// app/boot.ts
import { applyAntiCopy } from "@swifty.js/anti-copy/lark-docs";

applyAntiCopy({
  mode: "replace",
  excludePaths: ["/docs/playground"],
  devtools: true,
});

Framework.boot(config);
```

- Code blocks (`.codeblock`), dialogs (`[role="dialog"]`, incl. the search
  palette) and editable controls are exempt (`LARK_DOCS_DEFAULT_EXCLUDES`).
- Opt out per route with `excludePaths` (full paths incl. `baseUrl`; string
  prefix or RegExp, trailing slashes normalized); the toggle stays in sync
  across SPA navigation via the router's `changed` event.
- The returned handle exposes `instance` for manual control and `stop()` for
  teardown.

## Known limitations

By design (client-side JS cannot prevent these):

- View-source, `curl`, reader mode, disabled JavaScript.
- Undocked DevTools with deactivated breakpoints are indistinguishable from
  closed DevTools; browser zoom may cause devtools-detector false positives —
  with countermeasures enabled, a sustained false positive ends in a redirect.
- Scripts registered on `window` before this plugin can pre-empt the
  capture-phase listeners.

## Testing

```sh
pnpm test
```
