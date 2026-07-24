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

import { useEffect, useRef } from "preact/hooks";
import { z } from "zod";
import { useDocs } from "./context";
import { createLocalSearchClient } from "./docs-search-local";
import { SearchEntrySchema } from "./lib/content";

export function DocSearchWidget() {
  const docs = useDocs();
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const raw = docs.getSearchIndex ? await docs.getSearchIndex() : [];
      const parsed = z.array(SearchEntrySchema).safeParse(raw);
      const index = parsed.success ? parsed.data : [];
      const localClient = createLocalSearchClient(index);

      void import("@docsearch/css");
      try {
        const { default: docsearch } = await import("@docsearch/js");
        if (cancelled || !container.current) return;
        docsearch({
          container: container.current,
          appId: "local",
          apiKey: "local",
          indexName: "local",
          transformSearchClient: (client) =>
            new Proxy(client, {
              get(target, prop, receiver) {
                if (prop === "search") return localClient.search;
                return Reflect.get(target, prop, receiver);
              },
            }),
        });
      } catch (e) {
        console.warn("[@swifty.js/docs] Failed to initialize DocSearch:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [docs.getSearchIndex]);

  return <div id="docsearch-container" ref={container} />;
}
