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

import { randomFillSync } from "node:crypto";
import { open } from "node:fs/promises";
import { parentPort, workerData } from "node:worker_threads";

import { WorkerPayloadSchema } from "./create-large-file-schema.js";

const payload = WorkerPayloadSchema.parse(workerData);
const port = parentPort;
if (port === null) {
	throw new Error("worker parent port is unavailable");
}

const fh = await open(payload.path, "r+");
const buffer = Buffer.allocUnsafe(payload.chunkBytes);
try {
	let offset = payload.start;
	while (offset < payload.end) {
		const remaining = payload.end - offset;
		const writeSize = Math.min(payload.chunkBytes, remaining);
		const view =
			writeSize === payload.chunkBytes ? buffer : buffer.subarray(0, writeSize);
		randomFillSync(view);
		await fh.write(view, 0, writeSize, offset);
		offset += writeSize;
	}
} finally {
	await fh.close();
}

port.postMessage({
	end: payload.end,
	start: payload.start,
	written: payload.end - payload.start,
});
process.exit(0);
