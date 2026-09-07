<div align="center">

<img src="public/swifty.svg" alt="Swifty.js" width="120" />

# Swifty.js

**A monorepo of focused, dependency-light JavaScript & TypeScript utilities.**

[![npm](https://img.shields.io/npm/v/@swifty.js/cache?label=%40swifty.js%2Fcache&color=F05138)](https://www.npmjs.com/package/@swifty.js/cache)
[![npm](https://img.shields.io/npm/v/@swifty.js/anti-copy?label=%40swifty.js%2Fanti-copy&color=F05138)](https://www.npmjs.com/package/@swifty.js/anti-copy)
[![License: MIT](https://img.shields.io/badge/License-MIT-F05138.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-3C873A.svg)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220.svg)](https://pnpm.io)

</div>

---

Swifty.js is a pnpm workspace hosting a family of small, single-purpose packages published under the [`@swifty.js`](https://www.npmjs.com/search?q=%40swifty.js) scope. Each package does one thing well — distributed caching, copy protection, probabilistic data structures, React hooks, and more — with minimal runtime dependencies and full TypeScript typings.

Some packages also ship **agent skills** (`.agents/skills/`), machine-readable references that let AI coding assistants work with the package's source, API, and conventions directly.

## Packages

| Package                                                      | Description                                                                                                                                                                                                                    | Runtime              |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| [`@swifty.js/cache`](./packages/cache)                       | Distributed read-through cache — a TypeScript port of [groupcache](https://github.com/golang/groupcache) with gRPC peer fan-out, etcd discovery, consistent hashing, single-flight deduplication, and a sharded two-level LRU. | Node.js ≥ 20 · ESM   |
| [`@swifty.js/anti-copy`](./packages/anti-copy)               | Framework-agnostic copy-protection SDK for browsers — clipboard interception, shortcut blocking, print hiding, DevTools detection & countermeasures, region exemptions. Integrations for React, Vue, and VitePress.            | Browser              |
| [`@swifty.js/bloom-filter`](./packages/bloom-filter)         | Standard Bloom filter with xxHash32 — configurable bit-array size, hash count, seed, and false-positive rate.                                                                                                                  | Node.js · ESM        |
| [`@swifty.js/distributed-lock`](./packages/distributed-lock) | Redis-based distributed lock with Lua-scripted atomic acquire/release and owner verification.                                                                                                                                  | Node.js · ESM        |
| [`@swifty.js/hooks`](./packages/hooks)                       | React hooks — `useCreation`, `useLatest`, `useMemoizedFn`, `useRequest`, `useUpdate`, `useUrlState`.                                                                                                                           | Browser · React ≥ 18 |
| [`@swifty.js/mini-zustand`](./packages/mini-zustand)         | Minimal Zustand-like external store built on `useSyncExternalStore`.                                                                                                                                                           | Browser · React ≥ 18 |
| [`@swifty.js/mini-mitt`](./packages/mini-mitt)               | Tiny event emitter — `on` / `off` / `emit` over a `Map<string, Set<callback>>`.                                                                                                                                                | Universal            |
| [`@swifty.js/promises-a-plus`](./packages/promises-a-plus)   | Promises/A+ spec implementation, validated against the official `promises-aplus-tests` suite.                                                                                                                                  | Node.js ≥ 22         |
| [`wanproxy-js`](./packages/wanproxy.js)                      | TypeScript migration of WANProxy's TCP path — XCodec framing, zlib composition, SOCKS proxying, JSON monitor endpoint, persistent cache.                                                                                       | Node.js ≥ 20         |

## Agent Skills

Two packages ship skills for AI coding assistants:

| Skill                                                   | Package                                                                                                      |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| [`swifty-cache`](./.agents/skills/swifty-cache)         | `@swifty.js/cache` — architecture, public API surface, read/write paths, consistency model, etcd key layout. |
| [`swifty-anti-copy`](./.agents/skills/swifty-anti-copy) | `@swifty.js/anti-copy` — feature dimensions, options schema, integration patterns, violation types.          |

Add skills to your agent environment:

```bash
npx skills add github.com/hangtiancheng/swifty.js
```

## Getting Started

```bash
pnpm install
```

Build and test any package from its directory:

```bash
pnpm --filter @swifty.js/cache build
pnpm --filter @swifty.js/cache test
```

Or run a package's demo directly:

```bash
pnpm --filter @swifty.js/cache dev
```

Each package is self-contained — build with its own toolchain (Rollup, tsc, or tsup), test with Vitest, and publish independently under the `@swifty.js` scope.

## Repository Layout

```
swifty.js/
├── packages/
│   ├── anti-copy/          # Browser copy-protection SDK
│   ├── bloom-filter/       # Bloom filter (xxHash32)
│   ├── cache/              # Distributed cache (groupcache port)
│   ├── distributed-lock/   # Redis distributed lock
│   ├── hooks/              # React hooks
│   ├── mini-mitt/          # Event emitter
│   ├── mini-zustand/       # Zustand-like store
│   ├── promises-a-plus/    # Promises/A+ implementation
│   └── wanproxy.js/        # WANProxy TCP migration
├── .agents/skills/         # Agent skill definitions
├── public/                 # Logo assets
└── pnpm-workspace.yaml
```

## License

[MIT](./LICENSE) © [hangtiancheng](https://github.com/hangtiancheng)
