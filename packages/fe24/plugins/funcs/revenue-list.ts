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

import { Connect } from "vite";
import { IRevenueList, IResData } from "../types";
import { mockRevenueList } from "../mock";
import { randNum } from "../utils";

const revenueListFn: Connect.NextHandleFunction = (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const revenueListData = mockRevenueList(randNum(1000, 2000) /** amount */);
  const resData: IRevenueList & IResData = {
    code: 200,
    message: "获取营收排行榜成功",
    data: revenueListData.revenueList,
  };
  resData.data.sort((a, b) => b.revenue! - a.revenue!);
  res.end(JSON.stringify(resData));
};

export default revenueListFn;
