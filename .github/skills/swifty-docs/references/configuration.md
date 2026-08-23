# Configuration Reference

Source of truth: `src/types.ts`, `src/define-config.ts`, `src/scanner.ts`, `src/sidebar-generator.ts`, `src/vite.ts`, `src/utils/page-data.ts`, `src/utils/route-sorting.ts`, `src/utils/derive-title.ts`, `src/markdown/frontmatter.ts`, `src/file-content.ejs`, `src/client.d.ts`.

## `DocsConfig`

The full config interface (`src/types.ts`). `docs`, `baseUrl`, and `title` are required by the type; `defineConfig` does not fill defaults itself — the values below are the documented conventions and the fallbacks applied downstream.

| Field       | Type                            | Default (convention) | Notes                                                          |
| ----------- | ------------------------------- | -------------------- | ------------------------------------------------------------- |
| `docs`      | `string`                        | `"docs"`             | Docs source dir; relative resolved against `projectRoot` (`process.cwd()`). Absolute paths used as-is. |
| `baseUrl`   | `string`                        | `"/docs/"`           | URL prefix for all generated routes. Also fed to Vite `base` by the base-sync plugin. |
| `title`     | `string`                        | (required)           | Site title in navbar; used in `document.title` as `` `${page} · ${title}` ``. |
| `nav`       | `NavItem[]`                     | `[]`                 | Top navbar items. Internal links get `baseUrl` prepended.     |
| `sidebar`   | `Record<string, SidebarConfig>` | `{}`                 | Per-path-prefix sidebar. Value is `"auto"` or `SidebarItem[]`. |
| `markdown`  | `MarkdownOptions`               | `{}`                 | Anchor + container options.                                   |
| `highlight` | `HighlightOptions`              | `undefined`          | Shiki options. When omitted, code blocks fall back to plain escaped `<pre>`. |
| `search`    | `boolean`                       | `true`               | Built-in MiniSearch palette. `false` removes the trigger and dialog. `false` is forwarded explicitly through generation (it must survive). |

### `NavItem`

```ts
interface NavItem { text: string; link: string; }
```

### `SidebarConfig` / `SidebarItem`

```ts
type SidebarConfig = "auto" | SidebarItem[];
interface SidebarItem {
  text: string;
  link?: string;       // optional for group headers
  collapsed?: boolean; // group starts collapsed; default false
  items?: SidebarItem[];
}
```

`"auto"` generates from the filesystem for the prefix (matched against `joinBase(baseUrl, prefix)`); an explicit array is used verbatim, with `baseUrl` prepended to each `link` (recursively).

### `MarkdownOptions`

```ts
interface MarkdownOptions {
  anchor?: { permalink?: boolean };                 // default permalink: true (h1–h3)
  containers?: Record<string, { label: string }>;  // custom labels for tip/warning/danger/details
}
```

### `HighlightOptions`

```ts
interface HighlightOptions {
  theme?: string;      // default "github-dark" (DEFAULT_THEME in highlighter.ts)
  darkTheme?: string;  // when set → dual-theme output (--shiki-light / --shiki-dark)
  languages?: string[];// default: ~45 common web languages (DEFAULT_LANGUAGES)
}
```

`DEFAULT_LANGUAGES` (used when `languages` is unset/empty): `bash, cjs, css, csv, cts, docker, dockerfile, dotenv, go, graphql, html, http, javascript, js, json, json5, jsonc, jsonl, jsx, less, make, makefile, markdown, md, mdc, mdx, mermaid, mjs, mts, nginx, prisma, proto, protobuf, scss, sql, toml, tsx, typescript, vue, wasm, xml, yaml, yml, zsh`. Languages not loaded fall back to the `text` grammar; any Shiki error falls back to `<pre class="shiki"><code>…escaped…</code></pre>`.

## `defineConfig(config, projectRoot?)`

```ts
function defineConfig(config: DocsConfig, projectRoot: string = process.cwd()): DocsConfig
```

Returns `config` unchanged **and** triggers generation (`generateRoutesFile`) as a side effect at Vite config-load time. `projectRoot` controls resolution of `config.docs` and the `.swifty-docs/generated/` output. Import it from `@swifty.js/docs/vite` (Node-safe subpath — does not pull in the browser theme).

### `joinBase` (automatic baseUrl prefixing)

Internal `nav[].link`, manual sidebar `link`s, and `"auto"` sidebar prefixes pass through `joinBase(baseUrl, link)`, which is idempotent and conservative:
- Absolute URLs with a scheme (`https://…`), protocol-relative (`//…`), and hash links (`#…`) pass through unchanged.
- Relative paths (`guide/intro`) are made absolute (`/guide/intro`) then prefixed.
- Links already starting with `baseUrl` are not double-prefixed.
- With `baseUrl` `""` or `"/"`, links are only made absolute.

So `baseUrl: "/my-site/"` + `nav: [{ text, link: "/guide/intro" }]` → `/my-site/guide/intro`.

## Scanner — `scanDocsDir(docsDir, baseUrl): DocsRoute[]`

Recursive filesystem walk producing `DocsRoute` entries. Rules:
- Skips entries whose name starts with `_` or `.`; skips `node_modules` and `dist` directories.
- Sorts each directory's entries by **codepoint** (`a.name < b.name`) for cross-platform stability — not `localeCompare`.
- `index.md` maps to the directory path **without trailing slash** (root `index.md` → `/docs`, subdir → `/docs/guide`). Root with empty base → `/`.
- Other `.md` files map to their stem (`/docs/guide/config`).
- Directories without an `index.md` get a **virtual directory-index route** (`isDirectoryIndex: true`) pointing at the first child page (by `getFirstRoute`/`sortDocsRoutes`), so `/docs/guide` serves content even without `guide/index.md`. These are excluded from the sidebar and search.
- `protected: true` frontmatter sets `isProtected: true`.
- Route collisions (two files → same path) log a warning; the last entry wins:
  `[@swifty.js/docs] route collision: "<path>" is produced by both <a> and <b> — the latter wins. Rename one of them.`

`DocsRoute`:
```ts
interface DocsRoute {
  path: string;       // full route incl. baseUrl, no trailing slash
  filePath: string;   // absolute .md path
  pageData: PageData;
  isDirectoryIndex?: boolean;
  isProtected?: boolean;
}
```

## Sidebar generation — `generateSidebar(routes, prefix): SidebarItem[]`

- Filters to routes under `prefix` (equal to or starting with `prefix + "/"`); excludes `isDirectoryIndex` routes.
- Groups by first subdirectory segment; root-level pages become top-level items, subdirectories become collapsible groups (`collapsed: false`, title from `humanizeName(groupKey)`).
- Within each group, `sortDocsRoutes` applies an **all-or-nothing `sidebar_position` rule**: if *every* route in the group has `sidebarPosition`, sort by position ascending then filename; if *any* is missing it, sort by filename only.
- Item text = `pageData.sidebarLabel || pageData.title`.

## Title & metadata — `buildPageData` (shared by scanner + compiler)

`buildPageData(frontmatter, content, relativePath)` runs a single markdown parse (`extractPageMeta`) and builds `PageData`:

| PageData field    | Resolution                                                                          |
| ----------------- | ----------------------------------------------------------------------------------- |
| `title`           | `frontmatter.title` (scalar-coerced) → first `# h1` in body → `deriveTitleFromPath`. |
| `description`     | `frontmatter.description` (scalar-coerced) → `deriveTitleFromPath`.                  |
| `excerpt`         | Plain-text body (headings excluded), collapsed whitespace, sliced to **200 chars**. |
| `sidebarPosition` | `frontmatter.sidebar_position` coerced to a finite number (accepts numeric strings like `"3"`). |
| `sidebarLabel`    | `frontmatter.sidebar_label` (scalar-coerced) or `undefined`.                        |
| `headings`        | h2/h3 only, `{ level, text, slug }`, slugs deduped per document.                    |
| `relativePath`    | Path relative to the docs dir, forward-slashed.                                     |

Frontmatter scalars are coerced with Zod (`title: 123` → `"123"`); objects/arrays fail and fall through to the fallback chain. `deriveTitleFromPath`: `index.md` → parent directory name humanized (no parent → `"Home"`); other files → stem with dashes/underscores → spaces, words title-cased.

`PageData` / `HeadingInfo` (`src/types.ts`):
```ts
interface PageData {
  title: string; description?: string; excerpt: string;
  sidebarPosition?: number; sidebarLabel?: string;
  headings: HeadingInfo[]; relativePath: string;
}
interface HeadingInfo { level: number; text: string; slug: string; } // level 2 or 3
```

## Frontmatter

YAML delimited by `---` (`src/markdown/frontmatter.ts`, a minimal js-yaml wrapper). The closing `---` must be at line start; trailing spaces/tabs tolerated; an empty block (`---\n---`) is handled; malformed YAML returns empty data + full source. `FrontmatterResult` = `{ data: Record<string, unknown>; content: string }`. Recognized keys:

| Key                | Type      | Effect                                                              |
| ------------------ | --------- | ------------------------------------------------------------------- |
| `title`            | string    | Page title (top of resolution chain).                               |
| `description`      | string    | Meta description + search fallback text.                            |
| `sidebar_position` | number    | Sort order (all-or-nothing rule per group).                         |
| `sidebar_label`    | string    | Override sidebar display text.                                      |
| `protected`        | boolean   | Marks the page for `docsGuardPlugin` encryption. Any YAML-truthy `true` (`true`, `True`, `yes`, `on`) counts — the guard uses the same YAML parse as the scanner. |

## Vite plugins (`src/vite.ts`)

`swiftyDocsPlugin(options: { config: DocsConfig; debug?: boolean }): Plugin[]` returns, in order:

1. **`swifty-docs`** (`enforce: "pre"`) — `configureServer` adds the docs dir to the watcher and full-reloads on `.md` add/unlink with a log:
   `[@swifty.js/docs] <file> added/removed — restart the dev server to regenerate routes and sidebar.`
   `resolveId` appends `?swifty-docs` to `.md` imports (skips `node_modules` and Vite `?raw`/`?url`/`?inline` queries; strips `/@fs` prefix). `load` reads the file and runs `compileMarkdown()` (defaults `projectRoot` to `process.cwd()`, intentionally not Vite's root, so both pipelines resolve the docs dir identically).
2. **`swifty-docs:base-sync`** — sets Vite `base` from `config.baseUrl` when the user hasn't set one.
3. **`swifty-docs:spa-fallback`** (`apply: "build"`) — after build, copies `index.html` to `404.html` if absent, restoring deep links/refreshes for the history router on static hosts (GitHub Pages). A user `public/404.html` takes precedence.
4. **`...react()`** — the spread `@vitejs/plugin-react` plugins, which compile the theme's JSX and your `.tsx`. (No separate React plugin is needed.)

### `docsGuardPlugin(): Plugin` (`enforce: "post"`)

Registered separately. Reads `DOCS_PASSWORD` from `process.env` at plugin creation.
- **Without `DOCS_PASSWORD`:** a no-op that warns for any protected page:
  `[@swifty.js/docs] <file> has "protected: true" but DOCS_PASSWORD is not set — the page will be published UNENCRYPTED.`
- **With `DOCS_PASSWORD`:** in `transform`, for pages whose frontmatter `protected === true`, it locates `export const contentHtml = "…"`, JSON-parses it, and encrypts a `{ html, headings }` envelope with **AES-256-GCM**: `pbkdf2Sync(password, salt(16B), 100_000, 32, "sha256")`, random 12-byte IV, output `{ encrypted, authTag, salt, iv }` all base64. It then rewrites `contentHtml` to the JSON payload and scrubs `pageData` (`description = undefined`, `excerpt = ""`, `headings = []`) so protected content never enters the search index (`headings` are encrypted in the envelope so the Toc can be restored after unlock; `title` stays, already visible in the sidebar). Warnings if it cannot locate/parse:
  `[@swifty.js/docs] could not locate contentHtml in <file> — page left UNENCRYPTED.`
  `[@swifty.js/docs] could not sanitize pageData in <file> — protected excerpt/headings may leak into the search index.`

Client-side decryption uses WebCrypto (`src/utils/guard.ts`): PBKDF2 SHA-256 100_000 iterations, AES-GCM 256. See `createContentGuard`/`PasswordDialog` in `references/api.md`.

## Environment variables

- **`DOCS_PASSWORD`** — build-time secret read by `docsGuardPlugin()`. Set → protected pages are encrypted; unset → protected pages ship as plain HTML (with a warning). This is the only env var the package reads.

## Generated module contract (`@swifty-docs/generated`)

`defineConfig` writes `{projectRoot}/.swifty-docs/generated/index.js` from `file-content.ejs`. It is byte-stable (no timestamp — clean git status, cacheable). Exports:

- **`loadContent(path): Promise<{ pageData, contentHtml } | null>`** — dynamic-imports the compiled `.md` module for a route. Normalizes the path (strips trailing slashes and `/index`, `/index.md`, `/index.html`). Returns `null` for unknown paths. Checks a dev-only `_freshModules` cache first (HMR).
- **`docsConfig`** — the runtime site config: `{ title, baseUrl, nav (prefixed), sidebar, search? }`. `docs` is omitted; `search` is included only when set in config.
- **`getSearchIndex(): Promise<SearchEntry[]>`** — lazily loads every non-virtual, non-protected `.md` module (filtered through `_searchablePaths`) on first call and returns one entry per page: `{ title, link, excerpt, contentHtml }`. Cached in `_searchIndex`; reset on md hot update.
- **`onContentUpdate(cb): () => void`** — dev-only; subscribes to md hot updates, `cb` receives changed route paths. No-op in production. Backed by `import.meta.hot.accept` over per-specifier deps; on edit it caches the fresh module in `_freshModules`, resets `_searchIndex`, and notifies subscribers.

> **Doc/source gap:** the package README lists a `routes: Record<string,string>` export from the generated module. The current `file-content.ejs` does **not** emit `routes`; it emits `loadContent`, `docsConfig`, `getSearchIndex`, and `onContentUpdate`. Treat `file-content.ejs` + `src/client.d.ts` as authoritative.

The ambient type declaration lives in `src/client.d.ts` (shipped as `@swifty.js/docs/client`, types-only) and declares `loadContent`, `docsConfig`, `getSearchIndex`, `onContentUpdate`, and the `SearchEntry` interface. Reference it via `/// <reference types="@swifty.js/docs/client" />`.
