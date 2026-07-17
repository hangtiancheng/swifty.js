/**
 * Copyright 2026 hangtiancheng
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: {
    "core/index": "src/core/index.ts",
    "esbuild/index": "src/esbuild/index.ts",
    "rollup/index": "src/rollup/index.ts",
    "rsbuild/index": "src/rsbuild/index.ts",
    "vite/index": "src/vite/index.ts",
    "webpack/index": "src/webpack/index.ts",
    "webpack/loader": "src/webpack/loader.ts",
  },
  output: [
    {
      dir: "dist",
      format: "cjs",
      entryFileNames: "[name].cjs",
      sourcemap: true,
      exports: "auto",
    },
    {
      dir: "dist",
      format: "es",
      entryFileNames: "[name].js",
      sourcemap: true,
    },
  ],
  external: [
    "magic-string",
    "picomatch",
    "@rsbuild/core",
    "esbuild",
    "rollup",
    "vite",
    "webpack",
    "path",
    "url",
    "fs",
  ],
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
      declarationDir: "dist",
      rootDir: "src",
    }),
  ],
};
