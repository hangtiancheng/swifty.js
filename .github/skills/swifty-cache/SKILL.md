---
name: cache
description: Authoritative reference for the @swifty.js/cache distributed in-memory cache package located at packages/cache (TypeScript/Node.js, ESM, published as `@swifty.js/cache`). Use this skill whenever the user reads, writes, debugs, reviews, or extends code that imports from `@swifty.js/cache`, references the `packages/cache` source tree, or invokes its CLI/demo (`packages/cache/src/main.ts`, `packages/cache/bootstrap.js`). Trigger eagerly on any of these symbols and concepts—`Group`, `newGroup`, `getGroup`, `listGroups`, `destroyGroup`, `destroyAllGroups`, `Getter`, `GroupOption`, `withExpiration`, `withPeers`, `withCacheOptions`, `Cache`, `CacheOptions`, `defaultCacheOptions`, `Store`, `StoreOptions`, `LruStore`, `defaultStoreOptions`, `ByteView`, `cloneBytes`, `Value`, `SingleFlightGroup`, `ConHashMap`, `ConHashConfig`, `ConHashOption`, `withConHashConfig`, `defaultConHashConfig`, `crc32`, `HashFunc`, `hashBKRD`, `maskOfNextPowOf2`, `Peer`, `PeerPicker`, `Client`, `ClientPicker`, `PickerOption`, `Server`, `ServerOptions`, `register`, `RegisterConfig`, `defaultRegisterConfig`, `ServiceDiscovery`, `validPeerAddr`, `getLocalIP`, the `pb.SwiftyCache` gRPC service (Get/Set/Delete RPCs), and the `x-peer-request` metadata flag. Also trigger on conceptual phrases like "groupcache for Node", "TypeScript distributed cache with consistent hashing", "single-flight cache stampede", "etcd-based peer discovery", "two-level LRU cache", "peer fan-out write propagation", and on file paths under `packages/cache/src/**`. Do NOT use this skill for the Go sibling `github.com/hangtiancheng/swifty-go/swifty_cache`—route those tasks to the `cache` Go skill instead. The two share architecture but diverge on naming (PascalCase Go vs. camelCase TS), concurrency primitives (`context.Context`/goroutine vs. `AbortSignal`/`async`), and packaging.
---

# @swifty.js/cache — Distributed Cache for Node.js

`@swifty.js/cache` is a TypeScript port of the groupcache architecture popularized by Brad Fitzpatrick, redesigned for the Node.js runtime and shipped from `packages/cache` as ESM (`"type": "module"`, Node ≥ 20). It provides a coherent set of building blocks—`Group`, `Cache`, `LruStore`, `ConHashMap`, `SingleFlightGroup`, `ClientPicker`, `Server`, etcd-based registration—that together yield a peer-to-peer, eventually consistent, sharded read-through cache reachable over gRPC. This skill is the canonical playbook: consult it before designing topologies, wiring callers, debugging timeouts, or evolving the public surface.

The package is intentionally aligned with the Go sibling at `swifty-go/swifty_cache`. APIs, semantics, and wire format match symbol-for-symbol; only naming conventions and language-idiomatic concurrency diverge. When the user mentions concepts that exist on both sides, confirm whether they mean the TypeScript package (`@swifty.js/cache`, this skill) or the Go module (the `cache` Go skill).

## When to consult this skill (and when to skip)

Trigger this skill whenever you encounter:

- imports from `@swifty.js/cache` or relative imports inside `packages/cache/src/**`;
- discussion of the demo entry `packages/cache/src/main.ts` or the integration runner `packages/cache/bootstrap.js`;
- any of the symbols listed in the YAML `description`;
- requests to add new RPC handlers, swap in a different store, change consistent-hash replicas, tune deadlines, integrate TLS, change etcd endpoints, or re-export new public types;
- bug reports about cache miss storms, cross-node propagation gaps, `DEADLINE_EXCEEDED` from `pb.SwiftyCache.Get/Set/Delete`, port collisions, or stale peers in the consistent-hash ring.

Do **not** trigger for: the Go module under `swifty-go/swifty_cache` (route to its dedicated skill); generic `node-cache`, `lru-cache`, `keyv`, `cache-manager`, or Redis client questions; gRPC tutorials unrelated to this package; or unrelated browser-side caches.

## Mental model

Reads are **read-through**: a miss at the local LRU is funnelled through `SingleFlightGroup` to deduplicate concurrent loads; the loader either hops to the consistent-hash–elected peer over gRPC or invokes the user-supplied `Getter` to consult the origin. Writes (`set`/`delete`) update the local cache **and** asynchronously fan out to the elected peer with the `x-peer-request` metadata so the receiver does not echo the propagation back. There is no quorum and no anti-entropy—convergence is best-effort eventual consistency, the same as the Go sibling.

## Public API surface

All exports come through `packages/cache/src/index.ts`. Treat that file as the contract: anything not re-exported is internal and must not be relied on by callers.

### Group orchestration (`group.ts`)

- `type Getter = (ctx: AbortSignal, key: string) => Promise<Buffer>` — origin loader. Receives the `AbortSignal` from the originating call (or the server lifecycle signal when invoked through gRPC).
- `interface GroupOption { (g: Group): void }` — functional-options pattern matching the Go side.
- `withExpiration(ms: number): GroupOption` — set per-entry TTL in milliseconds; `0` (default) means no expiration.
- `withPeers(peers: PeerPicker): GroupOption` — wire a `PeerPicker` (typically `ClientPicker`) so the group can discover and forward to remote owners.
- `withCacheOptions(opts: CacheOptions): GroupOption` — replace the default `Cache` with a custom-sized one.
- `class Group` (registered globally by name)
  - `constructor(name, cacheBytes, getter, ...opts)` — also registers in the package-level `Map<string, Group>`. Re-registration logs a warning and replaces the existing entry.
  - `get(ctx: AbortSignal, key: string): Promise<ByteView>` — read-through with single-flight; throws `ErrGroupClosed` / `ErrKeyRequired` on misuse.
  - `set(ctx: AbortSignal, key: string, value: Buffer, isPeerRequest = false): Promise<void>` — local write plus best-effort peer fan-out when `isPeerRequest` is `false`.
  - `delete(ctx: AbortSignal, key: string, isPeerRequest = false): Promise<void>` — symmetric to `set`.
  - `clear()` — wipe local entries; does not propagate.
  - `close()` — idempotently dispose; remove from registry.
  - `registerPeers(peers)` — late-binding alternative to `withPeers`. Throws if called twice.
  - `getStats()` — returns counters: `loads`, `local_hits`, `local_misses`, `peer_hits`, `peer_misses`, `loader_hits`, `loader_errors`, derived `hit_rate`, `avg_load_time_ms`, plus inner `cache_*` stats.
  - `getName()`.
- `newGroup(name, cacheBytes, getter, ...opts): Group` — preferred factory; identical to `new Group(...)` but logs creation and registers.
- `getGroup(name): Group | undefined`, `listGroups(): string[]`, `destroyGroup(name): boolean`, `destroyAllGroups(): void`.

Sentinel errors thrown internally (not exported): `ErrKeyRequired`, `ErrValueRequired`, `ErrGroupClosed`. Users should catch `Error` and inspect `err.message` for substrings (`"key is required"`, `"value is required"`, `"cache group is closed"`).

### Cache and storage (`cache.ts`, `store.ts`, `lru.ts`)

- `interface Value { len(): number }` — minimal sized-value contract. `ByteView` is the canonical implementation.
- `interface Store` — `get`, `set`, `setWithExpiration`, `delete`, `clear`, `len`, `close`. Pluggable but only `LruStore` is shipped.
- `interface StoreOptions { maxBytes?, bucketCount?, capPerBucket?, level2Cap?, cleanupInterval?, onEvicted? }`. `defaultStoreOptions()` returns `{ maxBytes: 8192, bucketCount: 16, capPerBucket: 512, level2Cap: 256, cleanupInterval: 60_000 }`.
- `class Cache` — facade owned by `Group`. Lazily instantiates an `LruStore` on first `add`. Tracks `hits`/`misses`. `addWithExpiration(key, view, expirationTime)` accepts an absolute deadline (ms epoch); already-expired writes are dropped.
- `class LruStore` — sharded two-level LRU. `bucketCount` is rounded to the next power of two via `maskOfNextPowOf2`; each shard holds two `InternalCache` instances (capacity `capPerBucket` and `level2Cap`). Promotion: a get on level 1 moves the entry into level 2, providing scan-resistance and approximating an S3-FIFO/2Q-style design. Per-entry expiry is enforced lazily on `get` and proactively by an internal `setInterval(cleanupInterval)`. Always call `close()` to clear the timer.
- `hashBKRD(s)` — fast non-cryptographic 32-bit hash used to pick the shard. **Do not** use it for the consistent-hash ring (that's CRC32 by default).
- `maskOfNextPowOf2(cap)` — utility for power-of-two masks.

`CacheOptions` mirrors `StoreOptions` plus an alias of `cleanupTime` for `cleanupInterval`. `defaultCacheOptions()` returns the production-ready defaults: `maxBytes: 8 MiB`, 16 buckets, 512 + 256 capacity per bucket, 60 s cleanup.

### Immutable byte container (`byte-view.ts`)

- `class ByteView` wraps a `Buffer`. `len()` returns size; `byteSlice()` returns a **defensive copy** so mutations cannot leak back into the cache; `toString()` decodes UTF-8.
- `cloneBytes(b)` is the always-copy helper used internally before any value enters a cache or crosses the public boundary. Treat all cached values as immutable.

### Coalescing concurrent loads (`single-flight.ts`)

- `class SingleFlightGroup` provides `do<T>(key, fn): Promise<T>`. Concurrent calls with the same key share a single in-flight `Promise`; the entry is removed from the internal map in `finally`, so subsequent identical keys re-execute. This is what protects the origin from a thundering-herd cache miss.

### Consistent hashing (`consistent-hash.ts`, `config.ts`, `crc32.ts`)

- `class ConHashMap` — sorted virtual-node ring keyed by 32-bit hashes. Supports `add(...nodes)`, `remove(node)`, `get(key)`, `getStats()`, `close()`.
- `withConHashConfig(config): ConHashOption` — override the entire configuration when constructing.
- `interface ConHashConfig { defaultReplicas, minReplicas, maxReplicas, hashFunc, loadBalanceThreshold }`. `defaultConHashConfig` is `{ defaultReplicas: 50, minReplicas: 10, maxReplicas: 200, hashFunc: crc32, loadBalanceThreshold: 0.25 }`.
- **Adaptive rebalancing**: every second the ring inspects accumulated request counts; once `totalRequests ≥ 1000` and the worst node deviates from the average by more than `loadBalanceThreshold` (default 25 %), it scales each node's replica count by `currentReplicas / loadRatio` (overloaded) or `currentReplicas * (2 - loadRatio)` (underloaded), clamped to `[minReplicas, maxReplicas]`. Counters reset and the ring is re-sorted. **Always invoke `close()`** to stop the interval timer when disposing.
- `crc32(data: string | Buffer): number` — IEEE polynomial CRC-32 (table-driven, lazily initialized at module load). Type alias `HashFunc = (data: string | Buffer) => number`.

### Peer abstractions (`peers.ts`, `client.ts`, `client-picker.ts`)

- `interface Peer` — `get`, `set`, `delete`, `close`, all returning `Promise`s; shape mirrors the gRPC service.
- `interface PeerPicker` — `pickPeer(key): [Peer | null, found, isSelf]`, `close()`. Implementing your own picker (e.g. for static topologies) is supported.
- `class Client implements Peer` — gRPC stub. Hard-coded **3 000 ms deadline** per RPC and `waitForReady: true`. Errors surface as `Error("failed to {get|set|delete} value from swifty_cache: ${grpcMessage}")`. `getAddr()` returns the stored address.
- `class ClientPicker implements PeerPicker`
  - Configured with `(addr, opts?: { serviceName?: string })`; default service name is `"swifty_cache"`.
  - `start()` performs an initial `fetchAll` from etcd, registers existing peers (excluding `self`), then subscribes to live `put`/`delete` events. Self-address is filtered out so a node never forwards to itself.
  - `pickPeer(key)` resolves via `ConHashMap` and returns `[null, true, true]` for self-ownership, `[client, true, false]` for a known peer, or `[null, false, false]` when the address is unknown locally.
  - `printPeers()` is a debugging helper.
  - `close()` releases the ring timer, every `Client`, and the etcd watcher.

### Server and registration (`server.ts`, `register.ts`)

- `interface ServerOptions { etcdEndpoints?, dialTimeout?, maxMsgSize?, tls?, certFile?, keyFile? }`. Defaults: etcd at `localhost:2379`, 5 s dial timeout, 4 MiB max message size, TLS off.
- `class Server`
  - Constructor `(addr, svcName, opts?)` builds the gRPC server, registers `pb.SwiftyCache` (Get/Set/Delete) and the `grpc.health.v1.Health` Check RPC (always reports `SERVING` for the configured `svcName`), and resolves credentials (insecure or `ServerCredentials.createSsl`).
  - `start()` calls `bindAsync` then registers in etcd via `register(svcName, addr, signal)` with a 10-second lease. If registration fails the server still serves traffic but logs the failure.
  - `stop()` aborts the AbortController (which revokes the lease and deletes the etcd key) and triggers a graceful gRPC shutdown.
  - The handlers look up the target `Group` by name; missing groups produce `grpc.status.NOT_FOUND`. Get/Set/Delete inspect the inbound `x-peer-request` metadata to decide whether to suppress further peer fan-out (`isPeerRequest = true` short-circuits the propagation in `Group.set`/`Group.delete`).
- `register(svcName, addr, stopSignal)` — opens an `Etcd3` client against `defaultRegisterConfig.endpoints`, expands a leading `:` to `getLocalIP():port`, attaches a 10-second lease at `/services/{svcName}/{addr}`, and revokes/deletes on `stopSignal.aborted`.
- `class ServiceDiscovery` — the watcher used by `ClientPicker`. `fetchAll()` snapshots `/services/{svcName}`; `watch()` streams `put`/`delete` deltas. Always `close()` to release the watcher and the etcd client.
- `interface RegisterConfig` and `defaultRegisterConfig` are exported, so callers can hold a single source of truth for endpoints when wiring custom registries.

### Helpers (`utils.ts`)

- `validPeerAddr(addr)` — accepts `localhost:<port>` or `<dotted-quad>:<port>`. Useful when sanitizing configuration before feeding a picker.
- `getLocalIP()` — first non-internal IPv4 address; throws if none exists.

## Lifecycle and orchestration

A typical node has the following lifecycle. Honour the order—starting the picker before the server is fine, but never `registerPeers` before `picker.start()` has resolved, otherwise the ring is empty and `pickPeer` always returns self.

1. Create the singleton `Group` with `newGroup(name, cacheBytes, getter, ...opts)`.
2. Construct and start the `Server`: `await new Server(addr, svcName).start()`. This binds the gRPC port and registers in etcd.
3. Construct and start the `ClientPicker`: `const picker = new ClientPicker(addr, { serviceName: svcName }); await picker.start();` — populates the consistent-hash ring with existing peers and subscribes to mutations.
4. Wire the two: `group.registerPeers(picker)` (or supply `withPeers(picker)` when calling `newGroup`).
5. Serve normal traffic via `group.get/set/delete` (or via the gRPC service `pb.SwiftyCache`).
6. Shutdown: `server.stop()` revokes the etcd lease and stops the server; `picker.close()` cancels the watcher and disposes peer clients; `destroyAllGroups()` closes every cache and timer. Each step is independently idempotent.

The reference assembly lives in `packages/cache/src/main.ts`; the integration runner `packages/cache/bootstrap.js` boots three local nodes (8001/8002/8003) with a brewed `etcd`, performs a smoke test, and tears everything down. It also illustrates the **set-then-get** pattern that sidesteps the 3 s peer deadline in cold-cache scenarios: pre-populating a key on the owning node guarantees a local hit on the read.

## Wire format and gRPC contract

The proto definitions are bundled and re-exported via `proto/index.ts` (`proto`, `healthProto`).

```proto
// packages/cache/src/proto/swifty.proto
syntax = "proto3";
package pb;

message Request           { string group = 1; string key = 2; bytes value = 3; }
message ResponseForGet    { bytes value = 1; }
message ResponseForDelete { bool  value = 1; }

service SwiftyCache {
  rpc Get   (Request) returns (ResponseForGet);
  rpc Set   (Request) returns (ResponseForGet);
  rpc Delete(Request) returns (ResponseForDelete);
}
```

Health checks follow the standard `grpc.health.v1.Health/Check` contract; the registered service name matches the constructor's `svcName` so a discovery layer can probe per service.

The metadata key `x-peer-request: "true"` is the **propagation guard**. When `Group.set`/`Group.delete` forwards to a peer, it sets this header (well, the receiving side reads it through `isPeerRequest` in `server.ts`); the receiver therefore writes only locally and refrains from re-forwarding. When you author additional RPCs that mutate state across peers, follow the same convention to avoid storms.

## Operational guidance

**Topology sizing.** `cacheBytes` in `newGroup` only sets `Cache.maxBytes`; the actual storage uses `bucketCount × (capPerBucket + level2Cap)` slots. Tune via `withCacheOptions(defaultCacheOptions())` overrides when entry counts—not byte budgets—are the binding constraint. Power-of-two bucket counts are enforced by `maskOfNextPowOf2`, so `bucketCount: 24` quietly becomes 32 internally (mask `0x1f`).

**Hot-key fairness.** The adaptive replica adjustment in `ConHashMap` runs every second once the ring has seen ≥ 1 000 routed keys. If you observe one node serving disproportionately, prefer raising `defaultReplicas` (e.g. 100) rather than lowering `loadBalanceThreshold`, because lower thresholds amplify oscillation. Drop `maxReplicas` if you observe runaway memory in `keys`/`hashMap`.

**Deadlines and cold reads.** Every `Client` RPC carries a 3-second deadline. In a cold cluster a `get` may traverse `Group.load → ClientPicker.pickPeer → Client.get → Server.handleGet → Group.get → Getter`; deep pipelines plus origin latency can exceed the budget. Mitigations: (1) pre-warm hot keys by calling `set` on the owner first; (2) accept the time-out and rely on `SingleFlightGroup` to coalesce retries; (3) fork `client.ts` and parameterize the deadline if a different SLA is required (currently hard-coded—fixing this is a deliberate, breaking change). The integration runner `bootstrap.js` opts for option (1).

**Error semantics.** Misses on the loader path surface as `Error("failed to get data: ${cause}")` from `Group.loadData`. Propagation failures inside `syncToPeers` are logged but **not** thrown—writes are deliberately fire-and-forget. If you require write acknowledgement, await `Peer.set`/`Peer.delete` directly via `picker.pickPeer`. Exposed sentinels:

- `key is required` — empty string supplied to `get/set/delete`.
- `value is required` — `set` called with an empty `Buffer`.
- `cache group is closed` — operations after `close()` / `destroyGroup`.
- `nil Getter` — `newGroup` invoked without a loader.
- `RegisterPeers called more than once` — defensive double-wiring guard.

**Closing resources.** Memory leaks in this package almost always trace to a forgotten `close`. The active timers/watchers are: `LruStore.cleanupTimer`, `ConHashMap.balancerTimer`, `ServiceDiscovery.watcher`, the etcd lease in `register`, and every `Client.grpcClient`. `Group.close → Cache.close → LruStore.close` is automatic; the picker and server own the rest. In tests, prefer `try/finally` with `picker.close()` and `server.stop()` over relying on process exit.

**Self vs. remote routing.** `ClientPicker.pickPeer` returns the tuple `[peer, found, isSelf]`. The `Group` only forwards when `found && !isSelf`. If `pickPeer` returns `[null, false, false]` the cluster contains zero registered peers (or etcd is unreachable) and the loader falls straight through to `Getter`. This is the intended single-node fallback.

**Network address shape.** Bind addresses passed to `new Server(addr, ...)` should follow `host:port` (`"0.0.0.0:8001"`, `"127.0.0.1:8001"`, or `":8001"`—the latter expands to the local IPv4 in `register`). Peer addresses stored in etcd are byte-for-byte the value the registering node wrote; ensure all nodes agree on the host portion (don't mix `localhost` and `127.0.0.1` if `validPeerAddr` checks are added downstream).

**TLS.** Setting `tls: true, certFile, keyFile` on `ServerOptions` enables mutual-TLS-capable credentials on the server side. The shipped `Client` uses `grpc.credentials.createInsecure()` only—if you need a TLS client, fork or extend `client.ts`. This is a deliberate omission that keeps the bundled demo zero-config.

## Build, test, and release

The package is consumed as ESM (`exports.import`/`module` both point at `dist/index.mjs`). The Rollup config (`rollup.config.mjs`) bundles every `src/*.ts` file plus copies the `.proto` files into `dist/proto/` so the loader at `proto/index.ts` (`join(__dirname, "swifty.proto")`) keeps working post-build. Scripts:

- `pnpm --filter @swifty.js/cache run build` — Rollup bundle + dts.
- `pnpm --filter @swifty.js/cache run test` — Vitest suite (covers `byte-view`, `cache`, `consistent-hash`, `crc32`, `group`, `lru`, `single-flight`, `utils`).
- `pnpm --filter @swifty.js/cache run format` — Prettier.
- `node packages/cache/bootstrap.js` — end-to-end smoke (spawns three nodes and an etcd subprocess; expects `brew etcd` on `PATH`).

When publishing, `prepublishOnly` re-builds from clean. Only `dist/` ships (see `package.json#files`).

## Common pitfalls and how to handle them

- **Importing internals.** `packages/cache/src/index.ts` is the only stable surface. Pull requests that import deep paths (`@swifty.js/cache/dist/lru`) must be redirected through new exports there.
- **Mutating returned `Buffer`s.** `ByteView.byteSlice()` already copies; `Group.get` returns the `ByteView` itself. If you call `byteSlice()` and mutate, that's safe; mutating the cached `ByteView` is not—do not reach into private fields.
- **Forgetting `await picker.start()`.** Without the initial `fetchAll`, the ring is empty and every read falls back to the local `Getter`. Symptom: 100 % `loader_hits`, 0 % `peer_hits`.
- **Etcd reachability.** `register` and `ServiceDiscovery` both default to `localhost:2379` via `defaultRegisterConfig`. To override, construct `Etcd3` directly inside a custom `register` wrapper or extend `register.ts`—the public surface currently exposes the config object but `register()` ignores per-call endpoints. This is a known asymmetry with the Go side; flag it before shipping a multi-cluster deployment.
- **Mixing self addresses.** If `Server` binds `:8001` (which `register` upgrades to `192.168.x.y:8001`) but `ClientPicker` is constructed with `127.0.0.1:8001`, the picker won't recognize self in etcd events and may forward back to itself. Always pass the _exact_ address pair you registered with.
- **Test flakiness from timers.** `LruStore` and `ConHashMap` start `setInterval`s. In Vitest, ensure tests `close()` instances or the worker exits hang. The existing tests demonstrate the pattern.
- **3-second peer deadline.** As covered above, this is currently a constant in `client.ts`. Document it in any user-facing performance budget.

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
console.log(group.getStats()); // hit rate, load times, etc.
```

**Three-node cluster (assembled like `main.ts`):**

```ts
import { newGroup, Server, ClientPicker } from "@swifty.js/cache";

const SVC = "swifty_cache";
const group = newGroup("users", 8 << 20, loader);

const server = new Server("0.0.0.0:8001", SVC);
await server.start();

const picker = new ClientPicker("127.0.0.1:8001", { serviceName: SVC });
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

const client = new Client("127.0.0.1:8001");
await client.set("users", "alice", Buffer.from("…"));
const value = await client.get("users", "alice");
await client.close();
```

**Custom consistent-hash configuration:**

```ts
import { ConHashMap, withConHashConfig, crc32 } from "@swifty.js/cache";

const ring = new ConHashMap(
  withConHashConfig({
    defaultReplicas: 100,
    minReplicas: 50,
    maxReplicas: 400,
    hashFunc: crc32,
    loadBalanceThreshold: 0.15,
  }),
);
ring.add("127.0.0.1:8001", "127.0.0.1:8002", "127.0.0.1:8003");
console.log(ring.get("alice"));
ring.close();
```

## Cross-reference to the Go sibling

| Concept                  | TypeScript (`@swifty.js/cache`)                                              | Go (`github.com/hangtiancheng/swifty-go/swifty_cache`)                  |
| ------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Group factory            | `newGroup(name, cacheBytes, getter, ...opts)`                              | `NewGroup(name, cacheBytes, getter, opts...)`                       |
| Loader signature         | `(AbortSignal, string) => Promise<Buffer>`                                 | `func(ctx context.Context, key string) ([]byte, error)`             |
| Cancellation             | `AbortSignal`                                                              | `context.Context`                                                   |
| Functional options       | `withExpiration / withPeers / withCacheOptions / withConHashConfig`        | `WithExpiration / WithPeers / WithCacheOptions / WithConHashConfig` |
| Hash default             | `crc32` (IEEE)                                                             | `crc32.ChecksumIEEE`                                                |
| Bucket hash              | `hashBKRD`                                                                 | `HashBKRD`                                                          |
| Sentinel errors          | `Error("key is required")`, `... value is required`, `... group is closed` | `ErrKeyRequired`, `ErrValueRequired`, `ErrGroupClosed`              |
| Peer header              | `x-peer-request: "true"`                                                   | `x-peer-request: "true"`                                            |
| Client deadline          | 3 000 ms (hard-coded)                                                      | 3 s (hard-coded)                                                    |
| Service-discovery prefix | `/services/{svcName}/{addr}`                                               | `/services/{svcName}/{addr}`                                        |

Symbol parity makes ports trivial; behavioral parity makes a polyglot deployment safe. When the user describes a behavior change, ask whether they want both packages updated in lock-step—drift between them defeats the design intent.
