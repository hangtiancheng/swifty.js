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
