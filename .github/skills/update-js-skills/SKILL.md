---
name: update-js-skills
description: >
  Regenerate the swifty.js framework skill documentation by reading the latest package source code and rewriting SKILL.md files for @swifty.js/cache (packages/cache → .github/skills/swifty-cache) and @swifty.js/cdn (packages/cdn → .github/skills/swifty-cdn).
  Use this skill when the user asks to update, refresh, regenerate, or sync the skill docs with the current source, or when source code under packages/cache or packages/cdn has changed and the skills need to reflect the new API surface. Also trigger when the user mentions "update skills", "refresh skill docs", "sync skills with source", or says the skill documentation is outdated.
  Do NOT use for creating entirely new skills unrelated to these two packages, or for editing the skill description/triggering metadata only.
---

# Update Swifty.js Framework Skills

This skill orchestrates the regeneration of the two framework skill documents
by reading the latest TypeScript source code and producing comprehensive,
professional English documentation for each package.

## Target mapping

| Source directory  | Skill file to update                   |
| ----------------- | -------------------------------------- |
| `packages/cache/` | `.github/skills/swifty-cache/SKILL.md` |
| `packages/cdn/`   | `.github/skills/swifty-cdn/SKILL.md`   |

All paths are relative to the repository root.

## Procedure

For each of the two packages, execute the following steps in order:

1. Read every `.ts` file under the package's `src/` directory, including
   subdirectories (e.g. `packages/cache/src/proto/`, `packages/cdn/src/
middleware|models|routes|services|types|utils/`). Do not skip test files
   (`*.test.ts`) — they reveal usage patterns, edge cases, and cleanup
   conventions that downstream users need to know. Also read non-TS runtime
   artifacts that shape behavior: `.proto` files, `bootstrap.js`,
   `.env.example`, and `rollup.config.mjs` / `tsconfig.json` where present.

2. Read the package's `package.json` to capture the published name, module
   format (`type`, `main`/`module`/`exports`), scripts, dependency list, and
   engine constraints. If a `README.md` exists, read it for context but treat
   the source code as the single source of truth — flag README claims that
   the source contradicts rather than repeating them.

3. Analyze the source to extract:
   - Package architecture and component relationships
   - The complete public API surface (for `packages/cache`, `src/index.ts` is
     the export contract; anything not re-exported there is internal)
   - Constructor signatures, options interfaces, functional options, and
     default values (quote the actual defaults from source)
   - Behavioral contracts, invariants, and non-obvious semantics
   - Async/lifecycle characteristics: timers (`setInterval`), watchers,
     AbortSignal wiring, graceful-shutdown order, what `close()` releases
   - Error handling: thrown error message strings, HTTP status codes, gRPC
     status codes, and how callers should match them
   - Environment variables and configuration schemas (zod defaults)
   - Wire formats: gRPC proto contracts, HTTP routes, metadata/headers,
     cache-key formats, serialization layouts
   - Known limitations, caveats, and pitfalls
   - File-to-purpose mapping

4. Rewrite the target SKILL.md following the format specification below.
   Preserve the existing frontmatter `name` field of each skill; only its
   `description` and body content should be regenerated.

## Output format specification

Each SKILL.md must contain:

### YAML front matter

```yaml
---
name: <existing-skill-name>
description: <single long line optimized for skill triggering>
---
```

The `description` field is the primary mechanism that determines whether an
agent invokes the skill. It must:

- Name the npm package (`@swifty.js/cache` or `@swifty.js/cdn`) and its
  source path under `packages/`
- List the most important exported symbols, env vars, headers, and endpoints
  as concrete trigger tokens
- Describe what the package does in one sentence
- Include explicit "Use when..." guidance with conceptual trigger phrases
- Include explicit "Do NOT use for..." exclusions, including routing between
  the two skills (cache primitives vs. the CDN server that consumes them) and
  away from the Go sibling repo's skills

### Body structure

The body must cover all of the following (adapt headings to fit the package):

1. One-paragraph summary: what the package is, its runtime requirements,
   module format, and intended/unsuitable use cases.
2. Architecture overview: directory tree or component diagram naming every
   module and showing composition/data flow (middleware order, boot sequence,
   read/write paths).
3. Public API or configuration surface: every exported symbol or env var with
   signatures, defaults, and behavioral notes. For the cache package, mirror
   `src/index.ts` completely; for the CDN package, cover config, routing,
   grayscale resolution, the request path, caching internals, watchers, the
   full REST API table, discovery rules, and the data model.
4. Internal implementation details that affect correct usage (byte budgets,
   invalidation index invariants, single-flight semantics, propagation
   guards, SPA-fallback canonicalization, timer cleanup).
5. Operational guidance and lifecycle ordering (start/stop order, address
   pairing, deadline tuning, resource cleanup).
6. Pitfalls / known limitations: each item states the behavior, why it
   happens, and how to avoid or work around it.
7. Quick recipes: minimal, correct code examples that compile against the
   current API surface.
8. Cross-references: cache ↔ cdn integration points, and the Go sibling
   parity table for the cache package.

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
  names, cache-key formats, log prefixes, regexes, and default values.
- Keep code examples minimal but runnable against the current API. Use
  `// ...` to elide irrelevant setup, never to hide API surface.
- Do not invent features or capabilities that do not exist in the source.

## Execution order

Process the two packages in any order; each is independent. If one package
fails to update (e.g., source directory missing), report the failure and
continue with the other.

After updating both, report what changed at a high level (new exports,
removed APIs, changed defaults, significant behavioral changes) so the user
can verify the update is correct.
