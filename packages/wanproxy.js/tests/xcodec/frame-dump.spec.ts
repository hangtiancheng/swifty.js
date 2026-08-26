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
	dumpXCodecFrames,
	encodeFrame,
	XCODEC_MAGIC,
	XCODEC_SEGMENT_LENGTH,
} from "@/xcodec/index.js";

describe("dumpXCodecFrames", () => {
	it("formats known frames", () => {
		const segment = new Uint8Array(XCODEC_SEGMENT_LENGTH).fill(1);
		const input = new Uint8Array([
			...encodeFrame({ kind: "escape" }),
			...encodeFrame({ kind: "extract", segment }),
			...encodeFrame({ hash: 0x1234n, kind: "ref" }),
			...encodeFrame({ index: 3, kind: "backref" }),
		]);

		expect(dumpXCodecFrames(input)).toEqual([
			"ESCAPE",
			"EXTRACT 2048",
			"REF 0000000000001234",
			"BACKREF 3",
		]);
	});

	it("reports incomplete and invalid frames", () => {
		expect(dumpXCodecFrames(Uint8Array.from([XCODEC_MAGIC]))).toEqual([
			"need-more",
		]);
		expect(dumpXCodecFrames(Uint8Array.from([XCODEC_MAGIC, 0xff]))).toEqual([
			"invalid unsupported XCodec opcode 255",
		]);
	});
});
