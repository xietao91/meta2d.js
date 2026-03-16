<template>
  <a-tabs v-model:activeKey="activeKey" centered>
    <a-tab-pane key="appearance" tab="外观">
      <Appearance />
    </a-tab-pane>
    <a-tab-pane key="data" tab="数据">
      <CustomData />
    </a-tab-pane>
  </a-tabs>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Appearance from './Appearance.vue';
import CustomData from './CustomData.vue';

const activeKey = ref('appearance');
</script>

<style lang="postcss" scoped></style>
