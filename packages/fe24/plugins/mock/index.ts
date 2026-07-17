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

import { fakerZH_CN as faker } from "@faker-js/faker";
import type { IRevenueList, IOrderList, IRobotList } from "../types";
import { randArr } from "../utils";

type IRevenueListData = IRevenueList["data"];
const mockRevenueList = (
  amount: number,
): {
  revenueList: IRevenueListData;
} => {
  return {
    revenueList: Array.from({ length: amount }).map((_, index) => ({
      id: index + 1,
      address: faker.location.county(),
      revenue: faker.number.int({ min: 1000000, max: 1000000000 }),
    })),
  };
};

const mockRobotList = (amount: number): IRobotList["data"] => {
  return Array.from({ length: amount }).map((_, index) => ({
    id: index + 1,
    lng: faker.number.float({ min: 28, max: 30.6 }),
    lat: faker.number.float({ min: 118, max: 120.6 }),
    state: faker.number.int({ min: 1, max: 5 }),
    failureNum: faker.number.int({ min: 0, max: 200 }),
    address: faker.location.county(),
    name: faker.word.sample(),
    admin: faker.person.fullName(),
    email: faker.internet.email(),
  }));
};

const mockOrderList = (
  amount: number,
  robotList: IRobotList["data"],
): IOrderList["data"] => {
  const robotIdArr = randArr(0, robotList.length, amount);
  const year = new Date().getFullYear();
  return Array.from({ length: amount }).map(() => {
    const robotId = faker.helpers.arrayElement(robotIdArr);
    return {
      id: faker.string.numeric(7),
      state: faker.helpers.arrayElement([1, 2, 3]),
      date: faker.date
        .between({ from: `${year}-01-01`, to: `${year}-12-31` })
        .toISOString()
        .split("T")[0],
      robotId: robotId,
      robotName: robotList[robotId].name,
    };
  });
};

export { mockRevenueList, mockRobotList, mockOrderList };
