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
import { chartDataApi2 } from "@/apis/dashboard";
import type { ECOption } from "@/utils/echarts";

const getChartOption2 = async () => {
  const res = await chartDataApi2();
  const chartOption: ECOption = {
    title: {
      text: "机器人电量统计",
    },
    tooltip: {
      trigger: "axis", // 坐标轴触发
    },
    legend: {
      data: [],
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: [
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
      ],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "",
        type: "line",
        data: [],
        lineStyle: { width: 3 },
        itemStyle: {
          // --color-1st: #3d8d7a;
          color: "#3d8d7a",
          shadowBlur: 5,
          shadowColor: "#ccc",
        },
        smooth: true,
      },
      {
        name: "",
        type: "line",
        data: [],
        lineStyle: { width: 3 },
        itemStyle: {
          // --color-2nd: #b3d8a8;
          color: "#b3d8a8",
          shadowBlur: 5,
          shadowColor: "#ccc",
        },
        smooth: true,
      },
      {
        name: "",
        type: "line",
        data: [],
        lineStyle: { width: 3 },
        itemStyle: {
          // --color-4th: #a3d1c6;
          color: "#a3d1c6",
          shadowBlur: 5,
          shadowColor: "#ccc",
        },
        smooth: true,
      },
    ],
  };

  (chartOption.legend as any).data = res.data.map(({ name }) => name);
  for (let i = 0; i < res.data.length; i++) {
    (chartOption.series as any)[i].name = res.data[i].name;
    (chartOption.series as any)[i].data = res.data[i].data;
  }
  return chartOption;
};

export default getChartOption2;
