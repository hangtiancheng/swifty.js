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

/**
 * Compare function type: returns negative if a < b, positive if a > b, 0 if equal
 */
export type CompareFunction = (a: number, b: number) => number;

/**
 * Transform array into a heap in-place
 * @param arr - Array to heapify
 * @param compare - Comparison function
 * @returns The heapified array
 */
export function heapify(arr: number[], compare: CompareFunction): number[];

/**
 * Pop and return the smallest item from the heap
 * @param arr - Heap array
 * @param compare - Comparison function
 * @returns The smallest item
 * @throws Error if heap is empty
 */
export function heappop(arr: number[], compare: CompareFunction): number;

/**
 * Push item onto heap
 * @param arr - Heap array
 * @param item - Item to push
 * @param compare - Comparison function
 */
export function heappush(arr: number[], item: number, compare: CompareFunction): void;

/**
 * Push item on heap, then pop and return the smallest item
 * More efficient than heappush() followed by heappop()
 * @param arr - Heap array
 * @param item - Item to push
 * @param compare - Comparison function
 * @returns The smallest item
 */
export function heappushpop(arr: number[], item: number, compare: CompareFunction): number;

/**
 * Pop and return the smallest item, then push new item
 * More efficient than heappop() followed by heappush()
 * @param arr - Heap array
 * @param item - Item to push
 * @param compare - Comparison function
 * @returns The smallest item (before replacement)
 * @throws Error if heap is empty
 */
export function heapreplace(arr: number[], item: number, compare: CompareFunction): number;
