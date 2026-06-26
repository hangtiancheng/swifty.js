/**
 * CSS style injection utility.
 *
 * Supports three calling modes:
 *
 * 1. **CSS module object** — `applyStyle(styles)` where `styles` is the default
 *    export of a `.module.css` import. The bundler (Vite / Webpack / Rspack /
 *    Rsbuild) handles scoping and injection automatically; this call is a
 *    no-op that exists solely to provide a consistent API surface and to
 *    enable future runtime class-name resolution features.
 *
 * 2. **Single style** — `applyStyle(styleId, cssText)` injects a `<style>` tag
 *    with the given id. Duplicate ids are skipped (idempotent).
 *
 * 3. **Batch styles** — `applyStyle([id1, css1, id2, css2, ...])` injects
 *    multiple styles in one call. The array length must be even.
 *
 * All modes return a cleanup function. For CSS module objects the cleanup is
 * a no-op (the bundler manages the lifecycle). For injected `<style>` tags the
 * cleanup removes the element from the DOM and clears the id from the
 * injected-style tracker.
 */
import { noop } from "./utils";

/** Module-level set to track injected style IDs (prevents duplicate injection). */
const injectedStyleIds = new Set<string>();

/** Type guard: check if the input is a CSS module object (Record<string, string>). */
function isCssModuleObject(input: unknown): input is Record<string, string> {
  if (input == null || typeof input !== "object" || Array.isArray(input)) {
    return false;
  }
  const obj = input as Record<string, unknown>;
  // A CSS module object has at least one string-valued property.
  // An empty object is also accepted (no classes in the module).
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val !== "string" && val !== undefined) {
      return false;
    }
  }
  return true;
}

/**
 * Dynamically inject CSS styles or accept a CSS module object.
 *
 * @param input - One of:
 *   - CSS module object (`Record<string, string>`) from `.module.css` import
 *   - Style ID string (pair with `css` for single injection)
 *   - Array of `[id1, css1, id2, css2, ...]` for batch injection
 * @param css - CSS content string (only used when `input` is a style ID string)
 * @returns Cleanup function to remove the injected styles (no-op for CSS modules)
 */
export function applyStyle(
  input: string | string[] | Record<string, string>,
  css?: string,
): () => void {
  // ── CSS module object ──
  // The bundler handles scoping and injection. This is a no-op.
  if (isCssModuleObject(input)) {
    return noop;
  }

  // ── Batch style injection: [id1, css1, id2, css2, ...] ──
  if (Array.isArray(input)) {
    if (input.length % 2 !== 0) {
      throw new Error("Invalid array of [id, content] pairs");
    }
    const cleanupCallbacks: (() => void)[] = [];
    for (let i = 0; i < input.length; i += 2) {
      const styleId = input[i];
      const styleContent = input[i + 1];
      const cleanup = applyStyle(styleId, styleContent);
      if (cleanup !== noop) {
        cleanupCallbacks.push(cleanup);
      }
    }
    return (): void => {
      for (const cleanup of cleanupCallbacks) {
        cleanup();
      }
    };
  }

  // ── Single style injection ──
  const styleId = input;
  if (css && !injectedStyleIds.has(styleId)) {
    injectedStyleIds.add(styleId);
    const styleElement = document.createElement("style");
    styleElement.setAttribute("from", "lark");
    styleElement.id = styleId;
    styleElement.textContent = css;
    document.head.append(styleElement);
    return (): void => {
      injectedStyleIds.delete(styleId);
      styleElement.remove();
    };
  }

  return noop;
}
