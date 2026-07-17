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

self.onmessage = function (ev: MessageEvent) {
  const list = ev.data as {
    state: 0 | 1 | 2 | 3 | 4 | 5;
    failureNum: number;
  }[];
  const stateCounts = [0, 0, 0, 0, 0, 0];
  const minMaxAvg = [Infinity, 0, 0];

  // list === undefined; list.length === undefined; list.length === 0;
  if (!list || !list.length) {
    postMessage({ stateCounts, minMaxAvg });
    return;
  }

  stateCounts[0] = list.length;
  for (const item of list) {
    stateCounts[item.state]++;
    minMaxAvg[0] = Math.min(minMaxAvg[0], item.failureNum);
    minMaxAvg[1] = Math.max(minMaxAvg[1], item.failureNum);
    minMaxAvg[2] += item.failureNum;
  }
  minMaxAvg[2] = Number.parseInt((minMaxAvg[2] / list.length).toFixed(0));
  postMessage({ stateCounts, minMaxAvg });

  // worker 子线程可以自我关闭
  /** this. */ self.close();
};
