import type { CacheEntry, CacheKey } from "../types/index.js";

export class LruCache {
  private readonly store: Map<CacheKey, CacheEntry>;
  private readonly versionIndex: Map<string, Set<CacheKey>>;
  private readonly maxSize: number;
  private currentSize: number;

  constructor(maxSize: number) {
    this.store = new Map();
    this.versionIndex = new Map();
    this.maxSize = maxSize;
    this.currentSize = 0;
  }

  get(key: CacheKey): CacheEntry | undefined {
    const entry = this.store.get(key);
    if (entry === undefined) return undefined;
    this.store.delete(key);
    this.store.set(key, entry);
    return entry;
  }

  set(key: CacheKey, entry: CacheEntry): void {
    if (entry.size > this.maxSize) return;

    const existing = this.store.get(key);
    if (existing !== undefined) {
      this.currentSize -= existing.size;
      this.store.delete(key);
    }

    while (this.currentSize + entry.size > this.maxSize && this.store.size > 0) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) {
        this.evictKey(oldestKey);
      }
    }

    this.store.set(key, entry);
    this.currentSize += entry.size;

    const vk = this.versionKey(key);
    let keys = this.versionIndex.get(vk);
    if (keys === undefined) {
      keys = new Set();
      this.versionIndex.set(vk, keys);
    }
    keys.add(key);
  }

  has(key: CacheKey): boolean {
    return this.store.has(key);
  }

  delete(key: CacheKey): boolean {
    const entry = this.store.get(key);
    if (entry === undefined) return false;
    this.currentSize -= entry.size;
    this.store.delete(key);

    const vk = this.versionKey(key);
    const keys = this.versionIndex.get(vk);
    if (keys !== undefined) {
      keys.delete(key);
      if (keys.size === 0) this.versionIndex.delete(vk);
    }
    return true;
  }

  deleteByPrefix(prefix: string): number {
    let deleted = 0;

    if (prefix.endsWith(":")) {
      const keys = this.versionIndex.get(prefix);
      if (keys === undefined) return 0;
      for (const key of keys) {
        const entry = this.store.get(key);
        if (entry !== undefined) this.currentSize -= entry.size;
        this.store.delete(key);
        deleted++;
      }
      this.versionIndex.delete(prefix);
    } else {
      for (const [vk, keys] of this.versionIndex) {
        if (vk.startsWith(prefix)) {
          for (const key of keys) {
            const entry = this.store.get(key);
            if (entry !== undefined) this.currentSize -= entry.size;
            this.store.delete(key);
            deleted++;
          }
          this.versionIndex.delete(vk);
        }
      }
    }

    return deleted;
  }

  clear(): void {
    this.store.clear();
    this.versionIndex.clear();
    this.currentSize = 0;
  }

  get size(): number {
    return this.currentSize;
  }

  get count(): number {
    return this.store.size;
  }

  private versionKey(key: CacheKey): string {
    const colonIdx = key.indexOf(":");
    return colonIdx === -1 ? key : key.slice(0, colonIdx + 1);
  }

  private evictKey(key: CacheKey): void {
    const entry = this.store.get(key);
    if (entry !== undefined) this.currentSize -= entry.size;
    this.store.delete(key);

    const vk = this.versionKey(key);
    const keys = this.versionIndex.get(vk);
    if (keys !== undefined) {
      keys.delete(key);
      if (keys.size === 0) this.versionIndex.delete(vk);
    }
  }
}
