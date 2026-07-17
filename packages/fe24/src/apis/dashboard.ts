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
import type {
  IChartData,
  IChartData2,
  IChartData3,
  IRevenueList,
} from "@/types/dashboard";
import { get } from "@/utils/http";

async function chartDataApi(): Promise<IChartData> {
  return get(Api.ChartData);
}

async function chartDataApi2(): Promise<IChartData2> {
  return get(Api.ChartData2);
}

async function chartDataApi3(): Promise<IChartData3> {
  return get(Api.ChartData3);
}

async function revenueListApi(): Promise<IRevenueList> {
  return get(Api.RevenueList);
}

export { chartDataApi, chartDataApi2, chartDataApi3, revenueListApi };
