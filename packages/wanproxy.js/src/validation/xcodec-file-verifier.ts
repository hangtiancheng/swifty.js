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

import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";

import {
	createXCodecDecodeTransform,
	createXCodecEncodeTransform,
} from "../pipeline/index.js";
import { MemoryCache } from "../xcodec/index.js";
import { createHashSink, hashFile } from "./hash-file.js";

export interface XCodecFileVerification {
	readonly decodedSha256: string;
	readonly originalSha256: string;
	readonly verified: boolean;
}

export async function verifyXCodecFile(
	file: string,
	cacheSegments: number,
): Promise<XCodecFileVerification> {
	const originalHash = await hashFile(file);
	const decodedHash = await hashXCodecRoundTrip(file, cacheSegments);
	return {
		decodedSha256: decodedHash,
		originalSha256: originalHash,
		verified: originalHash === decodedHash,
	};
}

async function hashXCodecRoundTrip(
	file: string,
	cacheSegments: number,
): Promise<string> {
	const sink = createHashSink();
	await pipeline(
		createReadStream(file),
		createXCodecEncodeTransform({
			cache: new MemoryCache({ maxSegments: cacheSegments }),
		}),
		createXCodecDecodeTransform({
			cache: new MemoryCache({ maxSegments: cacheSegments }),
		}),
		sink.stream,
	);
	return sink.digest();
}
