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
