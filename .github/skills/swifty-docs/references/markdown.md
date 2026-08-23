# Markdown Extensions

Source of truth: `src/markdown/parser.ts`, `src/markdown/renderer.ts`, `src/markdown/plugins/{anchors,toc,containers,code-blocks}.ts`, `src/markdown/highlighter.ts`, `src/utils/{slugify,escape-html,heading-extraction}.ts`, `src/theme/lib/split-sections.ts`, `src/theme/mermaid.tsx`.

## Pipeline

`createParser(options?: MarkdownOptions)` builds a `markdown-it` (^14) instance with `{ html: true, linkify: true, typographer: false }` and applies four custom plugins **in order** (order matters — anchors before TOC, containers after):

1. `anchorPlugin` (`{ permalink: options?.anchor?.permalink ?? true }`)
2. `tocPlugin`
3. `containerPlugin` (`options?.containers`)
4. `codeBlockPlugin`

It also overrides two renderer rules: `link_open` (external link handling) and `heading_open` (adds `scroll-mt-20`). `renderToSwiftyTemplate(tokens, md)` just calls `md.renderer.render(...)` — the plugins do the work via rule overrides.

**String-output contract:** every custom render function returns an **HTML string** (some emit split open/close fragments across the nesting boundary), never JSX. All interpolated values go through the single shared `escapeHtml` (`src/utils/escape-html.ts`), which escapes `&`, `<`, `>`, `"` (sufficient because emitted attributes are always double-quoted). Do not add local escaping copies. Emit `<pre>` content on one line — `<pre>` preserves whitespace, so template indentation would leak into the code block.

## Heading anchors (`anchors.ts`)

Registers a core rule `heading_anchors`. For **every** heading it computes a slug with a per-document `createSlugger()` and sets `id="<slug>"` on the `heading_open` token. For **h1–h3** (when `permalink !== false`) it appends a permalink anchor into the heading's inline children:

```html
<a class="header-anchor" href="#<slug>" aria-label="Link to this section">#</a>
```

Heading text is extracted with the shared `inlineText()` (concatenates `text` + `code_inline` children, dropping emphasis/link markers), so anchor ids match the TOC slugs produced by `extractPageMeta`. `heading_open` also gets `class="scroll-mt-20"` (via `attrJoin`) to offset the sticky navbar during scroll-to-anchor.

### Slug dedup

`slugify(text)` — lowercase; replace any char that is not `\p{L}`, `\p{N}`, whitespace, or `-` with `-`; collapse whitespace → `-`; collapse repeated `-`; trim leading/trailing `-`; prefix a leading digit with `_` (so `#123` → `#_123`, a valid `querySelector`). CJK and other non-ASCII scripts are preserved. `createSlugger()` returns a stateful function: the first occurrence keeps the bare slug, later duplicates get `-1`, `-2`, … . Both the anchor plugin and `extractPageMeta` run every heading (including h1) through the slugger, so dedup counters stay aligned between rendered ids and TOC/search links.

## Table of contents (`toc.ts`)

Registers an inline rule (before `emphasis`) matching `^\[\[toc\]\]` (case-insensitive). It reports a match during the silent probe (so emphasis doesn't eat the leading `[`) and pushes a `toc_placeholder` token, rendered as:

```html
<div swifty-docs-toc></div>
```

At runtime `ContentRenderer` finds every `[swifty-docs-toc]` element and mounts an inline `<Toc headings={…} inline />` React root into it.

## Admonition containers (`containers.ts`)

Uses `markdown-it-container` for four fixed types: `tip`, `warning`, `danger`, `details`. Syntax:

```markdown
::: tip
Info-styled callout.
:::

::: warning Custom title
Warning-styled; text after the type becomes the title.
:::

::: danger
Error-styled callout.
:::

::: details Click to expand
Collapsible <details> with a rotating chevron.
:::
```

Rendering (all classes styled by `client.css`):
- `tip` / `warning` / `danger` → `<div class="callout callout-<type>" role="note"><p class="callout-title"><icon><title></p>…</div>`.
- `details` → `<details class="callout callout-details"><summary class="callout-title"><icon><title></summary>…</details>`.

The title is the trimmed text after the type, else the label from `markdown.containers[type].label`, else `type.toUpperCase()`. Titles are `escapeHtml`-escaped. Icons are decorative lucide glyphs (`InfoIcon`, `TriangleAlertIcon`, `OctagonAlertIcon`, `ChevronRightIcon`) rendered to strings at build time via `renderToString` (`react-dom/server`) with `aria-hidden="true"`.

## Code blocks (`code-blocks.ts`)

Overrides the `fence` renderer. The language is the first token in the info string.

- **` ```mermaid `** fences do **not** become code blocks — they render as a diagram placeholder:
  ```html
  <div class="mermaid-block" data-mermaid="<escapeHtml(encodeURIComponent(code))>"></div>
  ```
  `ContentRenderer` decodes `data-mermaid` and mounts `<MermaidDiagram code={…} />`.
- Otherwise the fence is wrapped in chrome: `<div class="codeblock" data-lang="<lang|text>">…inner…</div>`. `data-lang` drives the language chip (`.codeblock::after`).
  - **With Shiki configured** (`highlight` set): `md.options.highlight(code, lang, "")` returns a fully styled `<pre class="shiki">…</pre>`. Falls back to the plain block if it returns empty.
  - **Without Shiki**: `fallbackBlock` → `<pre class="codeblock-plain"><code class="language-<lang>"><escaped code></code></pre>` (single line).

The runtime `CopyButton` (mounted per `.codeblock` by `ContentRenderer`) copies `pre.innerText` via `navigator.clipboard`.

## Shiki highlighter (`highlighter.ts`)

- **Lazy singleton, cached by key.** `getHighlighter(theme?, languages?, darkTheme?)` dynamic-imports `shiki` on first use and `createHighlighter({ themes, langs })`. Instances are cached in a `Map` keyed by `theme+darkTheme:sortedLangs`; concurrent same-key calls share the in-flight promise; a rejected init is dropped from the promise map so a fixed config can retry (a retained rejection would disable highlighting forever).
- **Default theme** `DEFAULT_THEME = "github-dark"`, shared by loader and renderer so a `darkTheme`-only config still loads its light theme.
- **Default languages** — the ~45-language `DEFAULT_LANGUAGES` list (see `references/configuration.md`) used when `languages` is unset/empty.
- **`highlightCode(hl, code, lang, theme?, darkTheme?)`** — if `lang` isn't loaded, falls back to the `text` grammar. With `darkTheme`: `codeToHtml(code, { lang, themes: { light, dark }, defaultColor: false })` — every token carries `--shiki-light` / `--shiki-dark` variables and **no inline color**, so `client.css` switches schemes under `.dark` with no rebuild. Without `darkTheme`: single-theme inline colors. Any error → `<pre class="shiki"><code><escaped code></code></pre>`.

## Links

`link_open` override (`parser.ts`): links whose href does **not** start with `/` or `#` are treated as external and get `target="_blank"` + `rel="noopener noreferrer"`. Internal (`/…`) and hash (`#…`) links are left untouched — at runtime `LocationProvider` intercepts same-origin clicks for SPA navigation and `ContentRenderer` smooth-scrolls in-page `#` links (with `pushState`, decoded-hash comparison for CJK slugs).

## Search sectioning (`split-sections.ts`)

Consumed by `createSearchEngine` (not a markdown-it plugin, but part of the compiled-HTML contract). `splitContentSections(html)` splits the compiled page at `<h1–3 … id="…">…</h1–3>` boundaries using regex — reliable because the anchor plugin sets `id="slug"` on every heading and appends the `.header-anchor` link (stripped from titles). It strips tags and decodes entities to plain text (code-block text stays searchable; heading-like text inside fences can't match because fences are HTML-escaped). `buildSectionDocs(pages)` expands pages into per-section docs with an h1/h2 ancestry breadcrumb, deep-linking to `/route#slug`.

## Metadata extraction (`heading-extraction.ts`)

`extractPageMeta(content, excerptMaxLen = 200)` does a **single** markdown-it parse (a shared module-level instance) to collect: the first `# h1` (title candidate — first h1 only, even if empty), the h2/h3 `HeadingInfo[]` (deduped slugs), and a plain-text excerpt of non-heading body content (collapsed whitespace, sliced to 200 chars). Code blocks are naturally excluded because fence/code tokens are neither `heading_open` nor `inline`. This one helper backs `buildPageData` in both the scanner and the compiler, so titles/labels/headings can never drift between the two pipelines.
