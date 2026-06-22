import { defineConfig } from "tsup";

export default defineConfig([
  // Group 1: Main entry (public API)
  {
    entry: ["src/index.ts"],
    clean: true,
    dts: {
      resolve: true,
    },
    format: ["esm", "cjs"],
    minify: false,
    sourcemap: false,
    tsconfig: "./tsconfig.build.json",
  },
  // Group 2: Compiler (markdown -> JS module)
  {
    entry: ["src/compiler.ts"],
    dts: true,
    format: ["esm", "cjs"],
    minify: false,
    noExternal: ["markdown-it", "js-yaml"],
    sourcemap: false,
    tsconfig: "./tsconfig.build.json",
  },
  // Group 3: Build plugins (Vite / Webpack / Rspack)
  {
    entry: ["src/vite.ts", "src/webpack.ts", "src/rspack.ts"],
    dts: true,
    format: ["esm", "cjs"],
    minify: false,
    noExternal: ["markdown-it", "js-yaml"],
    shims: true,
    splitting: false,
    sourcemap: false,
    tsconfig: "./tsconfig.build.json",
  },
  // Group 4: Runtime (lightweight helpers for compiled .md modules)
  {
    entry: ["src/runtime.ts"],
    dts: true,
    format: ["esm", "cjs"],
    minify: false,
    sourcemap: false,
    tsconfig: "./tsconfig.build.json",
  },
]);
