/**
 * Theme view barrel exports.
 *
 * Exports factory functions that create lark-mvc View classes
 * for each theme component. Users call these factories with
 * their View class and compiled template to produce registered views.
 */
import type { View } from "@lark.js/mvc";
import { registerViewClass } from "@lark.js/mvc";

// Template imports — compiled by larkMvcPlugin at build time into
// (data, viewId, refData) => string functions. Bundled into theme.js
// in lib mode so consumers never need to import .html files directly.
import docLayout from "./docs-layout.html";
import sidebar from "./sidebar.html";
import toc from "./toc.html";
import search from "./search.html";

import { createDocsLayoutView } from "./docs-layout";
import { createSidebarView } from "./sidebar";
import { createTocView } from "./toc";
import { createSearchView } from "./search";

/**
 * Register all built-in theme views (layout, sidebar, toc, search) with
 * the lark-mvc view registry. Consumers call this once in boot.ts before
 * Framework.boot():
 *
 * ```ts
 * import { View } from "@lark.js/mvc";
 * import { registerThemeViews } from "@lark.js/docs/theme";
 * registerThemeViews(View);
 * ```
 *
 * This encapsulates all .html template imports inside the framework so
 * consumers don't need to import .html files or call registerViewClass
 * for each theme component manually.
 */
export function registerThemeViews(ViewClass: typeof View): void {
  registerViewClass(
    "theme/docs-layout",
    createDocsLayoutView(ViewClass, docLayout),
  );
  registerViewClass("theme/sidebar", createSidebarView(ViewClass, sidebar));
  registerViewClass("theme/toc", createTocView(ViewClass, toc));
  registerViewClass("theme/search", createSearchView(ViewClass, search));
}

// Re-export factories and helpers for advanced users who want custom
// registration or to override individual theme views.
export { createDocsLayoutView } from "./docs-layout";
export { createSidebarView } from "./sidebar";
export { createTocView } from "./toc";
export { createSearchView } from "./search";
export { createLocalSearchClient } from "./docs-search-local";
export { icons } from "./icons";
