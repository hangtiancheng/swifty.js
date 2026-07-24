# Markdown Extensions

All facts verified against `src/markdown/plugins/{anchors,toc,containers,code-blocks}.ts` and `src/markdown/renderer.ts`. The parser is markdown-it ^14 with exactly four custom plugins plus a custom renderer pass.

Implementation note: every plugin's render function returns an **HTML string** (markdown-it contract), some emitting split open/close tags — do not attempt to convert them to JSX/TSX.

## 1. Heading anchors (`anchors.ts`)

- Core ruler pass `heading_anchors`: every heading gets `id={slugify(text)}` (text = concatenated `text` + `code_inline` child tokens).
- Slug dedup within a document: second occurrence gets `-1`, third `-2`, etc.
- For h1–h3 (when `markdown.anchor.permalink !== false`), an `html_inline` token is appended:
  `<a class="header-anchor" href="#slug" aria-label="Link to this section">#</a>` — styled to fade in on heading hover.

## 2. `[[toc]]` directive (`toc.ts`)

- Inline rule registered **before** `emphasis` matching `/^\[\[toc\]\]/i`; the silent-probe phase returns true so emphasis doesn't eat the leading `[`.
- Renders to `<div data-swifty-toc></div>`; at runtime `ContentRenderer` mounts an inline Preact `Toc` component into every placeholder.

## 3. Admonition containers (`containers.ts`)

Built on markdown-it-container for the four types `tip`, `warning`, `danger`, `details`:

```markdown
::: tip Optional Custom Title
content
:::

::: details Click to expand
hidden content
:::
```

- Title = custom text after the type, else `markdown.containers[type].label`, else uppercased type. HTML-escaped.
- Icons: lucide-static SVGs (`Info`, `TriangleAlert`, `OctagonAlert`, `ChevronRight`) with `aria-hidden="true"` injected.
- Output: `tip|warning|danger` → `<div class="callout callout-<type>" role="note"><p class="callout-title">{icon}{title}</p>...</div>`; `details` → `<details class="callout callout-details"><summary class="callout-title">...` with a chevron that rotates 90° on `[open]` (CSS).

## 4. Code blocks (`code-blocks.ts`)

Overrides the `fence` renderer:

- Language = first word of the fence info string.
- With a configured highlighter, Shiki produces the inner `<pre class="shiki">`; single theme → inline colors, dual theme (`darkTheme` set) → `--shiki-light`/`--shiki-dark` variables per token switched by `client.css` under `.dark`.
- Without Shiki (or on highlight failure): fallback `<pre class="codeblock-plain"><code class="language-{lang}">` with escaped text.
- Everything is wrapped: `<div class="codeblock" data-lang="{lang|text}">...</div>` — the chrome (language chip via `::after content: attr(data-lang)`, hover border, copy button mount) is pure CSS + `ContentRenderer` wiring.
- Shiki is initialized as an async lazy singleton on first compile; grammars/WASM cached across all files; unknown languages fall back to the `"text"` grammar.

## Renderer pass (`renderer.ts` — `renderToSwiftyTemplate`)

- Internal links (href starting `/` or `#`) get `data-swifty-nav="true"`; `ContentRenderer` intercepts clicks for SPA navigation (preact-iso route) and smooth-scrolls anchor links.
- External links get `target="_blank" rel="noopener noreferrer"`.
- Headings receive `scroll-mt-20` to offset the sticky navbar on anchor scroll.
- Output is fully static HTML embedded as `contentHtml`; dynamic data (title, TOC headings) travels separately in `pageData`.
