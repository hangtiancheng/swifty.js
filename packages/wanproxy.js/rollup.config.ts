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

import { builtinModules } from "node:module";
import typescript from "@rollup/plugin-typescript";
import type { RollupOptions } from "rollup";

const entries = {
	index: "src/index.ts",
	"cli/index": "src/cli/index.ts",
	"demo/echo-server": "src/demo/echo-server.ts",
	"demo/socks5-client": "src/demo/socks5-client.ts",
	"demo/tcp-client": "src/demo/tcp-client.ts",
};

const external = new Set([
	...builtinModules,
	...builtinModules.map((moduleName) => `node:${moduleName}`),
	"zod",
]);

const config: RollupOptions = {
	external: (moduleId: string) => external.has(moduleId),
	input: entries,
	output: [
		{
			chunkFileNames: "chunks/[name]-[hash].js",
			dir: "dist-rollup",
			entryFileNames: "[name].js",
			format: "esm",
			sourcemap: false,
		},
		{
			chunkFileNames: "chunks/[name]-[hash].cjs",
			dir: "dist-rollup",
			entryFileNames: "[name].cjs",
			exports: "named",
			format: "cjs",
			sourcemap: false,
		},
	],
	plugins: [
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		typescript({
			compilerOptions: {
				declaration: true,
				declarationDir: "dist-rollup",
				declarationMap: false,
				outDir: "dist-rollup",
				rootDir: "src",
				sourceMap: false,
			},
			tsconfig: "./tsconfig.json",
		}),
	],
};

export default config;
