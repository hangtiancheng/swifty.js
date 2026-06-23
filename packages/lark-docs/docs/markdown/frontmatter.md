---
title: "Frontmatter"
description: "YAML frontmatter fields and usage"
sidebar_position: 2
---

# Frontmatter

Each `.md` file can include YAML frontmatter delimited by `---` at the top of the file. Frontmatter provides per-page metadata that controls titles, descriptions, sidebar ordering, and more.

## Syntax

```markdown
---
title: "My Page"
description: "A description for SEO and search"
sidebar_position: 1
sidebar_label: "Custom Label"
---

# Content starts here
```

The frontmatter block must be the very first thing in the file. It is parsed using `js-yaml` and stripped from the markdown content before rendering.

## Fields Reference

### `title`

Type: `string`

Page title displayed in the sidebar, navigation, and search results. If omitted, falls back to the first `# heading` in the content, then to the filename.

```yaml
title: "Getting Started"
```

### `description`

Type: `string`

Page description used for search indexing and meta tags. Appears as the excerpt in search results.

```yaml
description: "Learn how to install and configure the framework"
```

### `sidebar_position`

Type: `number`

Controls the sort order in auto-generated sidebars. Lower numbers appear first. Uses an all-or-nothing rule: if all pages in a group have this field, they sort by position then filename; if any page lacks it, all pages in that group sort by filename only.

```yaml
sidebar_position: 1    # appears first
sidebar_position: 2    # appears second
sidebar_position: 10   # appears after 1 and 2
```

When two pages have the same position, they sort alphabetically by title.

### `sidebar_label`

Type: `string`

Overrides the display text in the sidebar. If omitted, the `title` field is used.

```yaml
title: "Framework.boot() API Reference"
sidebar_label: "boot()" # sidebar shows "boot()" instead
```

### `sidebar_group`

Type: `string`

Assigns the page to a named sidebar group. Useful for organizing pages within a section.

```yaml
sidebar_group: "Advanced"
```

### `draft`

Type: `boolean`

When set to `true`, the page is excluded from production builds. Draft pages are still visible during development.

```yaml
draft: true
```

::: warning
Draft exclusion is controlled by the `excludeDrafts` option passed to `scanDocsDir()`. By default, drafts are included.
:::

## Complete Example

```yaml
---
title: "Configuration Reference"
description: "Complete reference for all configuration options"
sidebar_position: 2
sidebar_label: "Config"
sidebar_group: "Guide"
draft: false
---
```

## Fallback Behavior

When frontmatter fields are missing, the system uses these fallbacks:

| Field              | Fallback Chain                                     |
| ------------------ | -------------------------------------------------- |
| `title`            | frontmatter → first `# heading` → filename-derived |
| `description`      | frontmatter → filename-derived title               |
| `sidebar_position` | frontmatter → all-or-nothing rule (see above)      |
| `sidebar_label`    | frontmatter → `title` value                        |

For example, a file `docs/api/router.md` with no frontmatter and no `# heading` would get the title "Router" (derived from the filename).
