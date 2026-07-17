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

import { isFunction } from "./index.js";
import isBrowser from "./is-browser.js";
import type { RefObject } from "react";

type TargetValue<T> = T | undefined | null;

type TargetType = HTMLElement | Element | Document | Window;

export type BasicTarget<T extends TargetType = Element> =
  | TargetValue<T>
  | (() => TargetValue<T>) // Getter
  | RefObject<TargetValue<T>>;

export function getTargetElement<T extends TargetType>(
  target: BasicTarget<T>,
  defaultElement?: T,
): TargetValue<T> {
  if (!isBrowser) {
    return undefined;
  }

  if (!target) {
    return defaultElement;
  }

  let targetElement: TargetValue<T>;

  // RefCallback<TargetValue<T>>

  // Getter
  if (isFunction(target)) {
    targetElement = target();

    // RefObject<TargetValue<T>>
  } else if ("current" in target) {
    targetElement = target.current;

    // TargetValue<T>
  } else {
    targetElement = target;
  }

  return targetElement;
}
