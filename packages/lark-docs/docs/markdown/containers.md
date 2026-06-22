---
title: "Containers"
description: "Admonition containers: tip, warning, danger, details"
sidebar_position: 3
---

# Containers

`@lark.js/docs` supports custom admonition containers using the `::: type` syntax. These render as visually distinct callout blocks for tips, warnings, dangers, and collapsible details.

## Syntax

```markdown
::: type Optional Title
Content goes here.
:::
```

The `type` determines the visual style. An optional custom title overrides the default label.

## Available Types

### Tip

```markdown
::: tip
This is a helpful tip.
:::
```

::: tip
This is a helpful tip.
:::

With a custom title:

```markdown
::: tip Pro Tip
Use `sidebar_position` to control the order of pages in the sidebar.
:::
```

::: tip Pro Tip
Use `sidebar_position` to control the order of pages in the sidebar.
:::

### Warning

```markdown
::: warning
Be careful with this operation.
:::
```

::: warning
Be careful with this operation.
:::

### Danger

```markdown
::: danger
This action is irreversible.
:::
```

::: danger
This action is irreversible.
:::

### Details

The `details` type renders as a collapsible `<details>` element:

```markdown
::: details Click to expand
This content is hidden by default.
:::
```

::: details Click to expand
This content is hidden by default.
:::

## Custom Labels

Default labels can be overridden in the configuration:

```ts
// lark-docs.config.ts
export default defineConfig({
  markdown: {
    containers: {
      tip: { label: "HINT" },
      warning: { label: "CAUTION" },
      danger: { label: "STOP" },
    },
  },
});
```

## Rendering

Containers are rendered using DaisyUI's `alert` component classes:

| Type      | DaisyUI Class         | Color   |
| --------- | --------------------- | ------- |
| `tip`     | `alert alert-info`    | Blue    |
| `warning` | `alert alert-warning` | Yellow  |
| `danger`  | `alert alert-error`   | Red     |
| `details` | `alert`               | Neutral |

## Nesting

Containers can contain any markdown content, including code blocks, lists, and links:

````markdown
::: tip Installation
Install the package:

```bash
pnpm add @lark.js/docs
```
````

Then configure your [bundler](/docs/get-started/).
:::

```

::: tip Installation
Install the package with your preferred package manager, then configure your bundler as described in [Get Started](/docs/get-started/).
:::
```
