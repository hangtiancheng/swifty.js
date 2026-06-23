---
title: "Configuration"
description: "Full reference for lark-docs.config.ts defineConfig options"
sidebar_position: 2
---

# Configuration

`@lark.js/docs` is configured through a `lark-docs.config.ts` file using the `defineConfig` helper. This page documents every configuration option.

## defineConfig

```ts
import { defineConfig } from "@lark.js/docs/vite";

export default defineConfig({
  docs: "docs",
  baseUrl: "/docs/",
  routeMode: "history",
  title: "My Library",
  // ... all options below
});
```

`defineConfig` is a type-safe identity function -- it returns the argument unchanged and exists for TypeScript inference at the call site. When called, it also triggers route generation: scanning the docs directory, building sidebar trees, and writing the generated module to `.lark-docs/generated/index.js`.

The optional second argument `projectRoot` controls path resolution for the `docs` directory and the generated output. Defaults to `process.cwd()`.

## Options Reference

### `docs`

Type: `string` -- Default: `"docs"`

The source directory containing `.md` files, relative to the project root.

```ts
docs: "docs"; // resolves to <project>/docs/
docs: "content"; // resolves to <project>/content/
```

### `baseUrl`

Type: `string` -- Default: `"/docs/"`

Common URL prefix for all generated routes. Every route path is prefixed with this value.

```ts
baseUrl: "/docs/"; // routes: /docs/, /docs/guide/, /docs/api/router
baseUrl: "/v2/docs/"; // routes: /v2/docs/, /v2/docs/guide/
baseUrl: "/"; // routes: /, /guide/, /api/router
```

### `routeMode`

Type: `"history" | "hash"` -- Default: `"history"`

Maps to `@lark.js/mvc` Router's route mode. See [Router](/docs/router/) for details.

| Mode      | URL Format       | Example                  |
| --------- | ---------------- | ------------------------ |
| `history` | `/docs/guide/`   | Clean URLs via pushState |
| `hash`    | `#!/docs/guide/` | Hash fragment URLs       |

### `title`

Type: `string` -- Required

Site title displayed in the navbar.

### `description`

Type: `string`

Site description for meta tags and search indexing.

### `lang`

Type: `string` -- Default: `"en-US"`

Language code for the HTML `lang` attribute.

### `nav`

Type: `NavItem[]`

Top navigation items displayed in the navbar.

```ts
nav: [
  { text: "Guide", link: "/docs/guide/" },
  { text: "API", link: "/docs/api/" },
  { text: "GitHub", link: "https://github.com/..." },
];
```

Each item has:

- `text: string` -- display text
- `link: string` -- URL (internal or external)
- `items?: NavItem[]` -- nested dropdown items (optional)

### `sidebar`

Type: `Record<string, "auto" | SidebarItem[]>`

Sidebar configuration per URL prefix. Set to `"auto"` to generate from the directory structure.

```ts
sidebar: {
  "/docs/guide/": "auto",     // auto-generate from docs/guide/
  "/docs/api/": "auto",       // auto-generate from docs/api/
  "/docs/custom/": [          // manual configuration
    { text: "Overview", link: "/docs/custom/" },
    { text: "Details", link: "/docs/custom/details" },
  ],
}
```

When set to `"auto"`, the sidebar is generated using these rules:

1. Routes are grouped by subdirectory
2. Items sort by `sidebar_position` (frontmatter), then alphabetically
3. `index.md` becomes a top-level item
4. Subdirectories become collapsible groups

### `markdown`

Type: `MarkdownOptions`

```ts
markdown: {
  lineNumbers: true,          // show line numbers in code blocks
  anchor: { permalink: true }, // add # permalink links to headings
  toc: { level: [2, 3] },     // heading levels for TOC extraction
  containers: {               // custom container labels
    tip: { label: "TIP" },
    warning: { label: "WARNING" },
    danger: { label: "DANGER" },
  },
}
```

### `highlight`

Type: `HighlightOptions`

Shiki syntax highlighting configuration. When omitted, code blocks render as plain escaped text.

```ts
highlight: {
  theme: "github-dark",
  languages: ["typescript", "javascript", "html", "css", "json", "bash"],
}
```

See [Code Highlighting](/docs/markdown/code-highlighting/) for the full language list and theme options.

### `search`

Type: `SearchOptions`

```ts
search: {
  provider: "local",      // "local" | "docsearch" | "none"
}
```

| Provider      | Description                                                        |
| ------------- | ------------------------------------------------------------------ |
| `"local"`     | Built-in modal dialog with MiniSearch engine (default)             |
| `"docsearch"` | Algolia DocSearch widget backed by local index (no account needed) |
| `"none"`      | Disable search entirely                                            |

The `"docsearch"` provider uses the DocSearch UI widget but queries the local search index -- no Algolia account or API key is required. Install the additional packages:

```bash
pnpm add @docsearch/js @docsearch/css
```

See [Search](/docs/search/) for a detailed comparison of providers and scoring algorithms.

## Complete Example

```ts
import { defineConfig } from "@lark.js/docs/vite";

export default defineConfig({
  docs: "docs",
  baseUrl: "/docs/",
  routeMode: "history",
  title: "My Library",
  description: "Documentation for My Library",
  lang: "en-US",
  nav: [
    { text: "Guide", link: "/docs/guide/" },
    { text: "API", link: "/docs/api/" },
  ],
  sidebar: {
    "/docs/guide/": "auto",
    "/docs/api/": "auto",
  },
  markdown: {
    anchor: { permalink: true },
    toc: { level: [2, 3] },
  },
  highlight: {
    theme: "github-dark",
    languages: ["typescript", "javascript", "html", "css", "json", "bash"],
  },
  search: { provider: "docsearch" },
});
```

## Generated Output

`defineConfig()` writes a generated module to `.lark-docs/generated/index.js`:

```js
// Auto-generated by defineConfig() -- DO NOT EDIT!!!
const LAYOUT_VIEW = "theme/docs-layout";

const loaders = {
  "/docs/": () => import("/absolute/path/to/docs/index.md"),
  "/docs/guide/": () => import("/absolute/path/to/docs/guide/index.md"),
};

export async function loadContent(path) {
  const loader = loaders[path];
  if (!loader) return null;
  const mod = await loader();
  return { pageData: mod.pageData, contentHtml: mod.contentHtml };
}

export const routes = Object.fromEntries(
  Object.keys(loaders).map((k) => [k, LAYOUT_VIEW]),
);

export const docsConfig = { title: "...", nav: [...], sidebar: {...} };

let _searchIndex = null;
export async function getSearchIndex() { /* lazy build on first search */ }
```

The generated module exports four things:

- `loadContent(path)` -- dynamically imports the compiled `.md` module for a given route path
- `routes` -- maps every docs path to `"theme/docs-layout"` (all routes share one layout view)
- `docsConfig` -- the runtime site configuration (title, description, lang, nav, sidebar)
- `getSearchIndex()` -- lazily builds the search index on first call

This directory should be added to `.gitignore`. It is regenerated each time `defineConfig()` runs (on every dev server start and build).

Consumers import it via a Vite resolve alias:

```ts
// vite.config.ts
resolve: {
  alias: {
    "@lark-docs/generated": resolve(PKG_DIR, ".lark-docs/generated"),
  },
}
```

Type declarations for `@lark-docs/generated` are provided by `/// <reference types="@lark.js/docs/client" />` -- no generated `.d.ts` file is needed.

## Next Steps

- [Markdown](/docs/markdown/) -- frontmatter, containers, code highlighting, anchors
- [Search](/docs/search/) -- provider comparison and scoring details
- [Theme Architecture](/docs/theme/) -- view hierarchy and customization
- [API Reference](/docs/api/) -- complete public API documentation
