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

export const PipelineRoleSchema = z.enum(["incoming", "outgoing"]);
export const PipelineDirectionSchema = z.enum(["receive", "send"]);
export const PipelineModeSchema = z.enum([
	"none",
	"zlib",
	"xcodec",
	"zlib-xcodec",
]);

export const PipelineOptionsSchema = z.object({
	compressorLevel: z.number().int().min(-1).max(9).optional(),
	direction: PipelineDirectionSchema,
	mode: PipelineModeSchema,
	role: PipelineRoleSchema.optional(),
});

export type PipelineOptions = z.infer<typeof PipelineOptionsSchema>;
export type PipelineDirection = z.infer<typeof PipelineDirectionSchema>;
export type PipelineMode = z.infer<typeof PipelineModeSchema>;
export type PipelineRole = z.infer<typeof PipelineRoleSchema>;
