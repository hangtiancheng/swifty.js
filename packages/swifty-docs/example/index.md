# swifty-docs example

This site demonstrates `@swifty.js/docs` private pages.

- [Public page](/guide/public) — a normal page, always visible.
- [Secret page](/guide/secret) — has `private: true` frontmatter; it ships
  AES-256-GCM encrypted when the site is built with `DOCS_PASSWORD` set.

Run with `DOCS_PASSWORD=swifty` (see package scripts). The unlock password
for this demo is `swifty`.
