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

import type { Writable } from "node:stream";

import { loadWanproxyConfig } from "../config/config-file.js";
import { ProxyFleet } from "../proxy/proxy-fleet.js";
import { parseProxyCliArgs } from "./proxy-cli-args.js";

export async function startConfiguredProxy(
	argv: readonly string[] = process.argv,
	output: Writable = process.stdout,
): Promise<ProxyFleet> {
	const args = parseProxyCliArgs(argv);
	const config = await loadWanproxyConfig(args.configPath);
	const fleet = new ProxyFleet(config);
	await fleet.start();

	for (const address of fleet.addresses()) {
		output.write(`proxy listening on ${address.address}:${address.port}\n`);
	}
	const monitorAddress = fleet.monitorAddress();
	if (monitorAddress !== undefined) {
		output.write(
			`monitor listening on ${monitorAddress.address}:${monitorAddress.port}\n`,
		);
	}

	return fleet;
}

export function formatProxyCliError(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	return "unknown proxy CLI error";
}
