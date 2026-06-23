---
title: "Code Highlighting"
description: "Shiki-powered syntax highlighting for code blocks"
sidebar_position: 4
---

# Code Highlighting

`@lark.js/docs` uses [Shiki](https://shiki.style) for syntax highlighting. Shiki produces VSCode-quality output using TextMate grammars and renders to HTML with inline styles — no external CSS needed at runtime.

## Configuration

Enable syntax highlighting by adding a `highlight` section to your config:

```ts
// lark-docs.config.ts
export default defineConfig({
  highlight: {
    theme: "github-dark",
    languages: ["typescript", "javascript", "html", "css", "json", "bash"],
  },
});
```

::: warning
When `highlight` is omitted from the config, code blocks render as plain escaped text without color. This is intentional — Shiki is a large dependency (~5 MB with WASM + grammars) and should only be loaded when needed.
:::

## Options

### `theme`

Type: `string` — Default: `"github-dark"`

The Shiki color theme. Any built-in Shiki theme is supported:

| Theme           | Style                 |
| --------------- | --------------------- |
| `github-dark`   | Dark, GitHub-style    |
| `github-light`  | Light, GitHub-style   |
| `dracula`       | Dark, Dracula palette |
| `monokai`       | Dark, Monokai palette |
| `one-dark-pro`  | Dark, Atom-style      |
| `nord`          | Dark, Nord palette    |
| `vitesse-dark`  | Dark, Vitesse-style   |
| `vitesse-light` | Light, Vitesse-style  |

### `languages`

Type: `string[]`

Languages to load. Shiki supports 100+ languages via TextMate grammars; 44 are loaded by default. Common choices:

```ts
languages: [
  "typescript",
  "javascript",
  "html",
  "css",
  "json",
  "bash",
  "yaml",
  "markdown",
  "jsx",
  "tsx",
  "python",
  "rust",
  "go",
  "java",
  "c",
  "cpp",
];
```

::: tip
Only listed languages are loaded. If a code block uses an unlisted language, it renders as plain text with the `text` grammar.
:::

## Usage in Markdown

Specify the language after the opening triple backticks:

````markdown
```typescript
const x: number = 42;
```
````

This produces syntax-highlighted output:

```typescript
const greeting: string = "Hello, World!";

function add(a: number, b: number): number {
  return a + b;
}
```

## How It Works

Shiki is initialized lazily as a singleton:

1. **First code block** triggers async initialization (loads WASM + grammars, ~200-800ms)
2. **Subsequent code blocks** use the cached highlighter (instant)
3. **Output** is HTML with inline `style` attributes — zero runtime CSS dependency

```html
<pre class="shiki github-dark" style="background-color:#24292e">
  <code>
    <span class="line">
      <span style="color:#F97583">const</span>
      <span style="color:#79B8FF"> x</span>
      <span style="color:#F97583">:</span>
      <span style="color:#79B8FF"> number</span>
      <span style="color:#F97583"> =</span>
      <span style="color:#79B8FF"> 42</span>
      <span style="color:#E1E4E8">;</span>
    </span>
  </code>
</pre>
```

## Fallback Behavior

If Shiki fails to highlight a code block (unsupported language, initialization error), it falls back to escaped plain text:

```html
<pre class="shiki">
  <code>const x = 42;</code>
</pre>
```

This ensures documentation is always readable, even without syntax highlighting.
