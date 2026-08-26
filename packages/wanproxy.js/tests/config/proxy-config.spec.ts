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

import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
	formatEndpoint,
	loadWanproxyConfig,
	parseWanproxyConfig,
} from "@/config/index.js";

describe("WANProxy zod config", () => {
	it("parses TCP proxy config and applies codec defaults", () => {
		const config = parseWanproxyConfig({
			proxies: [
				{
					listen: { host: "127.0.0.1", port: 0 },
					name: "proxy-a",
					upstream: { host: "127.0.0.1", port: 9000 },
				},
			],
		});

		const firstProxy = config.proxies?.at(0);
		if (firstProxy === undefined) {
			throw new Error("expected parsed proxy");
		}
		expect(firstProxy).toEqual({
			codec: { mode: "none", role: "incoming" },
			listen: { host: "127.0.0.1", port: 0 },
			name: "proxy-a",
			upstream: { host: "127.0.0.1", port: 9000 },
		});
		expect(formatEndpoint(firstProxy.listen)).toBe("127.0.0.1:0");
	});

	it("rejects invalid ports, empty proxy lists, and invalid codec modes", () => {
		expect(() => parseWanproxyConfig({ proxies: [] })).toThrow();
		expect(() =>
			parseWanproxyConfig({
				proxies: [
					{
						codec: { mode: "bad" },
						listen: { host: "127.0.0.1", port: 70000 },
						name: "bad-proxy",
						upstream: { host: "127.0.0.1", port: 1 },
					},
				],
			}),
		).toThrow();
	});

	it("parses SOCKS proxy config without requiring TCP proxies", () => {
		expect(
			parseWanproxyConfig({
				monitor: { listen: { host: "127.0.0.1", port: 0 } },
				socksProxies: [
					{ listen: { host: "127.0.0.1", port: 0 }, name: "socks-a" },
				],
			}),
		).toEqual({
			monitor: { listen: { host: "127.0.0.1", port: 0 } },
			socksProxies: [
				{ listen: { host: "127.0.0.1", port: 0 }, name: "socks-a" },
			],
		});
	});

	it("loads config from a JSON file", async () => {
		const directory = await mkdtemp(join(tmpdir(), "wanproxy-config-"));
		const path = join(directory, "config.json");
		try {
			await writeFile(
				path,
				JSON.stringify({
					proxies: [
						{
							codec: { compressorLevel: 6, mode: "zlib", role: "incoming" },
							listen: { host: "127.0.0.1", port: 0 },
							name: "proxy-file",
							upstream: { host: "127.0.0.1", port: 8000 },
						},
					],
				}),
			);

			await expect(loadWanproxyConfig(path)).resolves.toEqual({
				proxies: [
					{
						codec: { compressorLevel: 6, mode: "zlib", role: "incoming" },
						listen: { host: "127.0.0.1", port: 0 },
						name: "proxy-file",
						upstream: { host: "127.0.0.1", port: 8000 },
					},
				],
			});
		} finally {
			await rm(directory, { force: true, recursive: true });
		}
	});
});
