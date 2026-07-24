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
 * @swifty.js/docs barrel exports.
 *
 * Main entry point — browser-safe exports only (Preact theme + types).
 *
 * Build-time utilities (defineConfig, scanDocsDir, generateSidebar, etc.)
 * are available from sub-path exports:
 *   - "@swifty.js/docs/vite"     (Vite plugin + build-time helpers)
 *   - "@swifty.js/docs/compiler" (compileMarkdown)
 */

// ============================================================
// @swifty.js/docs types (browser-safe)
// ============================================================

export type {
  DocsConfig,
  NavItem,
  SidebarConfig,
  SidebarItem,
  MarkdownOptions,
  HighlightOptions,
  SearchOptions,
  PageData,
  HeadingInfo,
  DocsRoute,
  SearchEntry,
  FrontmatterResult,
  CompileMarkdownOptions,
} from "./types";

// ============================================================
// Runtime utilities (browser-safe)
// ============================================================

export { slugify } from "./runtime";

// ============================================================
// Preact theme
// ============================================================

export { DocsProvider, useDocs, type DocsProviderProps } from "./theme/context";
export { DocsLayout } from "./theme/docs-layout";
export { Navbar } from "./theme/navbar";
export { Sidebar } from "./theme/sidebar";
export { Toc } from "./theme/toc";
export { SearchDialog } from "./theme/search-dialog";
export { DocSearchWidget } from "./theme/doc-search-widget";
export { ContentRenderer } from "./theme/content-renderer";
export { PrevNext } from "./theme/prev-next";
export { ThemeToggle } from "./theme/theme-toggle";
export { Logo } from "./theme/logo";
export { Button, buttonVariants } from "./theme/ui/button";
export { Input } from "./theme/ui/input";
export { Kbd } from "./theme/ui/kbd";
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./theme/ui/dialog";
export { cn } from "./theme/lib/utils";
export { createSearchEngine, highlightSegments } from "./theme/lib/search";
export { useScrollSpy } from "./theme/lib/scroll-spy";
export {
  computePrevNext,
  normalizePath,
  type LoadedContent,
  type PageHeading,
} from "./theme/lib/content";
export { createLocalSearchClient } from "./theme/docs-search-local";
export { decryptContent } from "./utils/guard"
