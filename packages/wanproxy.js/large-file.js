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

import { spawnSync } from "node:child_process";
import { cwd, exit } from "node:process";

const projectRoot = import.meta.dirname;

async function main() {
	if (!shouldSkipBuild(process.argv.slice(2), process.env)) {
		ensureBuilt();
	}
	const { parseLargeFileHarnessOptions, runLargeFileHarness } = await import(
		"./dist/validation/index.js"
	);
	const options = parseLargeFileHarnessOptions(
		process.argv.slice(2),
		process.env,
		projectRoot,
	);
	await runLargeFileHarness(options);
}

function ensureBuilt() {
	const result = spawnSync("pnpm", ["build"], {
		cwd: projectRoot,
		stdio: "inherit",
	});
	if (result.status !== 0) {
		throw new Error("pnpm build failed");
	}
}

function shouldSkipBuild(argv, env) {
	return argv.includes("--skip-build") || env.LARGE_FILE_SKIP_BUILD === "1";
}

main().catch((error) => {
	console.error(
		error instanceof Error
			? error.message
			: "unknown large-file verification error",
	);
	console.error(`working directory: ${cwd()}`);
	exit(1);
});
