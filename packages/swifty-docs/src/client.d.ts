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

/// <reference types="vite/client" />

declare module "@swifty-docs/generated" {
  import type { DocsConfig, PageData } from "@swifty.js/docs";

  export function loadContent(
    path: string,
  ): Promise<{ pageData: PageData; contentHtml: string } | null>;

  export const docsConfig: DocsConfig;

  export interface SearchEntry {
    /** Page title. */
    title: string;
    /** Route path. */
    link: string;
    /** Page excerpt (index text for pages whose HTML yields no sections). */
    excerpt: string;
    /** Compiled page HTML — split into per-section search docs at runtime. */
    contentHtml: string;
  }

  export function getSearchIndex(): Promise<SearchEntry[]>;

  /**
   * Subscribe to dev-mode markdown hot updates. The callback receives the
   * route paths whose content changed. Returns an unsubscribe function.
   * No-op in production builds.
   */
  export function onContentUpdate(cb: (routes: string[]) => void): () => void;
}
