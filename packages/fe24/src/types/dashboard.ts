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

export interface IResData {
  code: number;
  message: string;
}

export type IChartData = {
  data: {
    name: string;
    value: number;
  }[];
} & IResData;

export type IChartData2 = {
  data: {
    name: string;
    data: number[];
  }[];
} & IResData;

export type IChartData3 = {
  data: [number, number, number, number, number];
} & IResData;

export interface IRevenueItem {
  id: number;
  address: string;
  revenue: number;
}

export type IRevenueList = {
  data: IRevenueItem[];
} & IResData;

export interface ITimeLineItem {
  timestamp: number;
  message: string;
}
