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

import {
	mkdirSync,
	readdirSync,
	readFileSync,
	renameSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { z } from "zod";

import { XCODEC_SEGMENT_LENGTH } from "./constants.js";
import { XCodecHash } from "./hash.js";
import { MemoryCache, type MemoryCacheOptions } from "./memory-cache.js";
import { decodeUint64BE, formatUint64Hex } from "./uint64.js";

export const PersistentCacheOptionsSchema = z.object({
	directory: z.string().min(1),
	maxSegments: z.number().int().positive().optional(),
});

export type PersistentCacheOptions = z.infer<
	typeof PersistentCacheOptionsSchema
>;

const CacheFileNameSchema = z.string().regex(/^[0-9a-f]{16}\.xcs$/);

export class PersistentXCodecCache extends MemoryCache {
	private constructor(private readonly options: PersistentCacheOptions) {
		super(memoryOptions(options));
	}

	public static open(input: unknown): PersistentXCodecCache {
		const options = PersistentCacheOptionsSchema.parse(input);
		mkdirSync(options.directory, { recursive: true });
		const cache = new PersistentXCodecCache(options);
		cache.warmLoad();
		return cache;
	}

	public override enter(hash: bigint, segment: Uint8Array): void {
		this.writeSegment(hash, segment);
		super.enter(hash, segment);
	}

	public override replace(hash: bigint, segment: Uint8Array): void {
		this.writeSegment(hash, segment);
		super.replace(hash, segment);
	}

	private warmLoad(): void {
		for (const name of readdirSync(this.options.directory)) {
			const parsed = CacheFileNameSchema.safeParse(name);
			if (!parsed.success) {
				continue;
			}
			this.loadCacheFile(parsed.data);
		}
	}

	private loadCacheFile(name: string): void {
		const path = join(this.options.directory, name);
		const bytes = readFileSync(path);
		const segment = validatePersistedSegment(name, bytes);
		if (segment === undefined) {
			unlinkSync(path);
			return;
		}
		const hash = decodeUint64BE(Buffer.from(name.slice(0, 16), "hex"));
		if (!this.has(hash)) {
			super.enter(hash, segment);
		}
	}

	private writeSegment(hash: bigint, segment: Uint8Array): void {
		if (segment.length !== XCODEC_SEGMENT_LENGTH) {
			throw new RangeError("cache segment must be exactly 2048 bytes");
		}
		const path = this.segmentPath(hash);
		const tempPath = `${path}.tmp`;
		writeFileSync(tempPath, segment);
		renameSync(tempPath, path);
	}

	private segmentPath(hash: bigint): string {
		return join(this.options.directory, `${formatUint64Hex(hash)}.xcs`);
	}
}

function memoryOptions(options: PersistentCacheOptions): MemoryCacheOptions {
	return options.maxSegments === undefined
		? {}
		: { maxSegments: options.maxSegments };
}

function validatePersistedSegment(
	name: string,
	bytes: Uint8Array,
): Uint8Array | undefined {
	if (bytes.length !== XCODEC_SEGMENT_LENGTH) {
		return undefined;
	}
	const expected = decodeUint64BE(Buffer.from(name.slice(0, 16), "hex"));
	const actual = XCodecHash.hashSegment(bytes);
	if (actual !== expected) {
		return undefined;
	}
	return Uint8Array.from(bytes);
}
