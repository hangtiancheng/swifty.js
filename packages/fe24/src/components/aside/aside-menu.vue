<!--
 Copyright 2026 hangtiancheng

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-->

<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import RecursiveChild from "./recursive-child.vue";
import { ElMenu } from "element-plus";
import { Rice } from "@icon-park/vue-next";
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";
import type { IMenuItem } from "@/types/user";

const userStore = useUserStore();
const { menuList } = storeToRefs(userStore);
const route = useRoute();
const router = useRouter();
const handleClick = () => router.push({ name: "Home" });

const defaultOpeneds = computed(() => {
  const keys: string[] = [];
  const findParent = (list: IMenuItem[], parentName?: string) => {
    for (const item of list) {
      if (item.url === route.path && parentName) {
        keys.push(parentName);
      }
      if (item.children) {
        findParent(item.children, item.name);
      }
    }
  };
  findParent(menuList.value);
  return keys;
});
</script>

<template>
  <div>
    <div
      class="flex h-17.5 cursor-pointer items-center justify-center gap-2.5 px-2.5"
      @click="handleClick"
    >
      <Rice theme="filled" size="48" fill="#b8e986" :strokeWidth="3" />
      <h1 class="text-[20px]">机器人</h1>
    </div>

    <ElMenu
      class="menu-list border-none!"
      router
      :default-active="route.path"
      :default-openeds="defaultOpeneds"
    >
      <RecursiveChild
        v-for="item of menuList"
        :key="item.url"
        :item="item"
      ></RecursiveChild>
    </ElMenu>
  </div>
</template>

<style scoped lang="scss">
.menu-list {
  :deep(.is-active) {
    background-color: var(--color-green) !important;
    color: #fff;
    font-size: 16px;
    transition: all;
  }
}

:deep(.el-menu-item) {
  border-radius: 20px;
  &:hover {
    background-color: var(--color-green-light) !important;
  }
}

:deep(.el-sub-menu__title) {
  &:hover {
    background-color: var(--color-green-light) !important;
  }
}
</style>
