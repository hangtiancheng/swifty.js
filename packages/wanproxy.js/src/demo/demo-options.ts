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

const PortStringSchema = z
	.string()
	.regex(/^[0-9]+$/)
	.transform((value) => Number(value))
	.pipe(z.number().int().min(1).max(65_535));

const HostSchema = z.string().min(1);
const MessageSchema = z.string().min(1);

const EchoServerArgsSchema = z.object({
	host: HostSchema,
	port: PortStringSchema,
});

const TcpClientArgsSchema = z.object({
	host: HostSchema,
	message: MessageSchema,
	port: PortStringSchema,
});

const SocksClientArgsSchema = z.object({
	message: MessageSchema,
	proxyPort: PortStringSchema,
	targetPort: PortStringSchema,
});

export type EchoServerArgs = z.infer<typeof EchoServerArgsSchema>;
export type SocksClientArgs = z.infer<typeof SocksClientArgsSchema>;
export type TcpClientArgs = z.infer<typeof TcpClientArgsSchema>;

export function parseEchoServerArgs(argv: readonly string[]): EchoServerArgs {
	return EchoServerArgsSchema.parse({
		host: argv[3] ?? "127.0.0.1",
		port: argv[2] ?? "8301",
	});
}

export function parseTcpClientArgs(argv: readonly string[]): TcpClientArgs {
	return TcpClientArgsSchema.parse({
		host: argv[3] ?? "127.0.0.1",
		message: argv[4] ?? "hello from wanproxy-js",
		port: argv[2] ?? "8300",
	});
}

export function parseSocksClientArgs(argv: readonly string[]): SocksClientArgs {
	return SocksClientArgsSchema.parse({
		message: argv[4] ?? "hello through socks",
		proxyPort: argv[2] ?? "8320",
		targetPort: argv[3] ?? "8301",
	});
}
