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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { chartDataApi3 } from "@/apis/dashboard";
import { ROBOT_STATES } from "@/constants";
import type { ECOption } from "@/utils/echarts";

const getChartOption3 = async () => {
  const res = await chartDataApi3();
  const chartOption: ECOption = {
    radar: {
      shape: "circle",
      indicator: ROBOT_STATES.map((state) => ({ name: state, max: 100 })),
    },
    series: [
      {
        name: "机器人运行状态",
        type: "radar",
        // --color-1st: #3d8d7a;
        color: "#3d8d7a",
        data: [
          {
            value: [],
            name: "机器人运行状态",
          },
        ],
      },
    ],
  };
  (chartOption.series as any)[0].data[0].value = res.data;
  return chartOption;
};

export default getChartOption3;
