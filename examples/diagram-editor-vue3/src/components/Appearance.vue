<template>
  <div class="props-panel">
    <a-form layout="vertical" v-if="pen">
      <h5 class="mb-24">图元</h5>
      <a-form-item label="ID" name="id">
        <a-input
          v-model:value="penId"
          @blur="changePenId"
          @pressEnter="changePenId"
        />
      </a-form-item>
      <a-form-item label="文本" name="text">
        <a-input v-model:value="pen.text" @change="changeValue('text')" />
      </a-form-item>
      <a-form-item label="颜色" name="color">
        <ColorPickerField
          v-model="pen.color"
          @change="changeValue('color')"
        />
      </a-form-item>
      <a-form-item label="背景" name="background">
        <ColorPickerField
          v-model="pen.background"
          @change="changeValue('background')"
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
          style="flex: 1"
        />
        <span style="width: 32px; text-align: right; flex-shrink: 0">
          {{ pen.globalAlpha }}
        </span>
      </a-form-item>

      <a-divider />

      <a-form-item label="X" name="x">
        <a-input-number
          v-model:value="rect.x"
          @change="changeRect('x')"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item label="Y" name="y">
        <a-input-number
          v-model:value="rect.y"
          @change="changeRect('y')"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item label="宽" name="width">
        <a-input-number
          v-model:value="rect.width"
          @change="changeRect('width')"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item label="高" name="height">
        <a-input-number
          v-model:value="rect.height"
          @change="changeRect('height')"
          style="width: 100%"
        />
      </a-form-item>

      <a-divider />

      <a-form-item label="文字水平对齐" name="textAlign">
        <a-select
          v-model:value="pen.textAlign"
          @change="changeValue('textAlign')"
        >
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
          <a-select-option key="bottom" value="bottom"
            >底部对齐</a-select-option
          >
        </a-select>
      </a-form-item>

      <a-divider />

      <!-- 新增：字体大小 -->
      <a-form-item label="字体大小" name="fontSize">
        <a-input-number
          :min="1"
          :step="1"
          v-model:value="pen.fontSize"
          @change="changeValue('fontSize')"
          style="width: 100%"
          placeholder="默认"
        />
      </a-form-item>

      <!-- 新增：文字水平偏移 -->
      <a-form-item label="文字水平偏移" name="textLeft">
        <div style="display: flex; align-items: center; gap: 8px">
          <a-input-number
            v-model:value="pen.textLeft"
            @change="changeValue('textLeft')"
            style="width: 100%"
            placeholder="0"
          />
          <a-button
            size="small"
            style="flex-shrink: 0"
            @click="resetTextOffset('textLeft')"
            title="重置"
          >
            重置
          </a-button>
        </div>
      </a-form-item>

      <!-- 新增：文字垂直偏移 -->
      <a-form-item label="文字垂直偏移" name="textTop">
        <div style="display: flex; align-items: center; gap: 8px">
          <a-input-number
            v-model:value="pen.textTop"
            @change="changeValue('textTop')"
            style="width: 100%"
            placeholder="0"
          />
          <a-button
            size="small"
            style="flex-shrink: 0"
            @click="resetTextOffset('textTop')"
            title="重置"
          >
            重置
          </a-button>
        </div>
      </a-form-item>

      <a-divider />

      <a-space wrap class="actions-space">
        <a-button class="action-btn" @click="top">置顶</a-button>
        <a-button class="action-btn" @click="bottom">置底</a-button>
        <a-button class="action-btn" @click="up">上一层</a-button>
        <a-button class="action-btn" @click="down">下一层</a-button>
      </a-space>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useSelection } from "@/services/selections";
import ColorPickerField from "./ColorPickerField.vue";
import { message } from "ant-design-vue";

const { selections } = useSelection();

const pen = ref<any>();
const penId = ref("");
// 位置数据。当前版本位置需要动态计算获取
const rect = ref<any>();

onMounted(() => {
  getPen();
});

const getPen = () => {
  pen.value = selections.pen;
  penId.value = pen.value?.id || "";
  if (pen.value.globalAlpha == undefined) {
    pen.value.globalAlpha = 1;
  }
  // 初始化偏移默认值，避免显示 undefined
  if (pen.value.textLeft == undefined) {
    pen.value.textLeft = 0;
  }
  if (pen.value.textTop == undefined) {
    pen.value.textTop = 0;
  }

  rect.value = meta2d.getPenRect(pen.value);
};

const changePenId = () => {
  if (!pen.value?.id) {
    return;
  }

  const oldId = pen.value.id;
  const newId = penId.value?.trim();

  if (!newId) {
    message.warning("ID 不能为空");
    penId.value = oldId;
    return;
  }

  if (newId === oldId) {
    penId.value = oldId;
    return;
  }

  if (meta2d.findOne(newId)) {
    message.error("ID 已存在，请使用其他 ID");
    penId.value = oldId;
    return;
  }

  meta2d.changePenId(oldId, newId);
  pen.value = meta2d.findOne(newId) || pen.value;
  selections.pen = pen.value;
  rect.value = meta2d.getPenRect(pen.value);
  penId.value = newId;
  meta2d.render();
  localStorage.setItem("meta2d", JSON.stringify(meta2d.data()));
};

// 监听选中不同图元
// @ts-ignore
const watcher = watch(() => selections.pen.id, getPen);

const lineDashs = [undefined, [5, 5]];

const changeValue = (prop: string) => {
  const v: any = { id: pen.value.id };
  v[prop] = pen.value[prop];
  if (prop === "dash") {
    v.lineDash = lineDashs[v[prop]];
  }
  meta2d.setValue(v, { render: true });
  localStorage.setItem("meta2d", JSON.stringify(meta2d.data()));
};

const changeRect = (prop: string) => {
  const v: any = { id: pen.value.id };
  v[prop] = rect.value[prop];
  meta2d.setValue(v, { render: true });
  localStorage.setItem("meta2d", JSON.stringify(meta2d.data()));
};

// 重置文字偏移为 0
const resetTextOffset = (prop: "textLeft" | "textTop") => {
  pen.value[prop] = 0;
  meta2d.setValue({ id: pen.value.id, [prop]: 0 }, { render: true });
  localStorage.setItem("meta2d", JSON.stringify(meta2d.data()));
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

    .ant-space {
      gap: 4px;
    }

    .actions-space {
      display: flex;
      width: 100%;
    }

    .actions-space :deep(.ant-space-item) {
      flex: 1 1 calc(50% - 4px);
      min-width: 0;
    }

    .action-btn {
      width: 100%;
    }
  }
}
</style>
