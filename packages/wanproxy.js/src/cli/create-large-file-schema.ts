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

import { z } from "zod";

export const GIB = 1024 ** 3;
export const MIB = 1024 ** 2;
export const DEFAULT_CHUNK_BYTES = 4 * MIB;
export const DEFAULT_MAX_WORKERS = 8;

export const CreateRandomFileOptionsSchema = z.object({
	chunkBytes: z.number().int().positive().optional(),
	output: z.string().min(1),
	sizeGB: z.number().int().positive(),
	workers: z.number().int().positive().optional(),
});

export const WorkerPayloadSchema = z.object({
	chunkBytes: z.number().int().positive(),
	end: z.number().int().nonnegative(),
	path: z.string().min(1),
	start: z.number().int().nonnegative(),
});

export const WorkerDoneMessageSchema = z.object({
	end: z.number().int().nonnegative(),
	start: z.number().int().nonnegative(),
	written: z.number().int().nonnegative(),
});

export type CreateRandomFileOptions = z.infer<
	typeof CreateRandomFileOptionsSchema
>;
export type WorkerDoneMessage = z.infer<typeof WorkerDoneMessageSchema>;
export type WorkerPayload = z.infer<typeof WorkerPayloadSchema>;

export interface CreateRandomFileResult {
	readonly bytes: number;
	readonly elapsedSec: number;
	readonly throughputGiBs: number;
}
