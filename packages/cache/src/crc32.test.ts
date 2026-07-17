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

import { describe, it, expect } from "vitest";
import { crc32 } from "./crc32.js";

describe("crc32", () => {
  it("produces consistent hash for same input", () => {
    expect(crc32("hello")).toBe(crc32("hello"));
  });

  it("produces different hashes for different inputs", () => {
    expect(crc32("hello")).not.toBe(crc32("world"));
  });

  it("handles empty string", () => {
    const h = crc32("");
    expect(typeof h).toBe("number");
    expect(h).toBeGreaterThanOrEqual(0);
  });

  it("accepts Buffer input", () => {
    const fromStr = crc32("test");
    const fromBuf = crc32(Buffer.from("test"));
    expect(fromStr).toBe(fromBuf);
  });

  it("returns unsigned 32-bit value", () => {
    const h = crc32("anything");
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });
});
