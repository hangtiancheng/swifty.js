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

import { Api } from "@/constants/apis";
import type { IRobotList, IResData } from "@/types/robot";
import { get } from "@/utils/http";

export async function robotQueryApi(params: {
  id?: number;
  name?: string;
  address?: string;
  state?: 0 | 1 | 2 | 3 | 4 | 5;
  pageNum?: number;
  pageSize?: number;
}): Promise<IRobotList> {
  return get(Api.RobotQuery, params);
}

export async function robotAddApi(params: {
  lat?: number;
  lng?: number;
  name: string;
  address: string;
  state: 0 | 1 | 2 | 3 | 4 | 5;
  failureNum: number;
  admin: string;
  email: string;
}): Promise<IResData> {
  return get(Api.RobotAdd, params);
}

export async function robotUpdateApi(params: {
  id: number;
  address: string;
  state: 0 | 1 | 2 | 3 | 4 | 5;
  failureNum: number;
  email: string;
}): Promise<IResData> {
  return get(Api.RobotUpdate, params);
}

export async function robotDeleteApi(params: {
  id: number;
}): Promise<IResData> {
  return get(Api.RobotDelete, params);
}
