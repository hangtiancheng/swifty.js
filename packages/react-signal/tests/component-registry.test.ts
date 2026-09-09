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
import { aliasComponent, canonicalComponent } from "../src/component-registry";
import type { Component } from "../src/jsx/vnode";

const makeComponent = (): Component => () => null;

describe("component-registry (HMR alias map)", () => {
  it("canonicalComponent resolves non-aliased components to themselves", () => {
    const A = makeComponent();
    expect(canonicalComponent(A)).toBe(A);
  });

  it("canonicalComponent resolves stale references through alias chains", () => {
    const v1 = makeComponent();
    const v2 = makeComponent();
    const v3 = makeComponent();
    aliasComponent(v1, v2);
    aliasComponent(v2, v3);
    expect(canonicalComponent(v1)).toBe(v3); // chain: v1 → v2 → v3
    expect(canonicalComponent(v2)).toBe(v3);
    expect(canonicalComponent(v3)).toBe(v3);
  });

  it("self-aliasing is a no-op", () => {
    const A = makeComponent();
    aliasComponent(A, A);
    expect(canonicalComponent(A)).toBe(A);
  });

  it("alias cycles terminate", () => {
    const a = makeComponent();
    const b = makeComponent();
    aliasComponent(a, b);
    aliasComponent(b, a);
    // Cycle a → b → a: resolution terminates and returns one of the pair.
    const resolved = canonicalComponent(a);
    expect(resolved === a || resolved === b).toBe(true);
  });
});
