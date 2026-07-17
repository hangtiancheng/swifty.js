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
