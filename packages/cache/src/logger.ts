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

export interface Logger {
  info(msg: string): void;
  warn(msg: string): void;
  error(msg: string): void;
}

let current: Logger = {
  info: (msg) => console.log(`[SwiftyCache] ${msg}`),
  warn: (msg) => console.warn(`[SwiftyCache] ${msg}`),
  error: (msg) => console.error(`[SwiftyCache] ${msg}`),
};

export function setLogger(logger: Logger): void {
  current = logger;
}

export const log: Logger = {
  info: (msg) => current.info(msg),
  warn: (msg) => current.warn(msg),
  error: (msg) => current.error(msg),
};
