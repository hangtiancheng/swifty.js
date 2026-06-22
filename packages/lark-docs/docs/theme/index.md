---
title: "Theme Architecture"
description: "View hierarchy, layout structure, and theme customization"
sidebar_position: 1
---

# Theme Architecture

`@lark.js/docs` ships a fixed theme composed of five lark-mvc Views arranged in a parent-child hierarchy. The theme is styled entirely with Tailwind CSS and DaisyUI -- no custom CSS classes are used or needed.

## View Hierarchy

```
theme/docs-layout (root)
  +-- theme/sidebar     (left navigation tree)
  +-- theme/content     (compiled markdown body)
  +-- theme/toc         (right heading outline)
  +-- theme/search      (search modal, local provider only)
```

Each view is a factory function that takes the lark-mvc `View` class and a compiled HTML template, returning a View subclass ready for `registerViewClass()`.

## DocLayout

The root layout view manages the entire page structure. It is the only view that renders the navbar and the three-column responsive grid.

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
        v-lark="theme/content"
      prev/next navigation
    aside (right TOC, w-56, hidden below xl)
      v-lark="theme/toc"
  v-lark="theme/search" (conditional on provider === "local")
```

### State dependencies

DocLayout reads from `State.get("docsConfig")` on every render:

| Data key         | Source                        | Purpose                         |
| ---------------- | ----------------------------- | ------------------------------- |
| `siteTitle`      | `docsConfig.title`            | Navbar title text               |
| `navItems`       | `docsConfig.nav`              | Top navigation links            |
| `searchProvider` | `docsConfig.search?.provider` | Conditional search UI rendering |
| `prevPage`       | Set by route handler          | Previous page navigation link   |
| `nextPage`       | Set by route handler          | Next page navigation link       |

DocLayout also calls `this.observeLocation([], true)` so it re-renders on every navigation, updating the prev/next links.

### Event handlers

| Handler          | Event | Action                                        |
| ---------------- | ----- | --------------------------------------------- |
| `navigateTo`     | click | Reads `data-href`, calls `Router.to(href)`    |
| `navigateHome`   | click | Calls `Router.to("/")`                        |
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

## Content

The content view renders compiled markdown as raw HTML.

### Template

```html
<div class="prose max-w-none">{{!contentHtml}}</div>
```

The `prose` class from `@tailwindcss/typography` applies typographic styles to the rendered markdown. `max-w-none` removes the default max-width constraint.

### Data source

`contentHtml` is passed through the View's `_initParams`, set by the route handler when a `.md` file is matched. The compiled markdown module exports a `template` function that returns the pre-rendered HTML string.

## TOC (Table of Contents)

The TOC view renders h2/h3 headings extracted from the current page, with scroll-spy to highlight the visible section.

### Heading data

Headings are extracted during the build pipeline by `extractHeadings()`:

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

The search index is not loaded until the user first types in the search input. This avoids paying the cost of parsing the JSON index on every page load.

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

Extend the factory output and add custom methods:

```ts
const baseLayout = createDocsLayoutView(View, layoutTemplate);
const customLayout = baseLayout.extend({
  assign() {
    const result = baseLayout.prototype.assign.call(this);
    this.updater.set({ customData: "value" });
    return result;
  },
});
registerViewClass("theme/docs-layout", customLayout);
```

### Adding theme CSS

Import additional CSS in your boot file:

```ts
// boot.ts
import "./main.css"; // Tailwind + DaisyUI
import "./custom.css"; // your overrides
```

All Tailwind utility classes and DaisyUI component classes are available for use in custom templates.
