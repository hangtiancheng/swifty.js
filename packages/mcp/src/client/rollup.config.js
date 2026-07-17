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

import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import postcss from "rollup-plugin-postcss";
import replace from "@rollup/plugin-replace";
import babel from "@rollup/plugin-babel";
import json from "@rollup/plugin-json";

/**
 * Alias react/react-dom to @swifty.js/preact/compat so that third-party
 * libraries (react-i18next, lucide-react, etc.) share the same Preact runtime.
 */
function aliasReact() {
  return {
    name: "alias-react",
    resolveId(source) {
      if (source === "react" || source === "react-dom") {
        return this.resolve("@swifty.js/preact/compat", undefined, {
          skipSelf: true,
        });
      }
      if (
        source === "react/jsx-runtime" ||
        source === "react/jsx-dev-runtime"
      ) {
        return this.resolve("@swifty.js/preact/jsx-runtime", undefined, {
          skipSelf: true,
        });
      }
    },
  };
}

export default defineConfig({
  input: "src/index.tsx",
  output: {
    file: "dist/bundle.js",
    format: "es",
    sourcemap: true,
  },
  plugins: [
    aliasReact(),
    replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development",
      ),
    }),
    json(),
    resolve({
      browser: true,
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    }),
    commonjs(),
    babel({
      babelHelpers: "bundled",
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      presets: [
        "@babel/preset-typescript",
        [
          "@babel/preset-react",
          {
            runtime: "automatic",
            importSource: "@swifty.js/preact",
          },
        ],
      ],
    }),
    typescript({
      tsconfig: "./tsconfig.json",
      jsx: "react-jsx",
    }),
    postcss({
      extract: true,
      minimize: true,
    }),
  ],
});
