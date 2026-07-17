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

import type { Plugin } from "vite";
import { Api } from "./constants";
import {
  chartDataFn,
  chartDataFn2,
  chartDataFn3,
  revenueListFn,
  loginFn,
  robotAddFn,
  robotDeleteFn,
  robotQueryFn,
  markerListFn,
  robotUpdateFn,
  orderQueryFn,
  orderDeleteFn,
} from "./funcs";

export default function viteServer(): Plugin {
  return {
    name: "vite-server",
    configureServer(server) {
      server.middlewares.use(Api.Login, loginFn);
      server.middlewares.use(Api.ChartData, chartDataFn);
      server.middlewares.use(Api.ChartData2, chartDataFn2);
      server.middlewares.use(Api.ChartData3, chartDataFn3);
      server.middlewares.use(Api.RevenueList, revenueListFn);
      server.middlewares.use(Api.RobotQuery, robotQueryFn);
      server.middlewares.use(Api.RobotAdd, robotAddFn);
      server.middlewares.use(Api.RobotUpdate, robotUpdateFn);
      server.middlewares.use(Api.RobotDelete, robotDeleteFn);
      server.middlewares.use(Api.MarkerList, markerListFn);
      server.middlewares.use(Api.OrderQuery, orderQueryFn);
      server.middlewares.use(Api.OrderDelete, orderDeleteFn);
    },
  };
}
