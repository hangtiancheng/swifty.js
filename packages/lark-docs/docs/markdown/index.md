---
title: "Markdown"
description: "Overview of markdown features supported by @lark.js/docs"
sidebar_position: 1
---

# Markdown

`@lark.js/docs` uses [markdown-it](https://github.com/markdown-it/markdown-it) as its markdown parser, enhanced with custom plugins for documentation-specific features.

## Standard Features

All standard CommonMark syntax is supported:

- **Headings** (h1 through h6)
- **Paragraphs**, **bold**, _italic_, `inline code`
- **Lists** (ordered and unordered)
- **Blockquotes**
- **Links** and **images**
- **Tables**
- **Horizontal rules**
- **HTML passthrough** (raw HTML in markdown is preserved)
- **Linkify** (bare URLs are auto-detected and converted to links)

## Enhanced Features

| Feature               | Description                                              | Reference                                              |
| --------------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| YAML Frontmatter      | Per-page metadata (title, description, sidebar position) | [Frontmatter](/docs/markdown/frontmatter/)             |
| Admonition Containers | `::: tip`, `::: warning`, `::: danger`, `::: details`    | [Containers](/docs/markdown/containers/)               |
| Code Highlighting     | Shiki-powered syntax highlighting with 100+ languages    | [Code Highlighting](/docs/markdown/code-highlighting/) |
| Heading Anchors       | Auto-generated `id` attributes and `#` permalink links   | Automatic                                              |
| Table of Contents     | `[[toc]]` directive renders a page outline               | Automatic                                              |
| Internal Links        | Links starting with `/` or `#` use SPA navigation        | Automatic                                              |

## Internal Links

Links starting with `/` or `#` are automatically intercepted for SPA navigation via the lark-mvc Router. External links open in a new tab.

```markdown
[Guide](/docs/guide/) → SPA navigation
[Router API](/docs/api/router) → SPA navigation
[GitHub](https://github.com) → opens in new tab
[#installation](#installation) → scroll to anchor
```

## Heading Anchors

All headings automatically get `id` attributes for anchor linking. Headings h1 through h3 also get a `#` permalink symbol on hover.

```markdown
## Installation → id="installation" + # permalink

### Prerequisites → id="prerequisites" + # permalink

#### Details → id="details" (no permalink)
```

Duplicate heading texts get deduplicated slugs:

```markdown
## Setup → id="setup"

## Setup → id="setup-1"
```

## Table of Contents

Insert `[[toc]]` anywhere in your markdown to render a table of contents. The TOC includes h2 and h3 headings by default (configurable via `markdown.toc.level`).

```markdown
# Page Title

[[toc]]

## Section One

### Subsection

## Section Two
```
