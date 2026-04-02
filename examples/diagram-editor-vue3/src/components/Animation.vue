<template>
  <div class="props-panel">
    <a-form layout="vertical" v-if="pen">
      <h5 class="mb-24">动画</h5>

      <a-alert
        :message="isLinePen ? '当前为连线图元' : '当前为节点图元'"
        description="自动播放用于预览页进入后自动执行；编辑页可用下方控制按钮即时预览。"
        type="info"
        show-icon
        style="margin-bottom: 8px"
      />

      <a-form-item label="动画预设" name="preset">
        <a-select
          v-model:value="presetKey"
          :options="presetOptions"
          placeholder="选择一个预设并自动应用"
          @change="applyPreset"
        />
      </a-form-item>

      <a-form-item label="编辑态即时预览" name="previewInEditor">
        <a-switch v-model:checked="previewInEditor" />
      </a-form-item>

      <a-form-item label="动画时长(ms)" name="duration">
        <a-input-number
          :min="100"
          :step="100"
          v-model:value="pen.duration"
          @change="changeValue('duration')"
          style="width: 100%"
        />
      </a-form-item>

      <a-form-item label="自动播放" name="autoPlay">
        <a-switch
          v-model:checked="pen.autoPlay"
          @change="changeValue('autoPlay')"
        />
      </a-form-item>

      <a-form-item label="循环播放" name="playLoop">
        <a-switch
          v-model:checked="pen.playLoop"
          @change="changeValue('playLoop')"
        />
      </a-form-item>

      <a-form-item label="循环次数(0表示无限)" name="animateCycle">
        <a-input-number
          :min="0"
          :step="1"
          v-model:value="pen.animateCycle"
          @change="changeValue('animateCycle')"
          style="width: 100%"
        />
      </a-form-item>

      <a-form-item label="反向播放" name="animateReverse">
        <a-switch
          v-model:checked="pen.animateReverse"
          @change="changeValue('animateReverse')"
        />
      </a-form-item>

      <a-form-item label="动画颜色" name="animateColor">
        <ColorPickerField
          v-model="pen.animateColor"
          @change="changeValue('animateColor')"
        />
      </a-form-item>

      <a-form-item v-if="!isLinePen" label="阴影动画" name="animateShadow">
        <a-switch
          v-model:checked="pen.animateShadow"
          @change="changeValue('animateShadow')"
        />
      </a-form-item>

      <a-form-item
        v-if="!isLinePen && pen.animateShadow"
        label="阴影模糊"
        name="animateShadowBlur"
      >
        <a-input-number
          :min="0"
          :step="1"
          v-model:value="pen.animateShadowBlur"
          @change="changeValue('animateShadowBlur')"
          style="width: 100%"
        />
      </a-form-item>

      <a-form-item v-if="isLinePen" label="线条动画类型" name="lineAnimateType">
        <a-select
          v-model:value="pen.lineAnimateType"
          @change="changeValue('lineAnimateType')"
        >
          <a-select-option :value="0">水流</a-select-option>
          <a-select-option :value="1">水珠流动</a-select-option>
          <a-select-option :value="2">圆点</a-select-option>
          <a-select-option :value="3">箭头</a-select-option>
          <a-select-option :value="4">水滴</a-select-option>
          <a-select-option :value="5">自定义</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item
        v-if="isLinePen"
        label="动画元素数量"
        name="lineAnimateElementCount"
      >
        <a-input-number
          :min="1"
          :step="1"
          v-model:value="pen.lineAnimateElementCount"
          @change="changeValue('lineAnimateElementCount')"
          style="width: 100%"
        />
      </a-form-item>

      <a-form-item
        v-if="isLinePen"
        label="动画元素宽度"
        name="lineAnimateElementWidth"
      >
        <a-input-number
          :min="1"
          :step="1"
          v-model:value="pen.lineAnimateElementWidth"
          @change="changeValue('lineAnimateElementWidth')"
          style="width: 100%"
        />
      </a-form-item>

      <a-form-item label="状态" name="state">
        <a-tag :color="stateTagColor">{{ stateLabel }}</a-tag>
      </a-form-item>

      <a-space wrap class="actions-space">
        <a-button class="action-btn" type="primary" @click="startAnimate"
          >开始</a-button
        >
        <a-button class="action-btn" @click="pauseAnimate">暂停</a-button>
        <a-button class="action-btn" danger @click="stopAnimate">停止</a-button>
      </a-space>

      <a-button block style="margin-top: 8px" @click="clearAnimate"
        >清除动画配置</a-button
      >
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { message } from "ant-design-vue";
import { useSelection } from "@/services/selections";
import ColorPickerField from "./ColorPickerField.vue";

const { selections } = useSelection();

const pen = ref<any>();
const previewInEditor = ref(true);
const presetKey = ref<string>();
const animationState = ref<"stopped" | "running" | "paused">("stopped");

const isLinePen = computed(() => {
  return pen.value?.type === 1;
});

const stateLabel = computed(() => {
  if (animationState.value === "running") {
    return "运行中";
  }
  if (animationState.value === "paused") {
    return "已暂停";
  }
  return "已停止";
});

const stateTagColor = computed(() => {
  if (animationState.value === "running") {
    return "green";
  }
  if (animationState.value === "paused") {
    return "orange";
  }
  return "default";
});

const presetOptions = computed(() => {
  const common = [
    { label: "通用-慢速呼吸", value: "common-breathe" },
    { label: "通用-快速闪烁", value: "common-flash" },
  ];
  if (isLinePen.value) {
    return [
      ...common,
      { label: "线条-水流", value: "line-flow" },
      { label: "线条-箭头", value: "line-arrow" },
    ];
  }
  return [
    ...common,
    { label: "节点-柔光", value: "node-glow" },
    { label: "节点-脉冲", value: "node-pulse" },
  ];
});

const applyPenValues = (values: Record<string, any>, shouldPreview = false) => {
  if (!pen.value?.id) {
    return;
  }
  Object.assign(pen.value, values);
  meta2d.setValue({ id: pen.value.id, ...values }, { render: true });
  persistMeta2d();
  if (shouldPreview && previewInEditor.value) {
    startAnimate();
  }
};

onMounted(() => {
  getPen();
});

const persistMeta2d = () => {
  localStorage.setItem("meta2d", JSON.stringify(meta2d.data()));
};

const getPen = () => {
  pen.value = selections.pen;
  if (!pen.value) {
    return;
  }
  if (pen.value.duration == undefined) {
    pen.value.duration = 1000;
  }
  if (pen.value.animateCycle == undefined) {
    pen.value.animateCycle = 0;
  }
  if (pen.value.autoPlay == undefined) {
    pen.value.autoPlay = false;
  }
  if (pen.value.playLoop == undefined) {
    pen.value.playLoop = false;
  }
  if (pen.value.animateReverse == undefined) {
    pen.value.animateReverse = false;
  }
  if (pen.value.lineAnimateType == undefined) {
    pen.value.lineAnimateType = 0;
  }
  if (pen.value.lineAnimateElementCount == undefined) {
    pen.value.lineAnimateElementCount = 1;
  }
  if (pen.value.lineAnimateElementWidth == undefined) {
    pen.value.lineAnimateElementWidth = 12;
  }
  if (pen.value.animateShadow == undefined) {
    pen.value.animateShadow = false;
  }
  if (pen.value.animateShadowBlur == undefined) {
    pen.value.animateShadowBlur = 6;
  }
  presetKey.value = undefined;
  animationState.value = "stopped";
};

const changeValue = (prop: string) => {
  if (!pen.value?.id) {
    return;
  }
  applyPenValues({ [prop]: pen.value[prop] }, true);
};

const applyPreset = (key: string) => {
  if (!pen.value?.id) {
    return;
  }
  const values: Record<string, any> = {};
  switch (key) {
    case "common-breathe":
      Object.assign(values, {
        duration: 1800,
        autoPlay: true,
        playLoop: true,
        animateCycle: 0,
        animateReverse: false,
      });
      break;
    case "common-flash":
      Object.assign(values, {
        duration: 600,
        autoPlay: true,
        playLoop: true,
        animateCycle: 0,
        animateReverse: true,
      });
      break;
    case "line-flow":
      Object.assign(values, {
        duration: 1200,
        autoPlay: true,
        playLoop: true,
        animateCycle: 0,
        lineAnimateType: 0,
        lineAnimateElementCount: 1,
        lineAnimateElementWidth: 12,
      });
      break;
    case "line-arrow":
      Object.assign(values, {
        duration: 900,
        autoPlay: true,
        playLoop: true,
        animateCycle: 0,
        lineAnimateType: 3,
        lineAnimateElementCount: 2,
        lineAnimateElementWidth: 16,
      });
      break;
    case "node-glow":
      Object.assign(values, {
        duration: 1500,
        autoPlay: true,
        playLoop: true,
        animateCycle: 0,
        animateShadow: true,
        animateShadowBlur: 8,
        animateColor: "#30EEDC",
      });
      break;
    case "node-pulse":
      Object.assign(values, {
        duration: 900,
        autoPlay: true,
        playLoop: true,
        animateCycle: 0,
        animateReverse: true,
        animateShadow: true,
        animateShadowBlur: 6,
      });
      break;
    default:
      return;
  }
  applyPenValues(values, true);
  message.success("已应用动画预设");
};

const startAnimate = () => {
  if (!pen.value) {
    return;
  }
  meta2d.stopAnimate([pen.value]);
  meta2d.startAnimate([pen.value]);
  animationState.value = "running";
};

const pauseAnimate = () => {
  if (!pen.value) {
    return;
  }
  meta2d.pauseAnimate([pen.value]);
  animationState.value = "paused";
};

const stopAnimate = () => {
  if (!pen.value) {
    return;
  }
  meta2d.stopAnimate([pen.value]);
  animationState.value = "stopped";
};

const clearAnimate = () => {
  if (!pen.value?.id) {
    return;
  }
  const id = pen.value.id;
  pen.value.autoPlay = false;
  pen.value.playLoop = false;
  pen.value.duration = 1000;
  pen.value.animateCycle = 0;
  pen.value.animateReverse = false;
  pen.value.animateColor = undefined;
  pen.value.lineAnimateType = 0;
  pen.value.lineAnimateElementCount = 1;
  pen.value.lineAnimateElementWidth = 12;
  pen.value.animateShadow = false;
  pen.value.animateShadowBlur = 6;
  meta2d.stopAnimate([pen.value]);
  meta2d.setValue(
    {
      id,
      autoPlay: false,
      playLoop: false,
      duration: 1000,
      animateCycle: 0,
      animateReverse: false,
      animateColor: undefined,
      lineAnimateType: 0,
      lineAnimateElementCount: 1,
      lineAnimateElementWidth: 12,
      animateShadow: false,
      animateShadowBlur: 6,
    },
    { render: true },
  );
  persistMeta2d();
  presetKey.value = undefined;
  animationState.value = "stopped";
};

// 监听选中图元变化
// @ts-ignore
const watcher = watch(() => selections.pen?.id, getPen);

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
  }

  .actions-space {
    display: flex;
    width: 100%;
    gap: 4px;
  }

  .actions-space :deep(.ant-space-item) {
    flex: 1 1 calc(33.33% - 4px);
    min-width: 0;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
