---
title: "Configuration"
description: "Full reference for lark-docs.config.ts defineConfig options"
sidebar_position: 2
---

# Configuration

`@lark.js/docs` is configured through a `lark-docs.config.ts` file using the `defineConfig` helper. This page documents every configuration option.

## defineConfig

```ts
import { defineConfig } from "@lark.js/docs";

export default defineConfig({
  docs: "docs",
  baseUrl: "/docs/",
  routeMode: "history",
  title: "My Library",
  // ... all options below
});
```

`defineConfig` is a type-safe identity function — it returns the argument unchanged and exists purely for TypeScript inference at the call site.

## Options Reference

### `docs`

Type: `string` — Default: `"docs"`

The source directory containing `.md` files, relative to the project root.

```ts
docs: "docs"; // resolves to <project>/docs/
docs: "content"; // resolves to <project>/content/
```

### `baseUrl`

Type: `string` — Default: `"/docs/"`

Common URL prefix for all generated routes. Every route path is prefixed with this value.

```ts
baseUrl: "/docs/"; // routes: /docs/, /docs/guide/, /docs/api/router
baseUrl: "/v2/docs/"; // routes: /v2/docs/, /v2/docs/guide/
baseUrl: "/"; // routes: /, /guide/, /api/router
```

### `routeMode`

Type: `"history" | "hash"` — Default: `"history"`

Maps to `@lark.js/mvc` Router's route mode.

| Mode      | URL Format       | Example                  |
| --------- | ---------------- | ------------------------ |
| `history` | `/docs/guide/`   | Clean URLs via pushState |
| `hash`    | `#!/docs/guide/` | Hash fragment URLs       |

### `title`

Type: `string` — **Required**

Site title displayed in the navbar.

### `description`

Type: `string`

Site description for meta tags and search indexing.

### `lang`

Type: `string` — Default: `"en-US"`

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

- `text: string` — Display text
- `link: string` — URL (internal or external)
- `items?: NavItem[]` — Nested dropdown items (optional)

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
  provider: "local",  // "local" for client-side full-text search
                      // "none" to disable search
}
```

## Complete Example

```ts
import { defineConfig } from "@lark.js/docs";

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
  search: { provider: "local" },
});
```
