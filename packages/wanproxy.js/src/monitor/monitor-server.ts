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

import { createServer, type Server } from "node:http";

import type { MonitorConfig } from "../config/monitor-config.js";
import type { BoundAddress } from "../proxy/proxy-status.js";
import { closeServer } from "../proxy/socket-utils.js";
import type { MonitorStatusProvider } from "./monitor-status.js";

export class MonitorServer {
	private readonly server: Server;

	public constructor(
		private readonly config: MonitorConfig,
		private readonly statusProvider: MonitorStatusProvider,
	) {
		this.server = createServer((request, response) => {
			if (request.method !== "GET" || request.url !== "/status") {
				response.writeHead(404, { "content-type": "application/json" });
				response.end(JSON.stringify({ error: "not found" }));
				return;
			}
			response.writeHead(200, { "content-type": "application/json" });
			response.end(JSON.stringify(this.statusProvider()));
		});
	}

	public get address(): BoundAddress {
		const address = this.server.address();
		if (address === null || typeof address === "string") {
			throw new Error("monitor server is not listening on a TCP address");
		}
		return { address: address.address, port: address.port };
	}

	public async start(): Promise<void> {
		await new Promise<void>((resolve) => {
			this.server.listen(
				this.config.listen.port,
				this.config.listen.host,
				resolve,
			);
		});
	}

	public async stop(): Promise<void> {
		await closeServer(this.server);
	}
}
