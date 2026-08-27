# @swifty.js/docs

Password-protected private pages for [VitePress](https://vitepress.dev). Mark
a page with `private: true` frontmatter and its content ships **AES-256-GCM
encrypted** — the plaintext never reaches the static output, the page chunk,
or the local search index. The unlock UI is built with
[Lit](https://lit.dev) + Tailwind CSS (no Vue components) and follows the
site's VitePress theme variables, including dark mode.

## How it works

- **Build time** — a Vite plugin (`enforce: "post"`) detects markdown files
  with `private: true`, renders them to HTML with VitePress's own markdown
  renderer, encrypts the result (PBKDF2 100k/SHA-256 + AES-256-GCM) with the
  `DOCS_PASSWORD` environment variable, and replaces the compiled page
  module with a stub. The stub exports scrubbed `__pageData` (description
  and headers removed, title kept) and renders a `<vpd-private-page>`
  custom element.
- **Runtime** — the stub lazily imports the client runtime (never during
  SSR). On first visit a password dialog opens; decryption happens in the
  browser via WebCrypto, so a wrong password simply fails the GCM auth tag.
  The password is cached in `localStorage`, and later visits unlock
  silently. Decrypted HTML is injected into light DOM, so `.vp-doc` prose
  styling, code copy buttons, code groups, and the outline keep working.

If `DOCS_PASSWORD` is not set, the plugin warns and publishes private pages
unencrypted (same behavior in dev and build).

## Install

```bash
pnpm add -D @swifty.js/docs
```

`vitepress >= 1.0.0` is a peer dependency. Tailwind is compiled into the
package at build time — consumers do not need Tailwind installed.

## Usage

`.vitepress/config.ts`:

```ts
import { defineConfig } from "vitepress";
import { privateDocsPlugin } from "@swifty.js/docs";

export default defineConfig({
  vite: {
    plugins: [privateDocsPlugin()],
  },
});
```

Mark a page private:

```md
---
private: true
---

# Internal notes

Only visible after entering the password.
```

Build with the password:

```bash
DOCS_PASSWORD=your-password vitepress build docs
```

## API

### `privateDocsPlugin(options?)`

Vite plugin. Options:

| Option         | Type      | Default                    | Description                           |
| -------------- | --------- | -------------------------- | ------------------------------------- |
| `clientModule` | `string`  | `"@swifty.js/docs/client"` | Runtime module the page stubs import. |
| `debug`        | `boolean` | `false`                    | Log which pages were encrypted.       |

### `@swifty.js/docs/client`

Browser runtime (Lit). Normally loaded automatically by the generated
stubs. Exports `registerPrivatePage()`, `clearCachedPassword()`,
`decryptContent()`, and the `VpdPrivatePage` / `VpdPasswordDialog` element
classes.

## Security model & limitations

- One global password per site. Anyone with the password can read every
  private page; rotating the password requires a rebuild.
- Content is encrypted, not access-controlled: the ciphertext is public and
  brute-forceable offline — pick a strong password for anything sensitive.
- The page **title stays visible** (sidebar/nav); frontmatter ships in
  plaintext. `description` is scrubbed from pageData and meta tags.
- Private pages are rendered as static markdown: in-page Vue components,
  `<script setup>` blocks, and `{{ }}` interpolation are not supported
  inside private pages.
- Images referenced with relative paths are not processed for private
  pages — serve them from `public/` instead. `<!--@include-->` directives
  are not expanded.
- Frontmatter-driven layouts (e.g. `layout: home` hero data) live in
  frontmatter and are therefore not protected — only the markdown body is.

## Development

```bash
pnpm dev            # example site with DOCS_PASSWORD=swifty (password: swifty)
pnpm build          # build the library (dist/)
pnpm build:example  # build the example site
pnpm test           # vitest
pnpm typecheck
```

## License

MIT
