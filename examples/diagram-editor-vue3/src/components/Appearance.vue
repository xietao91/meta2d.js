<template>
  <div class="props-panel">
    <a-form layout="vertical" v-if="pen">
      <h5 class="mb-24">图元</h5>
      <a-form-item label="文本" name="text">
        <a-input v-model:value="pen.text" @change="changeValue('text')" />
      </a-form-item>
      <a-form-item label="颜色" name="color">
        <input
          type="color"
          v-model="pen.color"
          @change="changeValue('color')"
          style="width: 100%; height: 32px; cursor: pointer;"
        />
      </a-form-item>
      <a-form-item label="背景" name="background">
        <input
          type="color"
          v-model="pen.background"
          @change="changeValue('background')"
          style="width: 100%; height: 32px; cursor: pointer;"
        />
      </a-form-item>
      <a-form-item label="线条" name="dash">
        <a-select v-model:value="pen.dash" @change="changeValue('dash')">
          <a-select-option :key="0" :value="0">实线</a-select-option>
          <a-select-option :key="1" :value="1">虚线</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="圆角" name="borderRadius">
        <a-input-number
          :min="0"
          :max="1"
          :step="0.01"
          v-model:value="pen.borderRadius"
          @change="changeValue('borderRadius')"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item label="不透明度" name="globalAlpha">
        <a-slider
          v-model:value="pen.globalAlpha"
          :min="0"
          :max="1"
          :step="0.01"
          @change="changeValue('globalAlpha')"
        />
        <span class="ml-16" style="width: 50px; line-height: 30px">
          {{ pen.globalAlpha }}
        </span>
      </a-form-item>

      <a-divider />

      <a-form-item label="X" name="x">
        <a-input-number v-model:value="rect.x" @change="changeRect('x')" style="width: 100%" />
      </a-form-item>
      <a-form-item label="Y" name="y">
        <a-input-number v-model:value="rect.y" @change="changeRect('y')" style="width: 100%" />
      </a-form-item>
      <a-form-item label="宽" name="width">
        <a-input-number v-model:value="rect.width" @change="changeRect('width')" style="width: 100%" />
      </a-form-item>
      <a-form-item label="高" name="height">
        <a-input-number v-model:value="rect.height" @change="changeRect('height')" style="width: 100%" />
      </a-form-item>

      <a-divider />

      <a-form-item label="文字水平对齐" name="textAlign">
        <a-select v-model:value="pen.textAlign" @change="changeValue('textAlign')">
          <a-select-option key="left" value="left">左对齐</a-select-option>
          <a-select-option key="center" value="center">居中</a-select-option>
          <a-select-option key="right" value="right">右对齐</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="文字垂直对齐" name="textBaseline">
        <a-select
          v-model:value="pen.textBaseline"
          @change="changeValue('textBaseline')"
        >
          <a-select-option key="top" value="top">顶部对齐</a-select-option>
          <a-select-option key="middle" value="middle">居中</a-select-option>
          <a-select-option key="bottom" value="bottom">底部对齐</a-select-option>
        </a-select>
      </a-form-item>

      <a-divider />

      <a-space>
        <a-button @click="top">置顶</a-button>
        <a-button @click="bottom">置底</a-button>
        <a-button @click="up">上一层</a-button>
        <a-button @click="down">下一层</a-button>
      </a-space>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useSelection } from '@/services/selections';

const { selections } = useSelection();

const pen = ref<any>();
// 位置数据。当前版本位置需要动态计算获取
const rect = ref<any>();

onMounted(() => {
  getPen();
});

const getPen = () => {
  pen.value = selections.pen;
  if (pen.value.globalAlpha == undefined) {
    pen.value.globalAlpha = 1;
  }

  rect.value = meta2d.getPenRect(pen.value);
};

// 监听选中不同图元
// @ts-ignore
const watcher = watch(() => selections.pen.id, getPen);

const lineDashs = [undefined, [5, 5]];

const changeValue = (prop: string) => {
  const v: any = { id: pen.value.id };
  v[prop] = pen.value[prop];
  if (prop === 'dash') {
    v.lineDash = lineDashs[v[prop]];
  }
  meta2d.setValue(v, { render: true });
};

const changeRect = (prop: string) => {
  const v: any = { id: pen.value.id };
  v[prop] = rect.value[prop];
  meta2d.setValue(v, { render: true });
};

const top = () => {
  meta2d.top();
  meta2d.render();
};
const bottom = () => {
  meta2d.bottom();
  meta2d.render();
};
const up = () => {
  meta2d.up();
  meta2d.render();
};
const down = () => {
  meta2d.down();
  meta2d.render();
};

onUnmounted(() => {
  watcher();
});
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

    input[type="color"] {
      width: 100%;
      height: 32px;
      cursor: pointer;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
    }

    .ant-space {
      gap: 4px;
    }
  }
}
</style>
