# API Reference

Source of truth: `src/index.ts`, `src/theme/index.ts`, `src/vite.ts`, `src/compiler.ts`, `src/runtime.ts`, `src/theme/context.tsx`, `src/theme/docs-guard.tsx`, `src/theme/lib/*`, `src/utils/guard.ts`, `src/client.d.ts`, `package.json`.

## Package export map (`package.json` `exports`)

Version `0.0.12`, `"type": "module"`, `engines.node >= 20`. Dual ESM+CJS with `.d.ts`. `main: dist/index.cjs`, `module: dist/index.js`, `types: dist/index.d.ts`. `sideEffects: ["*.css"]`.

| Subpath                    | ESM / CJS                         | Contents                                                                 |
| -------------------------- | --------------------------------- | ------------------------------------------------------------------------ |
| `@swifty.js/docs` (`.`)    | `dist/index.js` / `dist/index.cjs`| Browser-safe barrel: React theme, primitives, router, guard, utilities, all types, and `slugify`/`createSlugger`. |
| `@swifty.js/docs/compiler` | `dist/compiler.js` / `.cjs`       | `compileMarkdown` + `CompileMarkdownOptions` type.                       |
| `@swifty.js/docs/vite`     | `dist/vite.js` / `.cjs`           | `swiftyDocsPlugin`, `docsGuardPlugin`, `SwiftyDocsVitePluginOptions`, and re-exported build-time helpers `defineConfig`, `scanDocsDir`, `generateSidebar`, plus `DocsConfig`/`SidebarConfig` types. Node-only. |
| `@swifty.js/docs/runtime`  | `dist/runtime.js` / `.cjs`        | `slugify`, `createSlugger` (browser-safe, no build deps).                |
| `@swifty.js/docs/theme`    | `dist/theme.js` / `.cjs`          | The React theme (same components/hooks as the main barrel).              |
| `@swifty.js/docs/client`   | types only (`dist/client.d.ts`)   | Ambient `declare module "@swifty-docs/generated"`. Use via `/// <reference types>`. No runtime code. |
| `@swifty.js/docs/client.css` | `dist/client.css`               | The theme stylesheet.                                                    |

Note the `.` and `/theme` entries deliberately exclude Node-only build code; config files should import `defineConfig`/`swiftyDocsPlugin` from `/vite`.

## Main barrel (`@swifty.js/docs`)

### Types (all from `src/types.ts`)

`DocsConfig`, `NavItem`, `SidebarConfig`, `SidebarItem`, `MarkdownOptions`, `HighlightOptions`, `PageData`, `HeadingInfo`, `DocsRoute`, `FrontmatterResult`, `CompileMarkdownOptions` — documented in `references/configuration.md`.

### Runtime utilities (from `src/runtime.ts` → `src/utils/slugify.ts`)

```ts
function slugify(text: string): string
function createSlugger(): (text: string) => string
```

`slugify` — lowercase, replace non-`\p{L}\p{N}`/space/dash with `-`, collapse whitespace/dashes, trim, and prefix a leading digit with `_` (valid CSS selector). Preserves CJK/Cyrillic/etc. `createSlugger` — per-document factory that appends `-1`, `-2`, … to duplicate slugs (matches the anchor plugin so TOC links equal rendered ids).

### `DocsProvider` / `useDocs` (`src/theme/context.tsx`)

```ts
interface DocsProviderProps {
  config: unknown;         // the generated docsConfig
  loadContent: unknown;    // the generated loadContent (or guard.loadContent)
  getSearchIndex: unknown; // the generated getSearchIndex
  onContentUpdate?: unknown; // optional dev-only md hot-reload subscription
  children?: ReactNode;
}
function DocsProvider(props: DocsProviderProps): JSX.Element
function useDocs(): DocsContextValue // throws "useDocs must be used inside a <DocsProvider>"
```

Props are `unknown` and validated with Zod at the boundary (values cross the plain-JS generated-module boundary). `config` failing validation falls back to `FALLBACK_CONFIG` (`{ title: "Documentation", baseUrl: "/" }`) with a warning. `loadContent`/`getSearchIndex`/`onContentUpdate` are validated as functions (`typeof === "function"`); on failure they become `null`. The context exposes `{ config, loadContent, getSearchIndex, onContentUpdate, searchEnabled, searchOpen, setSearchOpen, toggleSearch }`. `searchEnabled = config.search ?? true`. Warnings:
- `[@swifty.js/docs] docsConfig failed validation — using fallback.`
- `[@swifty.js/docs] loadContent not injected — pages cannot be loaded.`
(No warning when `onContentUpdate` is absent — that is the normal production case.)

### `DocsLayout` (`src/theme/docs-layout.tsx`)

`function DocsLayout(): JSX.Element` — the shell. Reads the path from `useLocation()`, normalizes it (`normalizePath`, redirecting `/x/index` → `/x`), loads content in an effect (validated by `LoadedContentSchema`; keeps the old page visible while the next loads), sets `document.title`, handles hash scrolling (decoded for CJK), redirects `/` or `baseUrl` to the first internal nav link (`landing`), and renders Navbar / sidebar rail (`236px`, `lg+`) / prose column (`ContentRenderer` + `PrevNext`) / TOC rail (`224px`, `xl+`) / a focus-trapped mobile drawer (`inert` when closed, Escape to close, body scroll lock, focus restore) / `SearchDialog` (only when `searchEnabled`). Also subscribes to `onContentUpdate` to refresh the current page in place (no loading flash) on md edits. Mount it under a `LocationProvider`.

### Router (`src/theme/lib/router.tsx`)

```ts
function LocationProvider({ children }): JSX.Element
function useLocation(): { path: string; route: (path: string, replace?: boolean) => void }
// useLocation throws "useLocation must be used inside a <LocationProvider>"
```

The package's own history router (not react-iso). `LocationProvider` tracks `window.location.pathname`, listens to `popstate`, and globally intercepts same-origin left-clicks on `<a>` (ignoring modified clicks, `target="_blank"`, hash-only, and cross-origin) for SPA navigation; same-path hash clicks push state and smooth-scroll. `route(to, replace?)` push/replaces history and updates state.

### Theme components

- `Navbar({ path, landing, onMenuClick })` — sticky frosted top bar (backdrop-blur on scroll); logo, nav items (active underline, external → new tab with `ArrowUpRightIcon`), search trigger (full input `sm+`, icon button below; `⌘K` hint via `Kbd`), `ThemeToggle`.
- `Sidebar({ path, onNavigate?, className? })` — renders only the array-valued sidebar groups; collapsible groups/nodes; auto-expands the group containing the active path; active item styled with `--primary`. Group titles strip `baseUrl`.
- `Toc({ headings, inline? })` — heading outline with `useScrollSpy` and a spring-animated active marker; `inline` variant is boxed (`not-prose`) and is what `[[toc]]` mounts. Renders nothing when `headings` is empty.
- `ContentRenderer({ html, headings, pageKey? })` — sets `article.innerHTML = html` (trusted first-party build output), replays the `animate-page-in` class on `pageKey` change, then mounts React roots into `[swifty-docs-toc]` (inline `Toc`), `.mermaid-block[data-mermaid]` (`MermaidDiagram`), and each `.codeblock` (a `CopyButton`); disposers unmount on re-render/unmount. Intercepts in-page `#hash` clicks for smooth scroll + `pushState`.
- `PrevNext({ prev, next })` — previous/next pager cards; renders nothing when both are null.
- `SearchDialog()` — MiniSearch command palette (portal `Dialog`). Lazy `createSearchEngine` (ref-initialized once), section-level results capped at `MAX_RESULTS = 12` and `MAX_RESULTS_PER_PAGE = 3`, keyboard nav (↑/↓ wrap, Enter opens — IME-composition-safe, Esc closes), `⌘K`/`Ctrl+K` toggles, `/` opens when not typing in a field. Re-runs on `onContentUpdate` (invalidates the engine). Highlights matches as real `<mark>` elements.
- `MermaidDiagram({ code })` (`src/theme/mermaid.tsx`) — lazy singleton `import("mermaid")`, serialized renders (global `initialize` is shared state), per-`(theme, code)` SVG cache, re-renders on `.dark` toggle (`MutationObserver`), `securityLevel: "loose"`, `suppressErrorRendering: true`; render failure shows `.mermaid-error` with the raw source. Warn: `[@swifty.js/docs] mermaid render failed:`.
- `ThemeToggle()` — light/dark button; toggles `.dark` on `<html>`, persists to `localStorage[THEME_STORAGE_KEY]`, observes the class so multiple instances stay in sync. `THEME_STORAGE_KEY = "swifty-docs-theme"`.
- `Logo({ href, title, className? })` — gradient clock mark (icon = current hour) + wordmark. Also exports `ThemeToggleIcon({ dark })`.

### shadcn-style primitives (`src/theme/ui/*`)

- `Button` + `buttonVariants` (cva). Variants: `default`, `outline`, `ghost`, `secondary`. Sizes: `default` (`h-9 px-4 py-2`), `sm` (`h-8`), `lg` (`h-10`), `icon` (`size-9`). Defaults `variant: "default"`, `size: "default"`.
- `Input` — `forwardRef<HTMLInputElement>`; themed text input.
- `Kbd` — styled `<kbd>`.
- Dialog family (`src/theme/ui/dialog.tsx`): `Dialog({ open, onOpenChange, children })` (Escape closes via document listener), `DialogPortal` (renders into `document.body` only when open), `DialogOverlay` (backdrop; click dismisses), `DialogContent` (forwardRef; `role="dialog"`, `aria-modal`, minimal Tab focus trap, focus restore on close), `DialogTitle`, `DialogDescription`, `DialogClose`, `DialogTrigger`, `DialogAccessibleTitle` (`sr-only` `<h2>`). Hand-rolled with `createPortal` from `react-dom` — no Radix.

### Hooks & utilities

- `cn(...inputs: ClassValue[]): string` (`src/theme/lib/utils.ts`) — `twMerge(clsx(...))`. (`decodedLocationHash()` is internal, not exported.)
- `useScrollSpy(headings: PageHeading[], offset = 96): string` (`src/theme/lib/scroll-spy.ts`) — rAF-throttled scroll/resize/ResizeObserver spy; returns the active heading slug (last heading at/above `offset`; last heading when at page bottom).
- `createSearchEngine(getSearchIndex: GetSearchIndexFn | null): SearchEngine` (`src/theme/lib/search.ts`) — `SearchEngine = { search(query): Promise<SearchHit[]>; size(): number; invalidate(): void }`. Builds a MiniSearch index lazily/once (generation-guarded): fields `["title","pageTitle","text"]`, store `["title","pageTitle","crumb","link","text"]`, `tokenize: cjkTokenize` (splits CJK runs into per-char tokens), `prefix: true`, `fuzzy: 0.2`, `boost: { title: 2, pageTitle: 1.5 }`. Splits each page's HTML into h1–h3 sections (`buildSectionDocs`/`splitContentSections`) so hits deep-link to `/route#slug` with a breadcrumb (`›`). Warns `getSearchIndex not injected` / `search index failed validation` and returns `[]`.
- `highlightSegments(text, query): { text: string; mark: boolean }[]` — split into plain/marked segments (rendered as `<mark>`; no `innerHTML`). (`capPerPage`, `makeSnippet`, `cjkTokenize` exist in the module but are not re-exported from the barrel.)
- `computePrevNext(sidebar, currentPath): { prev: NavLink | null; next: NavLink | null }` (`src/theme/lib/content.ts`) — flattens array-valued sidebar links in config order (trailing slashes ignored) and returns neighbors. `NavLink = { text, link }` (type not exported).
- `normalizePath(raw): { path: string; redirect: string | null }` — strips trailing slashes and resolves `/index(.md|.html)?` to the clean directory path; sets `redirect` when a history-replacing rewrite is needed.

Exported content types: `LoadContentFn`, `LoadedContent`, `PageHeading` (barrel); `theme` also exports `LoadedContent`, `PageHeading`. `RuntimeDocsConfig`, `SearchEntrySchema`, etc. are internal.

### Password guard (`src/theme/docs-guard.tsx`, `src/utils/guard.ts`)

```ts
function createContentGuard<T extends { contentHtml: string; pageData?: { headings?: unknown } }>(
  loadContent: (path: string) => Promise<T | null>,
): ContentGuard<T>
interface ContentGuard<T> { loadContent: (path: string) => Promise<T | null>; ContentGuard: FC; }

function PasswordDialog(props: PasswordDialogProps): JSX.Element
interface PasswordDialogProps {
  payload: EncryptedPayload;
  onUnlock: (plaintext: string, password: string) => void;
  onClose: () => void;
}

async function decryptContent(payload: EncryptedPayload, password: string): Promise<string>
interface EncryptedPayload { encrypted: string; authTag: string; salt: string; iv: string; }
```

`createContentGuard(loadContent)` wraps the generated loader: if a page's `contentHtml` parses as an `EncryptedPayload`, it tries a session-cached password (`sessionStorage["docs-guard-pwd"]`), else prompts via `<ContentGuard />` (mount once, may sit outside `<DocsProvider>`). On success it decrypts the `{ html, headings }` envelope, restores `contentHtml` and `pageData.headings`; on dismissal it returns a built-in "Access Denied" HTML block. Mounting multiple `<ContentGuard>` instances warns: `[@swifty.js/docs] Multiple <ContentGuard> instances mounted — only the most recent one will receive unlock requests.` `decryptContent` uses WebCrypto: PBKDF2 SHA-256, 100_000 iterations, AES-GCM 256.

## `@swifty.js/docs/compiler`

```ts
async function compileMarkdown(source: string, options: CompileMarkdownOptions): Promise<string>
interface CompileMarkdownOptions { config: DocsConfig; filePath: string; projectRoot?: string; }
```

Compiles a `.md` source string into a **JS module string** exporting `pageData` and `contentHtml`. `contentHtml` is emitted via `JSON.stringify` (safe escaping). Async because the first call lazy-loads the Shiki WASM + grammars; the highlighter is cached per theme+langs key (concurrent calls share the init promise; rejected inits are dropped so a fixed config can retry).

## `@swifty.js/docs/vite`

```ts
function swiftyDocsPlugin(options: SwiftyDocsVitePluginOptions): Plugin[] // [swifty-docs, base-sync, spa-fallback, ...react()]
function docsGuardPlugin(): Plugin                                        // enforce "post"
interface SwiftyDocsVitePluginOptions { config: DocsConfig; debug?: boolean; }
// re-exports: defineConfig, scanDocsDir, generateSidebar; types DocsConfig, SidebarConfig
```

Full plugin behavior, error/warning strings, and generation semantics are in `references/configuration.md`.

## Lifecycle summary

1. **Config load:** `defineConfig()` scans + generates `.swifty-docs/generated/index.js` (side effect, synchronous).
2. **Build/dev:** `swiftyDocsPlugin` intercepts `.md` → `compileMarkdown` (async, Shiki lazy); `docsGuardPlugin` optionally encrypts protected pages; `@vitejs/plugin-react` compiles JSX; `base-sync` sets `base`; `spa-fallback` emits `404.html` on build.
3. **Runtime mount:** `createRoot(...).render(<><guard.ContentGuard/><DocsProvider …><LocationProvider><DocsLayout/></LocationProvider></DocsProvider></>)`.
4. **Navigation:** `LocationProvider` updates `path` → `DocsLayout` effect calls `loadContent(path)` → `ContentRenderer` injects HTML + mounts TOC/mermaid/copy roots. Search index and mermaid load lazily on first use.
5. **Dev HMR:** editing a page fires `onContentUpdate` → in-place content refresh + search-index invalidation; adding/removing a page triggers a full reload with a "restart the dev server" log.
