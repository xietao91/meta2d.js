<template>
  <div class="props-panel">
    <a-form layout="vertical">
      <h5 class="mb-24">图纸</h5>
      <a-form-item label="图纸名称" name="name">
        <a-input v-model:value="data.name" @change="onChangeData" />
      </a-form-item>
      <a-divider />
      <a-form-item label="网格" name="grid">
        <a-switch v-model:checked="options.grid" @change="onChangeOptions" />
      </a-form-item>
      <a-form-item label="网格大小" name="gridSize">
        <a-input-number
          v-model:value="options.gridSize"
          :min="1"
          @change="onChangeOptions"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item label="网格角度" name="gridRotate">
        <a-input-number
          v-model:value="options.gridRotate"
          @change="onChangeOptions"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item label="网格颜色" name="gridColor">
        <ColorPickerField
          v-model="options.gridColor"
          @change="onChangeOptions"
        />
      </a-form-item>

      <a-divider />

      <a-form-item label="标尺" name="rule">
        <a-switch v-model:checked="options.rule" @change="onChangeOptions" />
      </a-form-item>

      <a-divider />

      <a-form-item label="背景颜色" name="background">
        <ColorPickerField
          v-model="data.background"
          @change="onChangeData"
        />
      </a-form-item>
      <a-form-item label="图元默认颜色" name="color">
        <ColorPickerField
          v-model="data.color"
          @change="onChangeData"
        />
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive } from 'vue';
import ColorPickerField from './ColorPickerField.vue';

// 图纸数据
const data = reactive<any>({
  name: '',
  background: undefined,
  color: undefined,
});

// 画布选项
const options = reactive<any>({
  grid: false,
  gridSize: 10,
  gridRotate: undefined,
  gridColor: undefined,
  rule: true,
});

onMounted(() => {
  const d: any = meta2d.data();
  data.name = d.name || '';
  data.background = d.background;
  data.color = d.color;

  Object.assign(options, meta2d.getOptions());
});

const onChangeData = () => {
  Object.assign(meta2d.store.data, data);
  meta2d.store.patchFlagsBackground = true;
  meta2d.render();
};

const onChangeOptions = () => {
  meta2d.setOptions(options);
  meta2d.store.patchFlagsTop = true;
  meta2d.store.patchFlagsBackground = true;
  meta2d.render();
};
</script>
<style lang="postcss" scoped>
.props-panel {
  :deep(.ant-form) {
    .ant-form-item {
      margin-bottom: 8px;
    }
    .ant-form-item-label {
      padding-bottom: 4px;
    }

    .ant-divider {
      margin: 12px 0;
    }

  }
}
</style>
