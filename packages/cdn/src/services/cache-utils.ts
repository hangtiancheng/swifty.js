import { ByteView } from "@swifty.js/cache";
import type { CacheEntry } from "../types/index.js";

export class PrefixIndex {
  private readonly index = new Map<string, Set<string>>();

  add(key: string): void {
    const pfx = this.extractPrefix(key);
    let keys = this.index.get(pfx);
    if (keys === undefined) {
      keys = new Set();
      this.index.set(pfx, keys);
    }
    keys.add(key);
  }

  remove(key: string): void {
    const pfx = this.extractPrefix(key);
    const keys = this.index.get(pfx);
    if (keys !== undefined) {
      keys.delete(key);
      if (keys.size === 0) this.index.delete(pfx);
    }
  }

  getKeysWithPrefix(prefix: string): string[] {
    const result: string[] = [];
    if (prefix.endsWith(":") || prefix.endsWith("@")) {
      const keys = this.index.get(prefix);
      if (keys !== undefined) {
        for (const key of keys) result.push(key);
      }
    } else {
      for (const [vk, keys] of this.index) {
        if (vk.startsWith(prefix)) {
          for (const key of keys) result.push(key);
        }
      }
    }
    return result;
  }

  deletePrefix(prefix: string): number {
    let deleted = 0;
    if (prefix.endsWith(":") || prefix.endsWith("@")) {
      const keys = this.index.get(prefix);
      if (keys === undefined) return 0;
      deleted = keys.size;
      this.index.delete(prefix);
    } else {
      for (const [vk, keys] of this.index) {
        if (vk.startsWith(prefix)) {
          deleted += keys.size;
          this.index.delete(vk);
        }
      }
    }
    return deleted;
  }

  clear(): void {
    this.index.clear();
  }

  private extractPrefix(key: string): string {
    const colonIdx = key.indexOf(":");
    return colonIdx === -1 ? key : key.slice(0, colonIdx + 1);
  }
}

export function serializeCacheEntry(entry: CacheEntry): Buffer {
  const meta = JSON.stringify({
    ct: entry.contentType,
    cc: entry.cacheControl,
    et: entry.etag,
    at: entry.cachedAt,
  });
  const metaBuf = Buffer.from(meta, "utf8");
  const buf = Buffer.allocUnsafe(4 + metaBuf.length + entry.content.length);
  buf.writeUInt32LE(metaBuf.length, 0);
  metaBuf.copy(buf, 4);
  entry.content.copy(buf, 4 + metaBuf.length);
  return buf;
}

export function deserializeCacheEntry(view: ByteView): CacheEntry {
  const buf = view.byteSlice();
  const metaLen = buf.readUInt32LE(0);
  const meta = JSON.parse(buf.subarray(4, 4 + metaLen).toString("utf8"));
  const content = buf.subarray(4 + metaLen);
  return {
    content,
    contentType: meta.ct,
    cacheControl: meta.cc,
    etag: meta.et,
    cachedAt: meta.at,
    size: content.length,
  };
}
