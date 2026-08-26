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

import { CodecConfigSchema } from "./codec-config.js";
import { MonitorConfigSchema } from "./monitor-config.js";
import { NetworkEndpointSchema } from "./network-endpoint.js";

export const TcpProxyConfigSchema = z.object({
	codec: CodecConfigSchema.default({ mode: "none", role: "incoming" }),
	listen: NetworkEndpointSchema,
	name: z.string().min(1),
	upstream: NetworkEndpointSchema,
});

export const SocksProxyConfigSchema = z.object({
	listen: NetworkEndpointSchema,
	name: z.string().min(1),
});

export const WanproxyConfigSchema = z
	.object({
		monitor: MonitorConfigSchema.optional(),
		proxies: z.array(TcpProxyConfigSchema).optional(),
		socksProxies: z.array(SocksProxyConfigSchema).optional(),
	})
	.refine(
		(config) =>
			(config.proxies?.length ?? 0) + (config.socksProxies?.length ?? 0) > 0,
		{
			message: "at least one proxy or SOCKS proxy is required",
		},
	);

export type SocksProxyConfig = z.infer<typeof SocksProxyConfigSchema>;
export type TcpProxyConfig = z.infer<typeof TcpProxyConfigSchema>;
export type WanproxyConfig = z.infer<typeof WanproxyConfigSchema>;

export function parseWanproxyConfig(input: unknown): WanproxyConfig {
	return WanproxyConfigSchema.parse(input);
}
