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

import { crc32 } from "./crc32.js";

export interface ConHashConfig {
  defaultReplicas: number;
  minReplicas: number;
  maxReplicas: number;
  hashFunc: (data: string | Buffer) => number;
  loadBalanceThreshold: number;
  autoRebalance?: boolean;
}

export const defaultConHashConfig: ConHashConfig = {
  defaultReplicas: 50,
  minReplicas: 10,
  maxReplicas: 200,
  hashFunc: crc32,
  loadBalanceThreshold: 0.25,
  autoRebalance: false,
};
