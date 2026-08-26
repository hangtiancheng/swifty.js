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

export class ReferenceRetention {
	private readonly frames: ReadonlyMap<bigint, Uint8Array>[] = [];

	public get size(): number {
		return this.frames.length;
	}

	public push(frame: ReadonlyMap<bigint, Uint8Array>): void {
		this.frames.push(frame);
	}

	public advance(count: number): void {
		if (!Number.isInteger(count) || count < 1 || count > this.frames.length) {
			throw new Error("invalid frame advance count");
		}
		this.frames.splice(0, count);
	}

	public learn(hashes: readonly bigint[]): readonly Uint8Array[] {
		const segments: Uint8Array[] = [];
		for (const hash of hashes) {
			const segment = this.find(hash);
			if (segment === undefined) {
				throw new Error("hash in ASK could not be found");
			}
			segments.push(segment);
		}
		return segments;
	}

	private find(hash: bigint): Uint8Array | undefined {
		for (const frame of this.frames) {
			const segment = frame.get(hash);
			if (segment !== undefined) {
				return segment.slice();
			}
		}
		return undefined;
	}
}
