---
title: "@lark.js/docs"
description: "Documentation site generator for @lark.js/mvc"
---

# @lark.js/docs

`@lark.js/docs` is to `@lark.js/mvc` what VitePress is to Vue3 — an out-of-the-box documentation site generator that produces a complete documentation site with navigation, sidebar, search, and syntax highlighting.

## Features

- **File-based routing** — Recursively scans a `docs/` directory and generates routes from `.md` files
- **Dual routing modes** — Supports `@lark.js/mvc` Router in both `history` and `hash` modes
- **Configurable base URL** — Pass `baseUrl` as a common route prefix (e.g. `/docs/`)
- **Professional markdown parsing** — Powered by `markdown-it` with custom plugins for anchors, TOC, containers, and code blocks
- **YAML frontmatter** — Per-page metadata for titles, descriptions, sidebar ordering, and draft exclusion
- **Syntax highlighting** — Shiki-powered code blocks with VSCode-quality TextMate grammars, singleton-cached
- **Admonition containers** — `::: tip`, `::: warning`, `::: danger`, `::: details` with customizable labels
- **Auto-generated sidebar** — From directory structure with frontmatter-based sorting and collapsible groups
- **Dual search providers** — Built-in local modal or Algolia DocSearch widget, both backed by a build-time search index
- **Responsive theme** — Tailwind CSS v4 + DaisyUI v5, three-column layout with sticky navbar, sidebar, and TOC
- **Multi-bundler support** — Vite plugin, Webpack loader, and Rspack loader sharing the same compilation pipeline

## Quick Start

```bash
pnpm add @lark.js/docs @lark.js/mvc tailwindcss daisyui
```

Configure your bundler, write markdown files, and boot the site. See [Get Started](/docs/get-started/) for the full guide.

## How It Works

```
docs/                    Build Time                       Runtime (Browser)
  index.md               ┌─────────────────-────┐         ┌────────────────────┐
  get-started/     ───>  │ larkDocsPlugin       │  ───>   │ lark-mvc Framework │
    index.md             │ 1. extractFrontmatter│         │   Router + Views   │
    configuration.md     │ 2. markdown-it parse │         │   + Frame tree     │
  markdown/              │ 3. Shiki highlight   │         │   + State (cross-  │
    index.md             │ 4. render to HTML    │         │     view data)     │
  search/                │ 5. emit JS module    │         └────────────────────┘
    index.md             └────────────────────-─┘
```

Each `.md` file is compiled at build time into a lark-mvc View module. At runtime, the Router handles navigation and the theme Views (layout, sidebar, content, TOC, search) render the documentation interface.

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
