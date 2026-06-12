/**
 * Safeguard: Proxy-based debug protection for data objects.
 *
 * In DEBUG mode, wraps data objects with Proxy to:
 * 1. Warn when data is read from a different page than where it was set
 * 2. Prevent direct mutation (forces use of State.set/digest)
 * 3. Track access patterns for debugging
 */

import { hasOwnProperty, isPrimitive, isPlainObject } from "./utils";

/** Cache pool for Proxy instances to avoid re-wrapping */
const proxiesPool = new Map<object, { cacheKey: string; entity: object }>();

/** Sentinel property to detect already-proxied objects */
const SAFEGUARD_SENTINEL = "\x1e_safe_\x1e";

/**
 * Wrap data with a Proxy for debug-mode protection.
 * Only active when window.__lark_Debug is true and Proxy is available.
 *
 * @param data - Data to wrap
 * @param getter - Optional callback when properties are read
 * @param setter - Optional callback when properties are written
 * @param isRoot - Whether this is the root data object
 * @returns Proxied data or original data if debug mode is off
 */
export function safeguard<T>(
  data: T,
  getter?: ((key: string) => void) | null,
  setter?: ((path: string, value: unknown) => void) | null,
  isRoot?: boolean,
): T {
  if (typeof window.__lark_Debug === "undefined" || !window.__lark_Debug) {
    return data;
  }
  if (typeof Proxy === "undefined") {
    return data;
  }
  if (isPrimitive(data)) {
    return data;
  }

  const build = (prefix: string, obj: object): object => {
    const cacheKey = (getter || "") + "\x01" + (setter || "");
    const cached = proxiesPool.get(obj);
    if (cached && cached.cacheKey === cacheKey) {
      return cached.entity;
    }
    // Don't re-proxy already proxied objects
    if (Reflect.get(obj, SAFEGUARD_SENTINEL)) {
      return obj;
    }

    const entity = new Proxy(obj, {
      set(target: object, property: string, value: unknown): boolean {
        if (!setter && !prefix) {
          throw new Error(
            "Avoid write back, key: " +
              prefix +
              property +
              " value:" +
              value +
              " more: https://github.com/hangtiancheng/lark",
          );
        }
        Reflect.set(target, property, value);
        if (setter) {
          setter(prefix + property, value);
        }
        return true;
      },
      get(target: object, property: string): unknown {
        if (property === SAFEGUARD_SENTINEL) {
          return true;
        }
        const out = Reflect.get(target, property);
        if (!prefix && getter) {
          getter(property);
        }
        if (
          !isRoot &&
          hasOwnProperty(target, property) &&
          (Array.isArray(out) || isPlainObject(out))
        ) {
          return build(prefix + property + ".", out as object);
        }
        return out;
      },
    });

    proxiesPool.set(obj, { cacheKey, entity });
    return entity;
  };

  return build("", data as object) as T;
}

/**
 * Clear the proxy cache. Useful for testing.
 */
export function clearSafeguardCache(): void {
  proxiesPool.clear();
}
