/**
 * Copyright 2026 hangtiancheng
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Plugin } from "vite";
import {
  createFilter,
  transformConditionalSource,
  type ConditionalBundleOptions,
} from "../core/index.js";

export default function ViteConditionalBundlePlugin(
  options: ConditionalBundleOptions = {},
): Plugin {
  const { includes, excludes, vars = {} } = options;
  const filter = createFilter(includes, excludes);

  return {
    name: "vite-plugin-conditional-compile",
    enforce: "pre" as const,
    transform(code: string, id: string) {
      if (!filter(id)) return null;

      const result = transformConditionalSource(code, vars);
      if (result) {
        return {
          code: result.code,
          map: result.map,
        };
      }
      return null;
    },
  };
}
