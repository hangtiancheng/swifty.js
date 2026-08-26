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

import { useEffect, useMemo } from "react";
import { useLocation } from "@swifty.js/docs";
import { createAntiCopy, type AntiCopyOptions } from "@/index";
import { DOCS_DEFAULT_EXCLUDES, isPathExcluded } from "./common";

/**
 * Regions excluded from protection by default in a @swifty.js/docs site:
 * code blocks (`.codeblock` chrome incl. the copy button), dialogs such as
 * the search palette, and editable controls.
 */
export const SWIFTY_DOCS_DEFAULT_EXCLUDES = DOCS_DEFAULT_EXCLUDES;

export { isPathExcluded };

export interface SwiftyDocsAntiCopyProps extends AntiCopyOptions {
  /**
   * Route paths exempt from protection. A string matches when the current
   * path equals it or starts with it followed by `/` (trailing slashes on
   * either side are ignored); a RegExp is tested against the full path.
   */
  excludePaths?: (string | RegExp)[];
}

/**
 * Renderless React component wiring copy protection into a @swifty.js/docs
 * app. Mount it anywhere inside `<LocationProvider>` so protection toggles
 * with client-side navigation:
 *
 * ```tsx
 * <LocationProvider>
 *   <AntiCopy mode="replace" excludePaths={["/playground"]} devtools />
 *   <Router>...</Router>
 * </LocationProvider>
 * ```
 */
export function AntiCopy(props: SwiftyDocsAntiCopyProps): null {
  const { excludePaths = [], ...options } = props;
  const { path } = useLocation();

  // The instance lives for the component's lifetime; options changes require a remount.
  const instance = useMemo(
    () =>
      createAntiCopy({
        ...options,
        excludeSelectors: [...SWIFTY_DOCS_DEFAULT_EXCLUDES, ...(options.excludeSelectors ?? [])],
      }),
    [],
  );

  // Serialized so changes to the excludePaths array retrigger the effect.
  const excludeKey = excludePaths.map(String).join("\n");

  useEffect(() => {
    if (isPathExcluded(path, excludePaths)) instance.disable();
    else instance.enable();
  }, [path, excludeKey]);

  useEffect(() => () => instance.disable(), []);

  return null;
}
