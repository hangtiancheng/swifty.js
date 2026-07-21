/**
 * Compare function type: returns negative if a < b, positive if a > b, 0 if
 * equal. When omitted, a native C++ ascending numeric comparator is used
 * (no JS callback per comparison — significantly faster).
 */
export type CompareFunction = (a: number, b: number) => number;

/**
 * Transform array into a heap in-place
 * @param arr - Array to heapify (elements must be numbers, NaN is rejected)
 * @param compare - Optional comparison function (defaults to ascending)
 * @returns The heapified array
 */
export function heapify(arr: number[], compare?: CompareFunction): number[];

/**
 * Pop and return the smallest item from the heap
 * @param arr - Heap array
 * @param compare - Optional comparison function (defaults to ascending)
 * @returns The smallest item
 * @throws Error if heap is empty
 */
export function heappop(arr: number[], compare?: CompareFunction): number;

/**
 * Push item onto heap
 * @param arr - Heap array
 * @param item - Item to push (NaN is rejected)
 * @param compare - Optional comparison function (defaults to ascending)
 */
export function heappush(
  arr: number[],
  item: number,
  compare?: CompareFunction,
): void;

/**
 * Push item on heap, then pop and return the smallest item
 * More efficient than heappush() followed by heappop()
 * @param arr - Heap array
 * @param item - Item to push (NaN is rejected)
 * @param compare - Optional comparison function (defaults to ascending)
 * @returns The smallest item
 */
export function heappushpop(
  arr: number[],
  item: number,
  compare?: CompareFunction,
): number;

/**
 * Pop and return the smallest item, then push new item
 * More efficient than heappop() followed by heappush()
 * @param arr - Heap array
 * @param item - Item to push (NaN is rejected)
 * @param compare - Optional comparison function (defaults to ascending)
 * @returns The smallest item (before replacement)
 * @throws Error if heap is empty
 */
export function heapreplace(
  arr: number[],
  item: number,
  compare?: CompareFunction,
): number;

/**
 * Stateful heap. The data lives in C++; every operation is O(log n) with no
 * per-call array copying. Prefer this over the function API for hot paths.
 */
export class Heap {
  /**
   * @param items - Optional initial items (heapified on construction)
   * @param compare - Optional comparison function (defaults to ascending)
   */
  constructor(items?: number[], compare?: CompareFunction);

  /** Push item onto the heap. NaN is rejected. */
  push(item: number): void;

  /**
   * Pop and return the top item.
   * @throws Error if heap is empty
   */
  pop(): number;

  /** Return the top item without removing it, or undefined if empty. */
  peek(): number | undefined;

  /** Push item, then pop and return the top item. */
  pushpop(item: number): number;

  /**
   * Pop and return the top item, then push new item.
   * @throws Error if heap is empty
   */
  replace(item: number): number;

  /** Copy the internal heap storage into a new array (heap order). */
  toArray(): number[];

  /** Number of items currently in the heap. */
  readonly size: number;
}
