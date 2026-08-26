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

import type { CodecConfig } from "../config/codec-config.js";
import type { PipelineRuntimeDeps } from "../pipeline/pipeline-builder.js";
import { buildCodecPipeline } from "../pipeline/pipeline-builder.js";
import { proxyPipelineOptions } from "./pipeline-options.js";
import { createRelayCloseController } from "./relay-close.js";
import type { RelayResult } from "./relay-result.js";

export function relayTcpSockets(
	local: Socket,
	upstream: Socket,
	codec: CodecConfig,
	deps: PipelineRuntimeDeps = {},
): RelayResult {
	const send = buildCodecPipeline(
		proxyPipelineOptions(codec, "send"),
		deps,
	).transforms;
	const receive = buildCodecPipeline(
		proxyPipelineOptions(codec, "receive"),
		deps,
	).transforms;
	const streams = [...send, ...receive];
	const destroy = () => destroyAll(local, upstream, streams);
	const close = createRelayCloseController(local, upstream, streams, destroy);

	pipeChain(local, send, upstream);
	pipeChain(upstream, receive, local);

	return {
		closed: close.closed,
		stop: () => {
			destroy();
			close.resolve();
		},
	};
}

function pipeChain(
	source: Socket,
	transforms: readonly Transform[],
	destination: Socket,
): void {
	let current: NodeJS.ReadableStream = source;
	for (const transform of transforms) {
		current = current.pipe(transform);
	}
	current.pipe(destination, { end: false });
	current.once("end", () => destination.end());
}

function destroyAll(
	local: Socket,
	upstream: Socket,
	transforms: readonly Transform[],
): void {
	local.destroy();
	upstream.destroy();
	for (const transform of transforms) {
		transform.destroy();
	}
}
