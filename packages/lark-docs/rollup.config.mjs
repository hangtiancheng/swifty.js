/**
 * Rollup configuration for @lark.js/docs
 *
 * Builds the package with multiple entry points:
 * - index: main API
 * - compiler: markdown compilation
 * - vite/webpack/rspack: bundler plugins
 * - runtime: lightweight helpers
 * - styles: CSS processing (Tailwind + DaisyUI)
 *
 * CSS is processed through PostCSS (Tailwind v4) and extracted
 * to dist/theme/main.css for users to import.
 */

// @ts-check

import { readFileSync } from "node:fs";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import { defineConfig } from "rollup";

const deps = Object.keys(
  (await import("./package.json", { with: { type: "json" } })).default
    .dependencies ?? {},
);
const peerDeps = Object.keys(
  (await import("./package.json", { with: { type: "json" } })).default
    .peerDependencies ?? {},
);

// Entries where markdown-it/js-yaml are bundled (not external),
// matching tsup's `noExternal` config.
const entries = [
  { name: "index", external: true },
  { name: "compiler", external: false },
  { name: "webpack", external: false },
  { name: "rspack", external: false },
  { name: "vite", external: false },
  { name: "runtime", external: true },
];

/** Externalize deps/peerDeps except bundled packages when external=false */
/**
 *
 * @param {boolean} external
 * @returns {(id: string) => boolean}
 */
const makeExternal = (external) => (id) => {
  if (id.startsWith("node:") || id.startsWith(".")) return false;
  if (
    !external &&
    (id === "markdown-it" ||
      id === "js-yaml" ||
      id.startsWith("markdown-it/") ||
      id.startsWith("js-yaml/"))
  ) {
    return false;
  }
  const pkg = id.startsWith("@")
    ? id.split("/").slice(0, 2).join("/")
    : id.split("/")[0];
  return deps.includes(pkg) || peerDeps.includes(pkg);
};

/**
 * Rollup plugin: inject __filename/__dirname shims for ESM output.
 * These are native CJS globals but absent in ESM, so we derive them
 * from import.meta.url — mirroring tsup's `shims: true`.
 * @returns {import("rollup").Plugin}
 */
function cjsShims() {
  const shims = readFileSync(new URL("./shims.js", import.meta.url), "utf-8");
  return {
    name: "cjs-shims",
    renderChunk(code, chunk, outputOptions) {
      if (outputOptions.format !== "es") return null;
      return shims + code;
    },
  };
}

const outputConfigs = [
  { file: "dist/[name].js", format: "es" },
  { file: "dist/[name].cjs", format: "cjs", exports: "named" },
];

// Entries that use __filename (vite/webpack/rspack plugin loaders) need the shim.
const cjsShimsEntries = new Set(["vite", "webpack", "rspack"]);

// --- JS bundles (ESM + CJS, no sourcemap, matching tsup) ---
const /** @type {import("rollup").OutputOptions[]} */ jsConfigs = entries.map(
    ({ name, external }) => ({
      input: `src/${name}.ts`,
      output: outputConfigs.map((o) => ({
        ...o,
        file: o.file.replace("[name]", name),
      })),
      external: makeExternal(external),
      plugins: [
        resolve(),
        commonjs(),
        typescript({ tsconfig: "./tsconfig.build.json" }),
        ...(cjsShimsEntries.has(name) ? [cjsShims()] : []),
      ],
    }),
  );

// --- Type declarations (.d.ts for ESM consumers) ---
const /** @type {import("rollup").RollupOptions[]} */ dtsConfigs = entries.map(
    ({ name }) => ({
      input: `src/${name}.ts`,
      output: {
        file: `dist/${name}.d.ts`,
        format: "es",
      },
      plugins: [dts({ tsconfig: "./tsconfig.build.json" })],
    }),
  );

// --- Type declarations (.d.cts for CJS consumers) ---
const /** @type {import("rollup").OutputOptions[]} */ dtsCjsConfigs =
    entries.map(({ name }) => ({
      input: `src/${name}.ts`,
      output: {
        file: `dist/${name}.d.cts`,
        format: "es",
      },
      plugins: [dts({ tsconfig: "./tsconfig.build.json" })],
    }));

export default defineConfig([...jsConfigs, ...dtsConfigs, ...dtsCjsConfigs]);
