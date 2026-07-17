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
import path from "node:path";
import fs from "node:fs";
import { mockOrderList, mockRobotList } from "./mock";
import { randNum } from "./utils";

export default function createJsonFiles(): Plugin {
  return {
    name: "create-json-files",
    configResolved() {
      const jsonPath = path.resolve(
        process.cwd(),
        "./plugins/assets/robot-list.json",
      );

      const robotList = mockRobotList(randNum(50, 100));
      // 定位到上海市静安区
      robotList[0].lat = 121.391229;
      robotList[0].lng = 31.251326;
      const jsonStr = JSON.stringify(robotList);
      fs.writeFileSync(jsonPath, jsonStr, { encoding: "utf8" });

      const jsonPath2 = path.resolve(
        process.cwd(),
        "./plugins/assets/order-list.json",
      );
      const orderList = mockOrderList(randNum(250, 500), robotList);
      const jsonStr2 = JSON.stringify(orderList);
      fs.writeFileSync(jsonPath2, jsonStr2, { encoding: "utf8" });
    },
  };
}
