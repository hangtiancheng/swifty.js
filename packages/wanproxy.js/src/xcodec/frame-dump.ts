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

import { ByteQueue } from "./byte-queue.js";
import { readFrame, type XCodecFrame } from "./frame-codec.js";
import { formatUint64Hex } from "./uint64.js";

export function dumpXCodecFrames(input: Uint8Array): readonly string[] {
	const queue = new ByteQueue();
	queue.append(input);
	const lines: string[] = [];

	while (queue.length > 0) {
		const result = readFrame(queue);
		if (result.status === "need-more") {
			lines.push("need-more");
			break;
		}
		if (result.status === "invalid") {
			lines.push(`invalid ${result.reason}`);
			break;
		}
		lines.push(formatFrame(result.frame));
	}
	return lines;
}

function formatFrame(frame: XCodecFrame): string {
	switch (frame.kind) {
		case "escape":
			return "ESCAPE";
		case "extract":
			return `EXTRACT ${frame.segment.length}`;
		case "ref":
			return `REF ${formatUint64Hex(frame.hash)}`;
		case "backref":
			return `BACKREF ${frame.index}`;
	}
}
