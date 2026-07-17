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

import fs from "node:fs";
import { IRobotList } from "../types";
import { Connect } from "vite";

function readRobotList(): IRobotList["data"] {
  const jsonStr = fs.readFileSync("./plugins/assets/robot-list.json", "utf8");
  return JSON.parse(jsonStr);
}

export const markerListFn: Connect.NextHandleFunction = (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const resData = readRobotList();
  // resData[0].lng = 31.251326
  // resData[0].lat = 121.391229
  res.end(
    JSON.stringify({
      code: 200,
      message: "获取地图标记列表成功",
      data: { list: resData },
    }),
  );
};
