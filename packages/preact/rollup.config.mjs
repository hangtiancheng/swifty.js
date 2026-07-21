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

import esbuild from "rollup-plugin-esbuild";
import terser from "@rollup/plugin-terser";
import { readFileSync, writeFileSync } from "fs";

const mangleConfig = JSON.parse(readFileSync("./mangle.json", "utf-8"));

const propsMap = new Map();
for (const [key, value] of Object.entries(mangleConfig.props.props)) {
  propsMap.set(key.replace(/^\$/, ""), value);
}

const terserOptions = {
  compress: mangleConfig.minify.compress,
  mangle: {
    properties: {
      ...mangleConfig.minify.mangle.properties,
      cache: { props: propsMap },
    },
  },
};

const sanitize = (name) => name.replace(/\//g, "-");

export default {
  input: {
    preact: "src/index.js",
    hooks: "src/hooks/index.js",
    compat: "src/compat/internal/index.js",
    "jsx-runtime": "src/jsx-runtime/index.js",
    client: "src/compat/client.js",
    scheduler: "src/compat/scheduler.js",
  },
  output: {
    dir: "dist",
    format: "esm",
    entryFileNames: (chunk) => `${sanitize(chunk.name)}.mjs`,
    chunkFileNames: (chunk) => `${sanitize(chunk.name)}.mjs`,
  },
  plugins: [
    esbuild({ target: "es2017" }),
    terser(terserOptions),
    {
      name: "post-build-bridge",
      writeBundle() {
        const jsxBridge =
          'import "./compat.mjs";\nexport * from "./jsx-runtime.mjs";\n';
        writeFileSync("dist/compat-jsx-runtime.mjs", jsxBridge);
        writeFileSync("dist/compat-jsx-dev-runtime.mjs", jsxBridge);
      },
    },
  ],
};
