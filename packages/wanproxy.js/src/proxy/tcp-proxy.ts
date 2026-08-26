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

import { connect, createServer, type Server, type Socket } from "node:net";

import type { TcpProxyConfig } from "../config/proxy-config.js";
import type { PipelineRuntimeDeps } from "../pipeline/pipeline-builder.js";
import { MemoryCache } from "../xcodec/memory-cache.js";
import type { TcpProxyStatus } from "./proxy-status.js";
import { closeServer, listen } from "./socket-utils.js";
import { relayTcpSockets } from "./tcp-relay.js";

function needsXCodecCache(mode: string): boolean {
	return mode === "xcodec" || mode === "zlib-xcodec";
}

export class TcpProxyServer {
	private acceptedConnections = 0;
	private readonly connections = new Set<Socket>();
	private readonly deps: PipelineRuntimeDeps;
	private readonly server: Server;

	public constructor(private readonly config: TcpProxyConfig) {
		this.server = createServer({ allowHalfOpen: true }, (socket) =>
			this.accept(socket),
		);
		this.deps = needsXCodecCache(config.codec.mode)
			? { cache: new MemoryCache() }
			: {};
	}

	public get address(): { readonly address: string; readonly port: number } {
		const address = this.server.address();
		if (address === null || typeof address === "string") {
			throw new Error("TCP proxy server is not listening on a TCP address");
		}
		return { address: address.address, port: address.port };
	}

	public async start(): Promise<void> {
		await listen(this.server, this.config.listen);
	}

	public async stop(): Promise<void> {
		for (const socket of this.connections) {
			socket.destroy();
		}
		await closeServer(this.server);
	}

	public status(): TcpProxyStatus {
		const address = this.tryAddress();
		return address === undefined
			? this.baseStatus()
			: { ...this.baseStatus(), address };
	}

	private accept(local: Socket): void {
		this.acceptedConnections += 1;
		this.track(local);
		const upstream = connect({
			allowHalfOpen: true,
			host: this.config.upstream.host,
			port: this.config.upstream.port,
		});
		this.track(upstream);
		upstream.once("connect", () => {
			const relay = relayTcpSockets(
				local,
				upstream,
				this.config.codec,
				this.deps,
			);
			relay.closed
				.catch(() => undefined)
				.finally(() => {
					this.connections.delete(local);
					this.connections.delete(upstream);
				});
		});
		upstream.once("error", () => local.destroy());
	}

	private track(socket: Socket): void {
		this.connections.add(socket);
		socket.once("close", () => this.connections.delete(socket));
	}

	private baseStatus(): Omit<TcpProxyStatus, "address"> {
		return {
			acceptedConnections: this.acceptedConnections,
			activeSockets: this.connections.size,
			codec: this.config.codec,
			kind: "tcp",
			listen: this.config.listen,
			listening: this.server.listening,
			name: this.config.name,
			upstream: this.config.upstream,
		};
	}

	private tryAddress():
		| { readonly address: string; readonly port: number }
		| undefined {
		const address = this.server.address();
		if (address === null || typeof address === "string") {
			return undefined;
		}
		return { address: address.address, port: address.port };
	}
}
