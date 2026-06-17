import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/extension.ts"],
  format: ["cjs"],
  target: "node18",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  external: ["vscode", "@swc/core"],
  noExternal: ["zod"],
  shims: false,
  splitting: false,
});
