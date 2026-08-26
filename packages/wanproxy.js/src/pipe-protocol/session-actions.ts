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

import { XCODEC_SEGMENT_LENGTH } from "../xcodec/constants.js";
import { XCodecHash } from "../xcodec/hash.js";
import type { MemoryCache } from "../xcodec/memory-cache.js";
import { encodePipeFrame } from "./control-frame.js";
import type { ReferenceRetention } from "./reference-retention.js";
import {
	type CodecSessionReceiveResult,
	invalid,
	ok,
} from "./session-result.js";

export function answerAsk(
	retention: ReferenceRetention,
	hashes: readonly bigint[],
): CodecSessionReceiveResult {
	try {
		const segments = retention.learn(hashes);
		return {
			output: new Uint8Array(),
			responses: encodePipeFrame({ kind: "learn", segments }),
			status: "ok",
		};
	} catch (error) {
		return invalid(
			error instanceof Error ? error.message : "failed to answer ASK",
		);
	}
}

export function applyLearnSegments(
	cache: MemoryCache,
	unknownHashes: Set<bigint>,
	segments: readonly Uint8Array[],
): CodecSessionReceiveResult {
	for (const segment of segments) {
		if (segment.length !== XCODEC_SEGMENT_LENGTH) {
			return invalid("invalid LEARN segment length");
		}
		const hash = XCodecHash.hashSegment(segment);
		if (!unknownHashes.has(hash)) {
			return invalid("gratuitous LEARN without ASK");
		}
		if (cache.has(hash)) {
			cache.replace(hash, segment);
		} else {
			cache.enter(hash, segment);
		}
		unknownHashes.delete(hash);
	}
	return ok();
}

export function applyAdvance(
	retention: ReferenceRetention,
	count: number,
): CodecSessionReceiveResult {
	try {
		retention.advance(count);
		return ok();
	} catch (error) {
		return invalid(error instanceof Error ? error.message : "invalid ADVANCE");
	}
}
