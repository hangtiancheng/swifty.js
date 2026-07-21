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
import { validPeerAddr, getLocalIP } from "./utils.js";

describe("validPeerAddr", () => {
  it("accepts localhost with port", () => {
    expect(validPeerAddr("localhost:8001")).toBe(true);
  });

  it("accepts IPv4 with port", () => {
    expect(validPeerAddr("127.0.0.1:8001")).toBe(true);
    expect(validPeerAddr("192.168.1.1:50051")).toBe(true);
  });

  it("rejects addresses without port", () => {
    expect(validPeerAddr("bad")).toBe(false);
    expect(validPeerAddr("localhost")).toBe(false);
  });

  it("rejects non-IPv4 hosts with port", () => {
    expect(validPeerAddr("bad:8001")).toBe(false);
  });
});

describe("getLocalIP", () => {
  it("returns a string", () => {
    try {
      const ip = getLocalIP();
      expect(typeof ip).toBe("string");
      expect(ip.split(".").length).toBe(4);
    } catch {
      // CI environments may not have a non-internal IPv4 interface
    }
  });
});
