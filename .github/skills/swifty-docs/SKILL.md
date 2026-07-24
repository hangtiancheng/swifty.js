---
name: swifty-docs
description: Authoritative reference for @swifty.js/docs, the Preact + shadcn-style documentation site generator located at packages/swifty-docs (TypeScript, ESM+CJS dual build, markdown-it compilation pipeline, Vite-only integration). Use this skill whenever the user reads, writes, debugs, reviews, or extends code under `packages/swifty-docs/src/**`, imports from `@swifty.js/docs` or any of its sub-paths (`/vite`, `/compiler`, `/runtime`, `/theme`, `/client`), edits `swifty-docs.config.ts`, or works with the `@swifty-docs/generated` virtual module. Trigger eagerly on any of these symbols and concepts—`defineConfig`, `swiftyDocsPlugin`, `compileMarkdown`, `scanDocsDir`, `generateSidebar`, `DocsConfig`, `NavItem`, `SidebarConfig`, `SidebarItem`, `MarkdownOptions`, `HighlightOptions`, `SearchOptions`, `PageData`, `HeadingInfo`, `DocsRoute`, `SearchEntry`, `DocsProvider`, `useDocs`, `DocsLayout`, `Navbar`, `Sidebar`, `Toc`, `SearchDialog`, `DocSearchWidget`, `ContentRenderer`, `PrevNext`, `ThemeToggle`, `Logo`, `Button`, `buttonVariants`, `Input`, `Kbd`, `Dialog`, `cn`, `createSearchEngine`, `highlightSegments`, `useScrollSpy`, `computePrevNext`, `normalizePath`, `createLocalSearchClient`, `slugify`, `loadContent`, `getSearchIndex`, the `.swifty-docs/generated/` output directory, the `?swifty-docs` module suffix, `data-swifty-nav`, `data-swifty-toc`, `[[toc]]`, `:::\ tip/warning/danger/details` containers, `sidebar_position`/`sidebar_label`/`draft` frontmatter, the `swifty-docs-theme` localStorage key, and the semantic CSS tokens (`--background`, `--primary`, `--sidebar`, `--code`, `--callout-warning`, `--callout-danger`, `--radius`). Also trigger on conceptual phrases like "docs site generator", "VitePress alternative", "build a documentation site with Preact", "customize the docs theme", "override docs colors/fonts", "add search to the docs", "Shiki dual-theme code blocks", "auto-generated sidebar", and on questions about styling, theming, dark mode, or markdown extensions in a swifty-docs site.
---

# @swifty.js/docs — Preact Documentation Site Generator

`@swifty.js/docs` (`packages/swifty-docs`, published as `@swifty.js/docs`, MIT) is a documentation site generator in the spirit of VitePress/Docusaurus, built on a markdown-it compilation pipeline and a precompiled Preact theme (shadcn-style primitives on Tailwind CSS v4). Markdown is compiled to static HTML at build time; a single-page Preact app renders it at runtime with client-side routing, local full-text search, and a light/dark theme.

Stack facts (from `package.json`): runtime deps include `markdown-it` ^14, `markdown-it-container` ^4, `shiki` ^4 (lazy dynamic import), `js-yaml` ^5, `ejs` ^3, `minisearch` ^7, `preact-iso` ^2.12, `lucide-preact`/`lucide-static` ^1.25, `zod` ^4, `@docsearch/js`/`@docsearch/css` ^4.6, `clsx`, `tailwind-merge`, `class-variance-authority`, `@tailwindcss/typography`. Peer deps: `preact` ^10.20, `tailwindcss` ^4. Vite is the **only** supported bundler — `@preact/preset-vite` is bundled into `swiftyDocsPlugin()`. There is no Webpack or Rspack integration.

## Three-Phase Architecture

1. **Configuration (build startup)** — `defineConfig(config, projectRoot?)` in `src/define-config.ts` is an identity function with a side effect: it scans the docs dir (`scanDocsDir`), auto-generates sidebars (`generateSidebar`), and renders `file-content.ejs` into `.swifty-docs/generated/index.js`. That generated module exports `loadContent(path)`, `docsConfig`, `getSearchIndex()`, and a `routes` map, importable via the `@swifty-docs/generated` Vite alias.
2. **Compilation (Vite plugin)** — `swiftyDocsPlugin({ config, debug? })` in `src/vite.ts` returns `[md-compiler, @preact/preset-vite]`. Its `resolveId` (enforce `pre`) tags `.md` imports with the `?swifty-docs` suffix; its `load` hook runs `compileMarkdown()` (`src/compile-markdown.ts`): extract YAML frontmatter → lazy-init Shiki singleton → parse with markdown-it + 4 custom plugins → render HTML → emit a JS module exporting `{ pageData, contentHtml }`.
3. **Runtime (browser)** — `<DocsProvider>` (Zod-validates config/loaders at the boundary, holds search-dialog state) wraps preact-iso's `<LocationProvider>` + `<Router>` with `<Route default component={DocsLayout} />`. `DocsLayout` reads the path from `useLocation()`, loads content in a `useEffect`, and renders Navbar / Sidebar / prose column (`ContentRenderer` + `PrevNext`) / Toc / SearchDialog / mobile drawer.

## Consumer Setup (5 steps)

```bash
pnpm add @swifty.js/docs preact preact-iso tailwindcss @tailwindcss/typography
```

1. **`swifty-docs.config.ts`** — `import { defineConfig } from "@swifty.js/docs/vite"` and export a `DocsConfig` (`docs`, `baseUrl`, `title`, `nav`, `sidebar`, `highlight`, `search`).
2. **`vite.config.ts`** — add `swiftyDocsPlugin({ config: docsConfig })` plus `@tailwindcss/vite`, and alias `"@swifty-docs/generated"` to `resolve(root, ".swifty-docs/generated")`. Gitignore `.swifty-docs/`.
3. **CSS entry** — `@import "tailwindcss"; @import "@swifty.js/docs/client.css";` then `@source "@swifty.js/docs/theme.js";` so the precompiled theme's utility classes survive Tailwind's scan.
4. **Boot** (`app/boot.tsx`) — render `<DocsProvider config={docsConfig} loadContent={loadContent} getSearchIndex={getSearchIndex}>` around `<LocationProvider><Router><Route path="/" component={DocsLayout} /><Route default component={DocsLayout} /></Router></LocationProvider>`. Add a no-FOUC inline script in `index.html` that toggles `.dark` from the `swifty-docs-theme` localStorage key before first paint.
5. **TypeScript** — `/// <reference types="@swifty.js/docs/client" />` in a shims file provides the ambient `@swifty-docs/generated` module declaration; add a `paths` mapping for IDE resolution.

The package's own docs site (`swifty-docs.config.ts`, `app/boot.tsx`, `app/index.html`, `app/main.css` at the package root) is the canonical working example — mirror it when scaffolding a consumer.

## Reference Files

Read the reference that matches the task — they contain the exhaustive, code-verified detail:

| File                          | Read when the task involves                                                                                                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `references/configuration.md` | `DocsConfig` fields and defaults, frontmatter schema, title resolution, `defineConfig` output, scanner/sidebar rules, virtual index routes                                                      |
| `references/theming.md`       | Customizing styles: semantic token tables (light/dark oklch values), fonts, radius, prose overrides, `.codeblock` / `.callout` classes, dark-mode bootstrap, custom utilities, animation tokens |
| `references/api.md`           | Every public export: components with props, hooks, utilities, `compileMarkdown`, Vite plugin options, package export map, `@swifty-docs/generated` contract                                     |
| `references/markdown.md`      | Markdown extensions: heading anchors + slug dedup, `[[toc]]`, admonition containers, code-block chrome, Shiki dual-theme, internal-link tagging                                                 |

## Working Rules

- **Ground answers in the source.** Key files: `src/types.ts` (all shared types), `src/vite.ts` (plugin), `src/define-config.ts` (generation), `src/compile-markdown.ts` (pipeline), `src/client.css` (all styling), `src/theme/**` (components), `src/markdown/plugins/*` (anchors, toc, containers, code-blocks). When behavior is unclear, read the file rather than guessing.
- **markdown-it plugins return HTML strings, not JSX.** The render functions in `src/markdown/plugins/` emit strings (some emit split open/close tags), so keep string output; escape interpolated values with the local `escapeHtml` helpers.
- **The theme is Preact, not React/Solid.** Components use `preact/hooks` (`useState`/`useEffect`), `class` (not `className`) props, and `preact-iso` routing. The Dialog primitive is a hand-rolled portal (`createPortal` from `preact/compat`).
- **Style customization = override CSS custom properties.** Consumers never fork components for colors; they redefine `--primary`, `--background`, etc. after importing `client.css` (see `references/theming.md` for the recipes).
- **Regenerating routes requires re-running `defineConfig`** — it executes when the Vite config loads, so adding/removing `.md` files needs a dev-server restart (or re-import of the config).
- Dev commands (run in `packages/swifty-docs`): `pnpm dev` (docs site), `pnpm build` (lib), `pnpm build:docs`, `pnpm test` (vitest), `pnpm typecheck`.
