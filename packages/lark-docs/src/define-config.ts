/**
 * Type-safe configuration helper.
 *
 * Exists purely for TypeScript inference at the call site.
 * Returns the argument unchanged at runtime.
 *
 * Usage:
 * ```ts
 * import { defineConfig } from "@lark.js/docs";
 *
 * export default defineConfig({
 *   docs: "docs",
 *   baseUrl: "/docs/",
 *   title: "My Library",
 * });
 * ```
 */
import type { DocsConfig } from "./types";

export function defineConfig(config: DocsConfig): DocsConfig {
  return config;
}
