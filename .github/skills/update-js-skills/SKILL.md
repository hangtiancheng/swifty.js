---
name: update-js-skills
description: >
  Regenerate the swifty.js framework skill documentation by reading the latest package source code and rewriting skill files for @swifty.js/cache (packages/cache → .github/skills/swifty-cache), @swifty.js/docs (packages/swifty-docs → .github/skills/swifty-docs), and @swifty.js/anti-copy (packages/anti-copy → .github/skills/swifty-anti-copy).
  Use this skill when the user asks to update, refresh, regenerate, or sync the skill docs with the current source, or when source code under packages/cache, packages/swifty-docs, or packages/anti-copy has changed and the skills need to reflect the new API surface. Also trigger when the user mentions "update skills", "refresh skill docs", "sync skills with source", or says the skill documentation is outdated.
  Do NOT use for creating entirely new skills unrelated to these three packages, or for editing the skill description/triggering metadata only.
---

# Update Swifty.js Framework Skills

This skill orchestrates the regeneration of the three framework skill documents
by reading the latest TypeScript source code and producing comprehensive,
professional English documentation for each package.

## Target mapping

| Source directory        | Skill files to update                                     |
| ----------------------- | --------------------------------------------------------- |
| `packages/cache/`       | `.github/skills/swifty-cache/SKILL.md`                    |
| `packages/swifty-docs/` | `.github/skills/swifty-docs/SKILL.md` + `references/*.md` |
| `packages/anti-copy/`   | `.github/skills/swifty-anti-copy/SKILL.md`                |

All paths are relative to the repository root. Create the skill directory if it
does not exist yet.

The swifty-docs skill uses progressive disclosure: a lean `SKILL.md` plus four
reference files (`references/configuration.md`, `references/theming.md`,
`references/api.md`, `references/markdown.md`). Regenerate all five files, and
keep the SKILL.md pointer table in sync with the reference file set. The
swifty-cache and swifty-anti-copy skills are single-file.

## Procedure

For each of the three packages, execute the following steps in order:

1. Read every `.ts`/`.tsx` file under the package's `src/` directory, including
   subdirectories (e.g. `packages/cache/src/proto/`,
   `packages/swifty-docs/src/{theme,markdown,utils}/`,
   `packages/anti-copy/src/core/`). Do not skip tests (`*.test.ts`, whether
   colocated or under `test/`) — they reveal usage patterns, edge cases, and
   cleanup conventions that downstream users need to know. Also read non-TS
   runtime artifacts that shape behavior: `.proto` files, `bootstrap.js`,
   `.env.example`, and `rollup.config.{js,mjs}` / `tsconfig*.json` where
   present.
   For swifty-docs additionally read `src/client.css` (the design-token and
   styling source of truth), `src/client.d.ts`, `src/file-content.ejs`, and
   the package's own consumer example (`swifty-docs.config.ts`, `app/main.tsx`,
   `app/index.html`, `app/main.css`).
   For anti-copy read all four entry points (`src/index.ts`, `src/vitepress.ts`,
   `src/swifty-docs.ts`, `src/lark-docs.ts`), the shared `src/common.ts`, every
   feature module under `src/core/`, and `rollup.config.js` (it defines the
   multi-entry build and the `@/*` path alias).

2. Read the package's `package.json` to capture the published name, module
   format (`type`, `main`/`module`/`exports`), scripts, dependency list,
   peer-dependency and `peerDependenciesMeta` optionality, and engine
   constraints. If a `README.md` exists, read it for context but treat
   the source code as the single source of truth — flag README claims that
   the source contradicts rather than repeating them.

3. Analyze the source to extract:
   - Package architecture and component relationships
   - The complete public API surface. `src/index.ts` is the export contract;
     when `package.json` declares a multi-entry `exports` map (swifty-docs:
     `.` plus theme entries; anti-copy: `.`, `./vitepress`, `./swifty-docs`,
     `./lark-docs`), document every subpath separately. Anything not
     re-exported there is internal.
   - Constructor signatures, options interfaces, functional options, and
     default values (quote the actual defaults from source)
   - Behavioral contracts, invariants, and non-obvious semantics
   - Async/lifecycle characteristics: timers (`setInterval`), watchers,
     AbortSignal wiring, graceful-shutdown order, what `close()` /
     `destroy()` releases, and whether repeated calls are idempotent
   - Error handling: thrown error message strings, HTTP status codes, gRPC
     status codes, rollback behavior on partial failure, and how callers
     should match them
   - Environment variables and configuration schemas (zod defaults)
   - Wire formats: gRPC proto contracts, HTTP routes, metadata/headers,
     cache-key formats, serialization layouts
   - For swifty-docs: the semantic CSS token tables (exact oklch values,
     light/dark), the markdown-it plugin behaviors, the generated
     `@swifty-docs/generated` module contract, and theme customization
     recipes (token overrides, fonts, dark-mode bootstrap)
   - For anti-copy: every `AntiCopyOptions` field with its exact default
     (including defaults that depend on `mode`), the `ViolationType` union
     and `ViolationEvent` payload, `DevtoolsOptions` detection heuristics and
     countermeasures, the exact default exclude-selector arrays exported per
     integration, `isPathExcluded` matching semantics, the SSR no-op instance,
     and how each integration hooks its framework's navigation
   - Known limitations, caveats, and pitfalls
   - File-to-purpose mapping

4. Rewrite the target skill files following the format specification below.
   The frontmatter `name` field must be exactly the skill directory name:
   `swifty-cache`, `swifty-docs`, or `swifty-anti-copy`. Regenerate the
   `description` and body content.

## Output format specification

Each SKILL.md must contain:

### YAML front matter

```yaml
---
name: <skill-directory-name> # swifty-cache | swifty-docs | swifty-anti-copy
description: <single long line optimized for skill triggering>
---
```

The `description` field is the primary mechanism that determines whether an
agent invokes the skill. It must:

- Name the npm package (`@swifty.js/cache`, `@swifty.js/docs`, or
  `@swifty.js/anti-copy`) and its source path under `packages/`
- List the most important exported symbols, subpath entries, env vars,
  headers, and endpoints as concrete trigger tokens
- Describe what the package does in one sentence
- Include explicit "Use when..." guidance with conceptual trigger phrases
- Include explicit "Do NOT use for..." exclusions, including routing between
  the skills (the swifty-docs generator vs. the unrelated `@lark.js/docs`
  generator; the anti-copy core vs. its per-framework integration entries)
  and away from the Go sibling repo's skills

### Body structure

The body must cover all of the following (adapt headings to fit the package):

1. One-paragraph summary: what the package is, its runtime requirements,
   module format, and intended/unsuitable use cases. For anti-copy state
   up front that client-side copy protection is a deterrent, not a security
   boundary.
2. Architecture overview: directory tree or component diagram naming every
   module and showing composition/data flow (middleware order, bootstrap
   sequence, read/write paths; for swifty-docs, the three-phase
   configuration→compilation→runtime pipeline; for anti-copy, the
   options→feature-list→attach/detach pipeline and the core-plus-integration
   layering).
3. Public API or configuration surface: every exported symbol or env var with
   signatures, defaults, and behavioral notes. For the cache package, mirror
   `src/index.ts` completely; for the docs package, cover `DocsConfig`,
   frontmatter, the Vite plugin, every theme component/hook/utility export,
   and the `@swifty-docs/generated` contract (detail lives in the
   `references/` files); for the anti-copy package, cover `createAntiCopy`,
   `AntiCopyInstance`, the full options table, and each subpath entry's
   exports (`applyAntiCopy` for VitePress and lark-docs, the renderless
   `AntiCopy` component for swifty-docs, plus the default exclude arrays).
4. Internal implementation details that affect correct usage (byte budgets,
   invalidation index invariants, single-flight semantics, propagation
   guards, SPA-fallback canonicalization, timer cleanup; for swifty-docs,
   markdown-it string-output contracts, slug dedup, Shiki lazy singleton,
   route regeneration timing; for anti-copy, enable-rollback on partial
   attach failure, `update()` disable→merge→rebuild→enable ordering,
   `excludeSelectors` matching via `Element.closest`, and which options
   changes require a remount).
5. Operational guidance and lifecycle ordering (start/stop order, address
   pairing, deadline tuning, resource cleanup, framework teardown hooks).
6. Pitfalls / known limitations: each item states the behavior, why it
   happens, and how to avoid or work around it.
7. Quick recipes: minimal, correct code examples that compile against the
   current API surface (for swifty-docs, include theme-customization recipes:
   token overrides, fonts, palette; for anti-copy, include one recipe per
   integration entry plus a framework-agnostic one).

## Writing standards

- Use professional, precise English throughout.
- Prefer active voice and imperative mood for instructions.
- Document what the code actually does, not what it should do. If there is a
  gap between docs/README and implementation (e.g., a stale embedding example
  or an unenforced option), document the actual behavior and note the
  discrepancy explicitly.
- Include every exported symbol and every env var. Completeness is
  non-negotiable; a skill that omits an export forces the user to read source
  anyway.
- Quote exact strings the user must match against: error messages, header
  names, cache-key formats, CSS selectors, log prefixes, regexes, and default
  values.
- Keep code examples minimal but runnable against the current API. Use
  `// ...` to elide irrelevant setup, never to hide API surface.
- Do not invent features or capabilities that do not exist in the source.

## Execution order

Process the three packages in any order; each is independent. If one package
fails to update (e.g., source directory missing), report the failure and
continue with the others.

After updating all three, report what changed at a high level (new exports,
removed APIs, changed defaults, significant behavioral changes) so the user
can verify the update is correct.
