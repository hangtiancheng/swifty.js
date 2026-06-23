/// <reference types="vite/client" />
/**
 * Lark .html template files — compiled by larkMvcPlugin into
 * (data, viewId, refData) => string functions at build time.
 *
 * Note: the built-in theme templates in src/theme/ are NOT imported as
 * .html by consumers. They use virtual modules (virtual:lark-docs/*)
 * resolved by the themeDualMode plugin — see virtual-modules.d.ts.
 */
declare module "*.html" {
  const content: string;
  export default content;
}

/**
 * Type declarations for dual-mode virtual template modules.
 *
 * These modules are resolved at build time by the themeDualMode Vite plugin
 * (see vite.config.ts). Each virtual module reads the corresponding .html
 * file from src/theme/, compiles it in BOTH string and VDOM modes via
 * compileTemplate(), and exports two pre-compiled template functions:
 *
 *   __str  — string-mode: (data, viewId, refData, encHtml, strSafe, encUri, refFn, encQuote) => string
 *   __vdom — VDOM-mode:   (data, viewId, refData) => VDomNode
 *
 * registerThemeViews() selects the correct function based on the
 * consumer's FrameworkConfig.virtualDom setting at runtime.
 *
 * Virtual modules (virtual:lark-docs/*) are used instead of direct .html
 * imports to avoid conflicts with larkMvcPlugin7 which intercepts all .html
 * imports via its own resolveId hook.
 */

declare module "virtual:lark-docs/docs-layout" {
  const __str: (...args: unknown[]) => string;
  const __vdom: (data: unknown, viewId: string, refData: unknown) => unknown;
  export { __str, __vdom };
}

declare module "virtual:lark-docs/sidebar" {
  const __str: (...args: unknown[]) => string;
  const __vdom: (data: unknown, viewId: string, refData: unknown) => unknown;
  export { __str, __vdom };
}

declare module "virtual:lark-docs/toc" {
  const __str: (...args: unknown[]) => string;
  const __vdom: (data: unknown, viewId: string, refData: unknown) => unknown;
  export { __str, __vdom };
}

declare module "virtual:lark-docs/search" {
  const __str: (...args: unknown[]) => string;
  const __vdom: (data: unknown, viewId: string, refData: unknown) => unknown;
  export { __str, __vdom };
}

// Algolia DocSearch CSS (side-effect import from node_modules)
declare module "@docsearch/css";

declare module "@lark-docs/generated" {
  import type { DocsConfig, PageData } from "@lark.js/docs";

  export function loadContent(
    path: string,
  ): Promise<{ pageData: PageData; contentHtml: string } | null>;

  export const routes: Record<string, string>;

  export const docsConfig: DocsConfig;

  export interface SearchEntry {
    title: string;
    link: string;
    headings: string[];
    excerpt: string;
  }

  export function getSearchIndex(): Promise<SearchEntry[]>;
}
