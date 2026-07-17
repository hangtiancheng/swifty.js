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

import type { DependencyList } from "react";

export function depsAreSame(oldDeps: DependencyList, deps: DependencyList) {
  if (oldDeps === deps) {
    return true;
  }

  for (let i = 0; i < oldDeps.length; i++) {
    // oldDeps[i] === deps[i] 和 Object.is() 区别
    // Object.is() 会考虑 NaN 等特殊值
    // NaN === NaN -> false
    // Object.is(NaN, NaN) -> true
    if (!Object.is(oldDeps[i], deps[i])) {
      return false;
    }
  }
  return true;
}
