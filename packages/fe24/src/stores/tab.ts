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

import type { IMenuItem } from "@/types/user";
import { defineStore } from "pinia";
import { ref } from "vue";

// 省略 children 属性的 IMenuItem 类型
type ITabItem = Omit<IMenuItem, "children">;

export const useTabStore = defineStore("tab", () => {
  const tabList = ref<ITabItem[]>([]);

  const addTab = (name: string, icon: string, url: string) => {
    if (tabList.value.some((tab) => tab.url === url)) {
      return;
    }
    tabList.value.push({ name, icon, url });
  };

  const findTab = (url: string) => {
    return tabList.value.findIndex((tab) => tab.url === url);
  };

  const removeTab = (idx: number) => {
    tabList.value.splice(idx, 1);
  };

  return {
    tabList,
    addTab,
    findTab,
    removeTab,
  };
});
