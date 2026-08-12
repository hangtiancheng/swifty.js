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

| Token                                    | Light                                                 | Dark                                             |
| ---------------------------------------- | ----------------------------------------------------- | ------------------------------------------------ |
| `--background`                           | `oklch(1 0 0)` (pure white)                           | `oklch(0.145 0 0)` (near-black)                  |
| `--foreground`                           | `oklch(0.145 0 0)` (near-black)                       | `oklch(0.95 0 0)` (off-white)                    |
| `--primary`                              | `oklch(0.55 0.19 258)` (React blue)                   | `oklch(0.72 0.14 255)` (lighter React blue)      |
| `--primary-foreground`                   | `oklch(1 0 0)`                                        | `oklch(0.145 0.02 260)`                          |
| `--secondary` / `--secondary-foreground` | `oklch(0.965 0 0)` / `oklch(0.205 0 0)`               | `oklch(0.235 0 0)` / `oklch(0.92 0 0)`           |
| `--muted` / `--muted-foreground`         | `oklch(0.96 0 0)` / `oklch(0.545 0 0)`                | `oklch(0.235 0 0)` / `oklch(0.7 0 0)`            |
| `--accent` / `--accent-foreground`       | `oklch(0.955 0.02 255)` / `oklch(0.35 0.12 258)`      | `oklch(0.27 0.04 258)` / `oklch(0.85 0.08 255)`  |
| `--destructive`                          | `oklch(0.58 0.21 27)`                                 | `oklch(0.65 0.2 25)`                             |
| `--radius`                               | `0.5rem` (sm/md/lg/xl derived: −4px, −2px, base, +4px) | same                                             |

The palette is Vercel-style: zero-chroma black/white neutrals with a React-blue
primary (hue ~255–258). There are **no** `--card`, `--card-foreground`,
`--border`, `--input`, `--ring`, `--sidebar`, `--code`, `--callout-warning`, or
`--callout-danger` tokens — those roles reuse the tokens above:

- **Borders** → `--muted` (utilities `border-muted`, `border-muted/70`, …; the
  base `*, ::before, ::after { border-color }` reset is `var(--muted)`).
- **Focus rings** → `--primary` (`ring-primary`, global `:focus-visible`
  outline is `color-mix(in oklab, var(--primary) 65%, transparent)`).
- **Input borders** → `--muted`, with `--primary` on focus.
- **Code surfaces** (`.codeblock`, `.mermaid-error`, prose `pre` bg, inline
  code) → `--muted` (`bg-muted`).
- **Card / drawer surfaces** (dialog, prev-next cards, mobile drawer) →
  `--background` (`bg-background`).
- **Callout accents** — tip and warning → `--primary`; danger →
  `--destructive`; details → muted.

## Recipe: rebrand the palette

Override tokens **after** importing `client.css` — no component changes needed:

```css
@import "tailwindcss";
@import "@swifty.js/docs/client.css";
@source "@swifty.js/docs/theme.js";

:root {
  --primary: oklch(0.55 0.2 150); /* green brand */
  --accent: oklch(0.93 0.03 150);
  --accent-foreground: oklch(0.35 0.12 150);
  --radius: 0.375rem; /* sharper corners */
}
.dark {
  --primary: oklch(0.72 0.15 150);
}
```

Because `@theme inline` references `var(--token)`, redefined values propagate to every `bg-*` / `text-*` / `border-*` utility and to prose, callouts, code blocks, selection color, and focus rings.

## Recipe: change fonts

`@theme inline` defines `--font-display` and `--font-sans` (both default to a Geist-style sans stack: `Geist, Swifty, -apple-system, PingFang SC, Microsoft YaHei, sans-serif`) and `--font-mono` (default `Geist Mono, Swifty, Maple Mono, Menlo, Cascadia Code, Sarasa Gothic SC, PingFang SC, Microsoft YaHei, monospace`). Fonts are **not** self-hosted by the package — load your own `@font-face`/fontsource and override:

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

| Class                                                           | Element                                                                                                                  |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `.codeblock`                                                    | fence wrapper (rounded border, `bg-muted`, hover border tint via `--primary`)                                            |
| `.codeblock::after`                                             | language chip from `data-lang` attr                                                                                      |
| `.codeblock-actions`, `.codeblock-copy`, `.codeblock-copy-done` | copy-button chrome (revealed on hover / `pointer-coarse`)                                                                |
| `.callout`, `.callout-title`                                    | admonition container + mono uppercase title row                                                                          |
| `.callout-tip` / `-warning` / `-danger` / `-details`            | per-type accents (tip and warning use `--primary`, danger uses `--destructive`, muted `<details>` with rotating chevron on `[open]`) |
| `.header-anchor`                                                | heading `#` permalink                                                                                                    |

Custom utilities defined with `@utility`: `docs-grid` (dot-grid hero background with bottom fade mask), `sidebar-scroll` (thin styled scrollbar), `skeleton` (loading shimmer).

Animation tokens in `@theme inline`: `--animate-fade-in`, `--animate-page-in`, `--animate-dialog-in`, `--animate-overlay-in`, `--animate-shimmer` (usable as `animate-page-in`, etc.). A global `prefers-reduced-motion: reduce` block collapses all animations/transitions to 0.01ms and disables smooth scroll.

## Structural customization (beyond CSS)

The theme has no slot system. For structural changes, compose exported components yourself instead of `DocsLayout`: `Navbar`, `Sidebar`, `Toc`, `ContentRenderer`, `PrevNext`, `SearchDialog`, `ThemeToggle`, `Logo` are all exported from `@swifty.js/docs`, plus primitives `Button`/`buttonVariants`, `Input`, `Kbd`, `Dialog*` and helpers `cn()`, `useDocs()`, `useScrollSpy()`, `computePrevNext()`, `normalizePath()`. Layout constants worth knowing: max grid width 1440px, sidebar rail 236px (visible `lg+`), TOC rail 224px (visible `xl+`), nav items hidden below `md`, search opens on click / `⌘K`·`Ctrl+K` / `/`.
