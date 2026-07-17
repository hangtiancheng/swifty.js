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

import { toChildArray } from "../..";

const mapFn = (children, fn) => {
  if (children == null) return null;
  return toChildArray(toChildArray(children).map(fn));
};

// This API is completely unnecessary for Preact, so it's basically passthrough.
export const Children = {
  map: mapFn,
  forEach: mapFn,
  count(children) {
    return children ? toChildArray(children).length : 0;
  },
  only(children) {
    const normalized = toChildArray(children);
    if (normalized.length !== 1) throw "Children.only";
    return normalized[0];
  },
  toArray: toChildArray,
};
