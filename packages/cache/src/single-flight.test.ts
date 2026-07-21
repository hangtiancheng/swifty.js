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
import { SingleFlightGroup } from "./single-flight.js";

describe("SingleFlightGroup", () => {
  it("returns value from fn", async () => {
    const g = new SingleFlightGroup();
    const value = await g.do("key", async () => "value");
    expect(value).toBe("value");
  });

  it("propagates errors", async () => {
    const g = new SingleFlightGroup();
    await expect(
      g.do("key", async () => {
        throw new Error("load failed");
      }),
    ).rejects.toThrow("load failed");
  });

  it("suppresses duplicate concurrent calls", async () => {
    const g = new SingleFlightGroup();
    let calls = 0;
    let resolveGate: () => void;
    const gate = new Promise<void>((r) => {
      resolveGate = r;
    });

    const callers = 16;
    const promises = Array.from({ length: callers }, () =>
      g.do("key", async () => {
        calls++;
        await gate;
        return "value";
      }),
    );

    await new Promise((r) => setTimeout(r, 20));
    resolveGate!();

    const results = await Promise.all(promises);
    for (const r of results) {
      expect(r).toBe("value");
    }
    expect(calls).toBe(1);
  });

  it("allows sequential calls after first completes", async () => {
    const g = new SingleFlightGroup();
    let calls = 0;

    await g.do("key", async () => {
      calls++;
      return "first";
    });

    const second = await g.do("key", async () => {
      calls++;
      return "second";
    });

    expect(second).toBe("second");
    expect(calls).toBe(2);
  });

  it("different keys run independently", async () => {
    const g = new SingleFlightGroup();
    const calls: string[] = [];

    const [a, b] = await Promise.all([
      g.do("a", async () => {
        calls.push("a");
        return "val-a";
      }),
      g.do("b", async () => {
        calls.push("b");
        return "val-b";
      }),
    ]);

    expect(a).toBe("val-a");
    expect(b).toBe("val-b");
    expect(calls).toContain("a");
    expect(calls).toContain("b");
  });
});
