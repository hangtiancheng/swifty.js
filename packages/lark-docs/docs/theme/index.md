---
title: "Theme Architecture"
description: "View hierarchy, layout structure, content loading, and theme customization"
sidebar_position: 1
---

# Theme Architecture

`@lark.js/docs` ships a fixed theme composed of four lark-mvc Views arranged in a parent-child hierarchy. The theme is styled entirely with Tailwind CSS and DaisyUI -- no custom CSS classes are used or needed.

## View Hierarchy

```
theme/docs-layout (root)
  +-- theme/sidebar     (left navigation tree)
  +-- theme/toc         (right heading outline)
  +-- theme/search      (search modal, local provider only)
```

The DocLayout renders the compiled markdown HTML (`contentHtml`) inline within the content area -- there is no separate content view. This simplifies the architecture and keeps content loading within the layout's async render cycle.

## registerThemeViews

The recommended way to set up the theme is a single function call:

```ts
import { View } from "@lark.js/mvc";
import { registerThemeViews } from "@lark.js/docs/theme";

registerThemeViews(View);
```

This function imports all `.html` templates internally (compiled by `larkMvcPlugin` at build time), creates the four view classes, and calls `registerViewClass()` for each. Consumers never import `.html` files or call `registerViewClass` manually.

For advanced customization, individual view factories are also available:

```ts
import {
  createDocsLayoutView,
  createSidebarView,
  createTocView,
  createSearchView,
} from "@lark.js/docs/theme";
```

## DocLayout

The root layout view manages the entire page structure. It is the only view that renders the navbar, the three-column responsive grid, and the compiled markdown content.

### How content rendering works

The layout view stays mounted across all `/docs/*` routes. It does NOT unmount and remount on navigation. Instead:

1. `init()` calls `this.observeLocation([], true)` to subscribe to route changes.
2. On navigation, `render()` fires asynchronously.
3. `render()` calls `loadContent(path)` from State to dynamically import the compiled `.md` module.
4. The result contains `{ pageData, contentHtml }`.
5. `contentHtml` is set on the updater and rendered inline via `{{!contentHtml}}`.
6. `pageData.headings` are published to State for the TOC sub-view.
7. A signature guard short-circuits stale loads if the user navigates again before the previous import resolves.

```ts
async render() {
  const loadContent = State.get("loadContent");
  const path = Router.parse().path || docsConfig.baseUrl || "/docs/";

  const sig = this.signature;
  const content = await loadContent(path);
  if (this.signature !== sig) return; // superseded by a newer render

  State.set({
    currentPageHeadings: content.pageData.headings || [],
    currentPageTitle: content.pageData.title || "",
  }).digest();

  this.updater.set({
    siteTitle: docsConfig.title,
    contentHtml: content.contentHtml,
  });
  this.updater.digest();
}
```

### Template structure

```
bg-base-100 min-h-screen
  navbar (sticky, backdrop-blur, shadow-sm)
    navbar-start   -> site title button
    navbar-center  -> nav items menu (hidden below lg)
    navbar-end     -> search button or DocSearch container
  mx-auto flex max-w-7xl
    aside (left sidebar, w-64, hidden below lg)
      v-lark="theme/sidebar"
    main (flex-1)
      article.prose.prose-lg
        {{!contentHtml}}
      prev/next navigation
    aside (right TOC, w-56, hidden below xl)
      v-lark="theme/toc"
  v-lark="theme/search" (conditional on provider === "local")
```

### State dependencies

DocLayout reads from State on every render:

| Data key         | Source                        | Purpose                        |
| ---------------- | ----------------------------- | ------------------------------ |
| `docsConfig`     | `State.get("docsConfig")`     | Site title, nav, search config |
| `loadContent`    | `State.get("loadContent")`    | Async content loader function  |
| `getSearchIndex` | `State.get("getSearchIndex")` | Lazy search index builder      |

DocLayout also publishes to State for child views:

| Data key              | Published to State | Purpose                 |
| --------------------- | ------------------ | ----------------------- |
| `currentPageHeadings` | After content load | TOC heading data        |
| `currentPageTitle`    | After content load | Current page title      |
| `searchOpen`          | On search toggle   | Search modal visibility |

### Event handlers

| Handler          | Event | Action                                        |
| ---------------- | ----- | --------------------------------------------- |
| `navigateTo`     | click | Reads `data-href`, calls `Router.to(href)`    |
| `navigateHome`   | click | Calls `Router.to(baseUrl)`                    |
| `openSearch`     | click | Sets `searchOpen: true` in State (local only) |
| `_initDocSearch` | init  | Dynamically loads DocSearch widget            |

### Search provider switching

The template uses conditional rendering based on `searchProvider`:

```html
{{if searchProvider === "local"}}
<button class="btn btn-ghost btn-circle btn-sm" @click="openSearch()">
  {{!icons.search}}
</button>
{{else if searchProvider === "docsearch"}}
<div id="docsearch-container"></div>
{{/if}}
```

When `"docsearch"` is selected, the DocSearch widget mounts into the container div during `init()` and manages its own button and modal.

## Sidebar

The sidebar view renders a hierarchical navigation tree.

### Data flow

```
State.get("docsConfig").sidebar
  -> Record<prefix, SidebarItem[]>
  -> flatten into sidebarGroups[]
  -> render with DaisyUI menu component
```

Each group has a `text` label (derived from the URL prefix) and an `items` array. The `isActive` flag is computed by comparing each item's `link` against the current route path.

### Prefix formatting

URL prefixes are converted to human-readable labels:

```
"/docs/get-started/" -> "Get Started"
"/docs/api/"         -> "Api"
"/docs/markdown/"    -> "Markdown"
```

The algorithm strips leading/trailing slashes, replaces dashes with spaces, and capitalizes each word.

## TOC (Table of Contents)

The TOC view renders h2/h3 headings extracted from the current page, with scroll-spy to highlight the visible section.

### Heading data

Headings are read from `State.get("currentPageHeadings")`, which the DocLayout publishes after each content load:

```ts
interface HeadingInfo {
  level: number; // 2 for h2, 3 for h3
  text: string; // plain text content
  slug: string; // URL-safe anchor id
}
```

### Scroll behavior

Clicking a TOC entry finds the target element by its `id` attribute and scrolls to it:

```ts
el.scrollIntoView({ behavior: "smooth", block: "start" });
```

The `scroll-mt-20` class on heading elements provides offset for the sticky navbar.

## Search

The search view renders a modal dialog for full-text search. Only active when `search.provider === "local"` -- the DocSearch provider manages its own UI.

### Lazy loading

The search index is not loaded until the user first types in the search input. On first query, `getSearchIndex()` from State is called, which lazily loads all `.md` modules and extracts page data. The index is cached for subsequent searches.

### State machine

```
init -> isOpen: false, results: [], hasSearched: false
openSearch -> isOpen: true (focus input after 100ms)
onSearchInput -> results: [...matches], hasSearched: true
goToResult -> Router.to(link), close modal
closeSearch -> isOpen: false, reset
```

## Icons

Theme icons use `lucide-static` imported as raw SVG strings via Vite's `?raw` suffix:

```ts
import search from "lucide-static/icons/search.svg?raw";
export const icons = { search };
```

Icons are complete `<svg>...</svg>` markup strings rendered with `{{!icons.name}}` (raw output). They inherit `currentColor` from the parent element, so color is controlled via Tailwind text-color utilities.

## Customization

The theme is a fixed set of views and templates. To customize:

### Replacing templates

Import the default template, modify it, and pass it to the view factory:

```ts
import defaultLayout from "@lark.js/docs/theme/docs-layout.html";

// Create a modified template string
const customLayout = defaultLayout.replace(
  'class="navbar"',
  'class="navbar bg-primary text-primary-content"',
);

registerViewClass(
  "theme/docs-layout",
  createDocsLayoutView(View, customLayout),
);
```

### Overriding view behavior

Call `registerViewClass` with the same view ID after `registerThemeViews` to replace it:

```ts
registerThemeViews(View);

// Override the layout with a custom version
registerViewClass(
  "theme/docs-layout",
  createDocsLayoutView(View, myCustomTemplate),
);
```

### Adding custom theme views

Register additional views alongside the built-in four:

```ts
import { registerThemeViews } from "@lark.js/docs/theme";
import { View } from "@lark.js/mvc";

registerThemeViews(View);

registerViewClass(
  "theme/footer",
  View.extend({
    template: footerTemplate,
    init() {
      this.assign();
    },
    render() {
      this.updater.digest();
    },
  }),
);
```

### Adding theme CSS

Import additional CSS in your boot file:

```ts
// boot.ts
import "./main.css"; // Tailwind + DaisyUI
import "./custom.css"; // your overrides
```

All Tailwind utility classes and DaisyUI component classes are available for use in custom templates.

## Next Steps

- [Styling](/docs/style/) -- Tailwind CSS v4, DaisyUI, typography plugin
- [Search](/docs/search/) -- DocSearch widget integration and scoring
- [API Reference](/docs/api/) -- view factories, types, and configuration
