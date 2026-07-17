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
