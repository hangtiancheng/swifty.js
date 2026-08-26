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

import { defineConfig } from "tsup";

export default defineConfig({
	clean: true,
	dts: {
		compilerOptions: {
			declarationMap: false,
		},
	},
	entry: {
		"cli/index": "src/cli/index.ts",
		"demo/echo-server": "src/demo/echo-server.ts",
		"demo/socks5-client": "src/demo/socks5-client.ts",
		"demo/tcp-client": "src/demo/tcp-client.ts",
		index: "src/index.ts",
	},
	external: ["zod"],
	format: ["esm", "cjs"],
	outExtension: ({ format }) => ({
		js: format === "cjs" ? ".cjs" : ".js",
	}),
	outDir: "dist-tsup",
	platform: "node",
	sourcemap: false,
	splitting: true,
	target: "node20",
	tsconfig: "tsconfig.json",
});
