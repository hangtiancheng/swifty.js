---
title: "Get Started"
description: "Install, configure, and build your first documentation site"
sidebar_position: 1
---

# Get Started

This guide walks through installing `@lark.js/docs`, configuring your bundler, writing your first markdown page, and booting the documentation site.

## Installation

```bash
pnpm add @lark.js/docs @lark.js/mvc tailwindcss daisyui
```

::: tip
Your project must have Tailwind CSS and DaisyUI installed. The theme templates use Tailwind utility classes and DaisyUI components — they are peer dependencies of `@lark.js/docs`.
:::

## Bundler Configuration

### Vite (Recommended)

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { larkDocPlugin } from "@lark.js/docs/vite";
import { larkMvcPlugin } from "@lark.js/mvc/vite";
import tailwindcss from "@tailwindcss/vite";
import docConfig from "./lark-docs.config";

export default defineConfig({
  plugins: [
    larkDocPlugin({ config: docConfig }),
    larkMvcPlugin(),
    tailwindcss(),
  ],
});
```

### Webpack

```ts
import { LarkDocPlugin } from "@lark.js/docs/webpack";
import docConfig from "./lark-docs.config";

export default {
  plugins: [new LarkDocPlugin({ config: docConfig })],
};
```

### Rspack

```ts
import { LarkDocPlugin } from "@lark.js/docs/rspack";
import docConfig from "./lark-docs.config";

export default {
  plugins: [new LarkDocPlugin({ config: docConfig })],
};
```

## Entry HTML

Create a minimal HTML entry point:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>My Docs</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="./boot.ts"></script>
  </body>
</html>
```

## Boot File

The boot file registers theme views, imports compiled `.md` files, and starts the framework:

```ts
// boot.ts
import { Framework, View, State, registerViewClass } from "@lark.js/mvc";
import { routes, siteData } from "./routes";

import {
  createDocLayoutView,
  createSidebarView,
  createContentView,
  createTocView,
  createSearchView,
} from "@lark.js/docs/theme";

import docLayoutTemplate from "@lark.js/docs/theme/docs-layout.html";
import sidebarTemplate from "@lark.js/docs/theme/sidebar.html";
import contentTemplate from "@lark.js/docs/theme/content.html";
import tocTemplate from "@lark.js/docs/theme/toc.html";
import searchTemplate from "@lark.js/docs/theme/search.html";

import "./main.css";

// Register theme views
registerViewClass(
  "theme/docs-layout",
  createDocLayoutView(View, docLayoutTemplate),
);
registerViewClass("theme/sidebar", createSidebarView(View, sidebarTemplate));
registerViewClass("theme/content", createContentView(View, contentTemplate));
registerViewClass("theme/toc", createTocView(View, tocTemplate));
registerViewClass("theme/search", createSearchView(View, searchTemplate));

// Inject site data
State.set({ siteData });

// Boot
Framework.boot({
  rootId: "app",
  routeMode: "history",
  defaultPath: "/docs/",
  defaultView: "index",
  routes,
});
```

## CSS Entry

```css
/* main.css */
@import "tailwindcss";
@plugin "daisyui";
```

## Your First Page

Create `docs/index.md`:

```markdown
---
title: "Home"
description: "Welcome to my documentation"
---

# Welcome

This is the home page of my documentation.

## Features

- Feature one
- Feature two
- Feature three
```

::: warning
Always include YAML frontmatter with at least a `title` field. Without it, the title falls back to the first `# heading` in the content, or the filename.
:::

## Next Steps

- [Configuration](/docs/get-started/configuration/) — Full config reference
- [Markdown](/docs/markdown/) — Frontmatter, containers, code highlighting
- [Router](/docs/router/) — history/hash modes, baseUrl, route rules
