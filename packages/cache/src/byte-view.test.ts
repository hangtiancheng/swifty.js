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
import { ByteView, cloneBytes } from "./byte-view.js";

describe("ByteView", () => {
  it("returns correct length", () => {
    const view = new ByteView(Buffer.from("hello"));
    expect(view.len()).toBe(5);
  });

  it("returns string representation", () => {
    const view = new ByteView(Buffer.from("value"));
    expect(view.toString()).toBe("value");
  });

  it("byteSlice returns a copy that does not affect original", () => {
    const view = new ByteView(Buffer.from("value"));
    const copy = view.byteSlice();
    copy[0] = 0x58; // 'X'
    expect(view.toString()).toBe("value");
  });

  it("multiple byteSlice calls return independent copies", () => {
    const view = new ByteView(Buffer.from("value"));
    const c1 = view.byteSlice();
    const c2 = view.byteSlice();
    c1[0] = 0x58;
    c2[0] = 0x59;
    expect(view.toString()).toBe("value");
  });

  it("handles empty buffer", () => {
    const view = new ByteView(Buffer.alloc(0));
    expect(view.len()).toBe(0);
    expect(view.toString()).toBe("");
    expect(view.byteSlice().length).toBe(0);
  });
});

describe("cloneBytes", () => {
  it("returns an independent copy", () => {
    const original = Buffer.from("hello");
    const clone = cloneBytes(original);
    clone[0] = 0x58;
    expect(original.toString()).toBe("hello");
    expect(clone.toString()).toBe("Xello");
  });

  it("preserves length", () => {
    const original = Buffer.from([1, 2, 3]);
    const clone = cloneBytes(original);
    expect(clone.length).toBe(3);
  });
});
