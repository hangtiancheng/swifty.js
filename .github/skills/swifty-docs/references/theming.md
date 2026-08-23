# Theming & Style Customization

Source of truth: `src/client.css` (Tailwind CSS v4, CSS-first config) and `src/theme/**`. The stylesheet is the single source of styling truth — there is no JS theme config. Consumers customize by overriding CSS custom properties after importing `client.css`; components are not meant to be forked for color/spacing.

## How the stylesheet is wired

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@custom-variant dark (&:where(.dark, .dark *));
@source "./theme";   /* published client.css rewrites this to @source "./theme-chunk.js" */
```

- Semantic tokens are defined as `oklch` custom properties on `:root` and `.dark`, then mapped into the Tailwind color scale via `@theme inline` (so `bg-background`, `text-primary`, etc. work).
- Dark mode is driven entirely by a **`.dark` class on `<html>`** (the single source of truth), applied by a no-FOUC inline script and toggled by `ThemeToggle`.
- The library build rewrites `@source "./theme"` to `@source "./theme-chunk.js"` (a single stable chunk of all theme components), so consumers importing `@swifty.js/docs/client.css` get the theme's utility classes scanned automatically — no manual `@source` needed.

> **Doc/source gap:** the package `app/main.css` comment and older docs mention `@source "@swifty.js/docs/dist/theme.js"`. The published stylesheet points at `theme-chunk.js` and the export map uses `dist/theme.js` for the JS entry. When in doubt, rely on the automatic `@source` inside `client.css`.

## Semantic token tables (exact oklch values)

Tokens live on `:root` (light) and `.dark`. There are **no** `--border`, `--ring`, `--card`, `--popover`, or `--destructive-foreground` tokens — borders reuse `--muted` (via `@layer base { *, ::before, ::after { border-color: var(--muted); } }`) and focus rings/outlines reuse `--primary`.

### Light (`:root`, `color-scheme: light`)

| Token                    | Value                   |
| ------------------------ | ----------------------- |
| `--background`           | `oklch(1 0 0)`          |
| `--foreground`           | `oklch(0.145 0 0)`      |
| `--primary`              | `oklch(0.55 0.19 258)`  |
| `--primary-foreground`   | `oklch(1 0 0)`          |
| `--secondary`            | `oklch(0.965 0 0)`      |
| `--secondary-foreground` | `oklch(0.205 0 0)`      |
| `--muted`                | `oklch(0.96 0 0)`       |
| `--muted-foreground`     | `oklch(0.545 0 0)`      |
| `--accent`               | `oklch(0.955 0.02 255)` |
| `--accent-foreground`    | `oklch(0.35 0.12 258)`  |
| `--destructive`          | `oklch(0.58 0.21 27)`   |
| `--radius`               | `0.5rem`                |

### Dark (`.dark`, `color-scheme: dark`)

| Token                    | Value                    |
| ------------------------ | ------------------------ |
| `--background`           | `oklch(0.145 0 0)`       |
| `--foreground`           | `oklch(0.95 0 0)`        |
| `--primary`              | `oklch(0.72 0.14 255)`   |
| `--primary-foreground`   | `oklch(0.145 0.02 260)`  |
| `--secondary`            | `oklch(0.235 0 0)`       |
| `--secondary-foreground` | `oklch(0.92 0 0)`        |
| `--muted`                | `oklch(0.235 0 0)`       |
| `--muted-foreground`     | `oklch(0.7 0 0)`         |
| `--accent`               | `oklch(0.27 0.04 258)`   |
| `--accent-foreground`    | `oklch(0.85 0.08 255)`   |
| `--destructive`          | `oklch(0.65 0.2 25)`     |

`--radius` is not redefined in `.dark` (inherits the light value).

### `@theme inline` mappings

Each token is exposed as a Tailwind color: `--color-background`, `--color-foreground`, `--color-primary`, `--color-primary-foreground`, `--color-secondary`, `--color-secondary-foreground`, `--color-muted`, `--color-muted-foreground`, `--color-accent`, `--color-accent-foreground`, `--color-destructive`.

### Fonts

```
--font-display: Geist, Swifty, -apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC, Microsoft YaHei, sans-serif;
--font-sans:    Geist, Swifty, -apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC, Microsoft YaHei, sans-serif;
--font-mono:    Geist Mono, Swifty, Maple Mono, Menlo, Cascadia Code, Sarasa Gothic SC, PingFang SC, Microsoft YaHei, monospace;
```

### Radius scale

`--radius-sm: calc(var(--radius) - 4px)`, `--radius-md: calc(var(--radius) - 2px)`, `--radius-lg: var(--radius)`, `--radius-xl: calc(var(--radius) + 4px)`.

### Animation tokens (`@theme inline` + `@keyframes`)

| Token                | Value                                             |
| -------------------- | ------------------------------------------------- |
| `--animate-fade-in`  | `fade-in 0.3s ease-out both`                      |
| `--animate-page-in`  | `page-in 0.5s cubic-bezier(0.32,0.72,0,1) both`   |
| `--animate-dialog-in`| `dialog-in 0.24s cubic-bezier(0.32,0.72,0,1) both`|
| `--animate-overlay-in`| `overlay-in 0.2s ease-out both`                  |
| `--animate-shimmer`  | `shimmer 1.6s linear infinite`                    |

Keyframes: `fade-in` (opacity), `page-in` (opacity + `translateY(14px)`), `dialog-in` (opacity + `translateY(-10px) scale(0.97)`), `overlay-in` (opacity), `shimmer` (`background-position`). All motion is disabled under `@media (prefers-reduced-motion: reduce)` (durations forced to `0.01ms`, `scroll-behavior: auto`).

## Base layer

- `border-color: var(--muted)` on all elements/pseudo-elements.
- `html`: `-webkit-font-smoothing: antialiased`, `text-rendering: optimizeLegibility`, `scroll-behavior: smooth`.
- `body`: `background-color: var(--background)`, `color: var(--foreground)`, `font-family: var(--font-sans)`.
- `::selection` and `mark`: `color-mix(in oklab, var(--primary) 24%, transparent)` background.
- `:focus-visible`: `2px solid color-mix(in oklab, var(--primary) 65%, transparent)` outline, `2px` offset.

## Custom utilities (`@utility`)

- **`docs-grid`** — faded dot-grid background (radial-gradient of `--color-foreground` at 8%, `22px` grid, masked out below 440px). Used by `DocsLayout`'s `BackgroundLayers`.
- **`sidebar-scroll`** — thin scrollbar themed with `--color-foreground` at 18%; webkit thumb `bg-foreground/16`.
- **`skeleton`** — shimmer gradient over `--color-muted` for loading placeholders (`PageSkeleton`).

## Prose (`.prose`, `@tailwindcss/typography` + overrides)

`.prose` maps all `--tw-prose-*` variables to the semantic tokens (so no `prose-invert` is needed; colors flip with `.dark`): body/headings/bold/code → `--color-foreground`, links/counters/bullets → `--color-primary`, `pre-bg` → `--color-muted`, borders → `--color-muted` / mixes, quotes/captions/lead → `--color-muted-foreground`. Base size `0.9375rem`, line-height `1.8`. Headings use `--font-display`; `h2` gets a bottom border; tables get bordered/rounded styling with a mono uppercase `th`. Heading permalinks (`.header-anchor`) are `opacity-0` and reveal to `opacity-70` on `h1–h4:hover`.

## Code blocks (`.codeblock`)

- `.codeblock` — bordered, rounded (`12px`), `bg-muted`, hover border shifts toward `--color-primary`.
- `.codeblock::after` — the language chip from `data-lang` (top-left, mono uppercase).
- `.codeblock pre` — transparent bg, horizontal scroll, `pt-10` to clear the chip; `.codeblock code` is `block font-mono`.
- **Shiki dual-theme**: `.codeblock .shiki span { color: var(--shiki-light, inherit); }` and `.dark .codeblock .shiki span { color: var(--shiki-dark, var(--shiki-light, inherit)); }` — schemes switch with no rebuild.
- `.codeblock-actions` / `.codeblock-copy` / `.codeblock-copy-done` — the copy button holder and states (hidden until `.codeblock:hover` or focus; `pointer-coarse` shows it always; done state is `text-primary`).

## Mermaid (` ```mermaid ` fences)

- `.mermaid-block` — the placeholder holder (margin `1.4rem`).
- `.mermaid-diagram` — centered flex; `svg` is `max-width: 100%`.
- `.mermaid-error` — fallback rendering of raw mermaid source when render fails.

## Callouts (`::: tip / warning / danger / details`)

- `.callout` — bordered, rounded (`10px`); `.callout-title` is a mono uppercase row with a `size-3.5` SVG glyph.
- `.callout-tip` / `.callout-warning` — `--primary`-tinted background + border; title `text-primary`.
- `.callout-danger` — `--destructive`-tinted; title `text-destructive`.
- `.callout-details` — `--muted`-tinted `<details>`; `<summary>` hides the native marker; the chevron rotates 90° when `[open]`.

## Customization recipes

### Override colors / palette

Redefine tokens **after** importing `client.css`, for both schemes:

```css
@import "tailwindcss";
@import "@swifty.js/docs/client.css";

:root {
  --primary: oklch(0.6 0.2 300);          /* brand hue */
  --accent: oklch(0.95 0.03 300);
  --radius: 0.75rem;
}
.dark {
  --primary: oklch(0.75 0.15 300);
}
```

All components consume `--primary` (buttons, active sidebar item, TOC marker, focus rings, callout tints), so this one override re-skins the whole site.

### Override fonts

```css
@theme inline {
  --font-sans: "Inter", system-ui, sans-serif;
  --font-display: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}
```

### Dark-mode bootstrap (no-FOUC, in `index.html`, before the bundle)

```html
<script>
  (function () {
    try {
      var stored = localStorage.getItem("swifty-docs-theme");
      var dark = stored
        ? stored === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", dark);
    } catch (e) {}
  })();
</script>
```

The `swifty-docs-theme` key is exported as `THEME_STORAGE_KEY` for bundled code, but the inline script must hardcode the literal (it runs before any module loads). `ThemeToggle` and `MermaidDiagram` observe the `.dark` class via `MutationObserver`, so external toggles stay in sync.

## Theme exports (components / hooks / utilities)

Exported from both the main entry (`@swifty.js/docs`) and `@swifty.js/docs/theme`. See `references/api.md` for signatures and props.

- **Layout & content:** `DocsProvider`, `useDocs`, `DocsLayout`, `Navbar`, `Sidebar`, `Toc`, `ContentRenderer`, `PrevNext`, `SearchDialog`, `MermaidDiagram` (exported from `theme/mermaid`, mounted internally by `ContentRenderer`).
- **Chrome:** `ThemeToggle`, `THEME_STORAGE_KEY`, `Logo`.
- **shadcn-style primitives:** `Button` + `buttonVariants` (cva; variants `default`/`outline`/`ghost`/`secondary`, sizes `default`/`sm`/`lg`/`icon`), `Input` (forwardRef), `Kbd`, and the `Dialog` family (`Dialog`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogTitle`, `DialogDescription`, `DialogClose`, `DialogTrigger`, `DialogAccessibleTitle`).
- **Router:** `LocationProvider`, `useLocation`.
- **Hooks / utilities:** `cn`, `useScrollSpy`, `createSearchEngine`, `highlightSegments`, `computePrevNext`, `normalizePath`.
- **Password guard:** `createContentGuard`, `PasswordDialog`, `ContentGuard`, `PasswordDialogProps`.
