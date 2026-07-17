/**
 * Copyright 2026 hangtiancheng
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
