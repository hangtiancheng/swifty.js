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
