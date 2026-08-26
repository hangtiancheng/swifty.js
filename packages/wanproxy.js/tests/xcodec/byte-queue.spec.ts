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

import { describe, expect, it } from "vitest";

import { ByteQueue } from "@/xcodec/index.js";

describe("ByteQueue", () => {
	it("appends, peeks, reads, skips, snapshots, and clears", () => {
		const queue = new ByteQueue();
		queue.append(Uint8Array.from([1, 2]));
		queue.append(new Uint8Array());
		queue.append(Uint8Array.from([3, 4, 5]));

		expect(queue.length).toBe(5);
		expect(queue.indexOf(4)).toBe(3);
		expect(queue.indexOf(9)).toBe(-1);
		expect(queue.peek()).toBe(1);
		expect(queue.peek(3)).toBe(4);
		expect(queue.peek(-1)).toBeUndefined();
		expect(queue.peek(5)).toBeUndefined();
		expect(queue.readExact(3)).toEqual(Uint8Array.from([1, 2, 3]));
		expect(queue.indexOf(4)).toBe(0);
		expect(queue.toUint8Array()).toEqual(Uint8Array.from([4, 5]));
		expect(queue.skip(1)).toBe(true);
		expect(queue.readExact(2)).toBeUndefined();
		expect(queue.readExact(1)).toEqual(Uint8Array.from([5]));
		queue.clear();
		expect(queue.length).toBe(0);
	});
});
