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
- **Professional markdown parsing** — Powered by `markdown-it` with custom plugins
- **YAML frontmatter** — Per-page metadata for titles, descriptions, sidebar ordering
- **Syntax highlighting** — Shiki-powered code blocks with VSCode-quality grammars
- **Admonition containers** — `::: tip`, `::: warning`, `::: danger`, `::: details`
- **Auto-generated sidebar** — From directory structure with frontmatter-based sorting
- **Full-text search** — Client-side search with scored ranking
- **Fixed theme** — Tailwind CSS + DaisyUI, no custom CSS needed
- **Multi-bundler support** — Vite, Webpack, and Rspack / Rsbuild

## Quick Start

```bash
pnpm add @lark.js/docs @lark.js/mvc tailwindcss daisyui
```

Configure your bundler, write markdown files, and boot the site. See [Get Started](/docs/get-started/) for the full guide.

## How It Works

```
docs/                    Build Time                          Runtime (Browser)
  index.md               ┌──────────────────┐               ┌────────────────────┐
  get-started/     ───▶  │ larkDocPlugin    │  ───▶         │ lark-mvc Framework │
    index.md             │ (compiles .md    │               │   Router + Views   │
    configuration.md     │  to JS modules)  │               │   + Frame tree     │
  markdown/              └──────────────────┘               └────────────────────┘
    index.md
```

Each `.md` file is compiled at build time into a lark-mvc View module. At runtime, the Router handles navigation and the theme Views (layout, sidebar, content, TOC, search) render the documentation interface.

## Navigation

- [Get Started](/docs/get-started/) — Installation, configuration, and first site
- [Markdown](/docs/markdown/) — Frontmatter, containers, code highlighting
- [Router](/docs/router/) — history/hash modes, baseUrl, route generation
- [Styling](/docs/style/) — Tailwind CSS + DaisyUI integration
