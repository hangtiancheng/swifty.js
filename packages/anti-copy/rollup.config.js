// @ts-check

import { fileURLToPath } from "node:url";
import alias from "@rollup/plugin-alias";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import { dts } from "rollup-plugin-dts";

const srcDir = fileURLToPath(new URL("src", import.meta.url));

/** @type {import("rollup").InputOption} */
const input = {
  index: "src/core/index.ts",
  vitepress: "src/vitepress.ts",
  "swifty-docs": "src/swifty-docs.ts",
  // "lark-mvc": "src/lark-mvc.ts",
  "lark-docs": "src/lark-docs.ts",
  rspress: "src/rspress.ts",
};

/** @type {import("rollup").ExternalOption} */
const external = [/^react(\/|$)/, /^vue(\/|$)/, /^vitepress(\/|$)/, /^@rspress\//, /^@lark\.js\//];

/** @type {import("rollup").RollupOptions[]} */
export default [
  {
    input,
    external,
    plugins: [
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
