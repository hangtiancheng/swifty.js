---
name: swifty-cdn
description: Authoritative reference for the @swifty.js/cdn local CDN server located at packages/cdn (TypeScript/Node.js, ESM, Koa 3 + MongoDB + chokidar, built on top of the @swifty.js/cache L1 memory cache). It serves dist artifacts from multiple workspace projects under `/cdn/<project>[@version]/<path>` with 4-level grayscale version routing (URL @version, header, cookie, weighted random), SPA fallback, ETag/304 negotiation, per-version cache invalidation, workspace dist auto-discovery, and a REST management API. Use this skill whenever the user reads, writes, debugs, reviews, or extends code under `packages/cdn/src/**`, mentions `@swifty.js/cdn`, "local CDN", "grayscale release", or works with any of these symbols and concepts—`createApp`, `AppInstance`, `loadConfig`, `ServerConfig`, `createCdnMiddleware`, `errorMiddleware`, `createApiRouter`, `parseRoute`, `ParsedRoute`, `resolveVersion`, `getVersionByWeight`, `ResolvedVersion`, `VersionResolutionSource`, `resolveSafePath`, `hasFileExtension`, `normalizeFilePath`, `buildCacheKey`, `CacheKey`, `CacheEntry`, `PrefixIndex`, `serializeCacheEntry`, `deserializeCacheEntry`, `getProjectConfig`, `getConfigMap`, `refreshConfig`, `refreshProjectConfig`, `invalidateProjectCache`, `invalidateVersionCache`, `validateDistPath`, `startFileWatcher`, `stopFileWatcher`, `addWatch`, `removeWatch`, `discoverDists`, `DiscoveredDist`, `Project`, `toProjectConfig`, `ProjectConfig`, `VersionConfig`, `ProjectCreateSchema`, `ProjectUpdateSchema`, `VersionCreateSchema`, `VersionUpdateSchema`, `PublishSchema`, env vars `CDN_PORT`/`CDN_MONGO_URI`/`CDN_CACHE_MAX_SIZE`/`CDN_CACHE_MAX_ENTRY_SIZE`/`CDN_PREFIX`/`CDN_API_PREFIX`/`CDN_GRAYSCALE_HEADER`/`CDN_GRAYSCALE_COOKIE_PREFIX`/`CDN_WORKSPACE_ROOT`, the `x-use-gray` header, `cdn_gray_` cookies, and the diagnostic headers `X-Cache`/`X-CDN-Version`/`X-Resolution-Source`. Also trigger on REST endpoints `/api/projects`, `/api/projects/:name/versions`, `/api/publish`, `/api/discover`, `/api/cache/stats`, `/api/health`, and on troubleshooting phrases like "stale dist content", "X-Cache always MISS", "Path traversal detected", "No available version", "weighted random version routing", "SPA fallback to index.html". Do NOT use for the internals of the underlying cache primitives (Group, LruStore, ByteView, ConHashMap, gRPC peers)—route those to the `swifty-cache` skill for `@swifty.js/cache`; this skill covers the CDN server that consumes it.
---

# @swifty.js/cdn — Local CDN Server with Grayscale Routing

`@swifty.js/cdn` (`packages/cdn`, ESM, `"type": "module"`, `main: dist/index.js`) is a single-machine CDN that unifies `dist` artifacts from multiple workspace projects under one HTTP endpoint. It layers grayscale (canary) version routing, an L1 in-memory cache, SPA fallback, and MongoDB-backed project/version CRUD on top of Koa 3. Intended for local multi-project development, intranet staging/QA, and offline demos—**not** for public production traffic (no auth, no TLS, no rate limiting, `cors({ origin: "*" })`).

Stack: Koa 3, `@koa/router` 15, `@koa/bodyparser`, `@koa/cors`, Mongoose 9, chokidar 5, pino 10 (+pino-pretty), zod 4, `mime-types`, and the workspace package `@swifty.js/cache` (provides the `Cache`/`ByteView` primitives used as the L1 store). Requirements: Node 18+, MongoDB 4+.

Scripts: `pnpm dev` (tsx watch src/index.ts), `pnpm build` (tsc), `pnpm start` (node ./dist/index.js). No test suite currently exists in this package.

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
    ├── logger.ts              # pino logger (name "cdn", LOG_LEVEL env, pino-pretty transport)
    ├── path-security.ts       # resolveSafePath / normalizeFilePath / buildCacheKey / hasFileExtension
    └── route-parser.ts        # parseRoute — URL → { projectName, explicitVersion, filePath }
```

Middleware order in `createApp` matters: `errorMiddleware` → CORS (`origin: "*"`, `exposeHeaders: ["ETag", "X-Cache", "X-CDN-Version", "X-Resolution-Source"]`) → `bodyParser()` → API router (`routes()` + `allowedMethods()`) → CDN middleware (catch-all last). `createApp` wires `Cache` from `@swifty.js/cache` with `maxBytes: config.cacheMaxSize` and `onEvicted: (key) => prefixIndex.remove(key)` so LRU evictions keep the secondary index consistent.

Boot sequence (`index.ts` `main()`): `loadConfig()` → `mongoose.connect(config.mongoUri)` → `refreshConfig()` (full load into memory) → `createApp(config)` → `startFileWatcher(cache, prefixIndex)` → `app.listen(config.port)`. Startup logs (pino, name `"cdn"`): `"Connecting to MongoDB"`, `"MongoDB connected"`, `"Config loaded into memory"`, `"File watcher started"`, `"Server running"`. Graceful shutdown on SIGTERM/SIGINT (idempotent via a `shuttingDown` flag): `server.close()` + `server.closeAllConnections?.()` → `await stopFileWatcher()` → `cache.close()` → `await mongoose.disconnect()` → `process.exit(0)`. Startup failure logs `"Failed to start"` at fatal level and exits 1.

## Configuration (`config.ts`)

All env vars are zod-validated at startup; invalid values fail fast with `Invalid environment configuration — <field>: <message>`. Empty-string vars are treated as unset (defaults apply). Prefixes are normalized to start with `/`; `grayscaleHeader` is lowercased; `workspaceRoot` is resolved with `path.resolve(process.cwd(), env.CDN_WORKSPACE_ROOT)`.

| Variable                      | Default                         | `ServerConfig` field                                                      |
| ----------------------------- | ------------------------------- | ------------------------------------------------------------------------- |
| `CDN_PORT`                    | `3300` (int 1–65535)            | `port` — HTTP port                                                        |
| `CDN_MONGO_URI`               | `mongodb://localhost:27017/cdn` | `mongoUri`                                                                |
| `CDN_CACHE_MAX_SIZE`          | `134217728` (128 MB)            | `cacheMaxSize` — L1 byte budget (`Cache.maxBytes`)                        |
| `CDN_CACHE_MAX_ENTRY_SIZE`    | `2097152` (2 MB)                | `cacheMaxEntrySize` — files **≥** this size are streamed, never cached    |
| `CDN_PREFIX`                  | `/cdn`                          | `cdnPrefix`                                                               |
| `CDN_API_PREFIX`              | `/api`                          | `apiPrefix`                                                               |
| `CDN_GRAYSCALE_HEADER`        | `x-use-gray`                    | `grayscaleHeader` (lowercased)                                            |
| `CDN_GRAYSCALE_COOKIE_PREFIX` | `cdn_gray_`                     | `grayscaleCookiePrefix` — cookie name = prefix + projectName              |
| `CDN_WORKSPACE_ROOT`          | `../` (resolved from cwd)       | `workspaceRoot` — root for discovery and distPath validation              |
| `LOG_LEVEL`                   | `info`                          | pino level (read directly in `logger.ts`, **not** part of `ServerConfig`) |

## URL routing (`route-parser.ts`)

```
/<cdnPrefix>/<projectName>[@version]/<filePath>
regex (after prefix strip): /^\/([a-zA-Z0-9][a-zA-Z0-9_-]*)(?:@([a-zA-Z0-9._-]+))?\/(.*)$/
```

- `projectName` must start alphanumeric; allows `-` and `_`. `version` allows dots, hyphens, underscores. The same character rules are enforced in triplicate: route regex, zod schemas (`ProjectCreateSchema`/`VersionCreateSchema`/`PublishSchema`), and the Mongoose `match`.
- `/cdn/admin/` yields `filePath: ""` (dist root → SPA fallback). Paths not matching the regex (or not starting with the prefix) return `undefined` from `parseRoute` and fall through to `next()` (404 by Koa default).
- Non-preflight `OPTIONS` on a CDN route returns 204 (preflight itself is handled by the CORS middleware).

## Grayscale version resolution (`grayscale.ts`)

`resolveVersion(project, explicitVersion, headers, headerName, cookiePrefix)` walks four levels; the first match wins and is reported in `X-Resolution-Source`:

1. **`url-explicit`** — URL `@version`, only if that version exists in the project. A nonexistent explicit version **degrades gracefully** to the next levels instead of 404ing.
2. **`header-override` / `cookie-override`** — header first, then cookie:
   - Plain string header (`x-use-gray: 2.0.0`) applies to all projects.
   - JSON object header (`x-use-gray: {"admin":"1.0.0"}`) is per-project; if the current project is not among the keys, resolution falls through (no plain-string fallback). Malformed JSON that starts with `{` **is** treated as a plain string.
   - Cookie `cdn_gray_<project>=<version>` is parsed manually from the `Cookie` header (split on `;`, prefix match).
   - An override naming a nonexistent version also falls through.
3. **`weighted-random`** — `getVersionByWeight(project.versions)` filters `isActive: true`: 0 active → skip level; 1 active → returned directly; total weight 0 → first active; otherwise proportional `Math.random()` selection.
4. **`default-fallback`** — `project.defaultVersion`, looked up by name. Because level 3 precedes it, `defaultVersion` only takes effect when **all versions are inactive**. To pin a "default", set its weight to 100 and zero/deactivate the rest.

Returns `undefined` when nothing resolves → 404. Note: the doc comments in `grayscale.ts` mention `X-CDN-Version or cdn_version_<project>` as override names — those comments are stale; the actual names come from `ServerConfig` (`x-use-gray` / `cdn_gray_` by default).

## The CDN request path (`middleware/cdn.ts`)

Order of operations for `GET /cdn/...`:

1. `parseRoute` → no match = `next()`. `OPTIONS` → 204.
2. Project lookup via `getProjectConfig` (in-memory, O(1), **never touches MongoDB**) → 404 `{ error: 'Project "x" not found' }`.
3. `resolveVersion` → 404 `{ error: 'No available version for project "x"' }`.
4. `normalizeFilePath` (`path.posix.normalize` + strip leading `/`; `""` for dist root, `"."` → `""` — cache-key canonicalization) then `resolveSafePath(distPath, path)` → escape = 403 `{ error: "Path traversal detected" }`.
5. **L1 lookup** with `buildCacheKey(project, version, normalizedPath)` (format `"project@version:filePath"`, type `CacheKey`). A hit serves from memory with `X-Cache: HIT-MEMORY`; deserialization is memoized per stored `ByteView` in a module-level `WeakMap` (`entryMemo`) so repeat hits skip `JSON.parse`.
6. **Disk stat with SPA fallback**:
   - Path is a directory → try `<dir>/index.html`.
   - Stat fails (e.g. `ENOENT`) and the path has **no file extension** (`hasFileExtension` = `path.basename(p).includes(".")`) → fall back to dist-root `index.html`. Paths with extensions 404 directly.
   - Nothing found → 404 `{ error: "File not found: <filePath>" }`.
7. **Canonical-key dedupe**: the entry is cached under the key of the file actually served (relative path of `finalPath`, e.g. `index.html`), so N SPA routes share one cache entry. If canonical ≠ requested key, a second cache lookup happens before disk read.
8. Serve (both branches set `Content-Type` via `mime.lookup` fallback `application/octet-stream`, `Content-Length`, `Cache-Control`, `Last-Modified`, `X-CDN-Version`, `X-Resolution-Source`):
   - `< cacheMaxEntrySize`: `fs.readFile`, strong MD5 ETag (`"<md5hex>"`), `X-Cache: MISS`, `serializeCacheEntry` → `cache.add(canonicalKey, new ByteView(...))` + `prefixIndex.add(canonicalKey)`.
   - `>= cacheMaxEntrySize`: `createReadStream`, weak ETag `W/"<sizeHex>-<mtimeHex>"`, `X-Cache: MISS-STREAM`, never cached. No Range/206 support.
   - Both paths honor `If-None-Match` per RFC 9110 (`*`, comma lists, weak-compare via `W/` prefix strip) → 304 with headers intact.

`Cache-Control` by filename (`getCacheControl`): `index.html`/`index.htm` → `no-cache` (enables instant grayscale switching); hashed files matching `/[.-][a-f0-9]{8,}\.\w+$/` → `public, max-age=31536000, immutable`; everything else → `public, max-age=3600`.

Diagnostic headers on every 200/304: `X-Cache` (`HIT-MEMORY`/`MISS`/`MISS-STREAM`), `X-CDN-Version` (actual version served), `X-Resolution-Source`. Debug grayscale with `curl -i` and read these three.

## REST API (`routes/api.ts`)

Envelope: success `{ success: true, data }`; failures `{ success: false, error, message }` where `error` is `"ValidationError"` (400), `"Conflict"` (409), `"NotFound"` (404), or `"Internal Server Error"` (500, from `errorMiddleware`, which also logs `"Unhandled error"`).

| Method/Path                                    | Status          | Behavior                                                                                                                                                                           |
| ---------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/health`                              | 200             | `{ status: "ok", uptime: process.uptime() }`                                                                                                                                       |
| `GET /api/cache/stats`                         | 200             | `{ entries, maxSizeBytes, hits, misses, hitRate }` (from `cache.len()` and `cache.stats()`; `hitRate` maps `stats.hit_rate`)                                                       |
| `GET /api/projects`                            | 200             | `ProjectConfig[]` (lean docs via `toProjectConfig`)                                                                                                                                |
| `GET /api/projects/:name`                      | 200/404         | `ProjectConfig`; 404 `Project "x" not found`                                                                                                                                       |
| `POST /api/projects`                           | 201/400/409     | `ProjectCreateSchema`; 400 `distPath "..." is outside workspace root` or `Duplicate version strings in versions array`; 409 `Project "x" already exists`; adds a watch per version |
| `PUT /api/projects/:name`                      | 200/400/404     | `ProjectUpdateSchema` — only `{ description?, defaultVersion? }`; `findOneAndUpdate` (skips Mongoose validators); invalidates project cache                                        |
| `DELETE /api/projects/:name`                   | 200/404         | removes all version watchers, deletes doc, invalidates, refreshes → `{ deleted: true }`                                                                                            |
| `GET /api/projects/:name/versions`             | 200/404         | raw `versions` array from the lean doc                                                                                                                                             |
| `POST /api/projects/:name/versions`            | 201/400/404/409 | `VersionCreateSchema` `{ version, distPath, weight=100, isActive=true }`; 409 `Version "v" already exists in project "x"`; invalidates project cache + `addWatch`                  |
| `PUT /api/projects/:name/versions/:version`    | 200/400/404/409 | `VersionUpdateSchema` (all optional, supports rename; 409 on rename collision); `removeWatch(old)` → invalidate → refresh → `addWatch(new ?? old)`                                 |
| `DELETE /api/projects/:name/versions/:version` | 200/404         | splices the version, `removeWatch`, invalidates, refreshes                                                                                                                         |
| `GET /api/discover`                            | 200             | `DiscoveredDist[]` from `discoverDists(config.workspaceRoot)`                                                                                                                      |
| `POST /api/publish`                            | 201/400         | `PublishSchema { name, version, distPath }`; idempotent create-or-update                                                                                                           |

`POST /api/publish` semantics:

- No project → create with the single version (`weight: 100, isActive: true, defaultVersion: version`, `description: ""`).
- Project exists, version new → append (`weight: 100, isActive: true`).
- Both exist → update `distPath` in place + force `isActive: true`.
- Never modifies `defaultVersion` on an existing project; always runs `invalidateProjectCache` → `refreshProjectConfig` → `addWatch`; always returns 201.

All distPath-writing endpoints (`POST /projects`, `POST/PUT versions`, `POST /publish`) enforce `validateDistPath(distPath, workspaceRoot)` → 400 `distPath "..." is outside workspace root`.

## Caching internals (`cache-utils.ts`, `config-store.ts`)

- The L1 store **is** `Cache` from `@swifty.js/cache` (byte-budgeted LRU). CDN entries are serialized to a single `Buffer`: `[4-byte LE meta length][JSON {ct,cc,et,at}][content]`, wrapped in `ByteView`. `deserializeCacheEntry` reads via `view.byteSlice()`. See the `swifty-cache` skill for eviction mechanics.
- `PrefixIndex` is the secondary index enabling O(k) invalidation: buckets keyed by the version-level prefix `"project@version:"` (extracted as everything up to and including the first `:`). `getKeysWithPrefix`/`deletePrefix` accept either a `:`-suffixed version prefix (exact bucket lookup) or a `"project@"` prefix (scans buckets with `startsWith`). Kept consistent via `prefixIndex.add` on insert and the cache's `onEvicted` hook on eviction.
- `invalidateVersionCache(cache, index, project, version)` — deletes every key under `"project@version:"`, O(k). `invalidateProjectCache(cache, index, project)` — every version of a project via the `"project@"` prefix.
- Invalidation triggers: chokidar `add`/`change`/`unlink` (single version); version CRUD, project PUT/DELETE, and `/api/publish` (whole project); LRU eviction (single entry via `onEvicted`).

### In-memory config store (`config-store.ts`)

MongoDB is read **only** during CRUD and boot; requests hit a module-level `configMap: Map<name, ProjectConfig>` (readonly plain objects created by `toProjectConfig`, not Mongoose docs). `refreshConfig()` builds a new map and swaps the reference at boot; `refreshProjectConfig(name)` does copy-mutate-swap (atomic reference replacement) after each CRUD, deleting the entry when the doc is gone. `validateDistPath(distPath, workspaceRoot)` is the write-side guard: `path.resolve(distPath)` must equal `path.resolve(workspaceRoot)` or start with it + `path.sep`.

### File watching (`file-watcher.ts`)

- One chokidar watcher per `${project}@${version}` key, **active versions only**, stored in a module-level `Map<string, FSWatcher>`. Options: `ignoreInitial: true`, `ignored: /(^|[/\\])\../` (dot-prefixed files), `persistent: true`. Log on start: `"Watching dist"` with `{ project, version, distPath }`.
- All three events (`change`, `add`, `unlink`) call `invalidateVersionCache` for that whole version (the changed file path is only used in the debug log `"Cache invalidated on file change"`).
- `startFileWatcher(cache, prefixIndex)` iterates `getConfigMap()` at boot. `addWatch(cache, prefixIndex, name, version)` silently no-ops if the project/version is missing or `isActive: false`, or if the key is already watched; `removeWatch(name, version)` awaits `watcher.close()` and no-ops on unknown keys. `stopFileWatcher()` closes all watchers in parallel and clears the map.
- Invariant to preserve when editing: every `cache.add` is paired with `prefixIndex.add`, and every removal path (delete or eviction) removes from the index — otherwise invalidation silently misses entries.
- Deactivating a version via PUT `isActive: false` removes then conditionally re-adds the watch (addWatch skips inactive) — stale content in inactive dists is expected and harmless.

### Workspace discovery (`discover.ts`)

- Scans from `workspaceRoot`, recursion pruned at `depth > MAX_SCAN_DEPTH` (3), serially (slow on huge workspaces). Unreadable dirs are skipped silently.
- Candidate dist names (8, `DIST_DIR_NAMES`): `dist`, `dist-ssr`, `dist-rsbuild`, `dist-rollup`, `dist-rspack`, `dist-tsup`, `dist-webpack`, `dist-vite`.
- `SKIP_DIRS` = those 8 names + `.cache .git .pnpm-store .vite .vscode bin build coverage node_modules out output temp tmp` — dist names are skipped as scan entries deliberately so `proj/dist/sub/dist` is not treated as an independent project.
- A directory containing any dist candidate contributes one result per candidate found and is **not** recursed into further.
- Result name: `<dirName>` for plain `dist`, else `<dirName>-<distType>` (uses `-`, not `:`, so the name stays URL-safe and passes the projectName regex). Version read from `<dist>/../package.json` `version` field, fallback `"0.0.0"` (`DEFAULT_VERSION`).

### Data model (`models/project.ts`)

One MongoDB document per project: `{ name (unique, match /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/), description = "", versions: [subdocs], defaultVersion = "latest", timestamps }`. Version subdoc: `{ version (required), distPath (required), weight (0–100, default 100), isActive (default true), createdAt: number (Date.now() ms — a number, not a Date) }`. The model is registered idempotently (`mongoose.models.Project ?? mongoose.model(...)`). `toProjectConfig(leanDoc)` maps to the readonly in-memory `ProjectConfig`.

## Operational guidance and lifecycle

- Startup order matters: MongoDB must be reachable before `refreshConfig()`; watchers start from the loaded `configMap`, so projects published while the server is down get watchers at next boot (active versions only).
- Shutdown order (SIGTERM/SIGINT): stop accepting connections (`server.close` + `closeAllConnections`) → close all chokidar watchers → `cache.close()` (releases `@swifty.js/cache` internals) → `mongoose.disconnect()` → exit 0. SIGKILL skips all of this.
- There are no timers in this package; the only long-lived async resources are the HTTP server, chokidar watchers, the Mongoose connection, and the cache.
- Security model — write side: `validateDistPath` (400 outside `CDN_WORKSPACE_ROOT`, prevents registering `/etc`); read side: `resolveSafePath` (403 on escape, defends `../../etc/passwd`); character sets locked by regex + zod at all boundaries. **Deliberately absent**: authentication, TLS, rate limiting, CORS restrictions, IP allowlists. Bind to `127.0.0.1` or firewall it; never expose to untrusted networks.

## Pitfalls / known limitations

- **Binds all interfaces with no auth**: `app.listen(port)` has no host argument; any LAN machine can hit the API. Avoid by firewalling or fronting with a reverse proxy.
- **`weighted-random` always precedes `default-fallback`**: `defaultVersion` only serves when every version is inactive. To pin a version, set its weight to 100 and zero/deactivate the rest.
- **`cors({ origin: "*" })`**: fully open; tighten in `app.ts` before any shared deployment.
- **No Range/206**: files ≥ `CDN_CACHE_MAX_ENTRY_SIZE` stream fully (weak ETag + 304 still work). Video scrubbing and resumable downloads will not work.
- **No L2 disk cache**: L1 is cold after every restart; first requests hit disk.
- **Serial discovery scan**: `GET /api/discover` stats entries one by one; slow on very large workspaces.
- **Discovery assumes `<dist>/../package.json`**: unusual layouts fall back to version `"0.0.0"`.
- **`findOneAndUpdate` bypasses Mongoose validators** in `PUT /api/projects/:name` (no `runValidators`); zod is the effective guard there.
- **No metrics endpoint**: only `/api/health` and `/api/cache/stats`.
- **README drift**: the README's embedding examples show `createApp` returning `{ app, cache }` and import `LruCache` from `services/memory-cache.js` — both stale; `createApp` returns `{ app, cache, prefixIndex }` and there is no `memory-cache.js` module (the store is `@swifty.js/cache`). The README also quotes the chokidar `ignored` regex as `/(^|[/\\])\.\./`; source is `/(^|[/\\])\../` (dot-prefixed files, not `..`).
- **Stale doc comment**: `grayscale.ts` header comments mention `X-CDN-Version`/`cdn_version_<project>` as override names; actual defaults are `x-use-gray`/`cdn_gray_` from config.

### Troubleshooting quick table

| Symptom                                    | Likely cause / check                                                                                                                                                               |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hangs at "Connecting to MongoDB"           | MongoDB down or bad URI: `mongosh <uri> --eval 'db.runCommand({ping:1})'`                                                                                                          |
| 404 `Project "x" not found`                | Not in `configMap`: `curl -s :3300/api/projects \| jq '[.data[].name]'`; publish first                                                                                             |
| 404 `No available version for project "x"` | All versions `isActive: false` and `defaultVersion` names no version; check `/api/projects/x`                                                                                      |
| Stale content after rebuild                | Watcher missing (check `"Watching dist"` log), version inactive, or browser cached an immutable hashed file (hard refresh)                                                         |
| `X-Cache` always `MISS`                    | File ≥ 2 MB (`MISS-STREAM`? raise `CDN_CACHE_MAX_ENTRY_SIZE`), editor temp files triggering chokidar invalidation, or LRU churn (check `/api/cache/stats` vs `CDN_CACHE_MAX_SIZE`) |
| 403 `Path traversal detected`              | URL contains `..` or a proxy rewrote the path outside distPath                                                                                                                     |
| Old version after publish                  | Weighted random picked it; verify with `/cdn/x@newver/...` (`X-Resolution-Source: url-explicit`), then set old version `weight: 0` or `isActive: false` via PUT                    |
| Port/connection lingers                    | SIGKILL skips graceful shutdown; use SIGTERM/SIGINT                                                                                                                                |

## Quick recipes

Start the server:

```bash
cd packages/cdn
cp .env.example .env   # confirm CDN_MONGO_URI and CDN_WORKSPACE_ROOT
pnpm dev               # or: pnpm build && pnpm start
curl -s http://localhost:3300/api/health
# {"success":true,"data":{"status":"ok","uptime":1.23}}
```

Publish a version (discover → publish → serve, no restart needed):

```bash
curl -s http://localhost:3300/api/discover | jq '.data'
curl -X POST http://localhost:3300/api/publish \
  -H 'Content-Type: application/json' \
  -d '{"name":"admin","version":"1.0.0","distPath":"/ws/packages/admin/dist"}'
curl -i http://localhost:3300/cdn/admin/index.html   # X-CDN-Version: 1.0.0
```

Grayscale test with header and cookie:

```bash
curl -i http://localhost:3300/cdn/admin@2.0.0/app.js              # url-explicit
curl -i -H 'x-use-gray: 2.0.0' http://localhost:3300/cdn/admin/app.js          # header-override (all projects)
curl -i -H 'x-use-gray: {"admin":"2.0.0"}' http://localhost:3300/cdn/admin/app.js  # per-project
curl -i -H 'Cookie: cdn_gray_admin=2.0.0' http://localhost:3300/cdn/admin/app.js   # cookie-override
```

Cache invalidation: touching any file in a watched dist invalidates that whole `project@version` bucket; to force it via the API, any version PUT works, e.g.

```bash
curl -X PUT http://localhost:3300/api/projects/admin/versions/1.0.0 \
  -H 'Content-Type: application/json' -d '{"isActive":true}'   # invalidates project cache
```

Embed in another Node process (`createApp` returns all three fields):

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

Notes for extenders: middleware added via `app.use(...)` after `createApp` runs after the API router — to guard the API, wrap in an outer Koa app or modify `app.ts` ordering. Core modules are side-effect-free and usable standalone: `parseRoute(path, prefix)`, `resolveVersion(...)`, `resolveSafePath(base, p)`, `normalizeFilePath(p)`, `buildCacheKey(...)`, `PrefixIndex`, `discoverDists(root)`. The grayscale resolver is not injectable; to customize (e.g. user-ID hashing), copy `utils/grayscale.ts` and swap the import in `middleware/cdn.ts`.

## Relationship to @swifty.js/cache

This package consumes exactly two exports from `@swifty.js/cache`: `Cache` (constructed with `{ maxBytes, onEvicted }`; used via `get` → `[view, found]`, `add`, `delete`, `len`, `stats()` → `{ hits, misses, hit_rate }`, `close`) and `ByteView` (wraps the serialized entry Buffer; read back with `byteSlice()`). It does **not** use `Group`, `LruStore`, `ConHashMap`, or the gRPC peer machinery. For internals of those primitives (sharding, eviction, distributed mode), consult the `swifty-cache` skill.

## Working conventions for this package

- TypeScript strict mode with `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `erasableSyntaxOnly`; the codebase enforces a zero-`any` policy and readonly in-memory types. Match that style in edits.
- All API input crosses a zod schema (`types/schemas.ts`); add schemas for any new endpoint rather than hand-validating.
- Keep the three-way agreement (route regex ↔ zod ↔ Mongoose `match`) intact when changing name/version character rules.
- Log via the shared pino `logger` with structured fields (`logger.info({ project, version }, "msg")`), not `console.log`.
