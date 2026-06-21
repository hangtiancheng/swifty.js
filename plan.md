# @lark.js/doc Technical Plan

## 1. Goal

`@lark.js/doc` is to `@lark.js/mvc` what VitePress is to Vue3 and Docusaurus is to React -- an out-of-the-box documentation site generator. It recursively scans a user-provided `docs/` directory, compiles every `.md` file into a Lark View, and produces a complete documentation site with navigation, sidebar, search, and code highlighting.

Non-goals:

- Blog engine, e-commerce, or general-purpose CMS features.
- User-customizable theme system (styling is fixed to Tailwind CSS + DaisyUI).
- Server-side rendering / static site generation in v1 (pure SPA first, SSG as a follow-up).

## 2. Requirements (from spec.md)

| #   | Requirement                                          | Notes                                       |
| --- | ---------------------------------------------------- | ------------------------------------------- |
| R1  | Recursively scan a `docs` directory                  | Generate file-based routes from `.md` files |
| R2  | Support `@lark.js/mvc` Router hash and history modes | User chooses via config                     |
| R3  | Accept `baseUrl` as a common route prefix            | e.g. `/docs/`                               |
| R4  | Use a professional markdown AST parser               | markdown-it (token-stream, fast, mature)    |
| R5  | Support Vite, Webpack, Rspack / Rsbuild              | Three bundler plugins, same as lark-mvc     |
| R6  | Styling is Tailwind CSS + DaisyUI only               | No user customization of the style system   |

## 3. Architecture Overview

```
                  Build Time                              Runtime (Browser)
  +-----------------------------------+    +-------------------------------------------+
  |  docs/                            |    |  lark-mvc Framework                        |
  |    getting-started.md             |    |    Framework.boot(config)                  |
  |    guide/                         |    |      routes: { "/guide/": "guide-index" }  |
  |      index.md                     |    |      routeMode: "history" | "hash"         |
  |      config.md                    |    |    Router handles navigation               |
  |    api/                           |    |    Frame tree mounts/unmounts Views        |
  |      router.md                    |    |    Each View renders compiled markdown     |
  +-----------------------------------+    +-------------------------------------------+
                  |                                        ^
                  v                                        |
  +-----------------------------------+    +-------------------------------------------+
  |  @lark.js/doc Build Pipeline      |    |  @lark.js/doc Runtime                     |
  |    1. Scan docs/ directory         |    |    DocLayout View (sidebar + content)      |
  |    2. Extract frontmatter          |    |    Sidebar View (navigation tree)          |
  |    3. Parse markdown (markdown-it) |    |    ContentView (rendered markdown)         |
  |    4. Generate Lark template       |    |    TOCView (right-side heading outline)    |
  |    5. Compile to JS module         |    |    SearchView (client-side full-text)      |
  |    6. Generate route map           |    +-------------------------------------------+
  +-----------------------------------+
```

### 3.1 How a .md File Becomes a Page

```
getting-started.md
  |
  v  [1] gray-matter: extract YAML frontmatter
  |
  v  [2] markdown-it: parse to token stream
  |
  v  [3] custom plugins: anchors, containers, code highlighting, TOC
  |
  v  [4] custom renderer: tokens -> lark-mvc template string (HTML with {{=}} syntax)
  |
  v  [5] lark-mvc compileTemplate: template string -> JS function module
  |
  v  Output: ES module exporting (data, viewId, refData) => string
```

At runtime, the compiled module is used as a Lark View's `template` function. The View's `init()` reads frontmatter data (title, description, sidebar position, etc.) and passes it to `updater.set()`.

### 3.2 Rendering Strategy: Pure SPA (v1)

v1 uses a pure client-side SPA approach:

1. At build time: scan `docs/`, compile all `.md` files to JS modules, generate the route map.
2. At runtime: `Framework.boot()` initializes the app, the Router handles navigation, Views are loaded on demand via `FrameworkConfig.require` (dynamic `import()`).
3. First page load fetches the JS bundle; subsequent navigation is instant (SPA).

SSG (pre-rendering each page to static HTML at build time) is deferred to v2. lark-mvc already has `vdomCreate` and a VDom engine, making SSG achievable by rendering the VDom tree to an HTML string at build time.

## 4. Package Structure

```
packages/lark-doc/
  package.json
  tsconfig.json               # IDE / dev / test
  tsconfig.build.json          # production build
  tsup.config.ts               # build config (4 entry groups)
  vitest.config.ts
  README.md
  src/
    index.ts                   # barrel exports
    types.ts                   # DocConfig, PageData, SidebarItem, etc.
    scanner.ts                 # recursive docs/ directory walker
    route-map.ts               # file paths -> lark-mvc routes config
    markdown/
      parser.ts                # markdown-it setup with plugin chain
      frontmatter.ts           # gray-matter integration
      renderer.ts              # custom markdown-it renderer -> lark template
      plugins/
        containers.ts          # ::: tip, ::: warning, ::: danger, ::: details
        anchors.ts             # heading anchor links
        toc.ts                 # table of contents extraction
        code-blocks.ts         # code block enhancements (line numbers, highlighting)
    compiler/
      compile-markdown.ts      # .md source -> JS module string
      extract-frontmatter.ts   # YAML frontmatter -> metadata object
    vite.ts                    # Vite plugin for .md files
    webpack.ts                 # Webpack loader + LarkDocPlugin
    rspack.ts                  # Rspack loader + LarkDocPlugin
    runtime.ts                 # lightweight helpers for compiled .md modules
    theme/
      doc-layout.html          # main layout template (sidebar + content + toc)
      doc-layout.ts            # DocLayout View class
      sidebar.html             # sidebar navigation template
      sidebar.ts               # Sidebar View class
      content.html             # content area template
      content.ts               # ContentView class
      toc.html                 # right-side heading outline template
      toc.ts                   # TocView class
      search.html              # search dialog template
      search.ts                # SearchView class
    config/
      define-config.ts         # defineConfig() helper
    boot.ts                    # internal boot logic (route registration, etc.)
  tests/
    scanner.test.ts
    route-map.test.ts
    parser.test.ts
    renderer.test.ts
    compile-markdown.test.ts
    frontmatter.test.ts
    vite-plugin.test.ts
    webpack-loader.test.ts
    rspack-loader.test.ts
```

## 5. Package Manifest

```jsonc
// packages/lark-doc/package.json
{
  "name": "@lark.js/doc",
  "version": "0.0.1",
  "description": "Documentation site generator for @lark.js/mvc",
  "type": "module",
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist", "README.md"],
  "exports": {
    ".": {
      "import": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs",
      },
    },
    "./compiler": {
      "import": {
        "types": "./dist/compiler.d.ts",
        "default": "./dist/compiler.js",
      },
      "require": {
        "types": "./dist/compiler.d.cts",
        "default": "./dist/compiler.cjs",
      },
    },
    "./vite": {
      "import": { "types": "./dist/vite.d.ts", "default": "./dist/vite.js" },
      "require": { "types": "./dist/vite.d.cts", "default": "./dist/vite.cjs" },
    },
    "./webpack": {
      "import": {
        "types": "./dist/webpack.d.ts",
        "default": "./dist/webpack.js",
      },
      "require": {
        "types": "./dist/webpack.d.cts",
        "default": "./dist/webpack.cjs",
      },
    },
    "./rspack": {
      "import": {
        "types": "./dist/rspack.d.ts",
        "default": "./dist/rspack.js",
      },
      "require": {
        "types": "./dist/rspack.d.cts",
        "default": "./dist/rspack.cjs",
      },
    },
    "./runtime": {
      "import": {
        "types": "./dist/runtime.d.ts",
        "default": "./dist/runtime.js",
      },
      "require": {
        "types": "./dist/runtime.d.cts",
        "default": "./dist/runtime.cjs",
      },
    },
  },
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "dev": "tsup --watch",
  },
  "dependencies": {
    "markdown-it": "^14.0.0",
    "gray-matter": "^4.0.3",
    "shiki": "^3.0.0",
  },
  "devDependencies": {
    "@lark.js/mvc": "workspace:^",
    "@types/markdown-it": "^14.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.9.0",
    "vitest": "^4.0.0",
    "@types/node": "^24.0.0",
  },
  "peerDependencies": {
    "@lark.js/mvc": ">=0.0.12",
  },
}
```

## 6. Build Configuration

### 6.1 tsup.config.ts

Follow lark-mvc's 4-group pattern:

```ts
import { defineConfig } from "tsup";

export default defineConfig([
  // Group 1: Main entry (public API)
  {
    entry: { index: "src/index.ts" },
    format: ["esm", "cjs"],
    dts: { resolve: true },
    tsconfig: "./tsconfig.build.json",
    minify: false,
    sourcemap: false,
  },
  // Group 2: Compiler (markdown -> lark template)
  {
    entry: { compiler: "src/compiler/compile-markdown.ts" },
    format: ["esm", "cjs"],
    dts: true,
    tsconfig: "./tsconfig.build.json",
    noExternal: ["markdown-it", "gray-matter"],
  },
  // Group 3: Build plugins (Vite / Webpack / Rspack)
  {
    entry: {
      vite: "src/vite.ts",
      webpack: "src/webpack.ts",
      rspack: "src/rspack.ts",
    },
    format: ["esm", "cjs"],
    dts: true,
    tsconfig: "./tsconfig.build.json",
    shims: true, // __filename / __dirname for ESM
    splitting: false, // each plugin must be self-contained
  },
  // Group 4: Runtime (lightweight helpers for compiled .md modules)
  {
    entry: { runtime: "src/runtime.ts" },
    format: ["esm", "cjs"],
    dts: true,
    tsconfig: "./tsconfig.build.json",
  },
]);
```

### 6.2 tsconfig.build.json

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "bundler",
    "moduleDetection": "force",
    "isolatedModules": true,
    "verbatimModuleSyntax": false,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "skipLibCheck": true,
    "lib": ["esnext", "DOM", "DOM.Iterable"],
    "types": ["node"],
    "paths": { "@/*": ["./src/*"] },
    "rootDir": "./src",
    "outDir": "./dist",
    "declarationDir": "./dist",
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts"],
}
```

## 7. Configuration API

### 7.1 User Config File

Users create a `lark-doc.config.ts` (or `.js` / `.mjs`) at the project root:

```ts
// lark-doc.config.ts
import { defineConfig } from "@lark.js/doc";

export default defineConfig({
  // Docs source directory (relative to project root)
  docs: "docs",

  // Base URL prefix for all generated routes
  baseUrl: "/docs/",

  // Routing mode
  routeMode: "history", // "history" | "hash"

  // Site metadata
  title: "My Library",
  description: "Documentation for My Library",
  lang: "en-US",

  // Navigation
  nav: [
    { text: "Guide", link: "/guide/" },
    { text: "API", link: "/api/" },
    { text: "GitHub", link: "https://github.com/..." },
  ],

  // Sidebar can be auto-generated from docs/ structure,
  // or manually configured per path prefix
  sidebar: {
    "/guide/": "auto", // auto-generate from docs/guide/ directory
    "/api/": "auto",
  },

  // Markdown processing options
  markdown: {
    lineNumbers: true,
    anchor: { permalink: true },
    toc: { level: [2, 3] },
    containers: {
      tip: { label: "TIP" },
      warning: { label: "WARNING" },
      danger: { label: "DANGER" },
    },
  },

  // Code highlighting (Shiki)
  highlight: {
    theme: "github-dark",
    languages: ["ts", "js", "html", "css", "json", "bash", "yaml"],
  },

  // Search
  search: {
    provider: "local", // "local" | "none"
  },
});
```

### 7.2 Type Definitions

```ts
// src/types.ts

export interface DocConfig {
  docs: string;
  baseUrl: string;
  routeMode: "history" | "hash";
  title: string;
  description?: string;
  lang?: string;
  nav?: NavItem[];
  sidebar?: Record<string, SidebarConfig>;
  markdown?: MarkdownOptions;
  highlight?: HighlightOptions;
  search?: SearchOptions;
}

export interface NavItem {
  text: string;
  link: string;
  items?: NavItem[];
}

export type SidebarConfig = "auto" | SidebarItem[];

export interface SidebarItem {
  text: string;
  link?: string;
  collapsed?: boolean;
  items?: SidebarItem[];
}

export interface MarkdownOptions {
  lineNumbers?: boolean;
  anchor?: { permalink?: boolean };
  toc?: { level?: number[] };
  containers?: Record<string, { label: string }>;
}

export interface HighlightOptions {
  theme?: string;
  languages?: string[];
}

export interface SearchOptions {
  provider: "local" | "none";
}

/** Metadata extracted from a single .md file's frontmatter */
export interface PageData {
  title: string;
  description?: string;
  sidebarPosition?: number;
  sidebarLabel?: string;
  sidebarGroup?: string;
  draft?: boolean;
  headings: HeadingInfo[];
  relativePath: string;
  lastUpdated?: number;
}

export interface HeadingInfo {
  level: number;
  text: string;
  slug: string;
}

/** Generated route entry */
export interface DocRoute {
  path: string; // e.g. "/docs/guide/config"
  viewId: string; // e.g. "docs-guide-config"
  filePath: string; // e.g. "docs/guide/config.md"
  pageData: PageData;
}

/** Sidebar data passed to the Sidebar View at runtime */
export interface SidebarData {
  items: SidebarItem[];
  currentPath: string;
}

/** TOC data passed to the TocView at runtime */
export interface TocData {
  headings: HeadingInfo[];
  activeSlug?: string;
}
```

### 7.3 defineConfig Helper

```ts
// src/config/define-config.ts
import type { DocConfig } from "../types";

/**
 * Type-safe config helper. Returns the argument unchanged.
 * Exists purely for TypeScript inference at the call site.
 */
export function defineConfig(config: DocConfig): DocConfig {
  return config;
}
```

## 8. Docs Scanner

### 8.1 Directory Walker

```ts
// src/scanner.ts
import fs from "node:fs";
import path from "node:path";
import type { DocRoute, HeadingInfo } from "./types";
import { extractFrontmatter } from "./compiler/extract-frontmatter";

const IGNORED_PREFIXES = ["_", "."];
const IGNORED_DIRS = new Set([
  "node_modules",
  "__tests__",
  "__fixtures__",
  ".git",
]);

/**
 * Recursively scan a docs directory and return an array of DocRoute entries.
 * Each .md file becomes one route.
 *
 * Rules:
 * - Files/dirs starting with _ or . are skipped
 * - node_modules, __tests__, __fixtures__, .git are skipped
 * - index.md maps to the directory root (e.g. /guide/)
 * - Other .md files map to their path without extension (e.g. /guide/config)
 * - Files with `draft: true` in frontmatter are excluded in production
 */
export function scanDocsDir(
  docsDir: string,
  baseUrl: string,
  options?: { excludeDrafts?: boolean },
): DocRoute[] {
  const routes: DocRoute[] = [];
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";

  function walk(dir: string, prefix: string): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (IGNORED_PREFIXES.some((p) => entry.name.startsWith(p))) continue;
      if (IGNORED_DIRS.has(entry.name)) continue;

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath, `${prefix}/${entry.name}`);
        continue;
      }

      if (!entry.name.endsWith(".md")) continue;

      const name = entry.name.replace(/\.md$/, "");
      const routePath = name === "index" ? `${prefix}/` : `${prefix}/${name}`;

      const fullRoutePath = normalizedBase + routePath.replace(/^\//, "");
      const viewId = generateViewId(routePath);

      // Read file and extract frontmatter + headings
      const raw = fs.readFileSync(fullPath, "utf-8");
      const { data: frontmatter, content } = extractFrontmatter(raw);

      if (options?.excludeDrafts && frontmatter.draft) continue;

      const pageData: DocRoute["pageData"] = {
        title: (frontmatter.title as string) || inferTitle(content) || name,
        description: frontmatter.description as string | undefined,
        sidebarPosition: frontmatter.sidebar_position as number | undefined,
        sidebarLabel: frontmatter.sidebar_label as string | undefined,
        sidebarGroup: frontmatter.sidebar_group as string | undefined,
        draft: frontmatter.draft as boolean | undefined,
        headings: extractHeadings(content),
        relativePath: path.relative(docsDir, fullPath),
        lastUpdated: fs.statSync(fullPath).mtimeMs,
      };

      routes.push({
        path: fullRoutePath,
        viewId,
        filePath: fullPath,
        pageData,
      });
    }
  }

  walk(docsDir, "");
  return routes;
}

function generateViewId(routePath: string): string {
  return (
    routePath
      .replace(/^\//, "")
      .replace(/\//g, "-")
      .replace(/[^a-zA-Z0-9-]/g, "") || "index"
  );
}

function inferTitle(content: string): string | undefined {
  const match = content.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim();
}

function extractHeadings(content: string): HeadingInfo[] {
  const headings: HeadingInfo[] = [];
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2].trim(),
      slug: slugify(match[2].trim()),
    });
  }
  return headings;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
```

### 8.2 Route Map Generator

```ts
// src/route-map.ts
import type { DocRoute } from "./types";

/**
 * Convert scanned DocRoute[] into a lark-mvc `routes` config object.
 * The output feeds directly into Framework.boot({ routes }).
 */
export function generateRouteMap(routes: DocRoute[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const route of routes) {
    map[route.path] = route.viewId;
  }
  return map;
}

/**
 * Generate a virtual module source string that imports all doc views
 * and registers them with registerViewClass.
 * This module is emitted by the build plugin as a virtual module.
 */
export function generateBootModule(routes: DocRoute[]): string {
  const imports = routes
    .map((r, i) => `import view${i} from ${JSON.stringify(r.filePath)};`)
    .join("\n");

  const registrations = routes
    .map((r, i) => `registerViewClass(${JSON.stringify(r.viewId)}, view${i});`)
    .join("\n");

  return `${imports}\nimport { registerViewClass } from "@lark.js/mvc";\n${registrations}`;
}
```

## 9. Markdown Processing Pipeline

### 9.1 markdown-it Setup

```ts
// src/markdown/parser.ts
import MarkdownIt from "markdown-it";
import { containerPlugin } from "./plugins/containers";
import { anchorPlugin } from "./plugins/anchors";
import { tocPlugin } from "./plugins/toc";
import { codeBlockPlugin } from "./plugins/code-blocks";
import type { MarkdownOptions } from "../types";

export function createParser(options?: MarkdownOptions): MarkdownIt {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: false,
  });

  // Plugin chain (order matters)
  md.use(anchorPlugin, { permalink: options?.anchor?.permalink ?? true });
  md.use(tocPlugin, { level: options?.toc?.level ?? [2, 3] });
  md.use(containerPlugin, options?.containers);
  md.use(codeBlockPlugin, { lineNumbers: options?.lineNumbers ?? false });

  return md;
}
```

### 9.2 Frontmatter Extraction

```ts
// src/compiler/extract-frontmatter.ts
import matter from "gray-matter";

export interface FrontmatterResult {
  data: Record<string, unknown>;
  content: string;
}

export function extractFrontmatter(source: string): FrontmatterResult {
  const { data, content } = matter(source);
  return { data, content };
}
```

### 9.3 Custom Renderer (markdown tokens -> lark template)

The core of the pipeline: a custom markdown-it renderer that outputs lark-mvc template syntax instead of raw HTML.

```ts
// src/markdown/renderer.ts
import type MarkdownIt from "markdown-it";

/**
 * Render markdown-it tokens to a lark-mvc template string.
 * The output uses {{=variable}} for dynamic content and {{!rawHtml}} for
 * pre-rendered HTML blocks (code blocks, containers).
 *
 * Key design decisions:
 * - Heading text is rendered statically (not as template variables)
 *   because headings come from the .md file, not from runtime data
 * - Code blocks are pre-rendered at build time via Shiki and injected
 *   as raw HTML via {{!}}
 * - Links use @click for SPA navigation (intercepted by lark-mvc Router)
 * - The template wraps content in a layout structure with sidebar + toc slots
 */
export function renderToLarkTemplate(
  tokens: MarkdownIt.Token[],
  md: MarkdownIt,
): string {
  // Use markdown-it's default renderer as the base,
  // then override specific rules for lark-specific behavior
  const originalRenderer = md.renderer.render.bind(md.renderer);

  // Override link rendering to use lark Router
  md.renderer.rules.link_open = (tokens, idx) => {
    const href = tokens[idx].attrGet("href") || "";
    if (href.startsWith("/") || href.startsWith("#")) {
      // Internal link: use Router.to for SPA navigation
      return `<a href="${href}" @click="navigateTo({href: '${href}'})">`;
    }
    // External link: open in new tab
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">`;
  };

  // Override heading rendering to add anchor IDs
  md.renderer.rules.heading_open = (tokens, idx) => {
    const level = tokens[idx].tag;
    const slug = tokens[idx].attrGet("id") || "";
    return `<${level} id="${slug}" class="doc-heading">`;
  };

  return originalRenderer(tokens, md.options, {});
}
```

### 9.4 Markdown-it Plugins

**Containers** (`::: tip`, `::: warning`, `::: danger`, `::: details`):

```ts
// src/markdown/plugins/containers.ts
import type MarkdownIt from "markdown-it";

const CONTAINER_TYPES = ["tip", "warning", "danger", "details"];

export function containerPlugin(
  md: MarkdownIt,
  options?: Record<string, { label: string }>,
): void {
  for (const type of CONTAINER_TYPES) {
    const label = options?.[type]?.label ?? type.toUpperCase();

    md.renderer.rules[`container_${type}`] = (tokens, idx) => {
      if (tokens[idx].nesting === 1) {
        const customTitle = tokens[idx].info.trim().slice(type.length).trim();
        const title = customTitle || label;

        if (type === "details") {
          return `<details class="doc-container doc-container-${type}">\n<summary>${md.utils.escapeHtml(title)}</summary>\n`;
        }
        return `<div class="doc-container doc-container-${type}">\n<p class="doc-container-title">${md.utils.escapeHtml(title)}</p>\n`;
      }
      return type === "details" ? "</details>\n" : "</div>\n";
    };
  }
}
```

**Anchors** (heading IDs and permalink symbols):

```ts
// src/markdown/plugins/anchors.ts
import type MarkdownIt from "markdown-it";

export function anchorPlugin(
  md: MarkdownIt,
  options?: { permalink?: boolean },
): void {
  md.core.ruler.push("heading_anchors", (state) => {
    const slugs = new Set<string>();

    for (const token of state.tokens) {
      if (token.type !== "heading_open") continue;

      const level = parseInt(token.tag.slice(1), 10);
      const nextToken = state.tokens[state.tokens.indexOf(token) + 1];
      const text =
        nextToken?.children
          ?.filter(
            (t: { type: string }) =>
              t.type === "text" || t.type === "code_inline",
          )
          .map((t: { content: string }) => t.content)
          .join("") ?? "";

      let slug = slugify(text);
      // Deduplicate slugs
      if (slugs.has(slug)) {
        let counter = 1;
        while (slugs.has(`${slug}-${counter}`)) counter++;
        slug = `${slug}-${counter}`;
      }
      slugs.add(slug);

      token.attrSet("id", slug);

      // Add permalink anchor
      if (options?.permalink && level <= 3) {
        const anchorToken = new state.Token("html_inline", "", 0);
        anchorToken.content = `<a class="doc-anchor" href="#${slug}">#</a>`;
        nextToken?.children?.push(anchorToken);
      }
    }
  });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}
```

**TOC** (table of contents extraction from headings):

```ts
// src/markdown/plugins/toc.ts
import type MarkdownIt from "markdown-it";

export function tocPlugin(
  md: MarkdownIt,
  options?: { level?: number[] },
): void {
  // Add a [[toc]] directive that renders to a placeholder.
  // The TocView fills this at runtime from pageData.headings.
  md.inline.ruler.before("emphasis", "toc", (state, silent) => {
    if (silent) return false;
    const match = state.src.slice(state.pos).match(/^\[\[toc\]\]/i);
    if (!match) return false;
    if (!silent) {
      const token = state.push("toc_placeholder", "", 0);
      token.markup = match[0];
    }
    state.pos += match[0].length;
    return true;
  });

  md.renderer.rules.toc_placeholder = () => {
    return '<div v-lark="theme/toc"></div>';
  };
}
```

**Code Blocks** (Shiki highlighting + line numbers):

```ts
// src/markdown/plugins/code-blocks.ts
import type MarkdownIt from "markdown-it";

export function codeBlockPlugin(
  md: MarkdownIt,
  options?: { lineNumbers?: boolean },
): void {
  const originalFence = md.renderer.rules.fence;

  md.renderer.rules.fence = (tokens, idx, mdOptions, env, self) => {
    const token = tokens[idx];
    const lang = token.info.trim().split(/\s+/)[0] || "";
    const code = token.content;

    // Code highlighting is done at build time via Shiki.
    // The highlighted HTML is injected as raw template output.
    const langAttr = lang ? ` data-lang="${md.utils.escapeHtml(lang)}"` : "";
    const lineNumClass = options?.lineNumbers ? " doc-code-lines" : "";

    return `<pre class="doc-code${lineNumClass}"${langAttr}><code>${md.utils.escapeHtml(code)}</code></pre>\n`;
  };
}
```

### 9.5 Code Highlighting (Shiki)

Shiki is used for build-time syntax highlighting. It produces HTML with inline styles (no external CSS needed), supporting 100+ languages via TextMate grammars.

```ts
// src/markdown/highlighter.ts
import { createHighlighter, type Highlighter } from "shiki";
import type { HighlightOptions } from "../types";

let highlighter: Highlighter | null = null;

export async function initHighlighter(
  options?: HighlightOptions,
): Promise<Highlighter> {
  if (highlighter) return highlighter;

  highlighter = await createHighlighter({
    themes: [options?.theme ?? "github-dark"],
    langs: options?.languages ?? [
      "typescript",
      "javascript",
      "html",
      "css",
      "json",
      "bash",
      "yaml",
      "markdown",
    ],
  });

  return highlighter;
}

export function highlightCode(
  hl: Highlighter,
  code: string,
  lang: string,
  theme?: string,
): string {
  try {
    return hl.codeToHtml(code, {
      lang: lang || "text",
      theme: theme ?? "github-dark",
    });
  } catch {
    // Fallback: escaped plain text
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
```

## 10. Compiler (Markdown -> JS Module)

### 10.1 Compilation Pipeline

```ts
// src/compiler/compile-markdown.ts
import { extractFrontmatter } from "./extract-frontmatter";
import { createParser } from "../markdown/parser";
import { renderToLarkTemplate } from "../markdown/renderer";
import { highlightCode, initHighlighter } from "../markdown/highlighter";
import type { DocConfig, HeadingInfo } from "../types";

export interface CompileMarkdownOptions {
  config: DocConfig;
  filePath: string;
  debug?: boolean;
}

/**
 * Compile a .md file into a JS module string that exports a lark-mvc
 * template function: (data, viewId, refData) => string
 *
 * Pipeline:
 * 1. Extract frontmatter (YAML)
 * 2. Parse markdown to token stream (markdown-it)
 * 3. Apply custom plugins (anchors, containers, TOC, code blocks)
 * 4. Render tokens to HTML string with lark-mvc template syntax
 * 5. Wrap in a JS module that exports the template function
 * 6. Embed pageData as a static export
 */
export async function compileMarkdown(
  source: string,
  options: CompileMarkdownOptions,
): Promise<string> {
  const { data: frontmatter, content } = extractFrontmatter(source);
  const md = createParser(options.config.markdown);

  // Highlight code blocks if Shiki is configured
  if (options.config.highlight) {
    const hl = await initHighlighter(options.config.highlight);
    md.options.highlight = (code: string, lang: string) => {
      return highlightCode(hl, code, lang, options.config.highlight?.theme);
    };
  }

  const tokens = md.parse(content, {});
  const htmlBody = renderToLarkTemplate(tokens, md);
  const pageData = buildPageData(frontmatter, content, options.filePath);

  return generateModule(htmlBody, pageData, options);
}

function buildPageData(
  frontmatter: Record<string, unknown>,
  content: string,
  filePath: string,
): { title: string; description?: string; headings: HeadingInfo[] } {
  const title =
    (frontmatter.title as string) || extractFirstHeading(content) || "";
  const headings = extractHeadings(content);

  return {
    title,
    description: frontmatter.description as string | undefined,
    headings,
  };
}

function extractFirstHeading(content: string): string | undefined {
  const match = content.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim();
}

function extractHeadings(content: string): HeadingInfo[] {
  const headings: HeadingInfo[] = [];
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let m;
  while ((m = regex.exec(content)) !== null) {
    headings.push({
      level: m[1].length,
      text: m[2].trim(),
      slug: m[2]
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-"),
    });
  }
  return headings;
}
```

### 10.2 Module Generation

The compiled output is a JS module that lark-mvc can consume as a View:

```ts
function generateModule(
  htmlBody: string,
  pageData: { title: string; description?: string; headings: HeadingInfo[] },
  options: CompileMarkdownOptions,
): string {
  const pageDataJson = JSON.stringify(pageData);
  const escapedHtml = htmlBody.replace(/`/g, "\\`").replace(/\$/g, "\\$");

  return `
// Generated by @lark.js/doc from: ${options.filePath}
import { View, Router } from "@lark.js/mvc";

export const pageData = ${pageDataJson};

const template = function(data, viewId, refData) {
  return \`${escapedHtml}\`;
};

export default View.extend({
  template,
  init() {
    this.updater.set({
      title: pageData.title,
      description: pageData.description || "",
      headings: pageData.headings,
    });
  },
  render() {
    this.updater.digest();
  },
  "navigateTo<click>"(e) {
    const params = e.params;
    if (params?.href) {
      e.preventDefault?.();
      Router.to(params.href);
    }
  },
});
`;
}
```

## 11. Multi-Bundler Plugins

### 11.1 Vite Plugin

```ts
// src/vite.ts
import type { Plugin } from "vite";
import { compileMarkdown } from "./compiler/compile-markdown";
import type { DocConfig } from "./types";

export interface LarkDocPluginOptions {
  config: DocConfig;
  debug?: boolean;
}

const LARK_DOC_SUFFIX = "?lark-doc-template";

/**
 * Vite plugin that transforms .md imports into lark-mvc View modules.
 *
 * Usage:
 *   import { larkDocPlugin } from "@lark.js/doc/vite";
 *   import { larkMvcPlugin } from "@lark.js/mvc/vite";
 *
 *   export default defineConfig({
 *     plugins: [
 *       larkDocPlugin({ config: docConfig }),
 *       larkMvcPlugin(),
 *     ],
 *   });
 *
 * Then in app code:
 *   import GuideView from "./docs/guide/index.md";
 */
export function larkDocPlugin(options: LarkDocPluginOptions): Plugin {
  const { config, debug } = options;
  let root = "";

  return {
    name: "lark-doc",
    enforce: "pre",

    configResolved(resolved) {
      root = resolved.root;
    },

    resolveId(source, importer) {
      if (!source.endsWith(".md")) return null;

      const path = require("node:path");
      const resolved = importer
        ? path.resolve(path.dirname(importer), source)
        : source;

      return resolved + LARK_DOC_SUFFIX;
    },

    async load(id) {
      if (!id.endsWith(LARK_DOC_SUFFIX)) return null;

      const filePath = id.slice(0, -LARK_DOC_SUFFIX.length);
      const fs = await import("node:fs");
      const source = fs.readFileSync(filePath, "utf-8");

      return compileMarkdown(source, { config, filePath, debug });
    },
  };
}
```

### 11.2 Webpack Loader + Plugin

```ts
// src/webpack.ts
import { compileMarkdown } from "./compiler/compile-markdown";
import type { DocConfig } from "./types";

interface LarkDocLoaderOptions {
  config: DocConfig;
  debug?: boolean;
}

/**
 * Webpack loader for .md files.
 * Uses this.callback() for async delivery (standard webpack 5 pattern).
 */
export async function larkDocLoader(
  this: {
    callback: Function;
    getOptions: () => LarkDocLoaderOptions;
    resourcePath: string;
  },
  source: string,
): Promise<void> {
  const callback = this.callback;
  const options = this.getOptions();

  try {
    const result = await compileMarkdown(source, {
      config: options.config,
      filePath: this.resourcePath,
      debug: options.debug,
    });
    callback(null, result);
  } catch (err) {
    callback(err);
  }
}

/**
 * Webpack plugin that auto-registers the .md loader rule.
 */
export class LarkDocPlugin {
  private options: LarkDocLoaderOptions;

  constructor(options: LarkDocLoaderOptions) {
    this.options = options;
  }

  apply(compiler: { options: { module: { rules: unknown[] } } }): void {
    compiler.options.module.rules.push({
      test: /\.md$/,
      exclude: /node_modules/,
      use: [{ loader: __filename, options: this.options }],
    });
  }
}
```

### 11.3 Rspack Loader + Plugin

```ts
// src/rspack.ts
import { compileMarkdown } from "./compiler/compile-markdown";
import type { DocConfig } from "./types";

interface LarkDocLoaderOptions {
  config: DocConfig;
  debug?: boolean;
}

/**
 * Rspack loader for .md files.
 * Returns a Promise directly (Rspack async loaders must return the result).
 */
export async function larkDocLoader(
  this: { getOptions: () => LarkDocLoaderOptions; resourcePath: string },
  source: string,
): Promise<string> {
  const options = this.getOptions();
  return compileMarkdown(source, {
    config: options.config,
    filePath: this.resourcePath,
    debug: options.debug,
  });
}

/**
 * Rspack plugin that auto-registers the .md loader rule.
 */
export class LarkDocPlugin {
  private options: LarkDocLoaderOptions;

  constructor(options: LarkDocLoaderOptions) {
    this.options = options;
  }

  apply(compiler: { options: { module: { rules: unknown[] } } }): void {
    compiler.options.module.rules.push({
      test: /\.md$/,
      exclude: /node_modules/,
      use: [{ loader: __filename, options: this.options }],
    });
  }
}
```

## 12. Theme / Layout Views

The theme is a set of fixed Lark Views using Tailwind CSS + DaisyUI. Users cannot customize the theme in v1.

### 12.1 DocLayout (Main Layout)

The DocLayout wraps every doc page. It provides the three-column structure: sidebar (left), content (center), TOC (right).

```html
<!-- src/theme/doc-layout.html -->
<div class="bg-base-100 min-h-screen">
  <!-- Top navigation bar -->
  <nav class="navbar bg-base-200 border-base-300 sticky top-0 z-50 border-b">
    <div class="flex-1">
      <a class="btn btn-ghost text-xl" @click="navigateHome()"
        >{{=siteTitle}}</a
      >
    </div>
    <div class="flex-none">
      <ul class="menu menu-horizontal px-1">
        {{forOf navItems as item idx}}
        <li>
          {{if item.link}}
          <a @click="navigateTo({href: '{{=item.link}}'})">{{=item.text}}</a>
          {{else}}
          <span>{{=item.text}}</span>
          {{/if}}
        </li>
        {{/forOf}}
      </ul>
      <label class="btn btn-ghost btn-circle" @click="openSearch()">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </label>
    </div>
  </nav>

  <div class="mx-auto flex max-w-7xl">
    <!-- Sidebar -->
    <aside
      class="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto p-4 lg:block"
    >
      <div v-lark="theme/sidebar"></div>
    </aside>

    <!-- Main content -->
    <main class="min-w-0 flex-1 px-8 py-6">
      <article class="prose prose-lg max-w-none">
        <div v-lark="theme/content"></div>
      </article>

      <!-- Prev / Next navigation -->
      <div class="border-base-300 mt-12 flex justify-between border-t pt-6">
        {{if prevPage}}
        <a
          class="btn btn-outline"
          @click="navigateTo({href: '{{=prevPage.link}}'})"
        >
          &larr; {{=prevPage.text}}
        </a>
        {{else}}
        <span></span>
        {{/if}} {{if nextPage}}
        <a
          class="btn btn-outline"
          @click="navigateTo({href: '{{=nextPage.link}}'})"
        >
          {{=nextPage.text}} &rarr;
        </a>
        {{/if}}
      </div>
    </main>

    <!-- Table of contents (right) -->
    <aside
      class="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 overflow-y-auto p-4 xl:block"
    >
      <div v-lark="theme/toc"></div>
    </aside>
  </div>
</div>
```

```ts
// src/theme/doc-layout.ts
import { View, Router, State } from "@lark.js/mvc";
import template from "./doc-layout.html";

export default View.extend({
  template,
  init() {
    this.observeLocation([], true); // observe path changes
    this.assign();
  },
  assign() {
    this.updater.snapshot();
    const siteData = State.get("siteData") as Record<string, unknown>;
    this.updater.set({
      siteTitle: siteData?.title || "Documentation",
      navItems: siteData?.nav || [],
    });
    return this.updater.altered();
  },
  render() {
    this.updater.digest();
  },
  "navigateTo<click>"(e: Record<string, unknown>) {
    const params = e.params as Record<string, string> | undefined;
    if (params?.href) Router.to(params.href);
  },
  "navigateHome<click>"() {
    Router.to("/");
  },
  "openSearch<click>"() {
    State.set({ searchOpen: true }).digest();
  },
});
```

### 12.2 Sidebar View

```html
<!-- src/theme/sidebar.html -->
<nav class="doc-sidebar">
  {{forOf sidebarGroups as group}}
  <div class="mb-4">
    {{if group.text}}
    <p
      class="text-base-content/70 mb-2 text-sm font-semibold tracking-wider uppercase"
    >
      {{=group.text}}
    </p>
    {{/if}}
    <ul class="menu menu-sm">
      {{forOf group.items as item}}
      <li>
        <a
          class="{{if item.isActive}}active{{/if}}"
          @click="navigateTo({href: '{{=item.link}}'})"
        >
          {{=item.text}}
        </a>
      </li>
      {{/forOf}}
    </ul>
  </div>
  {{/forOf}}
</nav>
```

### 12.3 TOC View (Right-side heading outline)

```html
<!-- src/theme/toc.html -->
<div class="doc-toc">
  <p
    class="text-base-content/70 mb-2 text-sm font-semibold tracking-wider uppercase"
  >
    On this page
  </p>
  <ul class="menu menu-sm">
    {{forOf headings as heading}}
    <li class="{{if heading.level === 3}}ml-4{{/if}}">
      <a
        class="{{if heading.isActive}}active text-primary{{/if}}"
        href="#{{=heading.slug}}"
        @click="scrollToHeading({slug: '{{=heading.slug}}'})"
      >
        {{=heading.text}}
      </a>
    </li>
    {{/forOf}}
  </ul>
</div>
```

### 12.4 Search View

```html
<!-- src/theme/search.html -->
{{if isOpen}}
<div class="modal modal-open">
  <div class="modal-box max-w-2xl">
    <input
      type="text"
      class="input input-bordered mb-4 w-full"
      placeholder="Search documentation..."
      @input="onSearchInput()"
      id="search-input"
    />
    <div class="max-h-96 overflow-y-auto">
      {{forOf results as result}}
      <a
        class="hover:bg-base-200 block cursor-pointer rounded p-3"
        @click="goToResult({href: '{{=result.link}}'})"
      >
        <p class="font-medium">{{=result.title}}</p>
        {{if result.excerpt}}
        <p class="text-base-content/60 text-sm">{{=result.excerpt}}</p>
        {{/if}}
      </a>
      {{/forOf}} {{if noResults}}
      <p class="text-base-content/50 py-8 text-center">No results found</p>
      {{/if}}
    </div>
    <div class="modal-action">
      <button class="btn" @click="closeSearch()">Close</button>
    </div>
  </div>
</div>
{{/if}}
```

## 13. Client-Side Search

### 13.1 Search Index Generation (Build Time)

At build time, a JSON search index is generated from all `.md` files:

```ts
// src/search-index.ts
import type { DocRoute } from "./types";

export interface SearchEntry {
  title: string;
  link: string;
  headings: string[];
  excerpt: string;
}

/**
 * Build a search index from all doc routes.
 * The index is serialized as JSON and loaded lazily when the user opens search.
 */
export function buildSearchIndex(routes: DocRoute[]): SearchEntry[] {
  return routes.map((route) => ({
    title: route.pageData.title,
    link: route.path,
    headings: route.pageData.headings.map((h) => h.text),
    excerpt: "",
  }));
}

/**
 * Emit the search index as a virtual module or static JSON file.
 */
export function emitSearchIndex(index: SearchEntry[]): string {
  return `export default ${JSON.stringify(index)};`;
}
```

### 13.2 Client-Side Search (Runtime)

The search uses a simple substring matching algorithm:

```ts
// src/runtime.ts (excerpt)

export interface SearchEntry {
  title: string;
  link: string;
  headings: string[];
  excerpt: string;
}

/**
 * Client-side full-text search over the pre-built index.
 * Matches against title, headings, and excerpt.
 */
export function searchDocs(index: SearchEntry[], query: string): SearchEntry[] {
  if (!query.trim()) return [];

  const terms = query.toLowerCase().split(/\s+/);

  return index
    .filter((entry) => {
      const haystack = [entry.title, ...entry.headings, entry.excerpt]
        .join(" ")
        .toLowerCase();

      return terms.every((term) => haystack.includes(term));
    })
    .slice(0, 20);
}
```

## 14. Sidebar Auto-Generation

### 14.1 Algorithm

```ts
// src/sidebar-generator.ts
import type { DocRoute, SidebarItem } from "./types";

/**
 * Auto-generate sidebar items from scanned routes.
 *
 * Grouping rules:
 * 1. Routes are grouped by their top-level directory
 * 2. Within each group, items are sorted by:
 *    a. sidebarPosition (frontmatter) if present
 *    b. Alphabetically by title
 * 3. index.md becomes the group's default page (not a separate item)
 * 4. Nested directories become collapsed sub-groups
 */
export function generateSidebar(
  routes: DocRoute[],
  prefix: string,
  baseUrl: string,
): SidebarItem[] {
  const normalizedPrefix = baseUrl + prefix.replace(/^\//, "");
  const prefixRoutes = routes.filter((r) =>
    r.path.startsWith(normalizedPrefix),
  );

  // Group by subdirectory
  const groups = new Map<string, DocRoute[]>();

  for (const route of prefixRoutes) {
    const relativePath = route.path.slice(normalizedPrefix.length);
    const parts = relativePath.split("/").filter(Boolean);
    const groupKey = parts.length > 1 ? parts[0] : "";

    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey)!.push(route);
  }

  const items: SidebarItem[] = [];

  for (const [groupKey, groupRoutes] of groups) {
    groupRoutes.sort((a, b) => {
      const posA = a.pageData.sidebarPosition ?? 999;
      const posB = b.pageData.sidebarPosition ?? 999;
      if (posA !== posB) return posA - posB;
      return a.pageData.title.localeCompare(b.pageData.title);
    });

    const sidebarItems: SidebarItem[] = groupRoutes.map((r) => ({
      text: r.pageData.sidebarLabel || r.pageData.title,
      link: r.path,
    }));

    if (groupKey) {
      items.push({
        text: formatGroupLabel(groupKey),
        collapsed: false,
        items: sidebarItems,
      });
    } else {
      items.push(...sidebarItems);
    }
  }

  return items;
}

function formatGroupLabel(key: string): string {
  return key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
```

## 15. Boot Integration (how @lark.js/doc connects to @lark.js/mvc)

### 15.1 Build-Time: Virtual Modules

The build plugin generates two virtual modules:

**`virtual:lark-doc-site-data`** -- site metadata (title, nav, sidebar, search index):

```ts
// Generated at build time
export const siteData = {
  title: "My Library",
  description: "...",
  nav: [{ text: "Guide", link: "/docs/guide/" }],
  sidebar: { "/docs/guide/": [...] },
  searchIndex: [...],
};
```

**`virtual:lark-doc-routes`** -- route map + page data:

```ts
// Generated at build time
export const routes = {
  "/docs/guide/": "docs-guide-index",
  "/docs/guide/config": "docs-guide-config",
};
export const pages = {
  "docs-guide-index": { title: "Guide", headings: [...], ... },
  "docs-guide-config": { title: "Configuration", headings: [...], ... },
};
```

### 15.2 Runtime: Boot Sequence

```ts
// User's boot.ts (or auto-generated by @lark.js/doc)
import { Framework, registerViewClass, State } from "@lark.js/mvc";
import { siteData } from "virtual:lark-doc-site-data";
import { routes, pages } from "virtual:lark-doc-routes";
import DocLayout from "@lark.js/doc/theme/doc-layout";
import Sidebar from "@lark.js/doc/theme/sidebar";
import Content from "@lark.js/doc/theme/content";
import Toc from "@lark.js/doc/theme/toc";
import Search from "@lark.js/doc/theme/search";

// Register theme views
registerViewClass("theme/doc-layout", DocLayout);
registerViewClass("theme/sidebar", Sidebar);
registerViewClass("theme/content", Content);
registerViewClass("theme/toc", Toc);
registerViewClass("theme/search", Search);

// Inject site data into State for cross-view access
State.set({ siteData });

// Boot with generated routes
Framework.boot({
  rootId: "app",
  routeMode: "history", // from user config
  defaultPath: "/docs/",
  defaultView: "docs-guide-index",
  routes,
  unmatchedView: "docs-404",
  require: async (names: string[]) => {
    // Dynamic import for lazy loading doc pages
    return Promise.all(
      names.map((name) => import(/* @vite-ignore */ `./docs-views/${name}.ts`)),
    );
  },
});
```

### 15.3 Alternative: CLI-Driven Boot (like VitePress)

For an out-of-the-box experience, `@lark.js/doc` can provide a CLI that generates the boot file automatically:

```bash
# Development
npx lark-doc dev --docs ./docs --port 3000

# Build
npx lark-doc build --docs ./docs --outDir ./dist

# Preview built site
npx lark-doc preview --outDir ./dist --port 4000
```

The CLI:

1. Reads `lark-doc.config.ts` from the project root
2. Scans the `docs/` directory
3. Generates virtual modules (site data, route map, search index)
4. Starts the dev server (Vite / Webpack / Rspack) with the appropriate plugins
5. Serves the generated documentation site

## 16. Project Integration

### 16.1 User Project Structure

```
my-project/
  lark-doc.config.ts       # @lark.js/doc configuration
  index.html               # entry HTML
  vite.config.ts           # OR webpack.config.mjs / rspack.config.mjs
  docs/
    index.md               # -> /docs/
    getting-started.md     # -> /docs/getting-started
    guide/
      index.md             # -> /docs/guide/
      config.md            # -> /docs/guide/config
      plugins.md           # -> /docs/guide/plugins
    api/
      index.md             # -> /docs/api/
      router.md            # -> /docs/api/router
      state.md             # -> /docs/api/state
  src/
    boot.ts                # Framework.boot() with generated routes
```

### 16.2 User's Vite Config

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { larkMvcPlugin } from "@lark.js/mvc/vite";
import { larkDocPlugin } from "@lark.js/doc/vite";
import docConfig from "./lark-doc.config";

export default defineConfig({
  plugins: [larkDocPlugin({ config: docConfig }), larkMvcPlugin()],
});
```

### 16.3 User's Markdown File

```markdown
---
title: Configuration
description: How to configure @lark.js/mvc
sidebar_position: 2
sidebar_label: Config
---

# Configuration

This guide covers all configuration options for the framework.

## Framework.boot()

The `boot()` method accepts a `FrameworkConfig` object:

::: tip
Always call `registerViewClass` before `Framework.boot()`.
:::

## Router Modes

The framework supports two routing modes:

| Mode    | URL Format       |
| ------- | ---------------- |
| history | `/home?page=2`   |
| hash    | `#!/home?page=2` |

::: warning
Hash mode does not work with server-side rendering.
:::

See [Router API](/docs/api/router) for details.
```

## 17. Testing Strategy

### 17.1 Test Configuration

```ts
// packages/lark-doc/vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
  },
});
```

### 17.2 Test Coverage

| Module                 | Tests                                                          |
| ---------------------- | -------------------------------------------------------------- |
| `scanner.ts`           | Directory walking, ignored files, draft exclusion, nested dirs |
| `route-map.ts`         | Route generation, baseUrl prefix, viewId generation            |
| `frontmatter.ts`       | YAML parsing, missing frontmatter, malformed YAML              |
| `parser.ts`            | markdown-it setup, plugin chain, custom containers             |
| `renderer.ts`          | Token to HTML, heading anchors, link interception, code blocks |
| `compile-markdown.ts`  | Full pipeline: .md to JS module, pageData embedding            |
| `sidebar-generator.ts` | Auto-generation, sorting, grouping, nested dirs                |
| `search-index.ts`      | Index building, search matching                                |
| `vite.ts`              | resolveId, load hooks, .md transformation                      |
| `webpack.ts`           | Loader function, plugin apply                                  |
| `rspack.ts`            | Loader function (Promise), plugin apply                        |

### 17.3 Root Integration

Add to root `package.json`:

```json
{
  "scripts": {
    "test:doc": "pnpm --filter @lark.js/doc test"
  }
}
```

## 18. Tailwind CSS + DaisyUI Integration

### 18.1 Strategy

Since styling is not user-customizable, `@lark.js/doc` bundles its own Tailwind + DaisyUI setup:

1. The theme templates use Tailwind utility classes and DaisyUI component classes directly.
2. A `tailwind.config.ts` is provided that scans the theme `.html` templates for used classes.
3. The build plugin injects Tailwind CSS processing into the bundler config.

### 18.2 Tailwind Config

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";
import daisyui from "daisyui";

export default {
  content: [require.resolve("@lark.js/doc/dist/theme/**/*.html")],
  plugins: [daisyui],
  daisyui: {
    themes: ["light", "dark"],
  },
} satisfies Config;
```

### 18.3 CSS Entry

```css
/* src/theme/styles.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .doc-heading {
    @apply scroll-mt-20;
  }
  .doc-anchor {
    @apply text-base-content/30 hover:text-base-content/60 ml-2 no-underline;
  }
  .doc-container {
    @apply my-4 rounded-lg p-4;
  }
  .doc-container-tip {
    @apply bg-success/10 border-success border-l-4;
  }
  .doc-container-warning {
    @apply bg-warning/10 border-warning border-l-4;
  }
  .doc-container-danger {
    @apply bg-error/10 border-error border-l-4;
  }
  .doc-code {
    @apply my-4 overflow-x-auto rounded-lg;
  }
}
```

## 19. Implementation Phases

### Phase 1: Core Pipeline (Week 1-2)

- [ ] Package scaffolding (package.json, tsconfig, tsup, vitest)
- [ ] Markdown parser setup (markdown-it + gray-matter)
- [ ] Frontmatter extraction
- [ ] Custom markdown-it plugins (anchors, containers, code blocks, TOC)
- [ ] Custom renderer (tokens to lark-mvc template string)
- [ ] Compiler module (.md to JS module)
- [ ] Tests for parser, renderer, compiler

### Phase 2: Build Plugins (Week 3)

- [ ] Vite plugin (resolveId + load hooks for .md files)
- [ ] Webpack loader + plugin
- [ ] Rspack loader + plugin
- [ ] Tests for all three bundler integrations

### Phase 3: Scanner + Route Generation (Week 3-4)

- [ ] Directory scanner (recursive walk, filtering, frontmatter extraction)
- [ ] Route map generator (file paths to lark-mvc routes)
- [ ] Sidebar auto-generation
- [ ] Search index builder
- [ ] Tests for scanner, route map, sidebar

### Phase 4: Theme Views (Week 4-5)

- [ ] DocLayout View (navbar + sidebar + content + TOC)
- [ ] Sidebar View (navigation tree)
- [ ] ContentView (rendered markdown)
- [ ] TocView (right-side heading outline)
- [ ] SearchView (dialog with full-text search)
- [ ] Tailwind + DaisyUI integration
- [ ] Prev/Next page navigation

### Phase 5: Boot Integration (Week 5-6)

- [ ] Virtual module generation (site data, routes, search index)
- [ ] Boot sequence (route registration, State injection)
- [ ] CLI commands (dev, build, preview) -- optional for v1
- [ ] End-to-end testing with a real docs site
- [ ] README.md documentation

### Phase 6: Polish (Week 6-7)

- [ ] Code highlighting with Shiki
- [ ] Mobile responsive layout (sidebar collapse, hamburger menu)
- [ ] Dark mode toggle
- [ ] Edit-on-GitHub links
- [ ] Last-updated timestamps
- [ ] Performance optimization (lazy loading, chunk splitting)

## 20. Dependencies Summary

| Package        | Purpose                                 | Size Impact               |
| -------------- | --------------------------------------- | ------------------------- |
| `markdown-it`  | Markdown parser (token-stream based)    | ~50 KB                    |
| `gray-matter`  | YAML frontmatter extraction             | ~15 KB                    |
| `shiki`        | Syntax highlighting (TextMate grammars) | ~5 MB (lazy-loaded, WASM) |
| `@lark.js/mvc` | Framework (peer dependency)             | existing                  |
| `tailwindcss`  | Utility-first CSS                       | build-only                |
| `daisyui`      | Tailwind component library              | build-only                |

Shiki is the heaviest dependency. It uses WASM and TextMate grammars for accurate syntax highlighting. For v1, Shiki is the recommended choice because it produces zero-runtime CSS (inline styles). If bundle size becomes a concern, Shiki can be replaced with a lighter alternative (e.g., `highlight.js`) or moved to a build-time-only dependency where the highlighted HTML is baked into the compiled modules.

## 21. Risks and Mitigations

| Risk                                             | Mitigation                                                                          |
| ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| Shiki is large and slow to initialize            | Lazy-load Shiki only when code blocks are present; cache the highlighter instance   |
| markdown-it plugins may conflict                 | Test each plugin in isolation; use well-maintained plugins from the markdown-it org |
| Tailwind class scanning may miss dynamic classes | Use only static classes in templates; no dynamic class composition                  |
| Large docs sites may have slow build times       | Compile .md files in parallel; cache compiled modules                               |
| SPA-first approach hurts SEO                     | Plan SSG for v2; lark-mvc VDom engine can render to string                          |
