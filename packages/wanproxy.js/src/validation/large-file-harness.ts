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

import { stat } from "node:fs/promises";
import { resolve } from "node:path";

import { createRandomFile } from "../cli/create-large-file.js";
import { GIB, MIB } from "../cli/create-large-file-schema.js";
import type { LargeFileHarnessOptions } from "./large-file-options.js";
import { verifyXCodecFile } from "./xcodec-file-verifier.js";

export interface LargeFileHarnessResult {
	readonly bytes: number;
	readonly decodedSha256: string;
	readonly file: string;
	readonly originalSha256: string;
	readonly sizeGB: number;
	readonly verified: true;
}

export async function runLargeFileHarness(
	options: LargeFileHarnessOptions,
	output: NodeJS.WritableStream = process.stdout,
): Promise<LargeFileHarnessResult> {
	const file = resolve(options.projectRoot, options.file);
	const expectedBytes = options.sizeGB * GIB;
	await ensureLargeFile(options, file, expectedBytes, output);
	const verification = await verifyXCodecFile(file, options.cacheSegments);
	if (!verification.verified) {
		throw new Error("XCodec roundtrip hash mismatch");
	}
	const result = {
		bytes: expectedBytes,
		decodedSha256: verification.decodedSha256,
		file,
		originalSha256: verification.originalSha256,
		sizeGB: options.sizeGB,
		verified: true,
	} as const;
	reportSuccess(options, result, output);
	return result;
}

async function ensureLargeFile(
	options: LargeFileHarnessOptions,
	file: string,
	expectedBytes: number,
	output: NodeJS.WritableStream,
): Promise<void> {
	const existingSize = await getExistingSize(file);
	if (existingSize === expectedBytes && !options.force) {
		output.write(`reusing existing ${options.sizeGB} GiB file\n`);
		return;
	}
	output.write(
		`creating ${options.sizeGB} GiB file with src/cli/create-large-file.ts logic\n`,
	);
	const result = await createRandomFile(createFileOptions(options, file));
	output.write(
		`created ${(result.bytes / GIB).toFixed(2)} GiB in ${result.elapsedSec.toFixed(2)}s\n`,
	);
}

function createFileOptions(options: LargeFileHarnessOptions, output: string) {
	const fileOptions: {
		chunkBytes?: number;
		output: string;
		sizeGB: number;
		workers?: number;
	} = { output, sizeGB: options.sizeGB };
	if (options.chunkMiB !== undefined) {
		fileOptions.chunkBytes = options.chunkMiB * MIB;
	}
	if (options.workers !== undefined) {
		fileOptions.workers = options.workers;
	}
	return fileOptions;
}

async function getExistingSize(file: string): Promise<number | undefined> {
	try {
		return (await stat(file)).size;
	} catch {
		return undefined;
	}
}

function reportSuccess(
	options: LargeFileHarnessOptions,
	result: LargeFileHarnessResult,
	output: NodeJS.WritableStream,
): void {
	if (options.json) {
		output.write(`${JSON.stringify(result, undefined, 2)}\n`);
		return;
	}
	output.write(`file: ${result.file}\n`);
	output.write(`bytes: ${result.bytes}\n`);
	output.write(`original sha256: ${result.originalSha256}\n`);
	output.write(`decoded sha256:  ${result.decodedSha256}\n`);
	output.write("XCodec roundtrip verified\n");
}
