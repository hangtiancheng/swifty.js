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

import { copyFileSync, cpSync } from "node:fs";
import { defineConfig } from "tsup";

// tsup runs array configs in parallel via Promise.all — a single config's
// onSuccess fires before other configs' DTS generation finishes.
// Defer the copy to process exit so all builds are fully complete.
(() => {
  process.on("exit", () => {
    copyFileSync("src/client.d.ts", "dist/client.d.ts");
    cpSync("../../.agents/skills/swifty-react-signal", "skills/swifty-react-signal", {
      errorOnExist: false,
      force: true,
      recursive: true,
    });
  });
})();

export default defineConfig([
  {
    entry: ["src/index.ts"],
    clean: true,
    dts: {
      // Inline only signals-core types; keep `preact` as an external import —
      // dts flatteners mangle its namespace-heavy JSX types (see dom-types.ts).
      resolve: ["@preact/signals-core"],
    },
    format: ["esm", "cjs"],
    minify: false,
    noExternal: [],
    sourcemap: false,
    tsconfig: "./tsconfig.build.json",
  },
  {
    // Webpack / Vite plugin entries — each needs __filename shim to
    // resolve to its own file (not a shared chunk) for the SwiftyReactSignalPlugin to
    // locate the loader at runtime. splitting: false ensures each ESM entry
    // is a single self-contained file with no shared chunk extraction.
    entry: ["src/webpack.ts", "src/vite.ts"],
    dts: true,
    format: ["esm", "cjs"],
    minify: false,
    noExternal: [],
    shims: true,
    splitting: false,
    sourcemap: false,
    tsconfig: "./tsconfig.build.json",
  },
  {
    // JSX automatic runtime — imported by compiled JSX modules
    // (jsxImportSource: "@swifty.js/react-signal"). Pure VNode factories with zero
    // framework imports, kept tiny so the runtime doesn't drag the whole
    // framework into consumer chunks.
    entry: ["src/jsx-runtime.ts", "src/jsx-dev-runtime.ts"],
    dts: true,
    format: ["esm", "cjs"],
    minify: false,
    noExternal: [],
    sourcemap: false,
    tsconfig: "./tsconfig.build.json",
  },
]);
