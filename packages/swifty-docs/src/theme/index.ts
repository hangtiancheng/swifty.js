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
 * Preact theme for @swifty.js/docs.
 *
 * The theme is a set of Preact components that render the build-time
 * markdown output ({ pageData, contentHtml } modules). Wire it up in your
 * app entry:
 *
 * ```tsx
 * import { DocsProvider, DocsLayout } from "@swifty.js/docs";
 * import { docsConfig, loadContent, getSearchIndex } from "@swifty-docs/generated";
 * import { render } from "preact";
 * import { LocationProvider, Router, Route } from "preact-iso";
 *
 * render(
 *   <DocsProvider
 *     config={docsConfig}
 *     loadContent={loadContent}
 *     getSearchIndex={getSearchIndex}
 *   >
 *     <LocationProvider>
 *       <Router>
 *         <Route default component={DocsLayout} />
 *       </Router>
 *     </LocationProvider>
 *   </DocsProvider>,
 *   document.getElementById("app")!,
 * );
 * ```
 */
export { DocsProvider, useDocs, type DocsProviderProps } from "./context";
export { DocsLayout } from "./docs-layout";
export { Navbar } from "./navbar";
export { Sidebar } from "./sidebar";
export { Toc } from "./toc";
export { SearchDialog } from "./search-dialog";
export { DocSearchWidget } from "./doc-search-widget";
export { ContentRenderer } from "./content-renderer";
export { PrevNext } from "./prev-next";
export { ThemeToggle } from "./theme-toggle";
export { Logo } from "./logo";

// shadcn-style primitives
export { Button, buttonVariants } from "./ui/button";
export { Input } from "./ui/input";
export { Kbd } from "./ui/kbd";
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

// Utilities and runtime helpers
export { cn } from "./lib/utils";
export { createSearchEngine, highlightSegments } from "./lib/search";
export { useScrollSpy } from "./lib/scroll-spy";
export { createLocalSearchClient } from "./docs-search-local";
export {
  computePrevNext,
  normalizePath,
  type LoadedContent,
  type PageHeading,
} from "./lib/content";
