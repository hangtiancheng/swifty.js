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

import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import dts from "rollup-plugin-dts";

const external = [
  "@grpc/grpc-js",
  "@grpc/proto-loader",
  "etcd3",
  /^node:/,
  "fs",
  "path",
  "url",
  "os",
  "buffer",
  "crypto",
  "events",
  "stream",
  "util",
];

export default defineConfig([
  {
    input: "src/index.ts",
    output: {
      dir: "dist",
      format: "esm",
      preserveModules: true,
      preserveModulesRoot: "src",
      entryFileNames: "[name].mjs",
      chunkFileNames: "[name]-[hash].mjs",
      sourcemap: false,
      generatedCode: { constBindings: true },
    },
    external,
    plugins: [
      resolve({ preferBuiltins: true }),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.build.json",
        sourceMap: false,
        inlineSources: false,
      }),
      copy({
        targets: [{ src: "src/proto/*.proto", dest: "dist/proto" }],
      }),
    ],
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.d.ts",
      format: "esm",
    },
    plugins: [
      dts({
        tsconfig: "./tsconfig.build.json",
      }),
    ],
  },
]);
