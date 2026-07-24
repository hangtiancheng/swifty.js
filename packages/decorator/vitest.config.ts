import swc from "unplugin-swc";
import {defineConfig} from "vitest/config";
import type {PluginOption} from "vitest";

export default defineConfig({
  plugins: [
    // esbuild can't emit decorator metadata, which the DI container relies on
    swc.vite({
      jsc: {
        target: "es2022",
        parser: {syntax: "typescript", decorators: true},
        transform: {legacyDecorator: true, decoratorMetadata: true}
      }
    }) as PluginOption
  ],
  test: {
    environment: "node",
    include: ["src/__tests__/**/*.{test,tests}.ts"],
    setupFiles: ["./test/vitest.setup.ts"],
    clearMocks: true,
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      include: ["src/**/*.ts"],
      exclude: ["src/__tests__/**", "**/types/**", "**/index.ts", "**/*.d.ts"]
    }
  }
});
