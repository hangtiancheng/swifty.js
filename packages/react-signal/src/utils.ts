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
 * Swifty framework internal utility functions.
 *
 * Deliberately tiny: errors are never swallowed (no try-catch wrappers).
 */

/** Safe hasOwnProperty check */
export function hasOwnProperty<T extends object>(
  owner: T | undefined | null,
  prop: PropertyKey,
): boolean {
  return owner != null && Object.prototype.hasOwnProperty.call(owner, prop);
}

// ============================================================
// Dev warnings (deduped — render paths run every pass)
// ============================================================

const warnedMessages = new Set<string>();

/** Warn once per unique message (render-path safe). */
export function devWarn(message: string): void {
  if (warnedMessages.has(message)) return;
  warnedMessages.add(message);
  // eslint-disable-next-line no-console
  console.warn(`[swifty-react-signal] ${message}`);
}
