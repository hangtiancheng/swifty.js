import { ByteView, cloneBytes } from "./byte-view.js";
import { Cache, CacheOptions, defaultCacheOptions } from "./cache.js";
import { Peer, PeerPicker } from "./peers.js";
import { SingleFlightGroup } from "./single-flight.js";

export type Getter = (ctx: AbortSignal, key: string) => Promise<Buffer>;

export interface GroupOption {
  (g: Group): void;
}

export function withExpiration(ms: number): GroupOption {
  return (g: Group) => {
    g._setExpiration(ms);
  };
}

export function withPeers(peers: PeerPicker): GroupOption {
  return (g: Group) => {
    g._setPeers(peers);
  };
}

export function withCacheOptions(opts: CacheOptions): GroupOption {
  return (g: Group) => {
    g._setCacheOptions(opts);
  };
}

const ErrKeyRequired = new Error("key is required");
const ErrValueRequired = new Error("value is required");
const ErrGroupClosed = new Error("cache group is closed");

interface GroupStats {
  loads: number;
  localHits: number;
  localMisses: number;
  peerHits: number;
  peerMisses: number;
  loaderHits: number;
  loaderErrors: number;
  loadDuration: number;
}

const groups: Map<string, Group> = new Map();

export class Group {
  private name: string;
  private getter: Getter;
  private mainCache: Cache;
  private peers: PeerPicker | null = null;
  private loader: SingleFlightGroup;
  private expiration = 0;
  private closed = false;
  private stats: GroupStats = {
    loads: 0,
    localHits: 0,
    localMisses: 0,
    peerHits: 0,
    peerMisses: 0,
    loaderHits: 0,
    loaderErrors: 0,
    loadDuration: 0,
  };

  constructor(
    name: string,
    cacheBytes: number,
    getter: Getter,
    ...opts: GroupOption[]
  ) {
    if (!getter) throw new Error("nil Getter");

    this.name = name;
    this.getter = getter;

    const cacheOpts = defaultCacheOptions();
    cacheOpts.maxBytes = cacheBytes;
    this.mainCache = new Cache(cacheOpts);
    this.loader = new SingleFlightGroup();

    for (const opt of opts) {
      opt(this);
    }
  }

  async get(ctx: AbortSignal, key: string): Promise<ByteView> {
    if (this.closed) throw ErrGroupClosed;
    if (!key) throw ErrKeyRequired;

    const [view, ok] = this.mainCache.get(key);
    if (ok && view) {
      this.stats.localHits++;
      return view;
    }

    this.stats.localMisses++;
    return this.load(ctx, key);
  }

  async set(
    ctx: AbortSignal,
    key: string,
    value: Buffer,
    isPeerRequest = false,
  ): Promise<void> {
    if (this.closed) throw ErrGroupClosed;
    if (!key) throw ErrKeyRequired;
    if (!value || value.length === 0) throw ErrValueRequired;

    const view = new ByteView(cloneBytes(value));
    if (this.expiration > 0) {
      this.mainCache.addWithExpiration(key, view, Date.now() + this.expiration);
    } else {
      this.mainCache.add(key, view);
    }

    if (!isPeerRequest && this.peers) {
      this.syncToPeers("set", key, value);
    }
  }

  async delete(
    ctx: AbortSignal,
    key: string,
    isPeerRequest = false,
  ): Promise<void> {
    if (this.closed) throw ErrGroupClosed;
    if (!key) throw ErrKeyRequired;

    this.mainCache.delete(key);

    if (!isPeerRequest && this.peers) {
      this.syncToPeers("delete", key, null);
    }
  }

  clear(): void {
    if (this.closed) return;
    this.mainCache.clear();
    console.log(`[LarkCache] cleared cache for group [${this.name}]`);
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.mainCache.close();
    groups.delete(this.name);
    console.log(`[LarkCache] closed cache group [${this.name}]`);
  }

  registerPeers(peers: PeerPicker): void {
    if (this.peers) throw new Error("RegisterPeers called more than once");
    this.peers = peers;
    console.log(`[LarkCache] registered peers for group [${this.name}]`);
  }

  getStats(): Record<string, unknown> {
    const s: Record<string, unknown> = {
      name: this.name,
      closed: this.closed,
      expiration: this.expiration,
      loads: this.stats.loads,
      local_hits: this.stats.localHits,
      local_misses: this.stats.localMisses,
      peer_hits: this.stats.peerHits,
      peer_misses: this.stats.peerMisses,
      loader_hits: this.stats.loaderHits,
      loader_errors: this.stats.loaderErrors,
    };

    const totalGets = this.stats.localHits + this.stats.localMisses;
    if (totalGets > 0) {
      s["hit_rate"] = this.stats.localHits / totalGets;
    }

    const totalLoads = this.stats.loads;
    if (totalLoads > 0) {
      s["avg_load_time_ms"] = this.stats.loadDuration / totalLoads;
    }

    const cacheStats = this.mainCache.stats();
    for (const [k, v] of Object.entries(cacheStats)) {
      s[`cache_${k}`] = v;
    }

    return s;
  }

  getName(): string {
    return this.name;
  }

  _setExpiration(ms: number): void {
    this.expiration = ms;
  }

  _setPeers(peers: PeerPicker): void {
    this.peers = peers;
  }

  _setCacheOptions(opts: CacheOptions): void {
    this.mainCache = new Cache(opts);
  }

  private async load(ctx: AbortSignal, key: string): Promise<ByteView> {
    const startTime = Date.now();

    const view = await this.loader.do(key, async () => {
      return this.loadData(ctx, key);
    });

    const loadDuration = Date.now() - startTime;
    this.stats.loadDuration += loadDuration;
    this.stats.loads++;

    if (this.expiration > 0) {
      this.mainCache.addWithExpiration(key, view, Date.now() + this.expiration);
    } else {
      this.mainCache.add(key, view);
    }

    return view;
  }

  private async loadData(ctx: AbortSignal, key: string): Promise<ByteView> {
    if (this.peers) {
      const [peer, ok, isSelf] = this.peers.pickPeer(key);
      if (ok && !isSelf && peer) {
        try {
          const value = await this.getFromPeer(peer, key);
          this.stats.peerHits++;
          return value;
        } catch (err) {
          this.stats.peerMisses++;
          console.log(`[LarkCache] failed to get from peer: ${err}`);
        }
      }
    }

    try {
      const bytes = await this.getter(ctx, key);
      this.stats.loaderHits++;
      return new ByteView(cloneBytes(bytes));
    } catch (err) {
      this.stats.loaderErrors++;
      throw new Error(`failed to get data: ${err}`);
    }
  }

  private async getFromPeer(peer: Peer, key: string): Promise<ByteView> {
    const bytes = await peer.get(this.name, key);
    return new ByteView(cloneBytes(bytes));
  }

  private syncToPeers(op: string, key: string, value: Buffer | null): void {
    if (!this.peers) return;
    const [peer, ok, isSelf] = this.peers.pickPeer(key);
    if (!ok || isSelf || !peer) return;

    (async () => {
      try {
        switch (op) {
          case "set":
            await peer.set(this.name, key, value!);
            break;
          case "delete":
            await peer.delete(this.name, key);
            break;
        }
      } catch (err) {
        console.log(`[LarkCache] failed to sync ${op} to peer: ${err}`);
      }
    })();
  }
}

export function newGroup(
  name: string,
  cacheBytes: number,
  getter: Getter,
  ...opts: GroupOption[]
): Group {
  if (!getter) throw new Error("nil Getter");

  const g = new Group(name, cacheBytes, getter, ...opts);

  if (groups.has(name)) {
    console.log(
      `[LarkCache] Group with name ${name} already exists; replacing it`,
    );
  }

  groups.set(name, g);
  console.log(
    `[LarkCache] Created cache group [${name}] with cacheBytes=${cacheBytes}`,
  );
  return g;
}

export function getGroup(name: string): Group | undefined {
  return groups.get(name);
}

export function listGroups(): string[] {
  return Array.from(groups.keys());
}

export function destroyGroup(name: string): boolean {
  const g = groups.get(name);
  if (!g) return false;
  groups.delete(name);
  g.close();
  console.log(`[LarkCache] destroyed cache group [${name}]`);
  return true;
}

export function destroyAllGroups(): void {
  const toClose = Array.from(groups.values());
  groups.clear();
  for (const g of toClose) {
    g.close();
    console.log(`[LarkCache] destroyed cache group [${g.getName()}]`);
  }
}
