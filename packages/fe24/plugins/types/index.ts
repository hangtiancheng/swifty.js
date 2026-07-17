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

import { adminMenu, userMenu } from "../constants";

export interface IResData {
  code: number;
  message: string;
}

export interface ILoginResData {
  data?: {
    token: string;
    auth: string;
    menuList: typeof adminMenu | typeof userMenu;
  };
}

export interface IChartData {
  data: {
    name: string;
    value: number;
  }[];
}

export interface IChartData2 {
  data: {
    name: string;
    data: number[];
  }[];
}

export interface IChartData3 {
  data: [number, number, number, number, number];
}

export interface IRevenueList {
  data: {
    id: number;
    address: string;
    revenue: number;
  }[];
}

export type IRobotList = {
  data: {
    id: number;
    address: string;
    name: string;
    state: /* 0 | 1 | 2 | 3 | 4 | 5 */ number;
    failureNum: number;
    admin: string;
    email: string;
    lat: number;
    lng: number;
  }[];
};

export type IOrderList = {
  data: {
    id: string;
    state: /* 0 | 1 | 2 | 3 */ number;
    robotId: number;
    robotName: string;
    date: string;
  }[];
};
