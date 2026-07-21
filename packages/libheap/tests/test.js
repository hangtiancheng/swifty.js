import { test, expect } from "vitest";
import {
  heapify,
  heappop,
  heappush,
  heappushpop,
  heapreplace,
  Heap,
} from "../index.js";

test("heapify + heappop returns sorted output (native comparator)", () => {
  const arr = [5, 1, 9, 3, 7, 2, 8];
  heapify(arr);
  const sorted = [];
  while (arr.length > 0) sorted.push(heappop(arr));
  expect(sorted).toStrictEqual([1, 2, 3, 5, 7, 8, 9]);
});

test("heapify with custom comparator (max-heap)", () => {
  const arr = [5, 1, 9, 3];
  const desc = (a, b) => b - a;
  heapify(arr, desc);
  expect(heappop(arr, desc)).toBe(9);
  expect(heappop(arr, desc)).toBe(5);
});

test("heappush grows the array and preserves heap order", () => {
  const arr = [];
  for (const x of [4, 1, 3]) heappush(arr, x);
  expect(arr.length).toBe(3);
  expect(arr[0]).toBe(1);
});

test("heappushpop returns item when smaller than root", () => {
  const arr = [5, 6, 7];
  expect(heappushpop(arr, 1)).toBe(1);
  expect([...arr].sort((a, b) => a - b)).toStrictEqual([5, 6, 7]);
});

test("heappushpop swaps when item larger than root", () => {
  const arr = [5, 6, 7];
  expect(heappushpop(arr, 10)).toBe(5);
  expect(arr[0]).toBe(6);
});

test("heapreplace returns old root", () => {
  const arr = [2, 6, 4];
  expect(heapreplace(arr, 10)).toBe(2);
  expect(arr[0]).toBe(4);
});

test("heappop on empty array throws", () => {
  expect(() => heappop([])).toThrow(/heap is empty/);
});

test("heapreplace on empty array throws", () => {
  expect(() => heapreplace([], 1)).toThrow(/heap is empty/);
});

test("non-number elements are rejected", () => {
  expect(() => heapify([1, "two", 3])).toThrow(TypeError);
  expect(() => heappush([1], undefined)).toThrow(TypeError);
});

test("NaN is rejected", () => {
  expect(() => heappush([1], NaN)).toThrow(TypeError);
  expect(() => heapify([1, NaN])).toThrow(TypeError);
});

test("throwing JS comparator propagates and does not corrupt caller array", () => {
  const arr = [3, 1, 2];
  const bad = () => {
    throw new Error("boom");
  };
  expect(() => heapify(arr, bad)).toThrow(/boom/);
  expect(arr).toStrictEqual([3, 1, 2]);
});

test("Heap class: push/pop/peek/size", () => {
  const h = new Heap();
  expect(h.size).toBe(0);
  expect(h.peek()).toBeUndefined();
  for (const x of [5, 1, 9, 3]) h.push(x);
  expect(h.size).toBe(4);
  expect(h.peek()).toBe(1);
  expect(h.pop()).toBe(1);
  expect(h.pop()).toBe(3);
  expect(h.size).toBe(2);
});

test("Heap class: constructor heapifies initial items", () => {
  const h = new Heap([7, 2, 5]);
  expect(h.pop()).toBe(2);
  expect(h.pop()).toBe(5);
  expect(h.pop()).toBe(7);
});

test("Heap class: custom comparator", () => {
  const h = new Heap([5, 1, 9, 3], (a, b) => b - a);
  expect(h.pop()).toBe(9);
  expect(h.pop()).toBe(5);
});

test("Heap class: pushpop and replace", () => {
  const h = new Heap([5, 6, 7]);
  expect(h.pushpop(1)).toBe(1);
  expect(h.pushpop(10)).toBe(5);
  expect(h.replace(2)).toBe(6);
  expect(h.peek()).toBe(2);
});

test("Heap class: pop on empty throws, NaN rejected", () => {
  const h = new Heap();
  expect(() => h.pop()).toThrow(/heap is empty/);
  expect(() => h.push(NaN)).toThrow(TypeError);
});

test("Heap class: toArray returns a copy", () => {
  const h = new Heap([3, 1, 2]);
  const a = h.toArray();
  expect(a.length).toBe(3);
  a.push(999);
  expect(h.size).toBe(3);
});

test("Heap class: large randomized sort matches Array.sort", () => {
  const n = 10_000;
  const items = [];
  let x = 42;
  for (let i = 0; i < n; i++) {
    x = (x * 1103515245 + 12345) % 2147483648;
    items.push(x / 2147483648);
  }
  const h = new Heap(items);
  const out = [];
  while (h.size > 0) out.push(h.pop());
  expect(out).toStrictEqual([...items].sort((a, b) => a - b));
});
