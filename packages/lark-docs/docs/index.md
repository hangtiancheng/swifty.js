---
title: "@lark.js/docs"
description: "Documentation site generator for @lark.js/mvc"
---

# @lark.js/docs

`@lark.js/docs` is to `@lark.js/mvc` what VitePress is to Vue -- an out-of-the-box documentation site generator that produces a complete documentation site with navigation, sidebar, search, and syntax highlighting.

## Features

- File-based routing -- recursively scans a `docs/` directory and generates SPA routes
- Dual routing modes -- supports `@lark.js/mvc` Router in both `history` and `hash` modes
- Markdown compilation pipeline -- `markdown-it` with four custom plugins (anchors, TOC, containers, code blocks)
- YAML frontmatter -- metadata extraction via `js-yaml` for page titles, descriptions, sidebar positioning, and draft control
- Shiki-powered code highlighting -- lazy WASM initialization and singleton caching for 100+ languages
- Admonition containers -- `::: tip`, `::: warning`, `::: danger`, `::: details` rendered as DaisyUI alert components
- Auto-generated sidebar -- directory-structure-based navigation with frontmatter overrides
- Three search providers -- MiniSearch-powered local modal, Algolia DocSearch UI with local index, or disabled
- Table of contents -- per-page heading outline with smooth-scroll navigation
- Three-column responsive layout -- Tailwind CSS v4 + DaisyUI v5 with sticky navbar and frosted glass effect
- Three bundler integrations -- Vite, Webpack, and Rspack / Rsbuild
- Zero-config boot -- `defineConfig()` auto-generates routes, sidebars, and search index into `.lark-docs/generated/`
- Single-call theme registration -- `registerThemeViews(View)` registers all theme components at once
- Dual-format library build -- ships ESM + CJS with full TypeScript declarations

## How It Works

`@lark.js/docs` operates in three phases:

**Phase 1 -- Configuration (build startup).** `defineConfig()` scans the docs directory, extracts frontmatter and headings from every `.md` file, auto-generates sidebar trees per path prefix, and writes a generated module to `.lark-docs/generated/index.js`. This module provides dynamic content loaders, a route map, runtime site configuration, and a lazy search index builder.

**Phase 2 -- Compilation (bundler plugin).** Each `.md` import is intercepted by the bundler plugin and compiled through `compileMarkdown()`. The pipeline extracts YAML frontmatter, initializes the Shiki highlighter on first call, parses the markdown body with `markdown-it` plus four custom plugins, renders to HTML, builds page metadata, and emits a JS module that exports `pageData` and `contentHtml`.

**Phase 3 -- Runtime (browser).** The `@lark.js/mvc` Framework boots with the generated routes. The layout view stays mounted across navigation and asynchronously loads page content via `loadContent()`. Four theme Views (layout, sidebar, TOC, search) render the documentation UI.

```
lark-docs.config.ts          Bundler Plugin              Browser Runtime
       |                            |                          |
  defineConfig()              compileMarkdown()          Framework.boot()
       |                            |                          |
  scanDocsDir()               extractFrontmatter         registerThemeViews(View)
  generateSidebar()           createParser()             routes + loadContent
       |                      getHighlighter()           from generated module
       |                            |                          |
  .lark-docs/generated/        JS module string          4 theme Views
  index.js                   ({pageData,                 render the docs UI
                               contentHtml})
```

## Documentation

| Section                            | Topics                                                |
| ---------------------------------- | ----------------------------------------------------- |
| [Get Started](/docs/get-started/)  | Installation, bundler config, boot file, first page   |
| [Markdown](/docs/markdown/)        | Frontmatter, containers, code highlighting, anchors   |
| [Router](/docs/router/)            | history/hash modes, baseUrl, route generation rules   |
| [Styling](/docs/style/)            | Tailwind CSS v4, DaisyUI, typography, theme switching |
| [Search](/docs/search/)            | Local modal, DocSearch widget, scoring algorithms     |
| [Theme Architecture](/docs/theme/) | View hierarchy, data flow, customization              |
| [API Reference](/docs/api/)        | All public types, functions, and entry points         |
