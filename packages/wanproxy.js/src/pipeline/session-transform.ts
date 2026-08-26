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

import { Transform, type TransformCallback } from "node:stream";

import {
	CodecSession,
	type CodecSessionOptions,
} from "../pipe-protocol/codec-session.js";
import { parseStreamChunk } from "./stream-chunk.js";

export type SessionTransformMode = "encode" | "decode";

export function createSessionEncodeTransform(
	session = new CodecSession(),
): Transform {
	return new SessionEncodeTransform(session);
}

export function createSessionDecodeTransform(
	session = new CodecSession(),
): Transform {
	return new SessionDecodeTransform(session);
}

export function createSessionPair(options: CodecSessionOptions = {}): {
	readonly encode: Transform;
	readonly decode: Transform;
} {
	const encodeSession = new CodecSession(options);
	const decodeSession = new CodecSession(options);
	return {
		decode: new SessionDecodeTransform(decodeSession),
		encode: new SessionEncodeTransform(encodeSession),
	};
}

class SessionEncodeTransform extends Transform {
	public constructor(private readonly session: CodecSession) {
		super();
	}

	public override _transform(
		chunk: unknown,
		_encoding: BufferEncoding,
		callback: TransformCallback,
	): void {
		try {
			const encoded = this.session.encodeData(parseStreamChunk(chunk));
			if (encoded.length > 0) {
				this.push(Buffer.from(encoded));
			}
			callback();
		} catch (error) {
			callback(toError(error));
		}
	}

	public override _flush(callback: TransformCallback): void {
		try {
			this.push(Buffer.from(this.session.closeWrite()));
			callback();
		} catch (error) {
			callback(toError(error));
		}
	}
}

class SessionDecodeTransform extends Transform {
	public constructor(private readonly session: CodecSession) {
		super();
	}

	public override _transform(
		chunk: unknown,
		_encoding: BufferEncoding,
		callback: TransformCallback,
	): void {
		try {
			const decoded = this.session.receive(parseStreamChunk(chunk));
			if (decoded.status === "invalid") {
				callback(new Error(decoded.reason));
				return;
			}
			if (decoded.output.length > 0) {
				this.push(Buffer.from(decoded.output));
			}
			callback();
		} catch (error) {
			callback(toError(error));
		}
	}
}

function toError(error: unknown): Error {
	return error instanceof Error
		? error
		: new Error("unknown session transform error");
}
