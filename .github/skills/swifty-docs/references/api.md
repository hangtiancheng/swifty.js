# API Reference

All facts verified against `src/index.ts`, `src/theme/index.ts`, `src/vite.ts`, `src/theme/context.tsx`, `src/theme/lib/*`, and `src/client.d.ts`.

## Package export map (package.json `exports`)

| Sub-path                   | Contents                                                                                               | Environment  |
| -------------------------- | ------------------------------------------------------------------------------------------------------ | ------------ |
| `@swifty.js/docs`          | Main barrel: theme components, primitives, types, `slugify`/`createSlugger`                            | Browser-safe |
| `@swifty.js/docs/vite`     | `swiftyDocsPlugin()`, `docsGuardPlugin()`, re-exports `defineConfig`, `scanDocsDir`, `generateSidebar` | Node (build) |
| `@swifty.js/docs/compiler` | `compileMarkdown()`, `CompileMarkdownOptions`                                                          | Node (build) |
| `@swifty.js/docs/runtime`  | `slugify()`, `createSlugger()` (browser-safe, no build deps)                                           | Browser-safe |
| `@swifty.js/docs/theme`    | Theme components + Dialog primitives + helpers                                                         | Browser      |
| `@swifty.js/docs/client`   | Types-only: ambient `declare module "@swifty-docs/generated"`                                          | TS types     |

ESM + CJS dual build (`dist/index.js` / `dist/index.cjs`) with full `.d.ts`.

## Build-time API

### `defineConfig(config: DocsConfig, projectRoot?: string): DocsConfig`

Identity + generation side effect. See `references/configuration.md`.

### `swiftyDocsPlugin(options: { config: DocsConfig; debug?: boolean }): Plugin[]`

Returns `[swifty-docs md-compiler, ...@preact/preset-vite]`. The compiler plugin: `enforce: "pre"`; `resolveId` rewrites any `.md` import (skipping `node_modules`) to `<abs-path>?swifty-docs` (handles `/@fs` prefixes); `load` matches the `swifty-docs` query flag and returns the compiled JS module string. `debug: true` logs resolveId/load activity.

### `compileMarkdown(source: string, options: CompileMarkdownOptions): Promise<string>`

`CompileMarkdownOptions = { config: DocsConfig; filePath: string; projectRoot?: string }`. Pipeline: frontmatter (js-yaml) → Shiki lazy singleton (`options.config.highlight`) → markdown-it parse with the 4 custom plugins → render HTML → build `PageData` via the shared `buildPageData()` (single parse, zod-coerced scalars) → emit `export const pageData = ...; export const contentHtml = ...;` module string. Do NOT pass Vite's resolved root as `projectRoot` — `config.docs` is resolved against `process.cwd()` by `defineConfig`/scanner, and both pipelines must agree.

### `docsGuardPlugin(): Plugin`

`enforce: "post"`. When `DOCS_PASSWORD` is set, encrypts `contentHtml` of pages whose frontmatter has `protected: true` (any YAML truthy spelling — detection uses `extractFrontmatter`, not a regex) with AES-256-GCM (PBKDF2 100k/SHA-256, per-page salt+iv), emits `__protected = true`, and scrubs `description`/`excerpt`/`headings` from `pageData` (headings are encrypted alongside the HTML so the Toc restores after unlock). Without `DOCS_PASSWORD` it only warns: `"... will be published UNENCRYPTED."`. Runtime counterpart: `createContentGuard(loadContent)` + `PasswordDialog` + `decryptContent(payload, password)`.

### `scanDocsDir` / `generateSidebar` / `slugify` / `createSlugger`

- `scanDocsDir(docsDir, baseUrl, options?: { excludeDrafts?: boolean }): DocsRoute[]` — deterministic codepoint-sorted walk; warns `"route collision: ..."` when two files map to the same path (e.g. `guide.md` + `guide/index.md`).
- `generateSidebar(routes, prefix): SidebarItem[]`
- `slugify(text): string` — lowercase, strip non-word chars (keep spaces/dashes), whitespace→dashes, collapse dashes, prefix leading digits with `_`. Browser-safe (`/runtime`).
- `createSlugger(): (text) => string` — per-document dedup wrapper over `slugify`; duplicates get `-1`/`-2` suffixes. Used by both the anchor plugin and heading extraction so anchor `id`s and TOC slugs always agree.

## Runtime API — components

### `DocsProvider(props: DocsProviderProps)`

```ts
interface DocsProviderProps {
  config: unknown; // Zod-validated; fallback { title: "Documentation", baseUrl: "/" }
  loadContent: unknown; // must be a function, else null + console.warn
  getSearchIndex: unknown; // must be a function, else null + console.warn
  children?: ComponentChildren;
}
```

Context value (via `useDocs()`): `{ config: RuntimeDocsConfig, loadContent, getSearchIndex, searchEnabled: boolean, searchOpen: boolean, setSearchOpen(open), toggleSearch() }`. `searchEnabled = config.search ?? true`. `useDocs()` throws outside a provider.

### `DocsLayout()`

The whole shell; takes no props. Reads path from preact-iso `useLocation()`, normalizes it (`normalizePath` — redirects `/index`, `/index.md`, `/index.html`, trailing slashes), loads content in `useEffect` with cancellation, renders Navbar / Sidebar rail / prose column (`ContentRenderer` + `PrevNext`) / Toc rail / mobile drawer / SearchDialog. Landing route falls back to `nav[0].link ?? baseUrl ?? "/"`.

### Other components (composable individually)

`Navbar`, `Sidebar`, `Toc` (also mounted inline for `[[toc]]`), `SearchDialog` (MiniSearch palette, mounted only when `searchEnabled`), `ContentRenderer` (injects `contentHtml`, wires `swifty-docs-nav` links, `[[toc]]` mounts, copy buttons, hash pushState deep links), `PrevNext`, `ThemeToggle` (persists `swifty-docs-theme`; the key is exported as `THEME_STORAGE_KEY`; syncs across instances via a MutationObserver on `<html class>`), `Logo`. Password guard: `createContentGuard(loadContent)` returns `{ loadContent, ContentGuard }` — mount `<ContentGuard />` once; `PasswordDialog` and `decryptContent` are also exported.

### Primitives (shadcn-style, hand-rolled Preact)

- `Button`, `buttonVariants` (cva-based)
- `Input`, `Kbd`
- From `/theme` only: `Dialog`, `DialogTrigger`, `DialogPortal` (preact/compat `createPortal` to `document.body`), `DialogOverlay`, `DialogContent` (role="dialog", autofocus), `DialogTitle`, `DialogDescription`, `DialogClose`. `Dialog` handles Escape via a document keydown listener; open state is controlled (`open` / `onOpenChange`).

Note: props use Preact's `class` attribute, not `className`.

## Runtime API — hooks & utilities

| Export               | Signature                                                                  | Notes                                                                                                                                                                                          |
| -------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useScrollSpy`       | `(headings: PageHeading[], offset = 96): string`                           | IntersectionObserver-based; returns active slug; SSR-safe (no-op without IO)                                                                                                                   |
| `computePrevNext`    | `(sidebar, currentPath): { prev: NavLink \| null; next: NavLink \| null }` | Flattens all sidebar links in order                                                                                                                                                            |
| `normalizePath`      | `(raw: string): { path: string; redirect: string \| null }`                | Strips trailing slashes, resolves `/index(.md/.html)`                                                                                                                                          |
| `cn`                 | `(...inputs: ClassValue[]): string`                                        | clsx + tailwind-merge                                                                                                                                                                          |
| `createSearchEngine` | `(getSearchIndex \| null): SearchEngine`                                   | Lazy MiniSearch build (first query), memoized; `SearchEngine = { search(q): Promise<SearchHit[]>, size(): number }`. Fuzzy 0.2, prefix matching, boosts: title 2x / headings 1.5x / excerpt 1x |
| `highlightSegments`  | `(text, query): { text: string; mark: boolean }[]`                         | For rendering real `<mark>` nodes — no innerHTML                                                                                                                                               |

Types exported from the main barrel: `DocsConfig`, `NavItem`, `SidebarConfig`, `SidebarItem`, `MarkdownOptions`, `HighlightOptions`, `PageData`, `HeadingInfo`, `DocsRoute`, `SearchEntry`, `FrontmatterResult`, `CompileMarkdownOptions`, plus `LoadedContent`, `PageHeading`, `DocsProviderProps`, `ContentGuard`, `PasswordDialogProps`, `EncryptedPayload`. Value exports also include `THEME_STORAGE_KEY` (the `"swifty-docs-theme"` localStorage key), `createContentGuard`, `PasswordDialog`, and `decryptContent`.

## `@swifty-docs/generated` contract (src/client.d.ts)

```ts
declare module "@swifty-docs/generated" {
  export function loadContent(
    path: string,
  ): Promise<{ pageData: PageData; contentHtml: string } | null>;
  export const docsConfig: DocsConfig;
  export interface SearchEntry {
    title: string;
    link: string;
    headings: string[];
    excerpt: string;
  }
  export function getSearchIndex(): Promise<SearchEntry[]>;
}
```

Consumers get these types via `/// <reference types="@swifty.js/docs/client" />` (use `types`, not `path` — `types` walks package `exports` and pnpm symlinks). Wire the module itself with a Vite alias: `"@swifty-docs/generated": resolve(root, ".swifty-docs/generated")`, and mirror it in tsconfig `paths` for the IDE.

## Search

`search?: boolean` in `DocsConfig` (default `true`). When enabled, `SearchDialog` renders the built-in MiniSearch command palette. Keyboard: `⌘K`/`Ctrl+K` toggle, `/` opens (outside inputs); arrows/Enter/Esc inside (Enter ignores IME composition). Index built lazily on first query via `getSearchIndex()` — page-level entries `{ title, link, headings, excerpt }`, protected and virtual-index routes excluded. `search: false` unmounts the dialog, its keyboard listeners, and the navbar trigger entirely. There is no external/Algolia provider.
