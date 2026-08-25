import { describe, expect, it } from "vitest";
import { mapWithConcurrency } from "@/utils/concurrency.js";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("mapWithConcurrency", () => {
  it("preserves input order regardless of completion order", async () => {
    const delays = [30, 5, 15, 1];
    const results = await mapWithConcurrency(delays, 4, async (ms, index) => {
      await delay(ms);
      return index;
    });
    expect(results).toEqual([0, 1, 2, 3]);
  });

  it("never exceeds the concurrency limit", async () => {
    let active = 0;
    let maxActive = 0;
    await mapWithConcurrency([1, 2, 3, 4, 5, 6], 2, async () => {
      active += 1;
      maxActive = Math.max(maxActive, active);
      await delay(5);
      active -= 1;
    });
    expect(maxActive).toBe(2);
  });

  it("propagates the first task rejection", async () => {
    await expect(
      mapWithConcurrency([1, 2], 2, (value) =>
        value === 2 ? Promise.reject(new Error("boom")) : Promise.resolve(value),
      ),
    ).rejects.toThrow("boom");
  });

  it("rejects a non-positive concurrency limit", async () => {
    await expect(mapWithConcurrency([1], 0, (value) => Promise.resolve(value))).rejects.toThrow(
      RangeError,
    );
  });

  it("handles an empty input", async () => {
    expect(await mapWithConcurrency([], 4, (value) => Promise.resolve(value))).toEqual([]);
  });
});
