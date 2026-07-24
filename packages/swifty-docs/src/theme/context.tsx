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

import { createContext } from "preact";
import { useContext, useMemo, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
import {
  DocsConfigSchema,
  FALLBACK_CONFIG,
  GetSearchIndexSchema,
  LoadContentSchema,
  type GetSearchIndexFn,
  type LoadContentFn,
  type RuntimeDocsConfig,
} from "./lib/content";

interface DocsContextValue {
  config: RuntimeDocsConfig;
  loadContent: LoadContentFn | null;
  getSearchIndex: GetSearchIndexFn | null;
  searchProvider: "local" | "docsearch" | "none";
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  toggleSearch: () => void;
}

const DocsContext = createContext<DocsContextValue | null>(null);

export interface DocsProviderProps {
  config: unknown;
  loadContent: unknown;
  getSearchIndex: unknown;
  children?: ComponentChildren;
}

export function DocsProvider(props: DocsProviderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  const value = useMemo<DocsContextValue>(() => {
    const configParse = DocsConfigSchema.safeParse(props.config);
    if (!configParse.success) {
      console.warn(
        "[@swifty.js/docs] docsConfig failed validation — using fallback.",
        configParse.error.issues,
      );
    }
    const config = configParse.success ? configParse.data : FALLBACK_CONFIG;

    const loadContentParse = LoadContentSchema.safeParse(props.loadContent);
    if (!loadContentParse.success) {
      console.warn(
        "[@swifty.js/docs] loadContent not injected — pages cannot be loaded.",
      );
    }
    const searchIndexParse = GetSearchIndexSchema.safeParse(
      props.getSearchIndex,
    );

    return {
      config,
      loadContent: loadContentParse.success ? loadContentParse.data : null,
      getSearchIndex: searchIndexParse.success ? searchIndexParse.data : null,
      searchProvider: config.search?.provider ?? "local",
      searchOpen,
      setSearchOpen,
      toggleSearch: () => setSearchOpen((v) => !v),
    };
  }, [props.config, props.loadContent, props.getSearchIndex, searchOpen]);

  return (
    <DocsContext.Provider value={value}>{props.children}</DocsContext.Provider>
  );
}

export function useDocs(): DocsContextValue {
  const ctx = useContext(DocsContext);
  if (!ctx) {
    throw new Error("useDocs must be used inside a <DocsProvider>");
  }
  return ctx;
}
