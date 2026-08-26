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

import type { Transform } from "node:stream";

import { CodecSession } from "../pipe-protocol/codec-session.js";
import type { MemoryCache } from "../xcodec/memory-cache.js";
import { createPassThroughTransform } from "./pass-through-transform.js";
import {
	type PipelineOptions,
	PipelineOptionsSchema,
} from "./pipeline-options.js";
import {
	createSessionDecodeTransform,
	createSessionEncodeTransform,
} from "./session-transform.js";
import { createZlibTransform } from "./zlib-transform.js";

export interface PipelineRuntimeDeps {
	readonly cache?: MemoryCache;
}

export interface PipelineBuildResult {
	readonly steps: readonly string[];
	readonly transforms: readonly Transform[];
}

export function buildCodecPipeline(
	input: unknown,
	deps: PipelineRuntimeDeps = {},
): PipelineBuildResult {
	const options = PipelineOptionsSchema.parse(input);
	const steps = resolveSteps(options);
	const transforms = steps.map((step) => createStep(step, options, deps));
	return { steps, transforms };
}

export function resolvePipelineSteps(input: unknown): readonly string[] {
	return resolveSteps(PipelineOptionsSchema.parse(input));
}

function resolveSteps(options: PipelineOptions): readonly string[] {
	if (options.mode === "none") {
		return ["pass-through"];
	}
	if (options.mode === "zlib") {
		return [zlibStep(options.direction)];
	}
	if (options.mode === "xcodec") {
		return [xcodecStep(options.direction)];
	}
	return resolveZlibXcodecSteps(options);
}

function resolveZlibXcodecSteps(options: PipelineOptions): readonly string[] {
	const role = options.role ?? "incoming";
	if (role === "incoming") {
		return options.direction === "receive"
			? ["inflate", "xcodec-decode"]
			: ["xcodec-encode", "deflate"];
	}
	return options.direction === "receive"
		? ["xcodec-decode", "deflate"]
		: ["inflate", "xcodec-encode"];
}

function zlibStep(direction: PipelineOptions["direction"]): string {
	return direction === "receive" ? "inflate" : "deflate";
}

function xcodecStep(direction: PipelineOptions["direction"]): string {
	return direction === "receive" ? "xcodec-decode" : "xcodec-encode";
}

function createStep(
	step: string,
	options: PipelineOptions,
	deps: PipelineRuntimeDeps,
): Transform {
	switch (step) {
		case "pass-through":
			return createPassThroughTransform();
		case "inflate":
			return createZlibTransform("inflate", zlibOptions(options));
		case "deflate":
			return createZlibTransform("deflate", zlibOptions(options));
		case "xcodec-encode":
			return createSessionEncodeTransform(
				new CodecSession(deps.cache ? { cache: deps.cache } : {}),
			);
		case "xcodec-decode":
			return createSessionDecodeTransform(
				new CodecSession(deps.cache ? { cache: deps.cache } : {}),
			);
		default:
			throw new Error(`unsupported pipeline step ${step}`);
	}
}

function zlibOptions(options: PipelineOptions): { readonly level?: number } {
	return options.compressorLevel === undefined
		? {}
		: { level: options.compressorLevel };
}
