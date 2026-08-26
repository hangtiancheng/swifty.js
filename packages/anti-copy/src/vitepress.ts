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

import type { EnhanceAppContext } from "vitepress";
import { watch } from "vue";
import { createAntiCopy, isBrowser, type AntiCopyInstance, type AntiCopyOptions } from "@/index";

/**
 * Regions excluded from protection by default in a VitePress site:
 * code blocks (selectable + native copy button) and interactive inputs
 * such as the local search box.
 */
export const VITEPRESS_DEFAULT_EXCLUDES = [
  'div[class*="language-"]',
  "button.copy",
  "input",
  "textarea",
  "[contenteditable='true']",
  ".VPLocalSearchBox",
];

/** Handle returned by {@link applyAntiCopy} for teardown and manual control. */
export interface AntiCopyHandle {
  instance: AntiCopyInstance;
  /** Stops the frontmatter watcher and destroys the instance. */
  stop(): void;
}

/**
 * Wires copy protection into a VitePress app. Call from the theme's
 * `enhanceApp(ctx)` hook.
 *
 * Protection is enabled site-wide by default; individual pages opt out with
 * `copyable: true` in their frontmatter. The router's reactive route data
 * is watched so protection toggles correctly across SPA navigations.
 */
export function applyAntiCopy(
  ctx: EnhanceAppContext,
  options: AntiCopyOptions = {},
): AntiCopyHandle {
  const instance = createAntiCopy({
    ...options,
    excludeSelectors: [...VITEPRESS_DEFAULT_EXCLUDES, ...(options.excludeSelectors ?? [])],
  });

  // During SSR/SSG the instance is already a no-op; skip the watcher too.
  if (!isBrowser()) {
    return {
      instance,
      stop() {
        /** noop */
      },
    };
  }

  const stopWatch = watch(
    () => ctx.router.route.data?.frontmatter?.copyable,
    (value) => {
      if (value) instance.disable();
      else instance.enable();
    },
    { immediate: true },
  );

  return {
    instance,
    stop() {
      stopWatch();
      instance.destroy();
    },
  };
}
