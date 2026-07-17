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
import { ElWatermark } from "element-plus";

import { useUserStore } from "@/stores/user";
defineProps<{
  watermarked: boolean;
}>();
const userStore = useUserStore();
</script>

<template>
  <!--! <RouterView>, <Transition> or <KeepAlive>. Use slot props instead -->
  <ElWatermark
    :content="watermarked ? userStore.username : ''"
    :font="{ fontSize: 28, fontFamily: 'PingFang SC, Microsoft YaHei' }"
  >
    <RouterView v-slot="{ Component }">
      <!-- leave-active-class="animate__animated animate__fadeOutRight" -->
      <Transition enter-active-class="animate__animated animate__fadeInLeft">
        <!-- :include="[组件名数组]" -->
        <!-- 注意: tsx 文件需要在 defineComponent 时指定组件名 -->
        <KeepAlive :include="['FeRobot', 'OrderDetail']">
          <Component :is="Component"></Component>
        </KeepAlive>
      </Transition>
    </RouterView>
  </ElWatermark>
</template>
