<template>
  <a-popover trigger="click" placement="bottomLeft" overlayClassName="color-picker-popover">
    <template #content>
      <div class="color-picker-panel">
        <div class="color-picker-panel__header">
          <button
            type="button"
            class="color-picker-panel__preview"
            :class="{ 'is-empty': !normalizedValue }"
            @click="applyColor(normalizedValue || defaultColor)"
          >
            <span
              class="color-picker-panel__preview-swatch"
              :style="{ background: normalizedValue || 'transparent' }"
            />
            <span class="color-picker-panel__preview-text">
              {{ normalizedValue || "未设置" }}
            </span>
          </button>
          <a-button size="small" @click="clearColor">清除</a-button>
        </div>

        <div class="color-picker-panel__section">
          <div class="color-picker-panel__title">预置颜色</div>
          <div class="color-picker-panel__grid">
            <button
              v-for="color in presetColors"
              :key="color"
              type="button"
              class="color-picker-panel__swatch"
              :class="{ 'is-active': normalizedValue === color }"
              :style="{ background: color }"
              :title="color"
              @click="applyColor(color)"
            />
          </div>
        </div>

        <div v-if="recentColors.length" class="color-picker-panel__section">
          <div class="color-picker-panel__title">最近使用</div>
          <div class="color-picker-panel__grid">
            <button
              v-for="color in recentColors"
              :key="color"
              type="button"
              class="color-picker-panel__swatch"
              :class="{ 'is-active': normalizedValue === color }"
              :style="{ background: color }"
              :title="color"
              @click="applyColor(color)"
            />
          </div>
        </div>

        <div class="color-picker-panel__footer">
          <input
            :value="nativeColorValue"
            type="color"
            class="color-picker-panel__native"
            @input="onNativeColorInput"
          />
          <a-input
            :value="inputValue"
            placeholder="#1677FF"
            @input="onInputChange"
            @blur="commitInputValue"
            @pressEnter="commitInputValue"
          />
        </div>
      </div>
    </template>

    <button
      type="button"
      class="color-picker-trigger"
      :class="{ 'is-empty': !normalizedValue }"
    >
      <span
        class="color-picker-trigger__swatch"
        :style="{ background: normalizedValue || 'transparent' }"
      />
      <span class="color-picker-trigger__text">
        {{ normalizedValue || "请选择颜色" }}
      </span>
    </button>
  </a-popover>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";

const RECENT_COLORS_STORAGE_KEY = "meta2d-color-recent";
const MAX_RECENT_COLORS = 10;
const presetColors = [
  "#000000",
  "#434343",
  "#666666",
  "#999999",
  "#B7B7B7",
  "#D9D9D9",
  "#F3F3F3",
  "#FFFFFF",
  "#F5222D",
  "#FA541C",
  "#FA8C16",
  "#FADB14",
  "#52C41A",
  "#13C2C2",
  "#1677FF",
  "#2F54EB",
  "#722ED1",
  "#EB2F96",
  "#8C8C8C",
  "#A8071A",
];

const props = withDefaults(
  defineProps<{
    modelValue?: string;
  }>(),
  {
    modelValue: undefined,
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string | undefined): void;
  (e: "change", value: string | undefined): void;
}>();

const inputValue = ref("");
const recentColors = ref<string[]>([]);
const defaultColor = presetColors[14];

const normalizeHexColor = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  const hex = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(hex)) {
    return undefined;
  }

  const normalizedHex =
    hex.length === 3
      ? hex
          .split("")
          .map((char) => char + char)
          .join("")
      : hex;

  return `#${normalizedHex.toUpperCase()}`;
};

const normalizedValue = computed(() => normalizeHexColor(props.modelValue));
const nativeColorValue = computed(() => normalizedValue.value || defaultColor);

const loadRecentColors = () => {
  const stored = localStorage.getItem(RECENT_COLORS_STORAGE_KEY);
  if (!stored) {
    recentColors.value = [];
    return;
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      recentColors.value = [];
      return;
    }

    recentColors.value = parsed
      .map((item) => normalizeHexColor(item))
      .filter((item): item is string => Boolean(item))
      .slice(0, MAX_RECENT_COLORS);
  } catch {
    recentColors.value = [];
  }
};

const saveRecentColor = (color?: string) => {
  if (!color) {
    return;
  }

  const normalized = normalizeHexColor(color);
  if (!normalized) {
    return;
  }

  const nextRecentColors = [
    normalized,
    ...recentColors.value.filter((item) => item !== normalized),
  ].slice(0, MAX_RECENT_COLORS);

  recentColors.value = nextRecentColors;
  localStorage.setItem(RECENT_COLORS_STORAGE_KEY, JSON.stringify(nextRecentColors));
};

const emitColor = (color?: string) => {
  emit("update:modelValue", color);
  emit("change", color);
};

const applyColor = (color?: string) => {
  const normalized = normalizeHexColor(color);
  inputValue.value = normalized || color || "";
  emitColor(normalized);
  saveRecentColor(normalized);
};

const clearColor = () => {
  inputValue.value = "";
  emitColor(undefined);
};

const onNativeColorInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  applyColor(value);
};

const onInputChange = (event: Event) => {
  inputValue.value = (event.target as HTMLInputElement).value;
};

const commitInputValue = () => {
  if (!inputValue.value.trim()) {
    clearColor();
    return;
  }

  const normalized = normalizeHexColor(inputValue.value);
  if (!normalized) {
    inputValue.value = normalizedValue.value || "";
    return;
  }

  applyColor(normalized);
};

watch(
  () => props.modelValue,
  (value) => {
    inputValue.value = normalizeHexColor(value) || value || "";
  },
  { immediate: true }
);

loadRecentColors();
</script>

<style lang="postcss" scoped>
.color-picker-trigger {
  width: 100%;
  min-height: 32px;
  padding: 4px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: #4096ff;
  }

  &:focus-visible {
    outline: none;
    border-color: #4096ff;
    box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.18);
  }

  &.is-empty .color-picker-trigger__swatch {
    background-image:
      linear-gradient(45deg, #f5f5f5 25%, transparent 25%),
      linear-gradient(-45deg, #f5f5f5 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #f5f5f5 75%),
      linear-gradient(-45deg, transparent 75%, #f5f5f5 75%);
    background-size: 10px 10px;
    background-position: 0 0, 0 5px, 5px -5px, -5px 0;
  }
}

.color-picker-trigger__swatch,
.color-picker-panel__preview-swatch {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid rgba(5, 5, 5, 0.12);
  flex-shrink: 0;
}

.color-picker-trigger__text {
  flex: 1;
  text-align: left;
  font-size: 13px;
  color: #262626;
}

.color-picker-panel {
  width: 240px;
}

.color-picker-panel__header,
.color-picker-panel__footer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-picker-panel__preview {
  flex: 1;
  min-width: 0;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  background: #fafafa;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-picker-panel__preview-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 12px;
  color: #595959;
}

.color-picker-panel__section {
  margin-top: 12px;
}

.color-picker-panel__title {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #595959;
}

.color-picker-panel__grid {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  gap: 6px;
}

.color-picker-panel__swatch {
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid rgba(5, 5, 5, 0.12);
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &.is-active {
    box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.25);
  }
}

.color-picker-panel__footer {
  margin-top: 12px;
}

.color-picker-panel__native {
  width: 44px;
  height: 32px;
  padding: 2px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  background: #fff;
}
</style>
