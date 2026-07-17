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

import type { IRobotItem } from "@/types/robot";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useRobotStore = defineStore("robot", () => {
  const defaultRowData: IRobotItem = {
    id: 0, // id > 0
    name: "",
    address: "",
    state: 1,
    failureNum: 0,
    admin: "",
    email: "",
  };

  // state
  const rowData = ref<IRobotItem>(defaultRowData);

  // actions
  const setRowData = (newRowData: IRobotItem) => {
    rowData.value = newRowData;
  };

  const resetRowData = () => {
    rowData.value = defaultRowData;
  };

  return {
    rowData,
    setRowData,
    resetRowData,
  };
});
