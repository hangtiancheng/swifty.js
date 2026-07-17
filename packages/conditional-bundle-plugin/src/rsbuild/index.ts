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

import {
  createFilter,
  transformConditionalSource,
  type ConditionalBundleOptions,
} from "../core/index.js";

interface RsbuildTransformResult {
  code: string;
  map?: unknown;
}

interface RsbuildTransformDescriptor {
  test?: RegExp;
  enforce?: "pre" | "post";
}

interface RsbuildTransformContext {
  code: string;
  resourcePath: string;
}

interface RsbuildPluginAPI {
  transform(
    descriptor: RsbuildTransformDescriptor,
    handler: (
      context: RsbuildTransformContext,
    ) => string | RsbuildTransformResult,
  ): void;
}

interface RsbuildPlugin {
  name: string;
  enforce?: "pre" | "post";
  setup(api: RsbuildPluginAPI): void;
}

export default function RsbuildConditionalBundlePlugin(
  options: ConditionalBundleOptions = {},
): RsbuildPlugin {
  const { includes, excludes, vars = {} } = options;
  const filter = createFilter(includes, excludes);

  return {
    name: "rsbuild-plugin-conditional-compile",
    enforce: "pre",
    setup(api) {
      api.transform(
        {
          enforce: "pre",
          test: /\.[cm]?[jt]sx?$/,
        },
        ({ code, resourcePath }) => {
          if (!filter(resourcePath)) {
            return code;
          }

          const result = transformConditionalSource(code, vars);
          if (!result) {
            return code;
          }

          return {
            code: result.code,
            map: result.map,
          };
        },
      );
    },
  };
}
