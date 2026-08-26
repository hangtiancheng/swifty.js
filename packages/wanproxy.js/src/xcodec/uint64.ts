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

const UINT64_MASK = 0xffff_ffff_ffff_ffffn;
const UINT64_BYTES = 8;

export function encodeUint64BE(value: bigint): Uint8Array {
	if (value < 0n || value > UINT64_MASK) {
		throw new RangeError("uint64 value is out of range");
	}

	const bytes = new Uint8Array(UINT64_BYTES);
	for (let index = UINT64_BYTES - 1; index >= 0; index -= 1) {
		bytes[index] = Number(
			(value >> BigInt((UINT64_BYTES - 1 - index) * 8)) & 0xffn,
		);
	}
	return bytes;
}

export function decodeUint64BE(bytes: Uint8Array): bigint {
	if (bytes.length !== UINT64_BYTES) {
		throw new RangeError("uint64 requires exactly 8 bytes");
	}

	let value = 0n;
	for (const byte of bytes) {
		value = (value << 8n) | BigInt(byte);
	}
	return value;
}

export function formatUint64Hex(value: bigint): string {
	if (value < 0n || value > UINT64_MASK) {
		throw new RangeError("uint64 value is out of range");
	}
	return value.toString(16).padStart(16, "0");
}
