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

import { onMounted, onUnmounted, type Ref } from "vue";
import echarts, { type ECOption } from "@/utils/echarts";

interface IEvent {
  axesInfo?: { value: number }[];
}

export interface ICustomEventOption {
  evName: string;
  handler: (ev: IEvent, chartInstance: echarts.ECharts | null) => void;
}

export function useChart(
  elemRef: Ref<HTMLElement | null>,
  getChartOption: () => Promise<ECOption>,
  customEventOptions?: ICustomEventOption[],
) {
  let chartInstance: echarts.ECharts | null = null;
  const initChart = async () => {
    if (elemRef.value) {
      chartInstance = echarts.init(elemRef.value);
      chartInstance.setOption(await getChartOption());
      customEventOptions?.forEach(({ evName, handler }) => {
        chartInstance?.on(evName, (...args: unknown[]) => {
          handler(args[0] as IEvent, chartInstance);
        });
      });
    }
  };

  const resizeChart = () => {
    chartInstance?.resize();
  };

  const updateChart = async () => {
    chartInstance?.setOption(await getChartOption());
  };

  onMounted(() => {
    initChart();
    window.addEventListener("resize", resizeChart);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", resizeChart);
    chartInstance?.dispose(); // 释放图表实例占用的资源
  });

  return updateChart;
}
