/**
 * useUrlState — sync view state with URL query parameters.
 *
 * Similar to useUrlState: reads initial state from URL params,
 * and writes state changes back to the URL via Router.to().
 * Automatically observes the specified param keys so the view
 * re-renders when the URL changes (via back/forward or Router.to).
 *
 * Works with both history and hash routing modes.
 */
import { Router } from "./router";
import type { ViewInterface } from "./types";

/**
 * Sync view state with URL query parameters.
 *
 * @param view - The view instance to bind to (for auto location observation and lifecycle)
 * @param initialState - Default values for each URL param key. Keys not present
 *   in the URL will use these defaults. Keys present in the URL override defaults.
 * @returns A tuple `[state, setState]`:
 *   - `state`: current values read from the URL, merged with defaults
 *   - `setState`: update URL params. Accepts a partial object or an updater function.
 *     Only the specified keys are changed; other URL params are preserved.
 *
 * @example
 * ```ts
 * export default View.extend({
 *   template,
 *   init() {
 *     const [state, setState] = useUrlState(this, { page: "1", size: "20" });
 *     this.updater.set({ page: state.page, size: state.size }).digest();
 *     this.setState = setState;
 *   },
 *   assign() {
 *     const [state] = useUrlState(this, { page: "1", size: "20" });
 *     this.updater.set({ page: state.page, size: state.size });
 *   },
 *   "nextPage<click>"() {
 *     this.setState((prev) => ({ page: String(Number(prev.page) + 1) }));
 *   },
 * });
 * ```
 */
export function useUrlState<S extends Record<string, string>>(
  view: ViewInterface,
  initialState?: S,
): [Readonly<S>, (patch: Partial<S> | ((prev: S) => Partial<S>)) => void] {
  const keys = initialState ? Object.keys(initialState) : [];

  if (keys.length > 0) {
    view.observeLocation(keys);
  }

  const getState = (): S => {
    const loc = Router.parse();
    const result = { ...(initialState || {}) } as Record<string, string>;
    for (const key of keys) {
      const val = loc.get(key);
      if (val) result[key] = val;
    }
    return result as S;
  };

  const setState = (patch: Partial<S> | ((prev: S) => Partial<S>)): void => {
    const current = getState();
    const resolved = typeof patch === "function" ? patch(current) : patch;
    Router.to(resolved as Record<string, unknown>);
  };

  return [getState(), setState];
}
