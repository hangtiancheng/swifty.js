---
name: cache
description: Authoritative reference for the @swifty.js/cache distributed in-memory cache package located at packages/cache (TypeScript/Node.js, ESM, published as `@swifty.js/cache`). Use this skill whenever the user reads, writes, debugs, reviews, or extends code that imports from `@swifty.js/cache`, references the `packages/cache` source tree, or invokes its CLI/demo (`packages/cache/src/main.ts`, `packages/cache/bootstrap.js`). Trigger eagerly on any of these symbols and concepts—`Group`, `newGroup`, `getGroup`, `listGroups`, `destroyGroup`, `destroyAllGroups`, `Getter`, `GroupOption`, `GroupStats`, `withExpiration`, `withPeers`, `withCacheOptions`, `Cache`, `CacheOptions`, `CacheStats`, `defaultCacheOptions`, `Store`, `StoreOptions`, `LruStore`, `defaultStoreOptions`, `usedBytes`, `ByteView`, `cloneBytes`, `Value`, `SingleFlightGroup`, `ConHashMap`, `ConHashConfig`, `ConHashOption`, `withConHashConfig`, `defaultConHashConfig`, `autoRebalance`, `crc32`, `HashFunc`, `hashBKRD`, `maskOfNextPowOf2`, `Peer`, `PeerPicker`, `Client`, `ClientOptions`, `deadlineMs`, `ClientPicker`, `PickerOption`, `peerDeadlineMs`, `Server`, `ServerOptions`, `advertiseAddr`, `register`, `RegisterConfig`, `defaultRegisterConfig`, `leaseTTL`, `ServiceDiscovery`, `validPeerAddr`, `getLocalIP`, `Logger`, `log`, `setLogger`, the `pb.SwiftyCache` gRPC service (Get/Set/Delete RPCs), and the `x-peer-request` metadata flag. Also trigger on conceptual phrases like "groupcache for Node", "TypeScript distributed cache with consistent hashing", "single-flight cache stampede", "etcd-based peer discovery", "two-level LRU cache", "peer fan-out write propagation", and on file paths under `packages/cache/src/**`. Do NOT use this skill for the Go sibling `github.com/hangtiancheng/swifty.go/swifty_cache`—route those tasks to the `swifty-cache` Go skill instead. The two share architecture but diverge on naming (PascalCase Go vs. camelCase TS), concurrency primitives (`context.Context`/goroutine vs. `AbortSignal`/`async`), and packaging.
---

# @swifty.js/cache — Distributed Cache for Node.js

`@swifty.js/cache` is a TypeScript port of the groupcache architecture popularized by Brad Fitzpatrick, redesigned for the Node.js runtime and shipped from `packages/cache` as ESM (`"type": "module"`, Node ≥ 20). It provides a coherent set of building blocks—`Group`, `Cache`, `LruStore`, `ConHashMap`, `SingleFlightGroup`, `ClientPicker`, `Server`, etcd-based registration—that together yield a peer-to-peer, eventually consistent, sharded read-through cache reachable over gRPC. This skill is the canonical playbook: consult it before designing topologies, wiring callers, debugging timeouts, or evolving the public surface.

The package is intentionally aligned with the Go sibling at `swifty.go/swifty_cache`. APIs, semantics, and wire format match symbol-for-symbol; only naming conventions and language-idiomatic concurrency diverge. When the user mentions concepts that exist on both sides, confirm whether they mean the TypeScript package (`@swifty.js/cache`, this skill) or the Go module (the Go skill).

Runtime dependencies: `@grpc/grpc-js`, `@grpc/proto-loader`, `etcd3`.

## When to consult this skill (and when to skip)

Trigger this skill whenever you encounter:

- imports from `@swifty.js/cache` or relative imports inside `packages/cache/src/**`;
- discussion of the demo entry `packages/cache/src/main.ts` or the integration runner `packages/cache/bootstrap.js`;
- any of the symbols listed in the YAML `description`;
- requests to add new RPC handlers, swap in a different store, change consistent-hash replicas, tune deadlines, integrate TLS, change etcd endpoints, or re-export new public types;
- bug reports about cache miss storms, cross-node propagation gaps, `DEADLINE_EXCEEDED` from `pb.SwiftyCache.Get/Set/Delete`, port collisions, stale peers in the consistent-hash ring, or self-forwarding loops caused by bind/advertise address mismatches.

Do **not** trigger for: the Go module under `swifty.go/swifty_cache` (route to its dedicated skill); generic `node-cache`, `lru-cache`, `keyv`, `cache-manager`, or Redis client questions; gRPC tutorials unrelated to this package; or unrelated browser-side caches.

## Mental model

Reads are **read-through**: a miss at the local LRU is funnelled through `SingleFlightGroup` to deduplicate concurrent loads; the loader either hops to the consistent-hash–elected peer over gRPC or invokes the user-supplied `Getter` to consult the origin. Writes (`set`/`delete`) update the local cache **and** asynchronously fan out to the single peer that owns the key on the ring (fire-and-forget). Peer-originated traffic carries the `x-peer-request` gRPC metadata so the receiver does not echo the propagation back. Other nodes are NOT notified, so their local caches may serve stale values until eviction or expiration. There is no quorum and no anti-entropy—convergence is best-effort eventual consistency, the same as the Go sibling.

## Public API surface

All exports come through `packages/cache/src/index.ts`. Treat that file as the contract: anything not re-exported is internal and must not be relied on by callers.

### Group orchestration (`group.ts`)

- `type Getter = (ctx: AbortSignal, key: string) => Promise<Buffer>` — origin loader. Receives the `AbortSignal` from the originating call (or a per-request signal wired to gRPC call cancellation when invoked through the server).
- `interface GroupOption { (g: Group): void }` — functional-options pattern matching the Go side.
- `withExpiration(ms: number): GroupOption` — set per-entry TTL in milliseconds; `0` (default) means no expiration.
- `withPeers(peers: PeerPicker): GroupOption` — wire a `PeerPicker` (typically `ClientPicker`) so the group can discover and forward to remote owners.
- `withCacheOptions(opts: CacheOptions): GroupOption` — replace the default `Cache` with a custom-configured one (closes the default cache first).
- `class Group` (registered globally by name)
  - `constructor(name, cacheBytes, getter, ...opts)` — throws `"nil Getter"` without a loader; `cacheBytes` becomes `CacheOptions.maxBytes` on top of `defaultCacheOptions()`.
  - `get(ctx: AbortSignal, key: string): Promise<ByteView>` — read-through with single-flight; throws on closed group or empty key.
  - `set(ctx: AbortSignal, key: string, value: Buffer, isPeerRequest = false): Promise<void>` — local write (clones the buffer) plus best-effort peer fan-out when `isPeerRequest` is `false` and peers are wired.
  - `delete(ctx: AbortSignal, key: string, isPeerRequest = false): Promise<void>` — symmetric to `set`.
  - `clear()` — wipe local entries; does not propagate.
  - `close()` — idempotently dispose; removes itself from the registry.
  - `registerPeers(peers)` — late-binding alternative to `withPeers`. Throws `"RegisterPeers called more than once"` if peers already set.
  - `getStats(): GroupStats` — see below.
  - `getName()`.
- `interface GroupStats` (exported) — `{ name, closed, expiration, loads, local_hits, local_misses, peer_hits, peer_misses, loader_hits, loader_errors, hit_rate?, avg_load_time_ms?, cache: CacheStats }`. `hit_rate = local_hits / (local_hits + local_misses)`; load counters and durations are recorded **inside** the single-flight callback, so they count actual loads, not waiting callers.
- `newGroup(name, cacheBytes, getter, ...opts): Group` — preferred factory; registers in the package-level `Map<string, Group>`. Re-registration logs a warning and replaces the existing entry (the old group is NOT closed automatically).
- `getGroup(name): Group | undefined`, `listGroups(): string[]`, `destroyGroup(name): boolean`, `destroyAllGroups(): void`.

Sentinel errors thrown internally (not exported as values): match on `err.message` substrings — `"key is required"`, `"value is required"` (`set` with empty `Buffer`), `"cache group is closed"`, `"nil Getter"`, `"RegisterPeers called more than once"`.

### Cache and storage (`cache.ts`, `store.ts`, `lru.ts`)

- `interface Value { len(): number }` — minimal sized-value contract. `ByteView` is the canonical implementation.
- `interface Store` — `get`, `set`, `setWithExpiration`, `delete`, `clear`, `len`, `close`. Pluggable but only `LruStore` is shipped.
- `interface StoreOptions { maxBytes?, bucketCount?, capPerBucket?, level2Cap?, cleanupInterval?, onEvicted? }`. `defaultStoreOptions()` returns `{ maxBytes: 8192, bucketCount: 16, capPerBucket: 512, level2Cap: 256, cleanupInterval: 60_000 }`. Note: when `LruStore` is constructed with fields omitted, its own fallbacks are `capPerBucket: 1024`, `level2Cap: 1024`—different from `defaultStoreOptions()`.
- `interface CacheOptions { maxBytes?, bucketCount?, capPerBucket?, level2Cap?, cleanupTime?, onEvicted? }` — mirrors `StoreOptions` but the interval field is named `cleanupTime` (mapped to `cleanupInterval` internally). `defaultCacheOptions()` returns `{ maxBytes: 8 MiB, bucketCount: 16, capPerBucket: 512, level2Cap: 256, cleanupTime: 60_000 }`.
- `interface CacheStats` (exported) — `{ initialized, closed, hits, misses, size?, hit_rate? }`; `size`/`hit_rate` only present once the store is lazily initialized.
- `class Cache` — facade owned by `Group`. Lazily instantiates an `LruStore` on first `add`/`addWithExpiration`. Tracks `hits`/`misses`. `addWithExpiration(key, view, expirationTime)` accepts an **absolute** deadline (ms epoch); an already-expired write is treated as a delete. Adds to a closed cache are logged and dropped.
- `class LruStore` — sharded two-level LRU with a **byte budget**:
  - `bucketCount` is rounded to a power of two via `maskOfNextPowOf2`; each shard holds two `InternalCache` rings (capacity `capPerBucket` and `level2Cap`).
  - **Promotion**: a hit in level 1 removes the entry from L1 and re-inserts it into L2, providing scan resistance (2Q-style). L2 hits stay in L2.
  - **Byte accounting**: each shard gets `bucketMaxBytes = max(1, floor(maxBytes / shardCount))` when `maxBytes > 0`. Entry size is `key.length + value.len()`. After every `set`, tails are evicted (L1 first, then L2) until the shard is under budget, firing `onEvicted` for each victim. `usedBytes()` reports the live total across shards.
  - Per-entry expiry is enforced lazily on `get` and proactively by an internal `setInterval(cleanupInterval)` sweep (disabled when `cleanupInterval ≤ 0`). Always call `close()` to clear the timer.
- `hashBKRD(s)` — fast non-cryptographic 32-bit hash used to pick the shard. **Do not** use it for the consistent-hash ring (that's CRC32 by default).
- `maskOfNextPowOf2(cap)` — utility for power-of-two masks (operates on the low 16 bits).

### Immutable byte container (`byte-view.ts`)

- `class ByteView` wraps a `Buffer`. `len()` returns size; `byteSlice()` returns a **defensive copy** so mutations cannot leak back into the cache; `toString()` decodes UTF-8.
- `cloneBytes(b)` is the always-copy helper used internally before any value enters a cache or crosses the public boundary. Treat all cached values as immutable.

### Coalescing concurrent loads (`single-flight.ts`)

- `class SingleFlightGroup` provides `do<T>(key, fn): Promise<T>`. Concurrent calls with the same key share a single in-flight `Promise`; the entry is removed from the internal map in `finally`, so subsequent identical keys re-execute. Rejections propagate to every waiter (an internal no-op `catch` prevents unhandled-rejection warnings). This is what protects the origin from a thundering-herd cache miss.

### Consistent hashing (`consistent-hash.ts`, `config.ts`, `crc32.ts`)

- `class ConHashMap` — sorted virtual-node ring keyed by 32-bit hashes. `add(...nodes)`, `remove(node)`, `get(key)` (returns `""` for empty key or empty ring), `getStats()` (per-node fraction of routed requests), `setConfig(config)`, `rebalance()` (manual trigger), `close()`.
- `withConHashConfig(config): ConHashOption` — override the entire configuration at construction.
- `interface ConHashConfig { defaultReplicas, minReplicas, maxReplicas, hashFunc, loadBalanceThreshold, autoRebalance? }`. `defaultConHashConfig` is `{ defaultReplicas: 50, minReplicas: 10, maxReplicas: 200, hashFunc: crc32, loadBalanceThreshold: 0.25, autoRebalance: false }`.
- **Adaptive rebalancing is opt-in** (`autoRebalance: true`; also toggleable at runtime via `setConfig`). When enabled, a 1-second timer inspects accumulated request counts; once `totalRequests ≥ 1000` and the worst node deviates from the average by more than `loadBalanceThreshold` (default 25 %), it scales each node's replica count by `currentReplicas / loadRatio` (overloaded) or `currentReplicas * (2 - loadRatio)` (underloaded), clamped to `[minReplicas, maxReplicas]`. Counters reset and the ring is re-sorted. Call `close()` to stop the timer; without `autoRebalance` there is no timer, but `close()` is still safe and idiomatic.
- Virtual-node hashes are computed as `hashFunc("{node}-{i}")`.
- `crc32(data: string | Buffer): number` — IEEE polynomial CRC-32 (table-driven, initialized at module load). Type alias `HashFunc = (data: string | Buffer) => number`.

### Peer abstractions (`peers.ts`, `client.ts`, `client-picker.ts`)

- `interface Peer` — `get(group, key): Promise<Buffer>`, `set(group, key, value): Promise<void>`, `delete(group, key): Promise<boolean>`, `close(): Promise<void>`; shape mirrors the gRPC service.
- `interface PeerPicker` — `pickPeer(key): [Peer | null, found, isSelf]`, `close(): Promise<void>`. Implementing your own picker (e.g. for static topologies) is supported.
- `class Client implements Peer` — gRPC stub over insecure credentials.
  - `interface ClientOptions { deadlineMs?, peerRequest? }` — `deadlineMs` sets the per-call deadline (default **3000 ms**); `peerRequest: true` attaches `x-peer-request: "true"` metadata to every outgoing call so the receiving server suppresses re-propagation.
  - Errors surface as `Error("failed to {get|set|delete} value {from|to} swifty_cache: ${grpcMessage}")`. `getAddr()` returns the stored address.
- `class ClientPicker implements PeerPicker`
  - `constructor(addr, opts?: PickerOption)` with `interface PickerOption { serviceName?, etcdEndpoints?, peerDeadlineMs? }`; default service name is `"swifty_cache"`. `etcdEndpoints` overrides the discovery endpoints; `peerDeadlineMs` is forwarded to every peer `Client` it creates. Peer clients are always constructed with `peerRequest: true`.
  - `start()` first adds `selfAddr` to the ring (so key ownership is globally consistent even single-node), then performs an initial `fetchAll` from etcd, registers existing peers (excluding self, validated by `validPeerAddr`—invalid registry entries are logged and skipped), then subscribes to live `put`/`delete` events. On watcher reconnect it resyncs by re-fetching all addresses.
  - `pickPeer(key)` resolves via `ConHashMap` and returns `[null, true, true]` for self-ownership, `[client, true, false]` for a known peer, or `[null, false, false]` when the ring is empty or the address has no client.
  - `printPeers()` is a debugging helper.
  - `close()` releases the ring timer, every `Client`, and the etcd watcher.

### Server and registration (`server.ts`, `register.ts`)

- `interface ServerOptions { etcdEndpoints?, dialTimeout?, maxMsgSize?, tls?, certFile?, keyFile?, advertiseAddr? }`. Defaults: etcd at `localhost:2379`, 5 s dial timeout, 4 MiB max receive size, TLS off. `advertiseAddr` is the address **published to etcd** for peers to dial—set it whenever you bind to `0.0.0.0` or `:port`.
- `class Server`
  - Constructor `(addr, svcName, opts?)` builds the gRPC server, registers `pb.SwiftyCache` (Get/Set/Delete) and the `grpc.health.v1.Health` Check RPC (reports `SERVING` for the configured `svcName`, `UNKNOWN` for anything else), and resolves credentials (insecure, or `ServerCredentials.createSsl` when `tls && certFile && keyFile`).
  - `start()` calls `bindAsync`, then registers `advertiseAddr || addr` in etcd via `register(...)`, passing through `etcdEndpoints` and `dialTimeout`. If registration fails the server still serves traffic but logs the failure.
  - `stop()` aborts the internal AbortController (revoking the lease and deleting the etcd key) and triggers a graceful gRPC shutdown.
  - Handlers look up the target `Group` by name; missing groups produce `grpc.status.NOT_FOUND`, handler errors `grpc.status.INTERNAL`. Set/Delete inspect the inbound `x-peer-request` metadata and pass `isPeerRequest` into `Group.set`/`Group.delete` to short-circuit further fan-out. Each handler derives an `AbortSignal` from gRPC call cancellation and passes it down to the `Getter`.
- `register(svcName, addr, stopSignal, config?: Partial<RegisterConfig>)` — opens an `Etcd3` client, normalizes the advertise address (`:port` and `0.0.0.0:port` expand to `getLocalIP():port`, falling back to `127.0.0.1`), and attaches a lease (default TTL **10 s**) at `/services/{svcName}/{addr}`. On lease loss it automatically re-registers after 1 s (repeats until stopped). On `stopSignal.aborted` it revokes the lease, deletes the key, and closes the client.
- `interface RegisterConfig { endpoints, dialTimeout, leaseTTL }` and `defaultRegisterConfig = { endpoints: ["localhost:2379"], dialTimeout: 5000, leaseTTL: 10 }`.
- `class ServiceDiscovery` — the watcher used by `ClientPicker`. Constructor `(svcName, onPut, onDelete, config?: Partial<RegisterConfig>)`. `fetchAll()` snapshots `/services/{svcName}`; `watch()` streams `put`/`delete` deltas (delete addresses are recovered from the key since delete events carry no value) and resyncs via `fetchAll` on reconnect. Always `close()` to release the watcher and the etcd client.

### Helpers (`utils.ts`, `logger.ts`)

- `validPeerAddr(addr)` — accepts `localhost:<port>`, `<IPv4>:<port>`, multi-label `hostname:<port>` (RFC-1123-style labels), and `[<IPv6>]:<port>`. Single-label hosts other than `localhost` are rejected. Used by `ClientPicker` to sanitize registry entries.
- `getLocalIP()` — first non-internal IPv4 address; throws `"no valid local IP found"` if none exists.
- `interface Logger { info, warn, error }`, `setLogger(logger)`, `log` — the package logs through this indirection (default prefixes `[SwiftyCache]` on console). Call `setLogger` to route into your app's structured logger; this is the supported way to silence or capture package logs (e.g. in tests).

## Lifecycle and orchestration

A typical node has the following lifecycle. Honour the order—starting the picker before the server is fine, but never `registerPeers` before `picker.start()` has resolved, otherwise the ring only contains self and every read falls through to the local `Getter`.

1. Create the singleton `Group` with `newGroup(name, cacheBytes, getter, ...opts)`.
2. Construct and start the `Server`: `await new Server(bindAddr, svcName, { advertiseAddr }).start()`. This binds the gRPC port and registers the advertise address in etcd.
3. Construct and start the `ClientPicker` **with the same advertise address**: `const picker = new ClientPicker(advertiseAddr, { serviceName: svcName }); await picker.start();` — seeds the ring with self, loads existing peers, and subscribes to mutations.
4. Wire the two: `group.registerPeers(picker)` (or supply `withPeers(picker)` when calling `newGroup`).
5. Serve normal traffic via `group.get/set/delete` (or via the gRPC service `pb.SwiftyCache`).
6. Shutdown: `server.stop()` revokes the etcd lease and stops the server; `await picker.close()` cancels the watcher and disposes peer clients; `destroyAllGroups()` closes every cache and timer. Each step is independently idempotent.

The reference assembly lives in `packages/cache/src/main.ts` (CLI flags `-p`/`--port`, default 50051; binds `0.0.0.0:{port}` and advertises `getLocalIP():{port}`). The integration runner `packages/cache/bootstrap.js` reuses a reachable etcd on `127.0.0.1:2379` or forks a local one (`brew install etcd`), compiles the demo with `tsc` into `.dist/`, boots three nodes (8001/8002/8003), and smoke-tests each with **set-then-get**—pre-populating a key on a node guarantees the subsequent read is a local hit and sidesteps cold-read peer deadlines.

## Wire format and gRPC contract

The proto definitions are bundled and re-exported via `proto/index.ts` (`proto`, `healthProto`); the raw files are also exposed as package exports `@swifty.js/cache/proto/swifty.proto` and `.../health.proto`.

```proto
// packages/cache/src/proto/swifty.proto
syntax = "proto3";
package pb;

message Request           { string group = 1; string key = 2; bytes value = 3; }
message ResponseForGet    { bytes value = 1; }
message ResponseForSet    { bool  success = 1; }
message ResponseForDelete { bool  value = 1; }

service SwiftyCache {
  rpc Get   (Request) returns (ResponseForGet);
  rpc Set   (Request) returns (ResponseForSet);
  rpc Delete(Request) returns (ResponseForDelete);
}
```

Health checks follow the standard `grpc.health.v1.Health/Check` contract; the registered service name matches the constructor's `svcName` (probing any other name returns `UNKNOWN`).

The metadata key `x-peer-request: "true"` is the **propagation guard**. `ClientPicker` builds its peer `Client`s with `peerRequest: true`, so every forwarded call carries the header; `server.ts` reads it and passes `isPeerRequest = true` into `Group.set`/`Group.delete`, which suppresses further fan-out. When you author additional RPCs that mutate state across peers, follow the same convention to avoid propagation storms.

## Operational guidance

**Topology sizing.** `cacheBytes` in `newGroup` sets `Cache.maxBytes`, which `LruStore` enforces as a **per-shard byte budget** (`maxBytes / shardCount`, floor, min 1 byte). Both constraints bind: entry-count capacity (`bucketCount × (capPerBucket + level2Cap)` slots) and bytes. Because the budget is per shard, a pathological key distribution can evict earlier than the global figure suggests. Power-of-two bucket counts are enforced by `maskOfNextPowOf2`, so `bucketCount: 24` quietly becomes 32 (mask `0x1f`). Tune via `withCacheOptions({...defaultCacheOptions(), ...})`.

**Hot-key fairness.** Ring rebalancing is **off by default**. Enable with `withConHashConfig({ ...defaultConHashConfig, autoRebalance: true })` or call `rebalance()` manually. If one node serves disproportionately, prefer raising `defaultReplicas` (e.g. 100) rather than lowering `loadBalanceThreshold`, because lower thresholds amplify oscillation. Drop `maxReplicas` if you observe runaway memory in the ring maps. `getStats()` on the ring returns each node's fraction of routed requests since the last reset.

**Deadlines and cold reads.** Peer RPCs default to a 3-second deadline, configurable per client (`new Client(addr, { deadlineMs })`) and fleet-wide via `new ClientPicker(addr, { peerDeadlineMs })`. In a cold cluster a `get` may traverse `Group.load → ClientPicker.pickPeer → Client.get → Server.handleGet → Group.get → Getter`; deep pipelines plus origin latency can exceed the budget. Mitigations: (1) pre-warm hot keys by calling `set` on the owner first (the `bootstrap.js` approach); (2) raise `peerDeadlineMs`; (3) accept the timeout—`SingleFlightGroup` coalesces the retries and the peer failure falls back to the local `Getter` (counted as `peer_misses`).

**Error semantics.** Loader failures surface as `Error("failed to get data: ${cause}")` from `Group.loadData`; a peer failure before that is swallowed (logged + `peer_misses++`) and the local `Getter` is tried. Propagation failures inside `syncToPeers` are logged but **not** thrown—writes are deliberately fire-and-forget. If you require write acknowledgement, await `Peer.set`/`Peer.delete` directly via `picker.pickPeer`. Message substrings to match on: `"key is required"`, `"value is required"`, `"cache group is closed"`, `"nil Getter"`, `"RegisterPeers called more than once"`.

**Closing resources.** Memory leaks in this package almost always trace to a forgotten `close`. The active timers/watchers are: `LruStore` cleanup interval, `ConHashMap` balancer interval (only when `autoRebalance` is on), the `ServiceDiscovery` watcher, the etcd lease keep-alive in `register`, and every `Client`'s gRPC channel. `Group.close → Cache.close → LruStore.close` is automatic; the picker and server own the rest. In tests, prefer `try/finally` with `await picker.close()` and `server.stop()` over relying on process exit.

**Self vs. remote routing.** `ClientPicker.pickPeer` returns the tuple `[peer, found, isSelf]`. The `Group` only forwards when `found && !isSelf && peer`. Since `start()` always seeds the ring with self, a single-node cluster routes everything as self-owned and falls through to the `Getter`—that is the intended single-node fallback. `[null, false, false]` indicates a ring entry with no live client (e.g. etcd knows a peer the picker failed to add).

**Bind vs. advertise addresses.** Bind the server to `0.0.0.0:{port}` (or `:{port}`) and set `ServerOptions.advertiseAddr` to the externally reachable `host:port`. `register` additionally normalizes `:port`/`0.0.0.0:port` to `getLocalIP():port`. The `ClientPicker` **must be constructed with the exact advertise address that lands in etcd**—otherwise it fails to recognize itself in discovery events and may forward requests back to itself. `main.ts` demonstrates the correct pairing. Also keep host spellings consistent cluster-wide (don't mix `localhost` and `127.0.0.1`): `validPeerAddr` accepts both, but the ring treats them as distinct nodes.

**Etcd endpoints.** Both sides are configurable: `ServerOptions.etcdEndpoints` (registration) and `PickerOption.etcdEndpoints` (discovery). `register` also accepts `Partial<RegisterConfig>` directly, including `leaseTTL` (default 10 s). The registration is self-healing: on lease loss it re-acquires after 1 s; the discovery watcher resyncs the full peer set on reconnect.

**TLS.** Setting `tls: true, certFile, keyFile` on `ServerOptions` enables SSL server credentials. The shipped `Client` uses `grpc.credentials.createInsecure()` only—if you need a TLS client, fork or extend `client.ts`. This is a deliberate omission that keeps the bundled demo zero-config.

**Logging.** All internal logs flow through `log` in `logger.ts`. Call `setLogger({ info, warn, error })` once at startup to integrate with your logging stack or to mute output in tests.

## Build, test, and release

The package is consumed as ESM (`main`/`module`/`exports.import` all point at `dist/index.mjs`, types at `dist/index.d.ts`). The Rollup config (`rollup.config.mjs`) bundles the sources and copies the `.proto` files into `dist/proto/` so the runtime loader in `proto/index.ts` (`join(__dirname, "swifty.proto")`) keeps working post-build. Scripts:

- `pnpm --filter @swifty.js/cache run build` — Rollup bundle + dts.
- `pnpm --filter @swifty.js/cache run test` — Vitest suite (covers `byte-view`, `cache`, `consistent-hash`, `crc32`, `group`, `lru`, `single-flight`, `utils`).
- `pnpm --filter @swifty.js/cache run format` — Prettier.
- `node packages/cache/bootstrap.js` — end-to-end smoke (three nodes + etcd; compiles into `.dist/`, distinct from Rollup's `dist/`).

When publishing, `prepublishOnly` cleans and re-builds. Only `dist/` ships (see `package.json#files`).

## Common pitfalls and how to handle them

- **Importing internals.** `packages/cache/src/index.ts` is the only stable surface. Pull requests that import deep paths (`@swifty.js/cache/dist/lru`) must be redirected through new exports there (the only sanctioned subpath exports are the two `.proto` files and `package.json`).
- **Mutating returned `Buffer`s.** `ByteView.byteSlice()` already copies; `Group.get` returns the `ByteView` itself. If you call `byteSlice()` and mutate, that's safe; mutating the cached `ByteView` is not—do not reach into private fields.
- **Forgetting `await picker.start()`.** Without it, the ring holds only self and every read falls back to the local `Getter`. Symptom: 100 % `loader_hits`, 0 % `peer_hits` in `getStats()`.
- **Bind/advertise mismatch.** If the server registers `192.168.x.y:8001` but the picker was constructed with `127.0.0.1:8001`, the picker treats its own registration as a foreign peer and forwards to itself. Always pass the exact registered address pair (see "Bind vs. advertise addresses").
- **Expecting rebalancing to be on.** `autoRebalance` defaults to `false`; a skewed ring won't self-correct unless you enable it or call `rebalance()`.
- **Assuming a global byte cap.** The byte budget is sharded; per-shard eviction can trigger below the global `maxBytes`. Use `LruStore.usedBytes()` when instrumenting.
- **Replacing a group without closing it.** `newGroup` with an existing name replaces the registry entry but does not close the old group—its store timer keeps running. Call `destroyGroup(name)` first when re-creating.
- **Test flakiness from timers.** `LruStore` (and `ConHashMap` when `autoRebalance` is on) start `setInterval`s. In Vitest, ensure tests `close()` instances or the worker hangs at exit. The existing tests demonstrate the pattern.
- **Peer deadline budgeting.** 3 s default per RPC; tune via `peerDeadlineMs`/`deadlineMs` rather than forking `client.ts`. Document the chosen value in any user-facing performance budget.

## Quick recipes

**Single-node, no peers, with TTL and stats:**

```ts
import { newGroup, withExpiration } from "@swifty.js/cache";

const group = newGroup(
  "users",
  8 * 1024 * 1024,
  async (signal, key) => loadUserFromDB(signal, key),
  withExpiration(30_000),
);

const view = await group.get(new AbortController().signal, "alice");
const json = view.toString();
console.log(group.getStats()); // hit rate, load times, cache stats
```

**Clustered node (assembled like `main.ts`):**

```ts
import { newGroup, Server, ClientPicker, getLocalIP } from "@swifty.js/cache";

const SVC = "swifty_cache";
const PORT = 8001;
const bindAddr = `0.0.0.0:${PORT}`;
const advertiseAddr = `${getLocalIP()}:${PORT}`;

const group = newGroup("users", 8 << 20, loader);

const server = new Server(bindAddr, SVC, { advertiseAddr });
await server.start();

const picker = new ClientPicker(advertiseAddr, {
  serviceName: SVC,
  // etcdEndpoints: ["etcd-1:2379"], peerDeadlineMs: 5000,
});
await picker.start();
group.registerPeers(picker);

process.on("SIGINT", async () => {
  server.stop();
  await picker.close();
  process.exit(0);
});
```

**Direct gRPC client (no `Group` involvement):**

```ts
import { Client } from "@swifty.js/cache";

const client = new Client("127.0.0.1:8001", { deadlineMs: 5000 });
await client.set("users", "alice", Buffer.from("…"));
const value = await client.get("users", "alice");
await client.close();
```

**Custom consistent-hash configuration with auto-rebalancing:**

```ts
import { ConHashMap, withConHashConfig, crc32 } from "@swifty.js/cache";

const ring = new ConHashMap(
  withConHashConfig({
    defaultReplicas: 100,
    minReplicas: 50,
    maxReplicas: 400,
    hashFunc: crc32,
    loadBalanceThreshold: 0.15,
    autoRebalance: true,
  }),
);
ring.add("127.0.0.1:8001", "127.0.0.1:8002", "127.0.0.1:8003");
console.log(ring.get("alice"), ring.getStats());
ring.close(); // stops the balancer timer
```

**Route package logs into your logger (or silence them in tests):**

```ts
import { setLogger } from "@swifty.js/cache";

setLogger({
  info: (m) => appLogger.debug(m),
  warn: (m) => appLogger.warn(m),
  error: (m) => appLogger.error(m),
});
```

## Cross-reference to the Go sibling

| Concept                  | TypeScript (`@swifty.js/cache`)                                            | Go (`github.com/hangtiancheng/swifty.go/swifty_cache`)              |
| ------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Group factory            | `newGroup(name, cacheBytes, getter, ...opts)`                              | `NewGroup(name, cacheBytes, getter, opts...)`                       |
| Loader signature         | `(AbortSignal, string) => Promise<Buffer>`                                 | `func(ctx context.Context, key string) ([]byte, error)`             |
| Cancellation             | `AbortSignal`                                                              | `context.Context`                                                   |
| Functional options       | `withExpiration / withPeers / withCacheOptions / withConHashConfig`        | `WithExpiration / WithPeers / WithCacheOptions / WithConHashConfig` |
| Hash default             | `crc32` (IEEE)                                                             | `crc32.ChecksumIEEE`                                                |
| Bucket hash              | `hashBKRD`                                                                 | `HashBKRD`                                                          |
| Sentinel errors          | `Error("key is required")`, `... value is required`, `... group is closed` | `ErrKeyRequired`, `ErrValueRequired`, `ErrGroupClosed`              |
| Peer header              | `x-peer-request: "true"`                                                   | `x-peer-request: "true"`                                            |
| Client deadline          | 3 000 ms default, configurable via `ClientOptions.deadlineMs`              | 3 s                                                                 |
| Service-discovery prefix | `/services/{svcName}/{addr}`                                               | `/services/{svcName}/{addr}`                                        |

Symbol parity makes ports trivial; behavioral parity makes a polyglot deployment safe. When the user describes a behavior change, ask whether they want both packages updated in lock-step—drift between them defeats the design intent.
