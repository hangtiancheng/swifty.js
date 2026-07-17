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

import type { IResData } from "./dashboard";
export type { IResData };

export interface IRobotItem {
  id: number;
  name: string;
  address: string;
  state:
    | 0 // 全部
    | 1 // 闲置
    | 2 // 使用
    | 3 // 故障
    | 4 // 维修
    | 5; // 报废
  failureNum: number;
  admin: string;
  email: string;
  lat?: number;
  lng?: number;
}

export type IRobotList = {
  data: {
    list: IRobotItem[];
    total?: number;
  };
} & IResData;
