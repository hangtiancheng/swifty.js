# API Reference

All facts verified against `src/index.ts`, `src/theme/index.ts`, `src/vite.ts`, `src/theme/context.tsx`, `src/theme/lib/*`, and `src/client.d.ts`.

## Package export map (package.json `exports`)

| Sub-path                   | Contents                                                                          | Environment  |
| -------------------------- | --------------------------------------------------------------------------------- | ------------ |
| `@swifty.js/docs`          | Main barrel: theme components, primitives, types, `slugify`                       | Browser-safe |
| `@swifty.js/docs/vite`     | `swiftyDocsPlugin()`, re-exports `defineConfig`, `scanDocsDir`, `generateSidebar` | Node (build) |
| `@swifty.js/docs/compiler` | `compileMarkdown()`, `CompileMarkdownOptions`                                     | Node (build) |
| `@swifty.js/docs/runtime`  | `slugify()` only                                                                  | Browser-safe |
| `@swifty.js/docs/theme`    | Theme components + `createLocalSearchClient` + Dialog primitives                  | Browser      |
| `@swifty.js/docs/client`   | Types-only: ambient `declare module "@swifty-docs/generated"`                     | TS types     |

ESM + CJS dual build (`dist/index.js` / `dist/index.cjs`) with full `.d.ts`.

## Build-time API

### `defineConfig(config: DocsConfig, projectRoot?: string): DocsConfig`

Identity + generation side effect. See `references/configuration.md`.

### `swiftyDocsPlugin(options: { config: DocsConfig; debug?: boolean }): Plugin[]`

Returns `[swifty-docs md-compiler, ...@preact/preset-vite]`. The compiler plugin: `enforce: "pre"`; `resolveId` rewrites any `.md` import (skipping `node_modules`) to `<abs-path>?swifty-docs` (handles `/@fs` prefixes); `load` matches the `swifty-docs` query flag and returns the compiled JS module string. `debug: true` logs resolveId/load activity.

### `compileMarkdown(source: string, options: CompileMarkdownOptions): Promise<string>`

`CompileMarkdownOptions = { config: DocsConfig; filePath: string; debug?: boolean; projectRoot?: string }`. Pipeline: frontmatter (js-yaml) → Shiki lazy singleton (`options.config.highlight`) → markdown-it parse with the 4 custom plugins → render HTML → build `PageData` → emit `export const pageData = ...; export const contentHtml = ...;` module string.

### `scanDocsDir` / `generateSidebar` / `slugify`

- `scanDocsDir(docsDir, baseUrl, options?: { excludeDrafts?: boolean }): DocsRoute[]`
- `generateSidebar(routes, prefix): SidebarItem[]`
- `slugify(text): string` — lowercase, strip non-word chars (keep spaces/dashes), whitespace→dashes, collapse dashes. Browser-safe (`/runtime`).

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

Context value (via `useDocs()`): `{ config: RuntimeDocsConfig, loadContent, getSearchIndex, searchProvider: "local"|"docsearch"|"none", searchOpen: boolean, setSearchOpen(open), toggleSearch() }`. `useDocs()` throws outside a provider.

### `DocsLayout()`

The whole shell; takes no props. Reads path from preact-iso `useLocation()`, normalizes it (`normalizePath` — redirects `/index`, `/index.md`, `/index.html`, trailing slashes), loads content in `useEffect` with cancellation, renders Navbar / Sidebar rail / prose column (`ContentRenderer` + `PrevNext`) / Toc rail / mobile drawer / SearchDialog. Landing route falls back to `nav[0].link ?? baseUrl ?? "/"`.

### Other components (composable individually)

`Navbar`, `Sidebar`, `Toc` (also mounted inline for `[[toc]]`), `SearchDialog` (MiniSearch palette, local provider), `DocSearchWidget` (Algolia UI over the local index, docsearch provider), `ContentRenderer` (injects `contentHtml`, wires `data-swifty-nav` links, `[[toc]]` mounts, copy buttons), `PrevNext`, `ThemeToggle` (persists `swifty-docs-theme`), `Logo`.

### Primitives (shadcn-style, hand-rolled Preact)

- `Button`, `buttonVariants` (cva-based)
- `Input`, `Kbd`
- From `/theme` only: `Dialog`, `DialogTrigger`, `DialogPortal` (preact/compat `createPortal` to `document.body`), `DialogOverlay`, `DialogContent` (role="dialog", autofocus), `DialogTitle`, `DialogDescription`, `DialogClose`. `Dialog` handles Escape via a document keydown listener; open state is controlled (`open` / `onOpenChange`).

Note: props use Preact's `class` attribute, not `className`.

## Runtime API — hooks & utilities

| Export                    | Signature                                                                  | Notes                                                                                                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useScrollSpy`            | `(headings: PageHeading[], offset = 96): string`                           | IntersectionObserver-based; returns active slug; SSR-safe (no-op without IO)                                                                                                                   |
| `computePrevNext`         | `(sidebar, currentPath): { prev: NavLink \| null; next: NavLink \| null }` | Flattens all sidebar links in order                                                                                                                                                            |
| `normalizePath`           | `(raw: string): { path: string; redirect: string \| null }`                | Strips trailing slashes, resolves `/index(.md/.html)`                                                                                                                                          |
| `cn`                      | `(...inputs: ClassValue[]): string`                                        | clsx + tailwind-merge                                                                                                                                                                          |
| `createSearchEngine`      | `(getSearchIndex \| null): SearchEngine`                                   | Lazy MiniSearch build (first query), memoized; `SearchEngine = { search(q): Promise<SearchHit[]>, size(): number }`. Fuzzy 0.2, prefix matching, boosts: title 2x / headings 1.5x / excerpt 1x |
| `highlightSegments`       | `(text, query): { text: string; mark: boolean }[]`                         | For rendering real `<mark>` nodes — no innerHTML                                                                                                                                               |
| `createLocalSearchClient` | `(index): AlgoliaCompatClient`                                             | Adapts `SearchEntry[]` to DocSearch hits (`hierarchy.lvl0/lvl1`, `_highlightResult`, `_snippetResult`); inject via `transformSearchClient`                                                     |

Types exported from the main barrel: `DocsConfig`, `NavItem`, `SidebarConfig`, `SidebarItem`, `MarkdownOptions`, `HighlightOptions`, `SearchOptions`, `PageData`, `HeadingInfo`, `DocsRoute`, `SearchEntry`, `FrontmatterResult`, `CompileMarkdownOptions`, plus `LoadedContent`, `PageHeading`, `DocsProviderProps`.

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

## Search providers

- `"local"` (default): `SearchDialog` command palette. Keyboard: `⌘K`/`Ctrl+K`, `/` to open; arrows/Enter/Esc inside. Index built lazily on first query via `getSearchIndex()`.
- `"docsearch"`: Algolia DocSearch button + modal UI, but queries the **local** index through `createLocalSearchClient` — no Algolia account. CSS/JS loaded via dynamic import only when active.
- `"none"`: search UI hidden entirely.
