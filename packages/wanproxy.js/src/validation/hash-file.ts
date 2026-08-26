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

import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { Writable } from "node:stream";
import { pipeline } from "node:stream/promises";

export async function hashFile(path: string): Promise<string> {
	const sink = createHashSink();
	await pipeline(createReadStream(path), sink.stream);
	return sink.digest();
}

export function createHashSink(): {
	readonly digest: () => string;
	readonly stream: Writable;
} {
	const hash = createHash("sha256");
	const stream = new Writable({
		write(chunk: unknown, _encoding: BufferEncoding, callback) {
			if (Buffer.isBuffer(chunk) || chunk instanceof Uint8Array) {
				hash.update(chunk);
				callback();
				return;
			}
			callback(new Error("hash sink received a non-byte chunk"));
		},
	});
	return {
		digest: () => hash.digest("hex"),
		stream,
	};
}
