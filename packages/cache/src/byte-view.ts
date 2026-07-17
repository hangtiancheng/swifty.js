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

import { Value } from "./store.js";

export class ByteView implements Value {
  private b: Buffer;

  constructor(b: Buffer) {
    this.b = b;
  }

  len(): number {
    return this.b.length;
  }

  byteSlice(): Buffer {
    return Buffer.from(this.b);
  }

  toString(): string {
    return this.b.toString();
  }
}

export function cloneBytes(b: Buffer): Buffer {
  const c = Buffer.alloc(b.length);
  b.copy(c);
  return c;
}
