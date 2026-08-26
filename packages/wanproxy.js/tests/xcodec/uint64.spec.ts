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

import {
	decodeUint64BE,
	encodeUint64BE,
	formatUint64Hex,
} from "@/xcodec/index.js";

describe("uint64 helpers", () => {
	it("encodes and decodes big-endian values", () => {
		const value = 0x0123_4567_89ab_cdefn;
		const encoded = encodeUint64BE(value);

		expect(Array.from(encoded)).toEqual([1, 35, 69, 103, 137, 171, 205, 239]);
		expect(decodeUint64BE(encoded)).toBe(value);
		expect(formatUint64Hex(value)).toBe("0123456789abcdef");
	});

	it("rejects out-of-range inputs", () => {
		expect(() => encodeUint64BE(-1n)).toThrow(RangeError);
		expect(() => encodeUint64BE(0x1_0000_0000_0000_0000n)).toThrow(RangeError);
		expect(() => decodeUint64BE(new Uint8Array(7))).toThrow(RangeError);
		expect(() => formatUint64Hex(0x1_0000_0000_0000_0000n)).toThrow(RangeError);
	});
});
