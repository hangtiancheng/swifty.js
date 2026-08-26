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

import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
	hashFile,
	parseLargeFileHarnessOptions,
	verifyXCodecFile,
} from "@/validation/index.js";

async function withTempDirectory<T>(
	run: (directory: string) => Promise<T>,
): Promise<T> {
	const directory = await mkdtemp(join(tmpdir(), "large-file-harness-"));
	try {
		return await run(directory);
	} finally {
		await rm(directory, { force: true, recursive: true });
	}
}

describe("large-file harness", () => {
	it("parses CLI flags and environment defaults", () => {
		const options = parseLargeFileHarnessOptions(
			[
				"--size-gb=2",
				"--file=fixture.bin",
				"--force",
				"--skip-build",
				"--workers=2",
				"--chunk-mib=8",
				"--cache-segments=32",
				"--json",
			],
			{},
			"/project",
		);

		expect(options).toEqual({
			cacheSegments: 32,
			chunkMiB: 8,
			file: "fixture.bin",
			force: true,
			json: true,
			projectRoot: "/project",
			sizeGB: 2,
			skipBuild: true,
			workers: 2,
		});
	});

	it("rejects unknown and invalid harness options", () => {
		expect(() =>
			parseLargeFileHarnessOptions(["--bad"], {}, "/project"),
		).toThrow("unknown argument");
		expect(() =>
			parseLargeFileHarnessOptions(["--size-gb=0"], {}, "/project"),
		).toThrow();
	});

	it("hashes and verifies an XCodec file roundtrip without loading it all", async () => {
		await withTempDirectory(async (directory) => {
			const file = join(directory, "payload.bin");
			const repeated = Buffer.alloc(4096, 0xa5);
			await writeFile(
				file,
				Buffer.concat([Buffer.from("prefix"), repeated, Buffer.from("tail")]),
			);

			const originalHash = await hashFile(file);
			const result = await verifyXCodecFile(file, 8);

			expect(result).toEqual({
				decodedSha256: originalHash,
				originalSha256: originalHash,
				verified: true,
			});
		});
	});
});
