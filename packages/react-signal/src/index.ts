/**
 * Copyright (c) 2026 hangtiancheng
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Swifty Framework — public API barrel export.
 *
 * Re-exports the complete public surface of `@swifty.js/react-signal` from a single
 * entry point. Consumers can `import { render, useSignal, createRouter, ... }`
 * from `"@swifty.js/react-signal"` without knowing the internal module layout.
 *
 * ## API surface
 *
 * | Category | Exports |
 * | -------- | ------- |
 * | Reactive | `signal`, `computed`, `effect`, `batch`, `untracked`, `Signal` |
 * | Rendering | `render`, `unmount`, `raw`, `Fragment` |
 * | Hooks | `useSignal`, `useRef`, `useComputed`, `useSignalEffect`, `useEffect` (mount-only), `onCleanup` |
 * | Router | `createRouter`, `RouterView`, `useRouter`, `useBlocker`, `matchPath`, `matchRoutes` |
 * | State | `createStore`, `useUrlState` |
 * | HMR | `hotSwapByComponent` |
 * | Types | All types from `./types` via `export *` |
 *
 * There is no Framework/boot object — an app boots with:
 * `render(<RouterView router={createRouter(routes)}/>, container)`.
 * Async server state (SWR-style queries) is intentionally NOT part of this
 * package — it belongs to a dedicated data-fetching package built on the
 * same signals.
 */
import { hotSwapByComponent } from "./hmr";

// Global HMR handle — THE single registration point. Auto-injected HMR
// snippets (see ./hmr-inject.ts) call it via `globalThis.__swifty_hmr__`
// instead of importing "@swifty.js/react-signal" (an import inside an HMR callback
// would register the module as an MF shared consumer → ChunkLoadError).
if (typeof globalThis !== "undefined" && !globalThis.__swifty_hmr__) {
  globalThis.__swifty_hmr__ = { hotSwapByComponent };
}

// Reactive core (@preact/signals-core) — the framework's single reactivity
// primitive set. Reads inside component bodies/computed/effects subscribe;
// writes re-render synchronously (batched inside `batch()`).
export { signal, computed, effect, batch, untracked, Signal } from "./reactive";
export type { ReadonlySignal } from "./reactive";

// Rendering (React-DOM style root API + JSX helpers)
export { render, unmount } from "./jsx/reconcile";
export { raw, Fragment } from "./jsx/vnode";
export type { JSXNode, VNode, RawHTML, Component } from "./jsx/vnode";

// Typed DOM attribute layer (per-tag intrinsic props, native-event handler
// types, `Signalish`/`Ref`/`ClassValue`/`CSSProperties`, aria/svg/mathml) —
// sourced from the preact package and adapted to Swifty semantics.
export type * from "./jsx/dom-types";

// The JSX namespace (React-19-style import): `import type { JSX } from
// "@swifty.js/react-signal"` enables `JSX.HTMLAttributes<T>`, `JSX.IntrinsicElements`,
// `JSX.TargetedEvent`, ... in user type positions.
export type { JSX } from "./jsx-runtime";

// Hooks (call-order-indexed slots — React rules of hooks; signals-only,
// no deps arrays)
export { useSignal, useRef, useComputed, useSignalEffect, useEffect, onCleanup } from "./hooks";

// Router (factory-based, history-only, react-router data model on signals)
export { createRouter, RouterView, useRouter, useBlocker, matchPath, matchRoutes } from "./router";
export type { RouterOptions } from "./router";

// Store (zustand-aligned state management — per-key signals)
export { createStore } from "./store";
export type { StoreApi } from "./store";

// URL state hook (sync component state with URL search params)
export { useUrlState } from "./url-state";

// HMR (called by auto-injected snippets through globalThis.__swifty_hmr__)
export { hotSwapByComponent };

// Types (re-exported for consumer convenience)
export * from "./types";
