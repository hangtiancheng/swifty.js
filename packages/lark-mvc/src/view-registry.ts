/**
 * View class registry: viewPath -> ViewClass.
 *
 * Extracted into its own module so that `frame.ts` and `view.ts` no longer
 * need to import each other's concrete classes just to share the registry —
 * they each take a type-only dependency on `View` and a value-level
 * dependency on this registry instead. That keeps the module graph cleaner.
 */
import { parseUri } from "./utils";
import type { View } from "./view";

/** Registry of view classes keyed by path. */
const viewClassRegistry: Record<string, typeof View> = {};

/**
 * Look up a previously registered View class by path.
 * Returns `undefined` if no class is registered for `path`.
 */
export function getViewClass(path: string): typeof View | undefined {
  return viewClassRegistry[path];
}

/**
 * Register a View class for a given view path.
 * Called after module loading completes (or up front during boot).
 */
export function registerViewClass(
  viewPath: string,
  ViewClass: typeof View,
): void {
  const parsed = parseUri(viewPath);
  const path = parsed.path;
  if (path) {
    viewClassRegistry[path] = ViewClass;
  }
}

/**
 * Invalidate a View class from the registry.
 * Used by HMR to force re-loading of a view module.
 */
export function invalidateViewClass(viewPath: string): void {
  const parsed = parseUri(viewPath);
  const path = parsed.path;
  if (path) {
    Reflect.deleteProperty(viewClassRegistry, path);
  }
}

/**
 * Get the full view class registry (for HMR / debugging).
 */
export function getViewClassRegistry(): Record<string, typeof View> {
  return viewClassRegistry;
}
