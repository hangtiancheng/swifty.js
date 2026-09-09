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
 * Reactive core — the framework's single reactivity primitive set, backed by
 * `@preact/signals-core`.
 *
 * Every data source in swifty-react-signal is signal-based:
 * - component state: `useSignal()` hook slots read by component bodies
 * - props: per-key signals behind each instance's props proxy
 * - stores: per-key signals behind a tracked `getState()` proxy
 * - router: `location` / `match` / `params` / `searchParams` signals on the
 *   `createRouter` instance
 *
 * Each mounted component re-runs its function inside one `effect()` — any
 * signal read during the body subscribes the instance, and writes re-render
 * it synchronously (writes inside `batch()` coalesce into a single
 * re-render).
 *
 * ## Shallow reactivity
 *
 * Signals compare by reference (`===`). Mutating a nested field or calling
 * `arr.push()` does NOT notify — replace the reference instead:
 * `sig.value = [...sig.value, item]`. This matches React/Preact semantics.
 */
export { signal, computed, effect, batch, untracked, Signal } from "@preact/signals-core";
export type { ReadonlySignal } from "@preact/signals-core";
