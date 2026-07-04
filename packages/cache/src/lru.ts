import { Store, StoreOptions, Value } from "./store.js";

const MAX_EXPIRE_AT = Number.MAX_SAFE_INTEGER;

const P = 0;
const N = 1;

interface Node {
  k: string;
  v: Value;
  expireAt: number;
}

class InternalCache {
  private doubleLink: [number, number][];
  private m: Node[];
  private hashMap: Map<string, number>;
  private last: number;
  private cap: number;

  constructor(cap: number) {
    this.cap = cap;
    this.doubleLink = new Array(cap + 1);
    for (let i = 0; i <= cap; i++) {
      this.doubleLink[i] = [0, 0];
    }
    this.m = new Array(cap);
    for (let i = 0; i < cap; i++) {
      this.m[i] = { k: "", v: null as any, expireAt: 0 };
    }
    this.hashMap = new Map();
    this.last = 0;
  }

  put(
    key: string,
    val: Value,
    expireAt: number,
    onEvicted?: (key: string, value: Value) => void,
  ): number {
    const idx = this.hashMap.get(key);
    if (idx !== undefined) {
      this.m[idx - 1].v = val;
      this.m[idx - 1].expireAt = expireAt;
      this.adjust(idx, P, N);
      return 0;
    }

    if (this.last === this.cap) {
      const tailIdx = this.doubleLink[0][P];
      const tail = this.m[tailIdx - 1];
      if (onEvicted && tail.expireAt > 0) {
        onEvicted(tail.k, tail.v);
      }

      this.hashMap.delete(tail.k);
      this.hashMap.set(key, tailIdx);
      tail.k = key;
      tail.v = val;
      tail.expireAt = expireAt;
      this.adjust(tailIdx, P, N);
      return 1;
    }

    this.last++;
    if (this.hashMap.size <= 0) {
      this.doubleLink[0][P] = this.last;
    } else {
      this.doubleLink[this.doubleLink[0][N]][P] = this.last;
    }

    this.m[this.last - 1].k = key;
    this.m[this.last - 1].v = val;
    this.m[this.last - 1].expireAt = expireAt;
    this.doubleLink[this.last] = [0, this.doubleLink[0][N]];
    this.hashMap.set(key, this.last);
    this.doubleLink[0][N] = this.last;
    return 1;
  }

  get(key: string): [Node | null, number] {
    const idx = this.hashMap.get(key);
    if (idx !== undefined) {
      this.adjust(idx, P, N);
      return [this.m[idx - 1], 1];
    }
    return [null, 0];
  }

  del(key: string): [Node | null, number, number] {
    const idx = this.hashMap.get(key);
    if (idx !== undefined && this.m[idx - 1].expireAt > 0) {
      const e = this.m[idx - 1].expireAt;
      this.m[idx - 1].expireAt = 0;
      this.adjust(idx, N, P);
      return [this.m[idx - 1], 1, e];
    }
    return [null, 0, 0];
  }

  walk(walker: (key: string, value: Value, expireAt: number) => boolean): void {
    let idx = this.doubleLink[0][N];
    while (idx !== 0) {
      if (this.m[idx - 1].expireAt > 0) {
        if (
          !walker(
            this.m[idx - 1].k,
            this.m[idx - 1].v,
            this.m[idx - 1].expireAt,
          )
        ) {
          return;
        }
      }
      idx = this.doubleLink[idx][N];
    }
  }

  private adjust(idx: number, f: number, t: number): void {
    if (this.doubleLink[idx][f] !== 0) {
      this.doubleLink[this.doubleLink[idx][t]][f] = this.doubleLink[idx][f];
      this.doubleLink[this.doubleLink[idx][f]][t] = this.doubleLink[idx][t];
      this.doubleLink[idx][f] = 0;
      this.doubleLink[idx][t] = this.doubleLink[0][t];
      this.doubleLink[this.doubleLink[0][t]][f] = idx;
      this.doubleLink[0][t] = idx;
    }
  }
}

export function hashBKRD(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 131 + s.charCodeAt(i)) | 0;
  }
  return hash;
}

export function maskOfNextPowOf2(cap: number): number {
  cap = cap & 0xffff;
  if (cap > 0 && (cap & (cap - 1)) === 0) {
    return cap - 1;
  }
  cap |= cap >> 1;
  cap |= cap >> 2;
  cap |= cap >> 4;
  return cap | (cap >> 8);
}

export class LruStore implements Store {
  private caches: [InternalCache, InternalCache][];
  private onEvicted?: (key: string, value: Value) => void;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;
  private mask: number;
  private closed = false;

  constructor(opts: StoreOptions) {
    const bucketCount = opts.bucketCount || 16;
    const capPerBucket = opts.capPerBucket || 1024;
    const level2Cap = opts.level2Cap || 1024;
    const cleanupInterval = opts.cleanupInterval ?? 60_000;

    this.mask = maskOfNextPowOf2(bucketCount);
    this.onEvicted = opts.onEvicted;
    this.caches = new Array(this.mask + 1);

    for (let i = 0; i <= this.mask; i++) {
      this.caches[i] = [
        new InternalCache(capPerBucket),
        new InternalCache(level2Cap),
      ];
    }

    if (cleanupInterval > 0) {
      this.cleanupTimer = setInterval(
        () => this.cleanupLoop(),
        cleanupInterval,
      );
    }
  }

  get(key: string): [Value | null, boolean] {
    const idx = hashBKRD(key) & this.mask;
    const currentTime = Date.now();

    const [n1, status1, expireAt] = this.caches[idx][0].del(key);
    if (status1 > 0 && n1) {
      if (expireAt > 0 && currentTime >= expireAt) {
        this.deleteInternal(key, idx);
        return [null, false];
      }
      this.caches[idx][1].put(key, n1.v, expireAt, this.onEvicted);
      return [n1.v, true];
    }

    const [n2, status2] = this.getFromLevel(key, idx, 1);
    if (status2 > 0 && n2) {
      if (n2.expireAt > 0 && currentTime >= n2.expireAt) {
        this.deleteInternal(key, idx);
        return [null, false];
      }
      return [n2.v, true];
    }

    return [null, false];
  }

  set(key: string, value: Value): void {
    this.setWithExpiration(key, value, 0);
  }

  setWithExpiration(key: string, value: Value, expirationMs: number): void {
    let expireAt: number;
    if (expirationMs > 0) {
      expireAt = Date.now() + expirationMs;
    } else {
      expireAt = MAX_EXPIRE_AT;
    }

    const idx = hashBKRD(key) & this.mask;
    this.caches[idx][0].put(key, value, expireAt, this.onEvicted);
  }

  delete(key: string): boolean {
    const idx = hashBKRD(key) & this.mask;
    return this.deleteInternal(key, idx);
  }

  clear(): void {
    const keys: string[] = [];

    for (let i = 0; i < this.caches.length; i++) {
      this.caches[i][0].walk((key) => {
        keys.push(key);
        return true;
      });
      this.caches[i][1].walk((key) => {
        if (!keys.includes(key)) {
          keys.push(key);
        }
        return true;
      });
    }

    for (const key of keys) {
      this.delete(key);
    }
  }

  len(): number {
    let count = 0;
    for (let i = 0; i < this.caches.length; i++) {
      this.caches[i][0].walk(() => {
        count++;
        return true;
      });
      this.caches[i][1].walk(() => {
        count++;
        return true;
      });
    }
    return count;
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  private getFromLevel(
    key: string,
    idx: number,
    level: number,
  ): [Node | null, number] {
    const [n, st] = this.caches[idx][level].get(key);
    if (st > 0 && n) {
      const currentTime = Date.now();
      if (n.expireAt <= 0 || currentTime >= n.expireAt) {
        return [null, 0];
      }
      return [n, st];
    }
    return [null, 0];
  }

  private deleteInternal(key: string, idx: number): boolean {
    const [n1, s1] = this.caches[idx][0].del(key);
    const [n2, s2] = this.caches[idx][1].del(key);
    const deleted = s1 > 0 || s2 > 0;

    if (deleted && this.onEvicted) {
      if (n1 && n1.v) {
        this.onEvicted(key, n1.v);
      } else if (n2 && n2.v) {
        this.onEvicted(key, n2.v);
      }
    }

    return deleted;
  }

  private cleanupLoop(): void {
    const currentTime = Date.now();

    for (let i = 0; i < this.caches.length; i++) {
      const expiredKeys: string[] = [];

      this.caches[i][0].walk((key, _value, expireAt) => {
        if (expireAt > 0 && currentTime >= expireAt) {
          expiredKeys.push(key);
        }
        return true;
      });

      this.caches[i][1].walk((key, _value, expireAt) => {
        if (expireAt > 0 && currentTime >= expireAt) {
          if (!expiredKeys.includes(key)) {
            expiredKeys.push(key);
          }
        }
        return true;
      });

      for (const key of expiredKeys) {
        this.deleteInternal(key, i);
      }
    }
  }
}
