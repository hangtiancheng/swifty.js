---
title: "Search"
description: "Built-in full-text search with local and DocSearch providers"
sidebar_position: 1
---

# Search

`@lark.js/docs` provides two search providers out of the box, plus an option to disable search entirely. Both active providers use a build-time search index generated from your documentation content -- no external search service required.

## Configuration

```ts
// lark-docs.config.ts
export default defineConfig({
  search: {
    provider: "local", // "local" | "docsearch" | "none"
  },
});
```

| Provider      | UI                       | Backend          | Dependencies                      |
| ------------- | ------------------------ | ---------------- | --------------------------------- |
| `"local"`     | Built-in modal dialog    | Local JSON index | None (included)                   |
| `"docsearch"` | Algolia DocSearch widget | Local JSON index | `@docsearch/js`, `@docsearch/css` |
| `"none"`      | No search UI             | N/A              | N/A                               |

## Search Index

Regardless of which provider you choose, the search index is built at the same time as your routes. The build pipeline:

1. `scanDocsDir()` discovers all `.md` files and extracts `PageData`
2. `buildSearchIndex(routes)` converts each non-draft route into a `SearchEntry`
3. The index is serialized into the generated config module and loaded at runtime

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

Pages with `draft: true` in their frontmatter are always excluded from the search index, regardless of whether drafts are visible during development.

## Provider: `"local"`

The local provider renders a DaisyUI-styled modal dialog with a text input and result list.

### How it works

1. User clicks the search icon in the navbar (or a search button)
2. The SearchView opens a modal and focuses the input field
3. On first keystroke, the search index is loaded lazily from `State.get("searchIndex")`
4. Each keystroke triggers `simpleSearch()` which filters the index
5. Results display page title and excerpt (description)

### Search algorithm

The local provider uses AND-logic substring matching:

```
query: "router config"
terms: ["router", "config"]

For each entry:
  haystack = title + " " + headings.join(" ") + " " + excerpt
  match = every term is found somewhere in haystack
```

Up to 20 results are returned. Results are displayed in match order (no relevance scoring in the local modal).

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
4. A local search client is created via `createLocalSearchClient(index)`
5. DocSearch's Algolia search client is replaced with the local client via `transformSearchClient`

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

The DocSearch provider uses a more sophisticated scoring system than the local provider:

| Match location | Points per term |
| -------------- | --------------- |
| Title          | 10              |
| Each heading   | 5               |
| Excerpt        | 1               |

All query terms must match at least one field (AND logic). Results are sorted by total score descending, with alphabetical title as a tiebreaker.

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

| Feature             | `"local"`            | `"docsearch"`                       |
| ------------------- | -------------------- | ----------------------------------- |
| Match logic         | AND                  | AND                                 |
| Field isolation     | No (single haystack) | Yes (per-field check)               |
| Relevance scoring   | No                   | Yes (title/heading/excerpt weights) |
| Result limit        | 20                   | Configurable (default 20)           |
| Keyboard shortcuts  | No                   | Yes (Ctrl+K, arrows)                |
| Recent searches     | No                   | Yes (built-in)                      |
| Result highlighting | No                   | Yes (built-in)                      |

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
