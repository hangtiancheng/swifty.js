---
title: "Styling"
description: "Tailwind CSS and DaisyUI integration"
sidebar_position: 1
---

# Styling

`@lark.js/docs` uses **Tailwind CSS** and **DaisyUI** for all theme styling. The theme templates use only Tailwind utility classes and DaisyUI component classes — no custom CSS is written or needed.

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
```

Import it in your boot file:

```ts
// boot.ts
import "./main.css";
```

::: tip
`@tailwindcss/typography` is a peer dependency that provides the `prose` class used for rendered markdown content. It adds proper typographic styles to headings, paragraphs, lists, tables, and code blocks.
:::

## Theme Structure

The documentation site is composed of five theme views:

| View          | Role                                          | Key DaisyUI Components             |
| ------------- | --------------------------------------------- | ---------------------------------- |
| **DocLayout** | Root layout: navbar + sidebar + content + TOC | `navbar`, `btn-ghost`, `menu`      |
| **Sidebar**   | Navigation tree                               | `menu`, `menu-sm`, `menu-active`   |
| **Content**   | Rendered markdown body                        | `prose`, `max-w-none`              |
| **TOC**       | Right-side heading outline                    | `menu`, `menu-sm`, `menu-active`   |
| **Search**    | Full-text search dialog                       | `modal`, `input`, `input-bordered` |

## Layout

The DocLayout provides a three-column responsive structure:

```
┌─────────────────────────────────────────────────────┐
│  Navbar (sticky top)                                │
├────────┬──────────────────────────┬─────────────────┤
│        │                          │                 │
│Sidebar │      Main Content        │      TOC        │
│  64w   │      (flex-1)            │      56w        │
│        │      prose prose-lg      │                 │
│        │                          │                 │
│        │                          │                 │
│        ├──────────────────────────┤                 │
│        │  Prev / Next Navigation  │                 │
│        │                          │                 │
└────────┴──────────────────────────┴─────────────────┘
```

- Sidebar is visible on `lg:` (1024px+) screens
- TOC is visible on `xl:` (1280px+) screens
- On smaller screens, only the main content is shown

## Color System

All colors use DaisyUI semantic color names, which automatically adapt to the active theme:

| Usage              | Color Class            |
| ------------------ | ---------------------- |
| Page background    | `bg-base-100`          |
| Navbar background  | `bg-base-200`          |
| Borders            | `border-base-300`      |
| Primary text       | `text-base-content`    |
| Muted text         | `text-base-content/70` |
| Active links       | `text-primary`         |
| Tip containers     | `alert-info`           |
| Warning containers | `alert-warning`        |
| Danger containers  | `alert-error`          |

::: tip
Because DaisyUI colors are semantic (not fixed hex values), switching themes automatically updates all colors throughout the site.
:::

## Code Block Styling

Code blocks are styled by Shiki at build time. Shiki produces HTML with **inline styles** — no CSS classes are needed for syntax highlighting. The output includes:

- Background color via `style="background-color:#..."` on `<pre>`
- Per-token colors via `style="color:#..."` on `<span>` elements
- Theme name as a class for identification: `class="shiki github-dark"`

When Shiki is not configured, code blocks fall back to DaisyUI styling:

```html
<pre
  class="bg-neutral text-neutral-content rounded-box overflow-x-auto p-4"
></pre>
```

## Icons

Theme icons use [lucide-static](https://lucide.dev) imported as raw SVG strings via Vite's `?raw` suffix. Icons are rendered with `{{!icons.name}}` and inherit `currentColor` from their parent:

```html
<span class="h-5 w-5 [&>svg]:h-full [&>svg]:w-full"> {{!icons.search}} </span>
```

## Custom Themes

DaisyUI supports 30+ built-in themes. Switch themes in your Tailwind config:

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
