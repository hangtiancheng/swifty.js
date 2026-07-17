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

import type { LoaderContext } from "webpack";
import {
  createFilter,
  transformConditionalSource,
  type ConditionalBundleOptions,
} from "../core/index.js";

export default function loader(
  this: LoaderContext<ConditionalBundleOptions>,
  source: string,
) {
  const options = this.getOptions();
  const { includes, excludes, vars = {} } = options;
  const filter = createFilter(includes, excludes);

  // webpack loader 'this.resourcePath' gives the absolute file path
  if (!filter(this.resourcePath)) {
    return source;
  }

  const result = transformConditionalSource(source, vars);
  if (result) {
    this.callback(null, result.code, result.map);
    return;
  }

  return source;
}
