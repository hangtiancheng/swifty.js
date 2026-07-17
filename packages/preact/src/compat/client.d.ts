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

// Intentionally not using a relative path to take advantage of
// the TS version resolution mechanism
// @ts-ignore
import * as preact from "../index.d.ts";

export function createRoot(container: preact.ContainerNode): {
  render(children: preact.ComponentChild): void;
  unmount(): void;
};

export function hydrateRoot(
  container: preact.ContainerNode,
  children: preact.ComponentChild,
): ReturnType<typeof createRoot>;
