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

import type { AntiCopyOptions, ResolvedOptions } from "./types";

export const DEFAULT_REPLACE_TEXT = "Copying is not allowed on this page.";

const DEFAULT_DEVTOOLS_INTERVAL_MS = 1000;
const DEFAULT_DEVTOOLS_THRESHOLD = 170;
const DEFAULT_DEVTOOLS_REDIRECT_URL = "about:blank";

function resolveDevtools(options: AntiCopyOptions): ResolvedOptions["devtools"] {
  if (!options.devtools) return false;
  const config = options.devtools === true ? {} : options.devtools;
  return {
    intervalMs: config.intervalMs ?? DEFAULT_DEVTOOLS_INTERVAL_MS,
    threshold: config.threshold ?? DEFAULT_DEVTOOLS_THRESHOLD,
    freeze: config.freeze ?? true,
    redirectUrl: config.redirectUrl ?? DEFAULT_DEVTOOLS_REDIRECT_URL,
  };
}

/** Merge user options with defaults into a fully-populated config object. */
export function resolveOptions(options: AntiCopyOptions = {}): ResolvedOptions {
  return {
    mode: options.mode ?? "block",
    replaceText: options.replaceText ?? DEFAULT_REPLACE_TEXT,
    excludeSelectors: options.excludeSelectors ?? [],
    copy: options.copy ?? true,
    keyboard: options.keyboard ?? true,
    contextmenu: options.contextmenu ?? true,
    // "replace" mode needs a live selection for the copy event to substitute,
    // so selection blocking defaults off there.
    selectStyle: options.selectStyle ?? options.mode !== "replace",
    print: options.print ?? true,
    devtools: resolveDevtools(options),
    onViolation: options.onViolation,
    target: options.target ?? document,
  };
}
