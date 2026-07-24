# Theming & Style Customization

All facts verified against `src/client.css` (Tailwind CSS v4, CSS-first config) and `src/theme/**`. The stylesheet is the single source of styling truth — there is no JS theme config.

## Architecture

`client.css` follows the shadcn token pattern:

1. Semantic tokens are CSS custom properties on `:root` (light) and `.dark` (dark), in `oklch`.
2. `@theme inline` maps each token into Tailwind's color scale (`--color-background: var(--background)`), so utilities like `bg-background` / `text-primary` work and flip automatically with `.dark`.
3. `@custom-variant dark (&:where(.dark, .dark *))` — dark mode is **class-based**, toggled on `<html>`.
4. `@source "./theme"` scans the theme components; consumers add `@source "@swifty.js/docs/theme.js"` for the precompiled bundle.

Consumer CSS entry:

```css
@import "tailwindcss";
@import "@swifty.js/docs/client.css";
@source "@swifty.js/docs/theme.js";
```

## Semantic token table (exact values from client.css)

| Token                                    | Light                                                    | Dark                                               |
| ---------------------------------------- | -------------------------------------------------------- | -------------------------------------------------- |
| `--background`                           | `oklch(0.979 0.004 145)`                                 | `oklch(0.162 0.013 150)`                           |
| `--foreground`                           | `oklch(0.243 0.022 152)`                                 | `oklch(0.912 0.008 150)`                           |
| `--card` / `--card-foreground`           | `oklch(0.992 0.003 145)` / fg                            | `oklch(0.187 0.013 150)` / fg                      |
| `--primary`                              | `oklch(0.507 0.09 155)`                                  | `oklch(0.723 0.098 155)`                           |
| `--primary-foreground`                   | `oklch(0.984 0.008 150)`                                 | `oklch(0.16 0.02 150)`                             |
| `--secondary` / `--secondary-foreground` | `oklch(0.94 0.014 150)`                                  | `oklch(0.232 0.015 150)`                           |
| `--muted` / `--muted-foreground`         | `oklch(0.947 0.009 150)` / `oklch(0.472 0.022 152)`      | `oklch(0.232 0.015 150)` / `oklch(0.677 0.02 152)` |
| `--accent` / `--accent-foreground`       | `oklch(0.922 0.028 155)`                                 | `oklch(0.268 0.032 155)`                           |
| `--destructive`                          | `oklch(0.577 0.215 27)`                                  | `oklch(0.65 0.2 25)`                               |
| `--border` / `--input`                   | `oklch(0.882 0.014 150)`                                 | `oklch(0.297 0.015 150)`                           |
| `--ring`                                 | same as `--primary`                                      | same as `--primary`                                |
| `--sidebar`                              | `oklch(0.966 0.006 145)`                                 | `oklch(0.148 0.012 150)`                           |
| `--code`                                 | `oklch(0.971 0.005 150)`                                 | `oklch(0.191 0.013 150)`                           |
| `--callout-warning`                      | `oklch(0.66 0.14 70)`                                    | `oklch(0.76 0.13 75)`                              |
| `--callout-danger`                       | `oklch(0.577 0.215 27)`                                  | `oklch(0.68 0.19 25)`                              |
| `--radius`                               | `0.625rem` (sm/md/lg/xl derived: −4px, −2px, base, +4px) | same                                               |

The default palette is green-tinted (hue ~145–155).

## Recipe: rebrand the palette

Override tokens **after** importing `client.css` — no component changes needed:

```css
@import "tailwindcss";
@import "@swifty.js/docs/client.css";
@source "@swifty.js/docs/theme.js";

:root {
  --primary: oklch(0.55 0.2 260); /* blue brand */
  --ring: oklch(0.55 0.2 260);
  --accent: oklch(0.93 0.03 260);
  --radius: 0.375rem; /* sharper corners */
}
.dark {
  --primary: oklch(0.72 0.15 260);
  --ring: oklch(0.72 0.15 260);
}
```

Because `@theme inline` references `var(--token)`, redefined values propagate to every `bg-*` / `text-*` / `border-*` utility and to prose, callouts, code blocks, selection color, and focus rings.

## Recipe: change fonts

`@theme inline` defines `--font-display`, `--font-sans`, `--font-mono` (all default to a mono stack: `Geist Mono, Swifty, Maple Mono, Menlo, Cascadia Code, Sarasa Gothic SC, PingFang SC, Microsoft YaHei, monospace`). Fonts are **not** self-hosted by the package — load your own `@font-face`/fontsource and override:

```css
@theme {
  --font-sans: "Inter", system-ui, sans-serif;
  --font-display: "Bricolage Grotesque", sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}
```

`--font-display` is used by prose h1–h3; `--font-sans` by `body`; `--font-mono` by inline code, code blocks, table headers, callout titles, and the codeblock language chip.

## Dark mode mechanics

- Class-based: `.dark` on `<html>`; `color-scheme` set on both roots.
- `ThemeToggle` (navbar) persists to localStorage key **`swifty-docs-theme`** (`"dark"` / `"light"`).
- No-FOUC: consumers add an inline `<head>` script (see `app/index.html`) that reads the key (fallback: `prefers-color-scheme`) and toggles `.dark` before first paint.
- Shiki dual-theme: with `highlight.darkTheme` set, tokens carry `--shiki-light`/`--shiki-dark` with no inline color; `client.css` switches which wins under `.dark` — no rebuild to change scheme.

## Prose (markdown body)

`.prose` maps every `--tw-prose-*` variable to semantic tokens, so `prose-invert` is **not needed** — colors flip with `.dark` automatically. Notable overrides (all in `client.css`): custom h1–h3 sizing/tracking on `--font-display`; primary-colored bullets/counters/links; bordered rounded tables with mono uppercase `th`; bordered rounded images; `.header-anchor` permalinks fade in on heading hover. Escape hatch: wrap markup in `class="not-prose"`.

## Component chrome classes (safe to restyle)

| Class                                                           | Element                                                                                                                      |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `.codeblock`                                                    | fence wrapper (rounded border, `bg-code`, hover border tint via `--primary`)                                                 |
| `.codeblock::after`                                             | language chip from `data-lang` attr                                                                                          |
| `.codeblock-actions`, `.codeblock-copy`, `.codeblock-copy-done` | copy-button chrome (revealed on hover / `pointer-coarse`)                                                                    |
| `.callout`, `.callout-title`                                    | admonition container + mono uppercase title row                                                                              |
| `.callout-tip` / `-warning` / `-danger` / `-details`            | per-type accents (`--primary`, `--callout-warning`, `--callout-danger`, muted `<details>` with rotating chevron on `[open]`) |
| `.header-anchor`                                                | heading `#` permalink                                                                                                        |

Custom utilities defined with `@utility`: `docs-grid` (dot-grid hero background with bottom fade mask), `sidebar-scroll` (thin styled scrollbar), `skeleton` (loading shimmer).

Animation tokens in `@theme inline`: `--animate-fade-in`, `--animate-page-in`, `--animate-dialog-in`, `--animate-overlay-in`, `--animate-shimmer` (usable as `animate-page-in`, etc.). A global `prefers-reduced-motion: reduce` block collapses all animations/transitions to 0.01ms and disables smooth scroll.

## Structural customization (beyond CSS)

The theme has no slot system. For structural changes, compose exported components yourself instead of `DocsLayout`: `Navbar`, `Sidebar`, `Toc`, `ContentRenderer`, `PrevNext`, `SearchDialog`, `ThemeToggle`, `Logo` are all exported from `@swifty.js/docs`, plus primitives `Button`/`buttonVariants`, `Input`, `Kbd`, `Dialog*` and helpers `cn()`, `useDocs()`, `useScrollSpy()`, `computePrevNext()`, `normalizePath()`. Layout constants worth knowing: max grid width 1440px, sidebar rail 236px (visible `lg+`), TOC rail 224px (visible `xl+`), nav items hidden below `md`, search opens on click / `⌘K`·`Ctrl+K` / `/`.
