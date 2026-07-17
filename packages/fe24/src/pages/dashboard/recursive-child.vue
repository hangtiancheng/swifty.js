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
import type { IMenuItem } from "@/types/user";
import { name2icon } from "@/utils/icons";
import { useRouter } from "vue-router";

defineOptions({
  name: "RecursiveChild",
});

defineProps<{
  item: IMenuItem;
}>();

const router = useRouter();
const handleClick = (url: string) => {
  router.push(url);
};
</script>

<template>
  <main>
    <!-- gap: 70px -->
    <div v-if="item.children" class="flex justify-between gap-17.5">
      <RecursiveChild
        v-for="child of item.children"
        :key="child.url"
        :item="child"
      ></RecursiveChild>
    </div>

    <Component
      v-else
      :is="name2icon.get(item.icon)"
      class="text-[25px] transition-all duration-500 hover:scale-[2] hover:cursor-pointer"
      @click="handleClick(item.url)"
    ></Component>
  </main>
</template>
