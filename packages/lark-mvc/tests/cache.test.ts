import { describe, it, expect, vi } from "vitest";
import { Cache } from "../src/cache";

describe("Cache", () => {
  it("constructor - initializes with default parameters", () => {
    const cache = new Cache();
    expect(cache.size).toBe(0);
  });

  it("constructor - initializes with custom parameters and onRemove callback", () => {
    const onRemove = vi.fn();
    const cache = new Cache({ maxSize: 30, bufferSize: 6, onRemove });
    expect(cache.size).toBe(0);
    // onRemove should not be called during construction
    expect(onRemove).not.toHaveBeenCalled();
  });

  it("set / get - stores and retrieves values", () => {
    const cache = new Cache({ maxSize: 20, bufferSize: 5 });
    const cacheValueA = { a: 1 };

    cache.set("testKey", cacheValueA);
    expect(cache.get("testKey")).toBe(cacheValueA);
    expect(cache.has("testKey")).toBe(true);
  });

  it("set - updates existing key with new value", () => {
    const cache = new Cache();
    cache.set("key", "value1");
    expect(cache.get("key")).toBe("value1");

    cache.set("key", "value2");
    expect(cache.get("key")).toBe("value2");
    // Updating an existing key should not increase size
    expect(cache.size).toBe(1);
  });

  it("del - removes cache entry", () => {
    const onRemove = vi.fn();
    const cache = new Cache({ onRemove });

    cache.set("test", "test-result");
    cache.del("test");

    expect(cache.get("test")).toBeUndefined();
    expect(cache.has("test")).toBe(false);
    expect(onRemove).toHaveBeenCalledWith("test");
  });

  it("del - deleting non-existent key does not throw", () => {
    const cache = new Cache();
    expect(() => cache.del("nonexistent")).not.toThrow();
  });

  it("has - checks key existence", () => {
    const cache = new Cache();
    expect(cache.has("key1")).toBe(false);

    cache.set("key1", 1);
    expect(cache.has("key1")).toBe(true);
    expect(cache.has("key2")).toBe(false);
  });

  it("forEach - iterates over all values", () => {
    const cache = new Cache();
    cache.set("key1", 5);
    cache.set("key2", 2);
    cache.set("key3", "a");
    cache.set("key4", "b");
    const testObj = { a: 1 };
    cache.set("key5", testObj);

    const resultSet = new Set<unknown>();
    cache.forEach((item) => {
      resultSet.add(item);
    });

    expect(resultSet.has(5)).toBe(true);
    expect(resultSet.has(2)).toBe(true);
    expect(resultSet.has("a")).toBe(true);
    expect(resultSet.has("b")).toBe(true);
    expect(resultSet.has(testObj)).toBe(true);
  });

  it("clear - clears all cache entries", () => {
    const onRemove = vi.fn();
    const cache = new Cache({ onRemove });

    cache.set("key1", 1);
    cache.set("key2", 2);
    cache.clear();

    expect(cache.size).toBe(0);
    expect(cache.has("key1")).toBe(false);
    expect(onRemove).toHaveBeenCalledTimes(2);
  });

  it("size - returns current entry count", () => {
    const cache = new Cache();
    expect(cache.size).toBe(0);

    cache.set("a", 1);
    expect(cache.size).toBe(1);

    cache.set("b", 2);
    expect(cache.size).toBe(2);

    cache.del("a");
    expect(cache.size).toBe(1); // del removes from entries array immediately
  });

  it("eviction - evicts low-frequency entries when capacity is exceeded", () => {
    const onRemove = vi.fn();
    // maxSize=2, bufferSize=1 → capacity=3
    // Adding 3 entries fills capacity, 4th triggers eviction
    const cache = new Cache({ maxSize: 2, bufferSize: 1, onRemove });

    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("c", 3);
    expect(cache.size).toBe(3);

    // 4th entry exceeds capacity, triggers eviction
    cache.set("d", 4);

    // 'a' should be evicted (lowest frequency, earliest access)
    expect(cache.get("a")).toBeUndefined();
    expect(cache.has("b")).toBe(true);
    expect(cache.has("c")).toBe(true);
    expect(onRemove).toHaveBeenCalled();
  });

  it("eviction - retains high-frequency entries longer", () => {
    // maxSize=2, bufferSize=1 → capacity=3
    const cache = new Cache({ maxSize: 2, bufferSize: 1 });

    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("c", 3);

    // Access 'a' multiple times to increase its frequency
    cache.get("a");
    cache.get("a");

    // Exceeds capacity, 'b' should be evicted (lower frequency than 'a')
    cache.set("d", 4);

    expect(cache.has("a")).toBe(true);
    expect(cache.get("b")).toBeUndefined();
    expect(cache.has("c")).toBe(true);
  });
});
