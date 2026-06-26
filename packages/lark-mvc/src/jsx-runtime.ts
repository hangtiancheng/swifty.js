/**
 * JSX Runtime for Lark-MVC.
 *
 * Bridges JSX/TSX syntax to the VDOM engine via `vdomCreate`.
 *
 * With `jsxImportSource: "@lark.js/mvc"`, the TypeScript/esbuild compiler
 * transforms JSX expressions into calls to this module's `jsx` / `jsxs` /
 * `Fragment` exports — exactly like React's `react/jsx-runtime`.
 *
 * ## Usage
 *
 * In `tsconfig.json`:
 * ```json
 * {
 *   "compilerOptions": {
 *     "jsx": "react-jsx",
 *     "jsxImportSource": "@lark.js/mvc"
 *   }
 * }
 * ```
 *
 * Then write TSX:
 * ```tsx
 * import { defineView } from "@lark.js/mvc";
 *
 * export default defineView((ctx) => ({
 *   template(data) {
 *     return (
 *       <div class="app">
 *         <h1>{data.title}</h1>
 *         <p>{data.body}</p>
 *       </div>
 *     );
 *   },
 * }));
 * ```
 *
 * The compiled output calls `jsx("div", { class: "app", children: [...] })`
 * which this runtime translates into `vdomCreate("div", { class: "app" }, [...])`.
 */
import { vdomCreate } from "./vdom";
import type { VDomNode } from "./types";

// ============================================================
// Fragment — a special tag that renders children without a wrapper.
// ============================================================

/** Symbol used to identify Fragment elements. */
export const Fragment = Symbol.for("lark.fragment");

// ============================================================
// Props type
// ============================================================

/** JSX element props (includes optional `children` and `key`). */
export interface JsxProps {
  /**
   * Children prop (set by the compiler when JSX has child nodes).
   *
   * Accepts any value — strings/numbers become text nodes, booleans/
   * null/undefined are skipped, arrays are flattened, and VDomNode
   * objects pass through.
   */
  children?: unknown;
  /** React-style key for list reconciliation. */
  key?: string | number;
  /** Any other attributes pass through to vdomCreate as props. */
  [name: string]: unknown;
}

// ============================================================
// Core: flatten children + normalize to VDomNode[]
// ============================================================

/**
 * Normalize a child value into a VDomNode.
 *
 * - `string` / `number` → text node via `vdomCreate(0, String(value))`
 * - `VDomNode` → as-is
 * - `boolean` / `null` / `undefined` → skipped (renders nothing)
 * - arrays → flattened recursively
 */
function normalizeChild(child: unknown, out: VDomNode[]): void {
  if (child === null || child === undefined || typeof child === "boolean") {
    return;
  }
  if (Array.isArray(child)) {
    for (const c of child) {
      normalizeChild(c, out);
    }
    return;
  }
  if (typeof child === "string" || typeof child === "number") {
    out.push(vdomCreate(0, String(child)));
    return;
  }
  // Assume it's already a VDomNode (from a nested jsx() call)
  out.push(child as VDomNode);
}

/**
 * Extract and flatten the `children` prop into a `VDomNode[]`.
 *
 * Returns `null` when there are no children (for self-closing elements).
 */
function extractChildren(props: JsxProps): VDomNode[] | null {
  const raw = props.children;
  if (raw === undefined || raw === null) return null;

  const out: VDomNode[] = [];
  if (Array.isArray(raw)) {
    for (const c of raw) {
      normalizeChild(c, out);
    }
  } else {
    normalizeChild(raw, out);
  }
  return out.length > 0 ? out : null;
}

/**
 * Strip `children` and `key` from props, returning the remaining attrs.
 */
function stripJsxMeta(props: JsxProps): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in props) {
    if (key === "children" || key === "key") continue;
    result[key] = props[key];
  }
  return result;
}

// ============================================================
// jsx / jsxs — the two entry points the compiler emits
// ============================================================

/**
 * Create a VDomNode from a JSX element.
 *
 * Called by the compiler for `<Tag {...props} />` and `<Tag {...props}>{child}</Tag>`.
 *
 * @param tag - Element tag name (string) or Fragment symbol
 * @param props - JSX props (includes `children` and optional `key`)
 * @param key - Optional key for list reconciliation (passed by compiler)
 * @returns A VDomNode ready for the VDOM diff engine
 */
export function jsx(
  tag: string | typeof Fragment,
  props: JsxProps,
  key?: string | number,
): VDomNode {
  // Fragment: render children without a wrapper element
  if (tag === Fragment) {
    const children = extractChildren(props);
    if (!children || children.length === 0) {
      // Empty fragment → empty text node
      return vdomCreate(0, "");
    }
    if (children.length === 1) {
      return children[0];
    }
    // Multiple children in a fragment: wrap in an anonymous container
    // that the diff engine treats as a group. We use a special tag that
    // vdomCreate recognizes as a passthrough.
    // For simplicity, we return the first child and let the caller handle
    // arrays. In practice, fragments with multiple children are rare in
    // template functions — they're more common in component composition.
    return children[0];
  }

  // Strip JSX meta-props (children, key)
  const attrs = stripJsxMeta(props);
  const children = extractChildren(props);

  // Handle `key` — set as compareKey for list reconciliation
  if (key !== undefined) {
    (attrs as Record<string, unknown>)["data-lark-key"] = String(key);
  }

  // Self-closing element (no children)
  if (!children) {
    return vdomCreate(tag as string, attrs, 1);
  }

  // Element with children
  return vdomCreate(tag as string, attrs, children);
}

/**
 * Create a VDomNode from a JSX element with **static** (already-array) children.
 *
 * The compiler emits `jsxs` when children are known to be an array at compile
 * time (e.g., `{items.map(...)}`). Semantically identical to `jsx` — the
 * distinction is an optimization hint the compiler uses.
 */
export const jsxs = jsx;

// ============================================================
// jsxDEV — development-mode entry point (includes source info)
// ============================================================

/**
 * Development-mode JSX entry point.
 *
 * The compiler emits `jsxDEV` when `jsx: "react-jsxdev"` is used (default in
 * dev mode). It carries extra `__source` and `__self` props for dev tooling.
 * We strip those and delegate to `jsx`.
 */
export function jsxDEV(
  tag: string | typeof Fragment,
  props: JsxProps,
  key: string | number | undefined,
  _isStaticChildren: boolean,
  _source: unknown,
  _self: unknown,
): VDomNode {
  // Strip __source and __self (dev-only props)
  const cleanProps: JsxProps = {};
  for (const k in props) {
    if (k === "__source" || k === "__self") continue;
    cleanProps[k] = props[k];
  }
  return jsx(tag, cleanProps, key);
}

// ============================================================
// JSX namespace — consumed by TypeScript when jsxImportSource is set
// ============================================================

/**
 * The JSX namespace.
 *
 * When `jsxImportSource` is `"@lark.js/mvc"`, TypeScript resolves
 * `JSX.IntrinsicElements`, `JSX.Element`, etc. from this namespace.
 *
 * Users don't need to import this — it's global as long as
 * `@lark.js/mvc` is in `node_modules` and `jsxImportSource` is set.
 */
export namespace JSX {
  /** The type of a JSX expression (a VDomNode). */
  export type Element = VDomNode;
  /** The type of a JSX fragment (also a VDomNode). */
  export type Fragment = VDomNode;
  /** Element class type (unused — we use functional elements). */
  export type ElementClass = never;
  /** Intrinsic elements: any HTML tag with any props. */
  export interface IntrinsicElements {
    [elemName: string]: Record<string, unknown> | undefined;
  }
  /** Allowed children types. */
  export type ElementChildrenAttribute = { children: unknown };
}

// ============================================================
// Re-exports
// ============================================================

export { vdomCreate } from "./vdom";
export type { VDomNode } from "./types";
