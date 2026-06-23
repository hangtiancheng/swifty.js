---
title: "Styling"
description: "Tailwind CSS v4 and DaisyUI v5 integration"
sidebar_position: 1
---

# Styling

`@lark.js/docs` uses Tailwind CSS v4 and DaisyUI v5 for all theme styling. The theme templates use only Tailwind utility classes and DaisyUI component classes -- no custom CSS classes are written or needed.

## Setup

Install the peer dependencies:

```bash
pnpm add tailwindcss daisyui @tailwindcss/typography
```

Create a CSS entry file:

```css
/* main.css */
@import "tailwindcss";
@plugin "daisyui";
@plugin "@tailwindcss/typography";
```

Import it in your boot file:

```ts
// boot.ts
import "./main.css";
```

::: warning
`@tailwindcss/typography` is required for the `prose` class that styles rendered markdown content. Without it, headings, paragraphs, lists, tables, and code blocks inside the content area will have no typographic styling.
:::

## Theme Structure

The documentation site is composed of four theme views:

| View          | Role                                          | Key DaisyUI Components                        |
| ------------- | --------------------------------------------- | --------------------------------------------- |
| **DocLayout** | Root layout: navbar + sidebar + content + TOC | `navbar`, `btn-ghost`, `menu menu-horizontal` |
| **Sidebar**   | Navigation tree                               | `menu menu-sm`, `menu-active`                 |
| **TOC**       | Right-side heading outline                    | `menu menu-xs`, `menu-active`                 |
| **Search**    | Full-text search dialog (local provider)      | `modal`, `input input-lg`, `kbd`              |

The compiled markdown HTML is rendered inline by the DocLayout view (not a separate content view), inside a `prose` container styled by the Typography plugin.

## Layout

The DocLayout provides a three-column responsive structure:

```
navbar (sticky, backdrop-blur, shadow-sm)
  navbar-start   -> site title
  navbar-center  -> nav items (hidden below lg)
  navbar-end     -> search button or DocSearch container
mx-auto flex max-w-7xl
  aside (left, w-64, hidden below lg)
    sidebar view
  main (flex-1, px-8 py-10)
    article.prose.prose-lg
      contentHtml (rendered inline)
    prev/next navigation
  aside (right, w-56, hidden below xl)
    TOC view
```

Responsive breakpoints:

| Breakpoint            | Visible components      |
| --------------------- | ----------------------- |
| `< lg` (below 1024px) | Content only            |
| `lg:` (1024px+)       | Sidebar + content       |
| `xl:` (1280px+)       | Sidebar + content + TOC |

## Navbar

The navbar uses DaisyUI's `navbar` component with three slots:

```html
<div class="navbar bg-base-100/80 sticky top-0 z-50 shadow-sm backdrop-blur">
  <div class="navbar-start">
    <!-- Site title -->
  </div>
  <div class="navbar-center hidden lg:flex">
    <!-- Navigation menu (hidden on mobile) -->
  </div>
  <div class="navbar-end gap-2">
    <!-- Search button or DocSearch container -->
  </div>
</div>
```

The `bg-base-100/80` with `backdrop-blur` creates a frosted-glass effect on scroll.

## Color System

All colors use DaisyUI semantic color names, which adapt to the active theme:

| Usage              | Color Class            |
| ------------------ | ---------------------- |
| Page background    | `bg-base-100`          |
| Navbar background  | `bg-base-100/80`       |
| Borders            | `border-base-200`      |
| Primary text       | `text-base-content`    |
| Muted text         | `text-base-content/50` |
| Active links       | `text-primary`         |
| Active background  | `bg-primary/10`        |
| Tip containers     | `alert-info`           |
| Warning containers | `alert-warning`        |
| Danger containers  | `alert-error`          |

::: tip
Because DaisyUI colors are semantic (not fixed hex values), switching themes automatically updates all colors throughout the site without changing any class names.
:::

## Typography Plugin

The `@tailwindcss/typography` plugin provides the `prose` class that styles rendered markdown content. It adds proper typographic rules for:

- Headings (h1-h6) with appropriate sizing and spacing
- Paragraphs with readable line height and margins
- Lists (ordered, unordered) with proper indentation
- Blockquotes with left border styling
- Tables with borders and padding
- Inline and block code with background colors
- Links with color and hover states
- Images with max-width constraints
- Horizontal rules

The DocLayout view renders the compiled markdown HTML inside a `prose` container:

```html
<article class="prose prose-lg max-w-none">{{!contentHtml}}</article>
```

## Code Block Styling

Code blocks are styled by Shiki at build time. Shiki produces HTML with inline styles -- no CSS classes are needed for syntax highlighting. The output includes:

- Background color via `style="background-color:#..."` on `<pre>`
- Per-token colors via `style="color:#..."` on `<span>` elements
- Theme name as a class: `class="shiki github-dark"`

When Shiki is not configured, code blocks fall back to DaisyUI styling:

```html
<pre class="bg-neutral text-neutral-content rounded-box overflow-x-auto p-4">
  <code class="language-{lang}">...</code>
</pre>
```

## Icons

Theme icons use `lucide-static` imported as raw SVG strings via Vite's `?raw` suffix:

```html
<span class="h-4 w-4 [&>svg]:h-full [&>svg]:w-full"> {{!icons.search}} </span>
```

Icons are complete `<svg>...</svg>` markup strings. They inherit `currentColor` from the parent element, so color is controlled via Tailwind text-color utilities.

## Switching DaisyUI Themes

DaisyUI supports 30+ built-in themes. Configure themes in your CSS:

```css
@import "tailwindcss";

@plugin "daisyui" {
  themes:
    light --default,
    dark --prefersdark,
    wireframe,
    cyberpunk;
}
```

All `@lark.js/docs` theme templates use semantic color names (`base-100`, `primary`, `base-content`, etc.) so they adapt to any DaisyUI theme without modification.

## Custom CSS

If you need to add project-specific styles, import additional CSS in your boot file:

```ts
// boot.ts
import "./main.css"; // Tailwind + DaisyUI + typography
import "./custom.css"; // your overrides
```

Keep custom CSS minimal -- Tailwind utilities and DaisyUI components cover most use cases.

## Next Steps

- [Theme Architecture](/docs/theme/) -- view hierarchy and customization approaches
- [Search](/docs/search/) -- DocSearch widget styling and integration
- [API Reference](/docs/api/) -- theme factory functions and type definitions
