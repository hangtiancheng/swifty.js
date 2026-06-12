/**
 * CSS style injection utility.
 */
import { noop } from "./utils";

/** Module-level set to track injected style IDs. */
const injectedStyleIds = new Set<string>();

/**
 * Dynamically inject CSS styles into the document head.
 * Returns a cleanup function to remove the injected styles.
 *
 * @param styleIdOrPairs - Style ID string or array of [id, content] pairs
 * @param css - CSS content string (only used when first arg is string)
 * @returns Cleanup function to remove the styles
 */
export function applyStyle(
  styleIdOrPairs: string | string[],
  css?: string,
): () => void {
  // Batch style injection: [id1, css1, id2, css2, ...]
  if (Array.isArray(styleIdOrPairs)) {
    if (styleIdOrPairs.length % 2 !== 0) {
      throw new Error("Invalid array of [id, content] pairs");
    }
    const cleanupCallbacks: (() => void)[] = [];
    for (let i = 0; i < styleIdOrPairs.length; i += 2) {
      const styleId = styleIdOrPairs[i];
      const styleContent = styleIdOrPairs[i + 1];
      const cleanup = applyStyle(styleId, styleContent);
      if (cleanup !== noop) {
        cleanupCallbacks.push(cleanup);
      }
    }
    return () => {
      for (const cleanup of cleanupCallbacks) {
        cleanup();
      }
    };
  }

  // Single style injection
  if (css && !injectedStyleIds.has(styleIdOrPairs)) {
    injectedStyleIds.add(styleIdOrPairs);
    const styleElement = document.createElement("style");
    styleElement.setAttribute("from", "lark");
    styleElement.id = styleIdOrPairs;
    styleElement.textContent = css;
    document.head.append(styleElement);
    return () => {
      injectedStyleIds.delete(styleIdOrPairs);
      styleElement.remove();
    };
  }

  return noop;
}
