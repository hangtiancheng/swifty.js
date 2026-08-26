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

import { ByteQueue } from "../xcodec/byte-queue.js";
import { XCODEC_MAGIC } from "../xcodec/constants.js";
import { readRawPrefix } from "../xcodec/decoder-state.js";
import { readFrame } from "../xcodec/frame-codec.js";
import { XCodecHash } from "../xcodec/hash.js";
import type { MemoryCache } from "../xcodec/memory-cache.js";

export function collectUnknownReferences(
	payload: Uint8Array,
	cache: MemoryCache,
): readonly bigint[] {
	const queue = new ByteQueue();
	queue.append(payload);
	const unknown = new Set<bigint>();
	const defined = new Set<bigint>();

	while (queue.length > 0) {
		const raw = readRawPrefix(queue);
		if (raw !== undefined) {
			continue;
		}
		if (queue.length === 1 && queue.peek(0) === XCODEC_MAGIC) {
			break;
		}
		const result = readFrame(queue);
		if (result.status !== "frame") {
			break;
		}
		if (result.frame.kind === "extract") {
			defined.add(XCodecHash.hashSegment(result.frame.segment));
			continue;
		}
		if (
			result.frame.kind === "ref" &&
			!cache.has(result.frame.hash) &&
			!defined.has(result.frame.hash)
		) {
			unknown.add(result.frame.hash);
		}
	}
	return [...unknown];
}
