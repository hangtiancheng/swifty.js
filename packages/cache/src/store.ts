/**
 * Copyright (c) 2026 hangtiancheng
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export interface Value {
  len(): number;
}

export interface Store {
  get(key: string): [Value | null, boolean];
  set(key: string, value: Value): void;
  setWithExpiration(key: string, value: Value, expirationMs: number): void;
  delete(key: string): boolean;
  clear(): void;
  len(): number;
  close(): void;
}

export interface StoreOptions {
  maxBytes?: number;
  bucketCount?: number;
  capPerBucket?: number;
  level2Cap?: number;
  cleanupInterval?: number;
  onEvicted?: (key: string, value: Value) => void;
}

export function defaultStoreOptions(): StoreOptions {
  return {
    maxBytes: 8192,
    bucketCount: 16,
    capPerBucket: 512,
    level2Cap: 256,
    cleanupInterval: 60_000,
    onEvicted: undefined,
  };
}
