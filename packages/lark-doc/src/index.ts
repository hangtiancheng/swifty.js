/**
 * @lark.js/docs barrel exports.
 *
 * Main entry point re-exporting all public APIs.
 */

// Types
export type {
  DocConfig,
  NavItem,
  SidebarConfig,
  SidebarItem,
  MarkdownOptions,
  HighlightOptions,
  SearchOptions,
  PageData,
  HeadingInfo,
  DocRoute,
  SidebarData,
  TocData,
  SearchEntry,
  FrontmatterResult,
  CompileMarkdownOptions,
} from "./types";

// Configuration helper
export { defineConfig } from "./config/define-config";

// Scanner
export { scanDocsDir } from "./scanner";

// Route map generation
export { generateRouteMap, generateBootModule } from "./route-map";

// Sidebar auto-generation
export { generateSidebar } from "./sidebar-generator";

// Search index
export { buildSearchIndex, emitSearchIndexModule } from "./search-index";

// Markdown processing (for advanced users)
export { createParser } from "./markdown/parser";
export { extractFrontmatter } from "./markdown/frontmatter";
export { renderToLarkTemplate } from "./markdown/renderer";
export { getHighlighter, highlightCode } from "./markdown/highlighter";

// Compiler (for advanced users; also available at @lark.js/docs/compiler)
export { compileMarkdown } from "./compiler/compile-markdown";

// Runtime search (also available at @lark.js/docs/runtime)
export { searchDocs, slugify } from "./runtime";

// Theme view factories
export {
  createDocLayoutView,
  createSidebarView,
  createContentView,
  createTocView,
  createSearchView,
} from "./theme/index";

// Theme icons (lucide-static raw SVG strings)
export { icons } from "./theme/icons";
