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
import { ElContainer, ElHeader, ElAside, ElMain } from "element-plus";
import AsideMenu from "@/components/aside/aside-menu.vue";
import HeaderMain from "@/components/header/header-main.vue";
import LayoutTab from "./layout-tabs.vue";
import { onUnmounted, ref, useTemplateRef } from "vue";
import bus from "@/utils/bus";

const watermarked = ref(false);

const tabContainerRef =
  useTemplateRef<InstanceType<typeof ElMain>>("tabContainerRef");
const storeScrollTop = () => {
  sessionStorage.setItem(
    "scroll-top",
    tabContainerRef.value?.$el.scrollTop.toString(),
  );
  tabContainerRef.value!.$el.scrollTop = 0;
};
const setScrollTop = () => {
  tabContainerRef.value!.$el.scrollTop = Number.parseFloat(
    sessionStorage.getItem("scroll-top")!,
  );
};
bus.subscribe("store-scrollTop", storeScrollTop);
bus.subscribe("set-scrollTop", setScrollTop);

onUnmounted(() => {
  bus.unsubscribe("store-scrollTop", storeScrollTop);
  bus.unsubscribe("set-scrollTop", setScrollTop);
});
</script>

<template>
  <ElContainer>
    <ElAside class="h-dvh! w-50! bg-white shadow-lg">
      <AsideMenu></AsideMenu>
    </ElAside>
    <ElContainer>
      <ElHeader class="z-10 h-[10vh]! p-0!">
        <HeaderMain
          @switch-watermark="(isAlive: boolean) => (watermarked = isAlive)"
        ></HeaderMain>
      </ElHeader>
      <ElMain class="h-[90vh]!" ref="tabContainerRef">
        <LayoutTab :watermarked="watermarked"></LayoutTab>
      </ElMain>
      <!-- <ElBacktop :right="100" :bottom="100" /> -->
    </ElContainer>
  </ElContainer>
</template>

<style scoped lang="scss">
/** 隐藏滚动条 */
.el-aside::-webkit-scrollbar {
  display: none;
}
</style>
