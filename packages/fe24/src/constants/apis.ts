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

const version = "v1";

export const enum Api {
  RobotQuery = `/api/${version}/robotQuery`,
  RobotAdd = `/api/${version}/robotAdd`,
  RobotDelete = `/api/${version}/robotDelete`,
  RobotUpdate = `/api/${version}/robotUpdate`,
  ChartData = `/api/${version}/chartData`,
  ChartData2 = `/api/${version}/chartData2`,
  ChartData3 = `/api/${version}/chartData3`,
  RevenueList = `/api/${version}/revenueList`,
  MarkerList = `/api/${version}/markerList`,
  Login = `/api/${version}/login`,
  OrderQuery = `/api/${version}/orderQuery`,
  OrderDelete = `/api/${version}/orderDelete`,
  AddressList = `/api/${version}/addressList`,
}
