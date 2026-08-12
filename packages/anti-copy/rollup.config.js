// @ts-check

import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import alias from "@rollup/plugin-alias";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import { dts } from "rollup-plugin-dts";

const srcDir = fileURLToPath(new URL("src", import.meta.url));
const distDir = fileURLToPath(new URL("dist", import.meta.url));

/**
 * Removes stale dist artifacts before the first build config writes output.
 * Only used in the JS config — the dts config runs second and must not wipe
 * the freshly-built JS bundles.
 */
function cleanDist() {
  return {
    name: "clean-dist",
    buildStart() {
      rmSync(distDir, { recursive: true, force: true });
    },
  };
}

/** @type {import("rollup").InputOption} */
const input = {
  index: "src/core/index.ts",
  vitepress: "src/vitepress.ts",
  "swifty-docs": "src/swifty-docs.ts",
  "lark-mvc": "src/lark-mvc.ts",
  "lark-docs": "src/lark-docs.ts",
  rspress: "src/rspress.ts",
};

/** @type {import("rollup").ExternalOption} */
const external = [
  /^react(\/|$)/,
  /^vue(\/|$)/,
  /^vitepress(\/|$)/,
  /^@rspress\//,
  /^@lark\.js\//,
  /^@swifty\.js\//,
];

/** @type {import("rollup").RollupOptions[]} */
export default [
  {
    input,
    external,
    plugins: [
      cleanDist(),
      alias({
        entries: [{ find: "@", replacement: srcDir }],
      }),
      typescript({ tsconfig: "./tsconfig.build.json" }),
      terser(),
    ],
    output: [
      {
        dir: "dist",
        format: "es",
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
        sourcemap: false,
      },
      {
        dir: "dist",
        format: "cjs",
        entryFileNames: "[name].cjs",
        chunkFileNames: "chunks/[name]-[hash].cjs",
        exports: "named",
        sourcemap: false,
      },
    ],
  },
  {
    input,
    external,
    plugins: [dts({ tsconfig: "./tsconfig.build.json" })],
    output: {
      dir: "dist",
      format: "es",
      entryFileNames: "[name].d.ts",
      chunkFileNames: "chunks/[name]-[hash].d.ts",
    },
  },
];
