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

// readonly unknown[]
import type { DependencyList } from "react";
import { useRef } from "react";
import { depsAreSame } from "../utils/deps-are-same.js";

/**
 *
 * @description `useCreation` 可以保证, 依赖项数组不改变时, 工厂函数只执行 1 次
 */
function useCreation<T>(factory: () => T, deps: DependencyList): T {
  const { current } = useRef<{
    deps: DependencyList;
    obj: T | undefined;
    initialized: boolean;
  }>({
    deps,
    obj: undefined,
    initialized: false,
  });

  if (!current.initialized || !depsAreSame(current.deps, deps)) {
    current.deps = deps;
    current.obj = factory();
    current.initialized = true;
  }

  return current.obj as T;
}

export default useCreation;
