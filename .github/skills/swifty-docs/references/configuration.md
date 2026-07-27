# Configuration Reference

All facts verified against `src/types.ts`, `src/define-config.ts`, `src/scanner.ts`, `src/sidebar-generator.ts`, and the package's own `swifty-docs.config.ts`.

## DocsConfig (src/types.ts)

```ts
interface DocsConfig {
  docs: string; // docs source dir, relative to projectRoot. Default "docs"
  baseUrl: string; // route prefix, e.g. "/docs/". Default "/docs/"
  title: string; // required — navbar title
  description?: string; // meta description. Default ""
  nav?: NavItem[]; // top navbar items
  sidebar?: Record<string, SidebarConfig>; // per-path-prefix sidebar
  markdown?: MarkdownOptions;
  highlight?: HighlightOptions; // Shiki; omit to disable highlighting
  search?: boolean; // enable the built-in MiniSearch palette. Default true
}

interface NavItem {
  text: string;
  link: string;
  items?: NavItem[];
}

type SidebarConfig = "auto" | SidebarItem[];

interface SidebarItem {
  text: string;
  link?: string; // optional for group headers
  collapsed?: boolean; // group starts collapsed. Default false
  items?: SidebarItem[];
}

interface MarkdownOptions {
  anchor?: { permalink?: boolean }; // default true, h1–h3 get a "#" permalink
  containers?: Record<string, { label: string }>; // keys: tip, warning, danger, details
}

interface HighlightOptions {
  theme?: string; // Shiki theme. Default "github-dark"
  darkTheme?: string; // enables dual-theme --shiki-light/--shiki-dark tokens
  languages?: string[]; // grammars to load; unknown langs fall back to "text"
}
```

Canonical example (the package's own config):

```ts
import { defineConfig } from "@swifty.js/docs/vite";

export default defineConfig({
  docs: "docs",
  baseUrl: "/swifty/",
  title: "Swifty Docs",
  description: "@swifty.js/docs -- Documentation site generator",
  nav: [{ text: "Guide", link: "/swifty/guide/" }],
  sidebar: { "/swifty/guide/": "auto" },
  highlight: { theme: "github-light", darkTheme: "github-dark" },
  search: true,
});
```

## defineConfig(config, projectRoot = process.cwd())

Identity function with a generation side effect (`src/define-config.ts`):

1. Resolves `config.docs` against `projectRoot` (absolute paths pass through).
2. `scanDocsDir(docsDir, baseUrl)` → `DocsRoute[]`.
3. For each sidebar prefix set to `"auto"`, runs `generateSidebar(routes, prefix)`; explicit arrays pass through unchanged.
4. Renders `src/file-content.ejs` and writes `.swifty-docs/generated/index.js`.

The generated module uses **relative** dynamic-import specifiers (portable across machines/CI), is byte-stable (no timestamp — unchanged content yields identical output), and exports:

- `loadContent(path)` — `Promise<{ pageData, contentHtml } | null>`; dynamic import of the compiled `.md` module for a route.
- `docsConfig` — runtime config: `{ title, description, baseUrl, nav, sidebar, search? }` (`docs` dir is stripped; `search` is forwarded whenever set — including `false`, which must survive to disable the palette).
- `getSearchIndex()` — lazily loads every non-virtual `.md` module on first call, filtered through `_searchablePaths` (virtual directory-index routes AND `protected: true` pages excluded), returns `SearchEntry[]`.

Because generation runs at config-load time, adding or removing `.md` files requires reloading the Vite config (restart dev server).

## Scanner rules (scanDocsDir)

`scanDocsDir(docsDir: string, baseUrl: string, options?: { excludeDrafts?: boolean }): DocsRoute[]`

- Recursive scan; skips entries starting with `_` or `.`, plus `node_modules`, `__tests__`, `__fixtures__`, `.git`, `.vitepress`, `.swifty-docs`, `dist`.
- Directory entries are codepoint-sorted before walking, so route and sidebar-group order is deterministic across platforms/filesystems/locales.
- `index.md` maps to the directory route without trailing `/`.
- Directories with no `index.md` get a **virtual index route** (`isDirectoryIndex: true`) pointing at the first page (by `sidebar_position`, then filename); virtual routes are excluded from the sidebar and search index.
- Route collisions (e.g. `guide.md` + `guide/index.md` both mapping to `/guide`) emit a `console.warn` (`"route collision: ..."`) — the last route wins in the generated loaders map.
- `protected: true` frontmatter (YAML-parsed, so `True`/`yes` count) sets `isProtected` on the route, excluding it from the search index.
- `excludeDrafts` drops pages with truthy `draft` frontmatter.

## Sidebar generation (generateSidebar)

`generateSidebar(routes: DocsRoute[], prefix: string): SidebarItem[]`

- Groups routes by subdirectory under the prefix.
- Sort: `sidebarPosition` frontmatter, then title. **All-or-nothing rule**: if any page in a group lacks `sidebar_position`, the whole group sorts by filename only.
- `sidebar_label` frontmatter overrides display text.

## Frontmatter

YAML between `---` delimiters, parsed with js-yaml. The closing `---` must sit at line start (values containing `---` are safe); trailing spaces/tabs after it are tolerated; empty blocks (`---\n---`) work.

| Field              | Type    | Effect                                                                             |
| ------------------ | ------- | ---------------------------------------------------------------------------------- |
| `title`            | string  | Page title (also navbar/search). Scalars are coerced (`title: 123` → `"123"`)      |
| `description`      | string  | Meta/search description                                                            |
| `sidebar_position` | number  | Sort order (lower = higher). Quoted numbers (`"3"`) are accepted                   |
| `sidebar_label`    | string  | Sidebar display override                                                           |
| `draft`            | boolean | Truthy value marks the page a draft; excluded via `excludeDrafts`                  |
| `protected`        | boolean | Page is encrypted by `docsGuardPlugin` (requires `DOCS_PASSWORD`) and unsearchable |

All coercion happens in the shared `buildPageData()` (`src/utils/page-data.ts`) — the scanner and compiler use the same helper, so sidebar labels and compiled page titles can never disagree.

Title resolution chain: frontmatter `title` → first `# heading` in the body (headings inside fenced code blocks ignored) → filename-derived (`index.md` uses title-cased parent dir name; other files use the stem with dashes→spaces). Root `index.md` falls back to `"Home"`.

## PageData (emitted per page)

```ts
interface PageData {
  title: string;
  description?: string;
  excerpt: string; // plain-text excerpt for search indexing
  sidebarPosition?: number;
  sidebarLabel?: string;
  draft?: boolean;
  headings: HeadingInfo[]; // h2/h3 for the TOC: { level, text, slug }
  relativePath: string; // relative to the docs dir
}
```

## Runtime validation (DocsProvider boundary)

`src/theme/lib/content.ts` defines Zod schemas. `DocsProvider` safe-parses `config` (fallback: `{ title: "Documentation", baseUrl: "/" }` with a console warning), and checks `loadContent` / `getSearchIndex` are functions (null + warning otherwise). Invalid inputs never throw — the site degrades gracefully.
