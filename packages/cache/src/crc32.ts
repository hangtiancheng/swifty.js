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

const crcTable: number[] = new Array(256);

(function initCrcTable() {
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    crcTable[i] = c >>> 0;
  }
})();

export function crc32(data: string | Buffer): number {
  const bytes = typeof data === "string" ? Buffer.from(data) : data;
  let crcValue = 0xffffffff;

  for (const byte of bytes) {
    crcValue = crcTable[(crcValue ^ byte) & 0xff] ^ (crcValue >>> 8);
  }

  return (crcValue ^ 0xffffffff) >>> 0;
}

export type HashFunc = (data: string | Buffer) => number;
