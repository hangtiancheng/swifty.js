/**
 * Type-safe configuration helper.
 *
 * Exists purely for TypeScript inference at the call site.
 * Returns the argument unchanged at runtime.
 *
 * Usage:
 * ```ts
 * import { defineConfig } from "@lark.js/doc";
 *
 * export default defineConfig({
 *   docs: "docs",
 *   baseUrl: "/docs/",
 *   title: "My Library",
 * });
 * ```
 */
import type { DocConfig } from "../types";

export function defineConfig(config: DocConfig): DocConfig {
  return config;
}
