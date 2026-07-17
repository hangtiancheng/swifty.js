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
import type { IOrderList, IResData } from "@/types/order";
import { get } from "@/utils/http";

export function orderQueryApi(params: {
  id?: string;
  state?: 0 | 1 | 2 | 3;
  robotId?: number;
  robotName?: string;
  startDate?: string;
  endDate?: string;
  pageNum?: number;
  pageSize?: number;
}): Promise<IOrderList> {
  return get(Api.OrderQuery, params);
}

export async function orderDeleteApi(params: {
  idList: string[];
}): Promise<IResData> {
  return get(Api.OrderDelete, { idList: JSON.stringify(params.idList) });
}
