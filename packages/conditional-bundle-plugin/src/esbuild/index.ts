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

import fs from "fs/promises";
import path from "path";
import type { Loader, OnLoadArgs, Plugin, PluginBuild } from "esbuild";
import {
  createFilter,
  transformConditionalSource,
  type ConditionalBundleOptions,
} from "../core/index.js";

const EXTENSION_TO_LOADER: Record<string, Loader> = {
  ".cjs": "js",
  ".cts": "ts",
  ".css": "css",
  ".js": "js",
  ".json": "json",
  ".jsx": "jsx",
  ".mjs": "js",
  ".mts": "ts",
  ".ts": "ts",
  ".tsx": "tsx",
  ".txt": "text",
};

function inferLoader(filePath: string): Loader | undefined {
  return EXTENSION_TO_LOADER[path.extname(filePath).toLowerCase()];
}

export default function EsbuildConditionalBundlePlugin(
  options: ConditionalBundleOptions = {},
): Plugin {
  const { includes, excludes, vars = {} } = options;
  const filter = createFilter(includes, excludes);

  return {
    name: "esbuild-plugin-conditional-compile",
    setup(build: PluginBuild) {
      build.onLoad({ filter: /.*/ }, async (args: OnLoadArgs) => {
        if (args.namespace !== "file" || !filter(args.path)) {
          return null;
        }

        const source = await fs.readFile(args.path, "utf8");
        const result = transformConditionalSource(source, vars);

        if (!result) {
          return null;
        }

        return {
          contents: result.code,
          loader: inferLoader(args.path),
          resolveDir: path.dirname(args.path),
        };
      });
    },
  };
}
