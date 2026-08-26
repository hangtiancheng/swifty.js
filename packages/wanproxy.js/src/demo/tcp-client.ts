#!/usr/bin/env node
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

import { connect } from "node:net";
import { stderr } from "node:process";

import { parseTcpClientArgs } from "./demo-options.js";

async function main(): Promise<void> {
	const { host, message, port } = parseTcpClientArgs(process.argv);
	const socket = connect(port, host);
	const chunks: Buffer[] = [];

	socket.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));

	await waitForSocketEvent(socket, "connect");
	socket.end(Buffer.from(message));
	await waitForSocketEvent(socket, "end");

	console.log(Buffer.concat(chunks).toString("utf8"));
}

main().catch((error: unknown) => {
	const message =
		error instanceof Error ? error.message : "unknown TCP client error";
	stderr.write(`${message}\n`);
	process.exit(1);
});

function waitForSocketEvent(
	socket: NodeJS.EventEmitter,
	event: string,
): Promise<void> {
	return new Promise((resolve, reject) => {
		const cleanup = (): void => {
			socket.off(event, onEvent);
			socket.off("error", onError);
		};
		const onEvent = (): void => {
			cleanup();
			resolve();
		};
		const onError = (error: Error): void => {
			cleanup();
			reject(error);
		};
		socket.once(event, onEvent);
		socket.once("error", onError);
	});
}
