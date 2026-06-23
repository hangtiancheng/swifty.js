/// <reference types="vite/client" />
/**
 * Lark .html template files — compiled by larkMvcPlugin into
 * (data, viewId, refData) => string functions at build time.
 * At type-check time they are treated as string modules.
 */
declare module "*.html" {
  const content: string;
  export default content;
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
