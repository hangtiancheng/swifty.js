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

import { BackrefWindow } from "./backref-window.js";
import { concatByteArrays } from "./byte-array.js";
import { ByteQueue } from "./byte-queue.js";
import type { XCodecCache } from "./cache-interface.js";
import { XCODEC_MAGIC, XCODEC_SEGMENT_LENGTH } from "./constants.js";
import { readRawPrefix } from "./decoder-state.js";
import { readFrame, type XCodecFrame } from "./frame-codec.js";
import { XCodecHash } from "./hash.js";
import { MemoryCache } from "./memory-cache.js";

export type DecodeResult =
	| { readonly status: "ok"; readonly output: Uint8Array }
	| { readonly status: "need-more"; readonly output: Uint8Array }
	| {
			readonly status: "unknown-hash";
			readonly output: Uint8Array;
			readonly hashes: readonly bigint[];
	  }
	| {
			readonly status: "invalid";
			readonly output: Uint8Array;
			readonly reason: string;
	  };

export interface DecoderOptions {
	readonly cache?: XCodecCache;
}

export class XCodecDecoder {
	private readonly cache: XCodecCache;
	private readonly queue = new ByteQueue();
	private readonly window = new BackrefWindow();

	public constructor(options: DecoderOptions = {}) {
		this.cache = options.cache ?? new MemoryCache();
	}

	public decode(input: Uint8Array): DecodeResult {
		this.queue.append(input);
		const output: Uint8Array[] = [];

		for (;;) {
			const raw = readRawPrefix(this.queue);
			if (raw !== undefined) {
				output.push(raw);
				continue;
			}
			if (this.queue.length === 0) {
				return { output: concatByteArrays(output), status: "ok" };
			}
			if (this.queue.length === 1 && this.queue.peek(0) === XCODEC_MAGIC) {
				return { output: concatByteArrays(output), status: "need-more" };
			}

			const frame = readFrame(this.queue);
			if (frame.status === "need-more") {
				return { output: concatByteArrays(output), status: "need-more" };
			}
			if (frame.status === "invalid") {
				return {
					output: concatByteArrays(output),
					reason: frame.reason,
					status: "invalid",
				};
			}

			const decoded = this.decodeFrame(frame.frame);
			if (decoded.status !== "ok") {
				return { ...decoded, output: concatByteArrays(output) };
			}
			output.push(decoded.output);
		}
	}

	private decodeFrame(frame: XCodecFrame): DecodeResult {
		switch (frame.kind) {
			case "escape":
				return { output: Uint8Array.from([XCODEC_MAGIC]), status: "ok" };
			case "extract":
				return this.decodeExtract(frame.segment);
			case "ref":
				return this.decodeRef(frame.hash);
			case "backref":
				return this.decodeBackref(frame.index);
		}
	}

	private decodeExtract(segment: Uint8Array): DecodeResult {
		const hash = XCodecHash.hashSegment(segment);
		if (this.cache.has(hash)) {
			this.cache.replace(hash, segment);
		} else {
			this.cache.enter(hash, segment);
		}
		this.window.declare(hash, segment);
		return { output: segment.slice(), status: "ok" };
	}

	private decodeRef(hash: bigint): DecodeResult {
		const segment = this.cache.lookup(hash);
		if (segment === undefined) {
			return {
				hashes: [hash],
				output: new Uint8Array(),
				status: "unknown-hash",
			};
		}
		this.window.declare(hash, segment);
		return { output: segment, status: "ok" };
	}

	private decodeBackref(index: number): DecodeResult {
		const segment = this.window.dereference(index);
		if (segment === undefined) {
			return {
				output: new Uint8Array(),
				reason: "backref index is not present",
				status: "invalid",
			};
		}
		if (segment.length !== XCODEC_SEGMENT_LENGTH) {
			return {
				output: new Uint8Array(),
				reason: "backref segment has invalid length",
				status: "invalid",
			};
		}
		return { output: segment, status: "ok" };
	}
}

export function decodeXCodec(
	input: Uint8Array,
	options: DecoderOptions = {},
): DecodeResult {
	return new XCodecDecoder(options).decode(input);
}
