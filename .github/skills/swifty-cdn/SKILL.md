---
name: cdn
description: Authoritative reference for the @swifty.js/cdn local CDN server located at packages/cdn (TypeScript/Node.js, ESM, Koa 3 + MongoDB + chokidar, built on top of the @swifty.js/cache L1 memory cache). It serves dist artifacts from multiple workspace projects under `/cdn/<project>[@version]/<path>` with 4-level grayscale version routing, SPA fallback, ETag/304 negotiation, per-version cache invalidation, workspace dist auto-discovery, and a REST management API. Use this skill whenever the user reads, writes, debugs, reviews, or extends code under `packages/cdn/src/**`, mentions `@swifty.js/cdn`, "local CDN", "grayscale release/灰度发布", or works with any of these symbols and concepts—`createApp`, `AppInstance`, `loadConfig`, `ServerConfig`, `createCdnMiddleware`, `errorMiddleware`, `createApiRouter`, `parseRoute`, `ParsedRoute`, `resolveVersion`, `getVersionByWeight`, `ResolvedVersion`, `VersionResolutionSource`, `resolveSafePath`, `hasFileExtension`, `normalizeFilePath`, `buildCacheKey`, `CacheKey`, `CacheEntry`, `PrefixIndex`, `serializeCacheEntry`, `deserializeCacheEntry`, `getProjectConfig`, `getConfigMap`, `refreshConfig`, `refreshProjectConfig`, `invalidateProjectCache`, `invalidateVersionCache`, `validateDistPath`, `startFileWatcher`, `stopFileWatcher`, `addWatch`, `removeWatch`, `discoverDists`, `DiscoveredDist`, `Project`, `toProjectConfig`, `ProjectConfig`, `VersionConfig`, `ProjectCreateSchema`, `VersionCreateSchema`, `PublishSchema`, env vars `CDN_PORT`/`CDN_MONGO_URI`/`CDN_CACHE_MAX_SIZE`/`CDN_CACHE_MAX_ENTRY_SIZE`/`CDN_PREFIX`/`CDN_API_PREFIX`/`CDN_GRAYSCALE_HEADER`/`CDN_GRAYSCALE_COOKIE_PREFIX`/`CDN_WORKSPACE_ROOT`, the `x-use-gray` header, `cdn_gray_` cookies, and the diagnostic headers `X-Cache`/`X-CDN-Version`/`X-Resolution-Source`. Also trigger on REST endpoints `/api/projects`, `/api/publish`, `/api/discover`, `/api/cache/stats`, `/api/health`, and on troubleshooting phrases like "stale dist content", "X-Cache always MISS", "Path traversal detected", "No available version", "weighted random version routing", "SPA fallback to index.html". For internals of the underlying cache primitives (Group, LruStore, ByteView, ConHashMap, gRPC peers), consult the `cache` skill for `@swifty.js/cache`—this skill covers the CDN server that consumes it.
---

# @swifty.js/cdn — Local CDN Server with Grayscale Routing

`@swifty.js/cdn` (`packages/cdn`, ESM, `"type": "module"`) is a single-machine CDN that unifies `dist` artifacts from multiple workspace projects under one HTTP endpoint. It layers grayscale (canary) version routing, an L1 in-memory cache, SPA fallback, and MongoDB-backed project/version CRUD on top of Koa 3. Intended for local multi-project development, intranet staging/QA, and offline demos—**not** for public production traffic (no auth, no TLS, no rate limiting, `cors({ origin: "*" })`).

Stack: Koa 3, `@koa/router` 15, `@koa/bodyparser`, `@koa/cors`, Mongoose 9, chokidar 5, pino 10 (+pino-pretty), zod 4, `mime-types`, and the workspace package `@swifty.js/cache` (provides the `Cache`/`ByteView` primitives used as the L1 store). Requirements: Node 18+, MongoDB 4+.

Scripts: `pnpm dev` (tsx watch), `pnpm build` (tsc), `pnpm start` (node dist/index.js). No test suite currently exists in this package.

## Architecture at a glance

```
src/
├── index.ts                   # Boot: loadConfig → mongoose.connect → refreshConfig
│                              #       → createApp → startFileWatcher → listen → graceful shutdown
├── app.ts                     # createApp(config): AppInstance { app, cache, prefixIndex }
├── config.ts                  # loadConfig(): zod-validated env → ServerConfig
├── middleware/
│   ├── cdn.ts                 # createCdnMiddleware — the core request path
│   └── error.ts               # errorMiddleware — global catch-all → 500 envelope
├── models/project.ts          # Mongoose Project schema + toProjectConfig
├── routes/api.ts              # createApiRouter — all REST endpoints
├── services/
│   ├── config-store.ts        # In-memory configMap + invalidation + validateDistPath
│   ├── discover.ts            # discoverDists — workspace dist scanning
│   ├── file-watcher.ts        # chokidar watchers keyed `${project}@${version}`
│   └── cache-utils.ts         # PrefixIndex + CacheEntry (de)serialization
├── types/
│   ├── index.ts               # All interfaces (zero `any` policy, readonly fields)
│   └── schemas.ts             # zod schemas for every API boundary
└── utils/
    ├── grayscale.ts           # resolveVersion — 4-level strategy
    ├── logger.ts              # pino logger (name "cdn", LOG_LEVEL env)
    ├── path-security.ts       # resolveSafePath / normalizeFilePath / buildCacheKey / hasFileExtension
    └── route-parser.ts        # parseRoute — URL → { projectName, explicitVersion, filePath }
```

Middleware order in `createApp` matters: `errorMiddleware` → CORS (`origin: "*"`, exposes `ETag`, `X-Cache`, `X-CDN-Version`, `X-Resolution-Source`) → bodyParser → API router → CDN middleware (catch-all last). `createApp` wires `Cache` from `@swifty.js/cache` with `onEvicted: (key) => prefixIndex.remove(key)` so LRU evictions keep the secondary index consistent.

Boot sequence (`index.ts`): config → MongoDB connect → `refreshConfig()` (full load into memory) → `createApp` → `startFileWatcher(cache, prefixIndex)` → `app.listen`. Graceful shutdown on SIGTERM/SIGINT: `server.close` + `closeAllConnections` → `stopFileWatcher()` → `cache.close()` → `mongoose.disconnect()` → exit 0.

## Configuration (`config.ts`)

All env vars are zod-validated at startup; invalid values fail fast with a readable message. Empty-string vars are treated as unset. Prefixes are normalized to start with `/`; `grayscaleHeader` is lowercased; `workspaceRoot` is resolved against `process.cwd()`.

| Variable                      | Default                         | Meaning                                                               |
| ----------------------------- | ------------------------------- | --------------------------------------------------------------------- |
| `CDN_PORT`                    | `3300`                          | HTTP port                                                             |
| `CDN_MONGO_URI`               | `mongodb://localhost:27017/cdn` | MongoDB URI                                                           |
| `CDN_CACHE_MAX_SIZE`          | `134217728` (128 MB)            | L1 cache byte budget (`Cache.maxBytes`)                               |
| `CDN_CACHE_MAX_ENTRY_SIZE`    | `2097152` (2 MB)                | Files **≥** this size are streamed, never cached                      |
| `CDN_PREFIX`                  | `/cdn`                          | CDN route prefix                                                      |
| `CDN_API_PREFIX`              | `/api`                          | API route prefix                                                      |
| `CDN_GRAYSCALE_HEADER`        | `x-use-gray`                    | Grayscale override header name                                        |
| `CDN_GRAYSCALE_COOKIE_PREFIX` | `cdn_gray_`                     | Cookie name = prefix + projectName                                    |
| `CDN_WORKSPACE_ROOT`          | `../` (from cwd)                | Root for discovery and distPath validation                            |
| `LOG_LEVEL`                   | `info`                          | pino level (read directly in `logger.ts`, not part of `ServerConfig`) |

## URL routing (`route-parser.ts`)

```
/<cdnPrefix>/<projectName>[@version]/<filePath>
regex: /^\/([a-zA-Z0-9][a-zA-Z0-9_-]*)(?:@([a-zA-Z0-9._-]+))?\/(.*)$/
```

- `projectName` must start alphanumeric; allows `-` and `_`. `version` allows dots, hyphens, underscores. The same character rules are enforced in triplicate: route regex, zod schemas, and the Mongoose `match`.
- `/cdn/admin/` yields `filePath: ""` (dist root → SPA fallback). Paths not matching the regex fall through to `next()` (404 by Koa default).
- Non-preflight `OPTIONS` on a CDN route returns 204 (preflight itself is handled by the CORS middleware).

## Grayscale version resolution (`grayscale.ts`)

`resolveVersion(project, explicitVersion, headers, headerName, cookiePrefix)` walks four levels; the first match wins and is reported in `X-Resolution-Source`:

1. **`url-explicit`** — URL `@version`, only if that version exists in the project. A nonexistent explicit version **degrades gracefully** to the next levels instead of 404ing.
2. **`header-override` / `cookie-override`** — header first, then cookie:
   - Plain string header (`x-use-gray: 2.0.0`) applies to all projects.
   - JSON object header (`x-use-gray: {"admin":"1.0.0"}`) is per-project; if the current project is not among the keys, resolution falls through (no plain-string fallback). Malformed JSON that starts with `{` **is** treated as a plain string.
   - Cookie `cdn_gray_<project>=<version>` is parsed manually from the `Cookie` header.
   - An override naming a nonexistent version also falls through.
3. **`weighted-random`** — `getVersionByWeight` over `isActive: true` versions: 0 active → skip; 1 active → returned directly; total weight 0 → first active; otherwise proportional random.
4. **`default-fallback`** — `project.defaultVersion`, looked up by name. Because level 3 precedes it, `defaultVersion` only takes effect when **all versions are inactive**. To pin a "default", set its weight to 100 and zero/deactivate the rest.

Returns `undefined` when nothing resolves → 404 `No available version`.

## The CDN request path (`middleware/cdn.ts`)

Order of operations for `GET /cdn/...`:

1. `parseRoute` → miss = `next()`.
2. Project lookup via `getProjectConfig` (in-memory, O(1), **never touches MongoDB**) → 404 `Project "x" not found`.
3. `resolveVersion` → 404 `No available version`.
4. `normalizeFilePath` (collapses `//`, `./`, strips leading `/` — cache-key canonicalization) then `resolveSafePath(distPath, path)` → traversal = 403 `Path traversal detected`.
5. **L1 lookup** with `buildCacheKey(project, version, normalizedPath)` (`"project@version:filePath"`). A hit serves from memory with `X-Cache: HIT-MEMORY`; deserialization is memoized per stored `ByteView` in a `WeakMap` so repeat hits skip `JSON.parse`.
6. **Disk stat with SPA fallback**:
   - Path is a directory → try `<dir>/index.html`.
   - `ENOENT` and the path has **no file extension** (`path.basename(p).includes(".")`) → fall back to dist-root `index.html`. Paths with extensions 404 directly.
7. **Canonical-key dedupe**: the entry is cached under the key of the file actually served (e.g. `index.html`), so N SPA routes share one cache entry. If canonical ≠ requested key, a second cache lookup happens before disk read.
8. Serve:
   - `< cacheMaxEntrySize`: `fs.readFile`, strong MD5 ETag, `X-Cache: MISS`, `serializeCacheEntry` → `cache.add(canonicalKey, new ByteView(...))` + `prefixIndex.add(canonicalKey)`.
   - `>= cacheMaxEntrySize`: `createReadStream`, weak ETag `W/"<sizeHex>-<mtimeHex>"`, `X-Cache: MISS-STREAM`, never cached. No Range/206 support.
   - Both paths honor `If-None-Match` (RFC 9110: `*`, comma lists, weak-compare) → 304 with headers intact.

`Cache-Control` by filename (`getCacheControl`): `index.html`/`index.htm` → `no-cache` (enables instant grayscale switching); hashed files matching `[.-][a-f0-9]{8,}\.\w+$` → `public, max-age=31536000, immutable`; everything else → `public, max-age=3600`.

Diagnostic headers on every 200/304: `X-Cache` (`HIT-MEMORY`/`MISS`/`MISS-STREAM`), `X-CDN-Version` (actual version served), `X-Resolution-Source`. Debug grayscale with `curl -i` and read these three.

## Caching internals (`cache-utils.ts`, `config-store.ts`)

- The L1 store **is** `Cache` from `@swifty.js/cache` (byte-budgeted sharded LRU). CDN entries are serialized to a single `Buffer`: `[4-byte LE meta length][JSON {ct,cc,et,at}][content]`, wrapped in `ByteView`. See the `cache` skill for eviction mechanics.
- `PrefixIndex` is the secondary index enabling O(k) invalidation: buckets keyed by the version-level prefix `"project@version:"`. `getKeysWithPrefix`/`deletePrefix` accept either a `:`-suffixed version prefix (exact bucket) or a `"project@"` prefix (scans buckets). Kept consistent via `prefixIndex.add` on insert and the cache's `onEvicted` hook on eviction.
- `invalidateVersionCache(cache, index, project, version)` — one version, O(k). `invalidateProjectCache` — every version of a project.
- Invalidation triggers: chokidar `add`/`change`/`unlink` (single version); version CRUD, project PUT/DELETE, and `/api/publish` (whole project); LRU eviction (single entry).
- `GET /api/cache/stats` → `{ entries, maxSizeBytes, hits, misses, hitRate }` (backed by `cache.len()` and `cache.stats()`).

## In-memory config store (`config-store.ts`)

MongoDB is read **only** during CRUD; requests hit a module-level `configMap: Map<name, ProjectConfig>` (readonly plain objects created by `toProjectConfig`, not Mongoose docs). `refreshConfig()` does a full reload at boot; `refreshProjectConfig(name)` does copy-mutate-swap (atomic reference replacement) after each CRUD, deleting the entry when the doc is gone. `validateDistPath(distPath, workspaceRoot)` is the write-side guard: resolved path must equal or live under the workspace root.

## File watching (`file-watcher.ts`)

- One chokidar watcher per `${project}@${version}`, **active versions only**, stored in a module-level `Map`. Options: `ignoreInitial: true`, `ignored: /(^|[/\\])\../` (dot-files), `persistent: true`.
- All three events call `invalidateVersionCache` for that version.
- `addWatch(cache, prefixIndex, name, version)` silently no-ops if the project/version is missing or inactive; `removeWatch(name, version)` awaits `watcher.close()` and no-ops on unknown keys. CRUD routes maintain watchers synchronously (POST version → addWatch; PUT version → removeWatch old + addWatch new; DELETE → removeWatch; publish → addWatch).
- Note: deactivating a version via PUT `isActive: false` removes then conditionally re-adds the watch (addWatch skips inactive) — stale content in inactive dists is expected and harmless.

## REST API (`routes/api.ts`)

Envelope: success `{ success: true, data }`; failures `{ success: false, error: "ValidationError" | "Conflict" | "NotFound" | "Internal Server Error", message }` with 400/409/404/500.

```
GET    /api/health                              { status: "ok", uptime }
GET    /api/cache/stats                         cache statistics
GET    /api/projects                            ProjectConfig[]
GET    /api/projects/:name                      ProjectConfig | 404
POST   /api/projects                            201; validates distPaths, rejects dup versions, 409 on dup name
PUT    /api/projects/:name                      only { description?, defaultVersion? } (ProjectUpdateSchema)
DELETE /api/projects/:name                      removes watchers, invalidates, { deleted: true }
GET    /api/projects/:name/versions             VersionConfig[]
POST   /api/projects/:name/versions             201; VersionCreateSchema { version, distPath, weight=100, isActive=true }
PUT    /api/projects/:name/versions/:version    all fields optional, supports rename (409 on collision)
DELETE /api/projects/:name/versions/:version    splices version, updates watchers
GET    /api/discover                            DiscoveredDist[]
POST   /api/publish                             201; idempotent create-or-update
```

`POST /api/publish` (`PublishSchema: { name, version, distPath }`) semantics:

- No project → create with the single version (`weight: 100, isActive: true, defaultVersion: version`).
- Project exists, version new → append (`weight: 100, isActive: true`).
- Both exist → update `distPath` in place + force `isActive: true`.
- Never modifies `defaultVersion` on an existing project; always invalidates the project cache, refreshes config, and adds a watch.

Typical publish flow: build → `GET /api/discover` → `POST /api/publish` with the discovered entry → immediately serve `/cdn/<name>/...` (no restart; chokidar keeps subsequent rebuilds fresh).

## Workspace discovery (`discover.ts`)

- Scans from `workspaceRoot`, `depth > 3` pruned, serially (slow on huge workspaces).
- Candidate dist names (8): `dist`, `dist-ssr`, `dist-rsbuild`, `dist-rollup`, `dist-rspack`, `dist-tsup`, `dist-webpack`, `dist-vite`.
- `SKIP_DIRS` = those 8 names + `.cache .git .pnpm-store .vite .vscode bin build coverage node_modules out output temp tmp` — dist names are skipped as scan entries deliberately so `proj/dist/sub/dist` isn't treated as an independent project.
- A directory containing any dist candidate contributes one result per candidate and is **not** recursed into further.
- Result name: `<dirName>` for plain `dist`, else `<dirName>-<distType>` (URL-safe, passes the projectName regex). Version read from `<dist>/../package.json`, fallback `"0.0.0"`.

## Data model (`models/project.ts`)

One MongoDB document per project: `{ name (unique, regex-matched), description = "", versions: [subdocs], defaultVersion = "latest", timestamps }`. Version subdoc: `{ version, distPath, weight (0-100, default 100), isActive (default true), createdAt: number (Date.now() ms — a number, not a Date) }`. Caveat: `PUT /projects/:name` uses `findOneAndUpdate`, which skips Mongoose validators by default (known limitation K15).

## Security model

- **Write side**: every distPath entering the system passes `validateDistPath` → 400 if outside `CDN_WORKSPACE_ROOT` (prevents registering `/etc`).
- **Read side**: every request path passes `resolveSafePath` → 403 on escape (defends `../../etc/passwd` URL injection).
- Character sets locked down by regex + zod at all boundaries.
- **Deliberately absent**: authentication, TLS, rate limiting, CORS restrictions, IP allowlists. Bind to `127.0.0.1` or firewall it; never expose to untrusted networks.

## Known limitations (keep in mind when advising)

- Binds all interfaces with no auth (K11); `cors({ origin: "*" })` (K5).
- `weighted-random` always precedes `default-fallback` (K3) — see grayscale section.
- No Range/206 for streamed files ≥ 2 MB (K7); no L2 disk cache, so L1 is cold after restart (K8).
- Serial discovery scan (K10); no metrics endpoint (K12); discovery assumes `<dist>/../package.json` (K14); `findOneAndUpdate` bypasses validators (K15).

## Troubleshooting quick table

| Symptom                          | Likely cause / check                                                                                                                                                  |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hangs at "Connecting to MongoDB" | MongoDB down or bad URI: `mongosh <uri> --eval 'db.runCommand({ping:1})'`                                                                                             |
| 404 `Project not found`          | Not in `configMap`: `curl -s :3300/api/projects \| jq '[.data[].name]'`; publish first                                                                                |
| 404 `No available version`       | All versions `isActive: false`; check `/api/projects/X`                                                                                                               |
| Stale content after rebuild      | Watcher missing (check "Watching dist" log), version inactive, or browser cached an immutable hashed file (hard refresh)                                              |
| `X-Cache` always `MISS`          | File ≥ 2 MB (`MISS-STREAM`? raise `CDN_CACHE_MAX_ENTRY_SIZE`), editor temp files triggering chokidar, or LRU churn (check `/api/cache/stats` vs `CDN_CACHE_MAX_SIZE`) |
| 403 `Path traversal detected`    | URL contains `..` or a proxy rewrote the path                                                                                                                         |
| Old version after publish        | Weighted random picked it; verify with `/cdn/x@newver/...`, then set old version `weight: 0` or `isActive: false` via PUT                                             |
| Port/connection lingers          | SIGKILL skips graceful shutdown; use SIGTERM/SIGINT                                                                                                                   |

## Embedding and extending

`createApp(config)` returns `AppInstance { app: Koa, cache: Cache, prefixIndex: PrefixIndex }` — note all three fields (the README's older example showing `{ app, cache }` and a `LruCache`/`memory-cache.js` import is stale; there is no such module). To embed:

```ts
import mongoose from "mongoose";
import { loadConfig } from "@swifty.js/cdn/dist/config.js";
import { createApp } from "@swifty.js/cdn/dist/app.js";
import { refreshConfig } from "@swifty.js/cdn/dist/services/config-store.js";
import { startFileWatcher } from "@swifty.js/cdn/dist/services/file-watcher.js";

const config = loadConfig();
await mongoose.connect(config.mongoUri);
await refreshConfig();
const { app, cache, prefixIndex } = createApp(config);
startFileWatcher(cache, prefixIndex);
app.listen(config.port);
```

- Custom middleware added via `app.use(...)` after `createApp` runs **after** the API router and before nothing useful — to guard the API, wrap in an outer Koa app or modify `app.ts` ordering.
- Core modules are side-effect-free and usable standalone: `parseRoute(path, prefix)`, `resolveVersion(...)`, `resolveSafePath(base, p)`, `buildCacheKey(...)`, `PrefixIndex`, `discoverDists(root)`.
- Custom grayscale strategy (e.g. user-ID hashing): the resolver is not injectable; copy `utils/grayscale.ts` and swap the import in `middleware/cdn.ts`.
- When modifying watcher/invalidation logic, preserve the invariant that every `cache.add` is paired with `prefixIndex.add` and every eviction path removes from the index — otherwise invalidation silently misses entries.

## Working conventions for this package

- TypeScript strict mode with `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`; the codebase enforces a zero-`any` policy and readonly in-memory types. Match that style in edits.
- All API input/output crosses a zod schema (`types/schemas.ts`); add schemas for any new endpoint rather than hand-validating.
- Keep the three-way agreement (route regex ↔ zod ↔ Mongoose `match`) intact when changing name/version character rules.
- Log via the shared pino `logger` with structured fields (`logger.info({ project, version }, "msg")`), not `console.log`.
