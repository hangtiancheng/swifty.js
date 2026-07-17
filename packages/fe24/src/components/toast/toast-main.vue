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

<!-- 特点 -->
<!-- 1. 支持多种提示类型: success, error, warning, default -->
<!-- 2. 自定义显示时长 -->
<!-- 3. 防抖处理, 避免频繁调用 -->
<!-- 4. 优雅的动画效果 -->
<!-- 5. 自动清理资源 -->
<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import { Attention, CheckOne, CloseOne, Caution } from "@icon-park/vue-next";

const props = defineProps<{
  message: string;
  type: "success" | "error" | "warning" | "default";
  duration: number; //! duration >= 500 && duration <= 2500, default 1500
}>();

const isAlive = ref(false);
let timer: number | null = null;

// 资源清理
onBeforeUnmount(() => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
});

/**
 * @description 节流 throttle (只触发第一次)
 */
const mount = () => {
  if (timer) {
    return;
  }
  isAlive.value = true;
  timer = setTimeout(() => {
    isAlive.value = false;
    timer = null;
  }, props.duration);
};

defineExpose({ mount, isAlive });
</script>

<template>
  <!-- enter-active-class="" leave-active-class="" -->
  <Transition name="fade">
    <div
      v-if="isAlive"
      class="border-1st fixed top-[10%] left-[50%] z-100 -translate-x-[50%] rounded-lg border-[3px] p-1.25"
    >
      <div class="flex items-center gap-1.25">
        <CheckOne
          theme="filled"
          size="24"
          fill="#7ed321"
          v-if="type === 'success'"
        />
        <CloseOne
          theme="filled"
          size="24"
          fill="#d0021b"
          v-else-if="type === 'error'"
        />
        <Caution
          theme="filled"
          size="24"
          fill="#f5a623"
          v-else-if="type === 'warning'"
        />
        <!-- type === 'default' -->
        <Attention theme="filled" size="24" fill="#4a90e2" v-else />
        <span>{{ message }}</span>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
