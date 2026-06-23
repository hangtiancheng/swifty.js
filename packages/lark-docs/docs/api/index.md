---
title: "API Reference"
description: "Complete public API for @lark.js/docs"
sidebar_position: 1
---

# API Reference

This page documents every public export from `@lark.js/docs`. All types are re-exported from the main entry point for convenience.

## Entry Points

| Import path              | Description                                         |
| ------------------------ | --------------------------------------------------- |
| `@lark.js/docs`          | Main barrel -- all exports                          |
| `@lark.js/docs/vite`     | Vite plugin + `defineConfig` + build-time utilities |
| `@lark.js/docs/webpack`  | Webpack plugin and loader                           |
| `@lark.js/docs/rspack`   | Rspack plugin and loader                            |
| `@lark.js/docs/compiler` | `compileMarkdown` function                          |
| `@lark.js/docs/runtime`  | `searchDocs`, `slugify` runtime helpers             |
| `@lark.js/docs/theme`    | `registerThemeViews`, view factories, icons         |
| `@lark.js/docs/client`   | Types-only: ambient module declarations             |

The `/vite`, `/webpack`, and `/rspack` sub-paths re-export build-time utilities (`scanDocsDir`, `generateRouteMap`, `generateSidebar`, `buildSearchIndex`, `defineConfig`) to avoid pulling in the main entry's `lucide-static` SVG `?raw` imports, which are not valid in Node.js contexts.

The `/client` sub-path is types-only (no runtime code). It ships `client.d.ts` which provides `declare module "@lark-docs/generated"` and `declare module "*.html"` ambient declarations. Consumer projects reference it via `/// <reference types="@lark.js/docs/client" />` in their `shims.d.ts`.

## Configuration

### `defineConfig`

```ts
import { defineConfig } from "@lark.js/docs/vite";

function defineConfig(config: DocsConfig, projectRoot?: string): DocsConfig;
```

Type-safe identity function. Returns the argument unchanged. When called, also triggers route generation: scanning the docs directory, building sidebar trees, and writing the generated module to `.lark-docs/generated/index.js`.

The optional `projectRoot` parameter controls path resolution for the `docs` directory and the generated output. Defaults to `process.cwd()`.

### `DocsConfig`

```ts
interface DocsConfig {
  docs: string; // docs source directory (relative to project root)
  baseUrl: string; // URL prefix for all routes
  routeMode: "history" | "hash"; // routing mode
  title: string; // site title (navbar)
  description?: string; // site description
  lang?: string; // language code (default: "en-US")
  nav?: NavItem[]; // top navigation items
  sidebar?: Record<string, SidebarConfig>; // sidebar per prefix
  markdown?: MarkdownOptions; // markdown processing
  highlight?: HighlightOptions; // Shiki highlighting
  search?: SearchOptions; // search configuration
}
```

### `NavItem`

```ts
interface NavItem {
  text: string; // display text
  link: string; // URL (internal or external)
  items?: NavItem[]; // nested dropdown items
}
```

### `SidebarConfig`

```ts
type SidebarConfig = "auto" | SidebarItem[];
```

`"auto"` generates the sidebar from the directory structure. An explicit `SidebarItem[]` uses those items directly.

### `SidebarItem`

```ts
interface SidebarItem {
  text: string; // display text
  link?: string; // URL (optional for group headers)
  collapsed?: boolean; // whether group starts collapsed (default: false)
  items?: SidebarItem[]; // child items (for groups)
  isActive?: boolean; // runtime: matches current route
}
```

### `MarkdownOptions`

```ts
interface MarkdownOptions {
  lineNumbers?: boolean; // reserved (not yet implemented)
  anchor?: { permalink?: boolean }; // heading anchor config
  toc?: { level?: number[] }; // TOC extraction levels
  containers?: Record<string, { label: string }>; // custom container labels
}
```

| Option             | Default  | Description                                            |
| ------------------ | -------- | ------------------------------------------------------ |
| `lineNumbers`      | `false`  | Reserved for future line number support                |
| `anchor.permalink` | `true`   | Add `#` permalink after h1-h3 headings                 |
| `toc.level`        | `[2, 3]` | Heading levels included in the TOC                     |
| `containers`       | `{}`     | Override default labels for tip/warning/danger/details |

### `HighlightOptions`

```ts
interface HighlightOptions {
  theme?: string; // Shiki theme (default: "github-dark")
  languages?: string[]; // languages to load
}
```

When `highlight` is omitted from the config, code blocks render as plain escaped text with DaisyUI fallback styling.

### `SearchOptions`

```ts
interface SearchOptions {
  provider: "local" | "docsearch" | "none";
}
```

| Provider      | Description                                            |
| ------------- | ------------------------------------------------------ |
| `"local"`     | Built-in modal dialog with MiniSearch engine (default) |
| `"docsearch"` | Algolia DocSearch widget backed by local index         |
| `"none"`      | Disable search entirely                                |

## Theme

### `registerThemeViews`

```ts
import { registerThemeViews } from "@lark.js/docs/theme";

function registerThemeViews(ViewClass: typeof View): void;
```

Registers all four theme views (layout, sidebar, TOC, search) with the lark-mvc view registry. Imports the `.html` templates internally so consumers don't need to handle them. Call this once in `boot.ts` before `Framework.boot()`.

```ts
import { View } from "@lark.js/mvc";
import { registerThemeViews } from "@lark.js/docs/theme";

registerThemeViews(View);
```

### View Factories

```ts
import {
  createDocsLayoutView,
  createSidebarView,
  createTocView,
  createSearchView,
} from "@lark.js/docs/theme";
import { View as ViewClass } from "@lark.js/mvc";

function createDocsLayoutView(
  View: typeof ViewClass,
  template: unknown,
): unknown;
function createSidebarView(View: typeof ViewClass, template: unknown): unknown;
function createTocView(View: typeof ViewClass, template: unknown): unknown;
function createSearchView(View: typeof ViewClass, template: unknown): unknown;
```

Each factory takes the lark-mvc `View` class and a compiled HTML template, returning a View subclass. Register the result with `registerViewClass()`. These are available for advanced customization -- most users should use `registerThemeViews()` instead.

### `createLocalSearchClient`

```ts
import { createLocalSearchClient } from "@lark.js/docs/theme";

function createLocalSearchClient(index: SearchEntry[]): {
  search(
    requests: Array<{
      indexName: string;
      params: { query: string; hitsPerPage?: number };
    }>,
  ): Promise<{ results: unknown[] }>;
};
```

Creates an Algolia-compatible search client backed by the local index. Used by the DocSearch provider's `transformSearchClient`.

### `icons`

```ts
import { icons } from "@lark.js/docs/theme";

const icons: { search: string };
```

Icon registry. Each value is a complete `<svg>...</svg>` markup string from `lucide-static`. Icons inherit `currentColor`.

## Build-Time Functions

### `scanDocsDir`

```ts
import { scanDocsDir } from "@lark.js/docs";

function scanDocsDir(
  docsDir: string,
  baseUrl: string,
  options?: { excludeDrafts?: boolean },
): DocsRoute[];
```

Recursively walks the docs directory, reads each `.md` file, extracts frontmatter and headings, and returns route entries.

Skipped entries:

- Files/directories starting with `_` or `.`
- `node_modules`, `__tests__`, `__fixtures__`, `.git`, `.vitepress`, `.lark-docs`, `dist`

### `generateRouteMap`

```ts
import { generateRouteMap } from "@lark.js/docs";

function generateRouteMap(routes: DocsRoute[]): Record<string, string>;
```

Converts route entries to a path-to-viewId map for `FrameworkConfig.routes`.

### `generateBootModule`

```ts
import { generateBootModule } from "@lark.js/docs";

function generateBootModule(routes: DocsRoute[]): string;
```

Generates a JS module source string that imports all compiled views and registers them with `registerViewClass()`.

### `generateSidebar`

```ts
import { generateSidebar } from "@lark.js/docs";

function generateSidebar(
  routes: DocsRoute[],
  prefix: string,
  baseUrl: string,
): SidebarItem[];
```

Auto-generates sidebar items for routes under a given prefix.

Grouping rules:

1. Routes grouped by subdirectory under the prefix
2. Root-level items processed first
3. Subdirectory groups become collapsible sections
4. Items sorted by `sidebar_position`, then alphabetically

### `buildSearchIndex`

```ts
import { buildSearchIndex } from "@lark.js/docs";

function buildSearchIndex(routes: DocsRoute[]): SearchEntry[];
```

Builds search entries from all non-draft routes. Each entry contains `title`, `link`, `headings`, and `excerpt` (from frontmatter description).

### `emitSearchIndexModule`

```ts
import { emitSearchIndexModule } from "@lark.js/docs";

function emitSearchIndexModule(index: SearchEntry[]): string;
```

Serializes the search index as a JS module string: `export default [...];`

## Compiler

### `compileMarkdown`

```ts
import { compileMarkdown } from "@lark.js/docs/compiler";

async function compileMarkdown(
  source: string,
  options: CompileMarkdownOptions,
): Promise<string>;
```

Compiles a `.md` source string into a JS module that exports `pageData` (metadata object) and `contentHtml` (rendered HTML string).

Pipeline:

1. Extract YAML frontmatter
2. Create markdown-it parser with four plugins (anchors, TOC, containers, code blocks)
3. Initialize Shiki highlighter (async, singleton-cached)
4. Parse tokens and render to HTML
5. Build page metadata (title, headings, description)
6. Emit JS module string exporting `{ pageData, contentHtml }`

### `CompileMarkdownOptions`

```ts
interface CompileMarkdownOptions {
  config: DocsConfig; // full docs config
  filePath: string; // absolute path to the .md file
  debug?: boolean; // enable debug line markers
}
```

## Markdown Processing

### `createParser`

```ts
import { createParser } from "@lark.js/docs";

function createParser(options?: MarkdownOptions): MarkdownIt;
```

Creates a configured `markdown-it` instance with all four plugins:

1. **Anchors** -- heading IDs and `#` permalinks
2. **TOC** -- `[[toc]]` directive
3. **Containers** -- `::: tip/warning/danger/details`
4. **Code blocks** -- fence renderer override

Base configuration:

- `html: true` -- raw HTML passthrough
- `linkify: true` -- auto-detect URLs
- `typographer: false`

### `extractFrontmatter`

```ts
import { extractFrontmatter } from "@lark.js/docs";

function extractFrontmatter(source: string): FrontmatterResult;
```

Parses YAML frontmatter from a markdown source string. Returns `{ data, content }` where `data` is the parsed YAML object and `content` is the markdown with frontmatter stripped.

Graceful degradation: returns empty data on malformed YAML or missing frontmatter.

### `FrontmatterResult`

```ts
interface FrontmatterResult {
  data: Record<string, unknown>; // parsed YAML key-value pairs
  content: string; // markdown with frontmatter removed
}
```

### `renderToLarkTemplate`

```ts
import { renderToLarkTemplate } from "@lark.js/docs";

function renderToLarkTemplate(tokens: Token[], md: MarkdownIt): string;
```

Renders markdown-it tokens to an HTML string using the configured renderer rules.

### `getHighlighter`

```ts
import { getHighlighter } from "@lark.js/docs";

async function getHighlighter(
  theme?: string,
  languages?: string[],
): Promise<Highlighter>;
```

Returns a cached Shiki highlighter singleton. On first call, loads WASM and TextMate grammars (async, ~200-800ms). Subsequent calls return the cached instance instantly.

### `highlightCode`

```ts
import { highlightCode } from "@lark.js/docs";

function highlightCode(
  hl: Highlighter,
  code: string,
  lang: string,
  theme?: string,
): string;
```

Highlights a code string using the Shiki highlighter. Falls back to escaped plain text on unsupported languages or error.

## Runtime Helpers

### `searchDocs`

```ts
import { searchDocs } from "@lark.js/docs/runtime";

function searchDocs(
  index: SearchEntry[],
  query: string,
  limit?: number, // default: 20
): SearchEntry[];
```

Client-side full-text search with scored ranking.

Scoring per term: title = 10pts, heading = 5pts, excerpt = 1pt. AND logic across all terms. Per-field boundary checking prevents false matches spanning field boundaries. Results sorted by score descending, then alphabetically by title.

### `slugify`

```ts
import { slugify } from "@lark.js/docs/runtime";

function slugify(text: string): string;
```

Converts text to a URL-safe slug. Lowercases, removes non-word characters (except spaces and dashes), replaces whitespace with dashes, collapses consecutive dashes.

## Bundler Plugins

### Vite Plugin

```ts
import { larkDocsPlugin } from "@lark.js/docs/vite";

function larkDocsPlugin(options: {
  config: DocsConfig;
  debug?: boolean;
}): Plugin;
```

Vite plugin with `enforce: "pre"`. Intercepts `.md` imports, marks them with `?lark-docs` suffix, and compiles them via `compileMarkdown()`.

### Webpack Plugin and Loader

```ts
import { LarkDocsPlugin, larkDocsLoader } from "@lark.js/docs/webpack";

class LarkDocsPlugin {
  constructor(options: {
    config: DocsConfig;
    debug?: boolean;
    test?: RegExp; // default: /\.md$/
    exclude?: RegExp; // default: /node_modules/
  });
}

function larkDocsLoader(this: LoaderContext, source: string): void;
```

The plugin pushes a loader rule onto `compiler.options.module.rules`. The loader uses `this.callback()` for async delivery (Webpack 5 convention). Self-references via `__filename` to resolve the loader path.

### Rspack Plugin and Loader

```ts
import { LarkDocsPlugin, larkDocsLoader } from "@lark.js/docs/rspack";

class LarkDocsPlugin {
  constructor(options: {
    config: DocsConfig;
    debug?: boolean;
    test?: RegExp;
    exclude?: RegExp;
  });
}

async function larkDocsLoader(source: string): Promise<string>;
```

Same as Webpack, but the loader returns a `Promise<string>` directly (Rspack async loader convention).

## Data Types

### `DocsRoute`

```ts
interface DocsRoute {
  path: string; // full route path (e.g. "/docs/guide")
  viewId: string; // view ID for registerViewClass
  filePath: string; // absolute file path to .md source
  pageData: PageData; // extracted page metadata
}
```

### `PageData`

```ts
interface PageData {
  title: string; // page title
  description?: string; // from frontmatter
  sidebarPosition?: number; // sort position (all-or-nothing rule: if any page lacks it, all sort by filename)
  sidebarLabel?: string; // override sidebar text
  sidebarGroup?: string; // group assignment
  draft?: boolean; // exclude from production
  headings: HeadingInfo[]; // h2/h3 headings for TOC
  relativePath: string; // path relative to docs dir
  lastUpdated?: number; // mtime in ms (scanner only)
}
```

### `HeadingInfo`

```ts
interface HeadingInfo {
  level: number; // 2 for h2, 3 for h3
  text: string; // plain text content
  slug: string; // URL-safe anchor id
}
```

### `SearchEntry`

```ts
interface SearchEntry {
  title: string; // page title
  link: string; // route link
  headings: string[]; // all heading texts
  excerpt: string; // description or filename-derived title
}
```

### `SidebarData`

```ts
interface SidebarData {
  items: SidebarItem[];
  currentPath: string;
}
```

### `TocData`

```ts
interface TocData {
  headings: HeadingInfo[];
  activeSlug?: string; // currently visible heading
}
```

## Generated Module Types

The `@lark-docs/generated` module (ambient declaration via `@lark.js/docs/client`) exports:

```ts
declare module "@lark-docs/generated" {
  import type { DocsConfig, PageData } from "@lark.js/docs";

  export function loadContent(
    path: string,
  ): Promise<{ pageData: PageData; contentHtml: string } | null>;

  export const routes: Record<string, string>;

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
