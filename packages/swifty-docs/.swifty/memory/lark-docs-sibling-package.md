---
name: lark-docs-sibling-package
description: lark-docs is a sibling docs-generator package (lark-mvc framework) that swifty-docs is being kept in test-parity with
metadata:
  type: project
---

`@lark.js/docs` at `/Users/hangtiancheng/github/swifty.js/lark.js/packages/lark-docs` is a sibling documentation-site generator built on the `lark-mvc` framework. It mirrors `@swifty.js/docs` (this package, Preact-based) feature-for-feature, and the user is actively keeping the two test suites aligned.

When working on tests in this package, the lark-docs `tests/` directory is the reference corpus: the user asks for ports of tests that exist there but not here (and vice-versa), and for exhaustive per-test diffs between the two suites. Test failures during alignment are acceptable — parity is the goal.

Known systematic differences between the two suites (so they don't get flagged as drift):

- Code-block chrome: swifty asserts `class="language-*"`, lark asserts `class="codeblock" data-lang="*"`.
- Search module location: swifty keeps it under `@/theme/lib/search` + `@/theme/lib/split-sections` (runtime); lark keeps it under `src/utils/search-text` + `src/utils/search-sections` (compile-time utils).
- Naming/branding in fixtures: `swifty-docs-*` vs `lark-docs-*` tmpdir prefixes, `?swifty-docs` vs `?lark-docs` query suffixes, `renderToSwiftyTemplate` vs `renderToLarkTemplate`, `swifty scenario` vs `larky scenario` baseUrl fixtures.

Known un-portable gaps (swifty tests that cannot be mirrored into lark without refactoring lark's source, because the target symbols are module-private):

- `SearchEntrySchema` — bare `const` at lark `src/theme/search.ts:43`, never exported.
- `createSearchEngine` — does not exist in lark; the MiniSearch build lives as closure-scoped `ensureMiniSearch()` / `buildMiniSearch()` nested inside the exported `createSearchView()` in lark `src/theme/search.ts` (~lines 62, 138, 147).

When porting tests swifty→lark, check whether the symbol under test is actually exported in lark before promising a port; if it is private, flag it as "genuinely missing but not addable" rather than silently skipping or fabricating a test.
