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

import type { Socket } from "node:net";
import type { Transform } from "node:stream";

export interface RelayCloseController {
	readonly closed: Promise<void>;
	readonly resolve: () => void;
}

export function createRelayCloseController(
	local: Socket,
	upstream: Socket,
	transforms: readonly Transform[],
	destroy: () => void,
): RelayCloseController {
	let resolveClosed: () => void = () => undefined;
	let rejectClosed: (error: Error) => void = () => undefined;
	const closed = new Promise<void>((resolve, reject) => {
		resolveClosed = resolve;
		rejectClosed = reject;
	});

	let remaining = 2;
	const markClosed = () => {
		remaining -= 1;
		if (remaining === 0) {
			resolveClosed();
		}
	};
	const rejectOnce = (error: Error) => {
		destroy();
		rejectClosed(error);
	};

	local.once("close", markClosed);
	upstream.once("close", markClosed);
	for (const stream of [local, upstream, ...transforms]) {
		stream.once("error", rejectOnce);
	}

	return { closed, resolve: resolveClosed };
}
