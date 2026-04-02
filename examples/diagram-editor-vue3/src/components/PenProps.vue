<template>
  <a-tabs v-model:activeKey="activeKey" centered>
    <a-tab-pane key="appearance" tab="外观">
      <Appearance />
    </a-tab-pane>
    <a-tab-pane key="data" tab="数据">
      <CustomData />
    </a-tab-pane>
    <a-tab-pane key="animation" tab="动画">
      <Animation />
    </a-tab-pane>
  </a-tabs>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Appearance from './Appearance.vue';
import CustomData from './CustomData.vue';
import Animation from './Animation.vue';

const TAB_STORAGE_KEY = 'diagram-editor.pen-props.active-tab';
const validTabs = ['appearance', 'data', 'animation'];

const savedTab = localStorage.getItem(TAB_STORAGE_KEY) || 'appearance';
const activeKey = ref(validTabs.includes(savedTab) ? savedTab : 'appearance');

watch(activeKey, (value) => {
  localStorage.setItem(TAB_STORAGE_KEY, value);
});
</script>

<style lang="postcss" scoped></style>
