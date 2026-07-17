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
import { commaSep } from "@/utils/comma-sep.ts";
import type { IRevenueItem } from "@/types/dashboard";

defineProps<{
  item: IRevenueItem;
  idx: number;
}>();
</script>

<template>
  <div
    class="flex h-full items-center"
    :style="{
      background: idx % 2 === 0 ? '#ecfcca' : '#fff',
    }"
  >
    <div class="w-[20%] text-center">
      {{ commaSep(item.revenue) }}
    </div>
    <div class="w-[80%] truncate">
      {{ item.address }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container::-webkit-scrollbar {
  display: none !important;
}
</style>
