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

import type { WanproxyConfig } from "../config/proxy-config.js";
import { MonitorServer } from "../monitor/monitor-server.js";
import type { BoundAddress, FleetStatus, ProxyStatus } from "./proxy-status.js";
import { SocksProxyServer } from "./socks-proxy.js";
import { TcpProxyServer } from "./tcp-proxy.js";

export class ProxyFleet {
	private readonly monitor: MonitorServer | undefined;
	private readonly servers: readonly FleetServer[];

	public constructor(config: WanproxyConfig) {
		this.servers = [
			...(config.proxies ?? []).map((proxy) => new TcpProxyServer(proxy)),
			...(config.socksProxies ?? []).map(
				(proxy) => new SocksProxyServer(proxy),
			),
		];
		this.monitor =
			config.monitor === undefined
				? undefined
				: new MonitorServer(config.monitor, () => this.status());
	}

	public async start(): Promise<void> {
		await Promise.all(this.servers.map((server) => server.start()));
		await this.monitor?.start();
	}

	public async stop(): Promise<void> {
		await this.monitor?.stop();
		await Promise.all(this.servers.map((server) => server.stop()));
	}

	public addresses(): readonly {
		readonly address: string;
		readonly port: number;
	}[] {
		return this.servers.map((server) => server.address);
	}

	public monitorAddress(): BoundAddress | undefined {
		return this.monitor?.address;
	}

	public status(): FleetStatus {
		return {
			generatedAt: new Date().toISOString(),
			proxies: this.servers.map((server): ProxyStatus => server.status()),
		};
	}
}

type FleetServer = TcpProxyServer | SocksProxyServer;
