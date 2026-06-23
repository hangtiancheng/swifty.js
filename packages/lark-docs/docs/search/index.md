---
title: "Search"
description: "Built-in full-text search with local and DocSearch providers"
sidebar_position: 1
---

# Search

`@lark.js/docs` provides two search providers out of the box, plus an option to disable search entirely. Both active providers use a lazily-built local search index generated from your documentation content -- no external search service required.

## Configuration

```ts
// lark-docs.config.ts
export default defineConfig({
  search: {
    provider: "local", // "local" | "docsearch" | "none"
  },
});
```

| Provider      | UI                       | Backend                | Dependencies                      |
| ------------- | ------------------------ | ---------------------- | --------------------------------- |
| `"local"`     | Built-in modal dialog    | MiniSearch local index | None (included)                   |
| `"docsearch"` | Algolia DocSearch widget | MiniSearch local index | `@docsearch/js`, `@docsearch/css` |
| `"none"`      | No search UI             | N/A                    | N/A                               |

## Search Index

The search index is built lazily at runtime, not at build time. The generated module exports a `getSearchIndex()` function that loads all `.md` modules on first call and extracts page data:

```js
// In .lark-docs/generated/index.js
let _searchIndex = null;
export async function getSearchIndex() {
  if (_searchIndex) return _searchIndex;
  const mods = await Promise.all(entries.map(([, loader]) => loader()));
  _searchIndex = mods.map((mod, i) => ({
    title: mod.pageData?.title || "",
    link: entries[i][0],
    headings: (mod.pageData?.headings || []).map((h) => h.text || ""),
    excerpt: mod.pageData?.description || "",
  }));
  return _searchIndex;
}
```

This keeps the generated file small. The cost is one batch of dynamic imports on first search query.

### SearchEntry shape

```ts
interface SearchEntry {
  title: string; // page title
  link: string; // route path (e.g. "/docs/guide/")
  headings: string[]; // all h2/h3 heading texts
  excerpt: string; // from frontmatter description field
}
```

### Draft exclusion

Pages with `draft: true` in their frontmatter are excluded from the search index.

## Provider: `"local"`

The local provider renders a DaisyUI-styled modal dialog powered by [MiniSearch](https://github.com/lucaong/minisearch) -- the same full-text search engine used by VitePress.

### How it works

1. User clicks the search icon in the navbar
2. The SearchView opens a modal and focuses the input field
3. On first keystroke, `getSearchIndex()` is called to lazily build the index
4. A MiniSearch instance is created from the entries (cached for subsequent searches)
5. Results display page title, heading matches, and excerpt with highlighted terms

### Search features

MiniSearch provides:

- Prefix matching: typing "conf" matches "configuration"
- Fuzzy matching: tolerates typos (fuzzy factor 0.2)
- Field-weighted scoring: title matches boosted 2x, headings 1.5x, excerpt 1x
- Highlighted results: matched terms wrapped in `<mark>` in both title and excerpt
- Lazy index construction: the MiniSearch instance is built on first query, then reused

### Template structure

The search modal is rendered by `theme/search`:

```html
{{if isOpen}}
<div class="modal modal-open" @click="closeSearch()">
  <div class="modal-box max-w-2xl p-0" @click.stop="noop()">
    <!-- Search input with icon and esc hint -->
    <!-- Results list using DaisyUI menu component -->
    <!-- Empty state messages -->
  </div>
</div>
{{/if}}
```

## Provider: `"docsearch"`

The DocSearch provider uses Algolia's [DocSearch](https://docsearch.algolia.com/) widget for a polished search experience with keyboard shortcuts, recent searches, and highlighted results. Despite the Algolia branding, no Algolia account is needed -- the search queries the same local index.

### Setup

Install the DocSearch packages:

```bash
pnpm add @docsearch/js @docsearch/css
```

Configure the provider:

```ts
export default defineConfig({
  search: { provider: "docsearch" },
});
```

### How it works

1. On page load, the DocsLayout view detects `search.provider === "docsearch"`
2. `@docsearch/css` and `@docsearch/js` are loaded via dynamic `import()`
3. The widget mounts into `#docsearch-container` in the navbar
4. A local search client is created via `createLocalSearchClient(searchIndex)`
5. DocSearch's Algolia search client is replaced with the local client via `transformSearchClient`

The search index is loaded by calling `getSearchIndex()` from State, which lazily builds it on first search.

### Local search client

`createLocalSearchClient()` returns an Algolia-compatible search client object:

```ts
function createLocalSearchClient(index: SearchEntry[]) {
  return {
    async search(requests) {
      // For each request:
      //   1. Filter index using scored AND-logic matching
      //   2. Convert SearchEntry to DocSearch hit format
      //   3. Return { results: [{ hits, nbHits, ... }] }
    },
  };
}
```

### Scoring algorithm

The DocSearch provider uses per-field scoring:

| Match location | Points per term |
| -------------- | --------------- |
| Title          | 10              |
| Each heading   | 5               |
| Excerpt        | 1               |

All query terms must match at least one field (AND logic). Per-field boundary checking ensures each term is matched against individual fields independently to avoid false matches spanning field boundaries. Results are sorted by total score descending, with alphabetical title as a tiebreaker.

### Hit format

Each `SearchEntry` is converted into DocSearch's hierarchy format:

```
hierarchy.lvl0 = page title        (displayed as result group header)
hierarchy.lvl1 = first heading     (displayed as result subtitle)
hierarchy.lvl2..lvl6 = null
url = route link                   (used for navigation on click)
```

### Keyboard shortcuts

DocSearch provides built-in keyboard navigation:

| Shortcut           | Action               |
| ------------------ | -------------------- |
| `Ctrl+K` / `Cmd+K` | Open search modal    |
| `Escape`           | Close search modal   |
| `Arrow Up/Down`    | Navigate results     |
| `Enter`            | Open selected result |

## Provider: `"none"`

Set `provider: "none"` to remove the search button and disable all search functionality:

```ts
export default defineConfig({
  search: { provider: "none" },
});
```

The search index is not built, the search modal is not rendered, and the search button does not appear in the navbar.

## Scoring comparison

| Feature             | `"local"`             | `"docsearch"`                       |
| ------------------- | --------------------- | ----------------------------------- |
| Engine              | MiniSearch            | Custom AND-logic scorer             |
| Match logic         | Prefix + fuzzy        | AND substring                       |
| Field isolation     | Yes (per-field boost) | Yes (per-field check)               |
| Relevance scoring   | Yes (field-weighted)  | Yes (title/heading/excerpt weights) |
| Result highlighting | Yes                   | Yes (built-in)                      |
| Keyboard shortcuts  | No                    | Yes (Ctrl+K, arrows)                |
| Recent searches     | No                    | Yes (built-in)                      |

## Runtime exports

The search runtime is available for custom integrations:

```ts
import { searchDocs } from "@lark.js/docs/runtime";

// searchDocs(index, query, limit?) -> SearchEntry[]
const results = searchDocs(searchIndex, "router config", 10);
```

For DocSearch integrations:

```ts
import { createLocalSearchClient } from "@lark.js/docs/theme";

const client = createLocalSearchClient(searchIndex);
const { results } = await client.search([
  { indexName: "local", params: { query: "router", hitsPerPage: 10 } },
]);
```

## Next Steps

- [Theme Architecture](/docs/theme/) -- how search integrates with the layout view
- [API Reference](/docs/api/) -- `searchDocs`, `createLocalSearchClient`, `SearchEntry`
- [Configuration](/docs/get-started/configuration/) -- search provider setup
