<template>
  <div>
    <h3>自定义数据</h3>
    <a-button type="primary" @click="showModal">添加</a-button>

    <div v-if="customDataList.length > 0" style="margin-top: 20px">
      <div
        v-for="(item, index) in customDataList"
        :key="index"
        class="data-item"
      >
        <div class="item-label">{{ item.displayName }}:</div>
        <div class="item-content">
          <a-input
            v-model:value="item.value"
            :placeholder="item.placeholder"
            style="width: 50px; margin-right: 10px"
            @change="updatePenCustomData"
          />
          <a-button
            size="small"
            @click="showEditModal(item, index)"
            style="margin-right: 10px"
            >编辑</a-button
          >
          <a-button size="small" @click="deleteData(index)">删除</a-button>
        </div>
      </div>
    </div>

    <a-modal
      v-model:open="modalVisible"
      title="添加数据"
      @ok="handleAddOk"
      @cancel="handleAddCancel"
    >
      <a-form
        :model="formState"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 14 }"
      >
        <a-form-item label="显示名称" name="displayName">
          <a-input v-model:value="formState.displayName" />
        </a-form-item>
        <a-form-item label="属性名" name="propertyName">
          <a-input
            v-model:value="formState.propertyName"
            :disabled="isEditMode"
          />
        </a-form-item>
        <a-form-item label="类型" name="type">
          <a-select v-model:value="formState.type">
            <a-select-option value="text">文本</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="提示文字" name="placeholder">
          <a-textarea v-model:value="formState.placeholder" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted } from "vue";
import { message } from "ant-design-vue";
import { useSelection } from "@/services/selections";

const { selections } = useSelection();

const modalVisible = ref(false);
const isEditMode = ref(false);
const editingIndex = ref<number | null>(null);
const pen = ref<any>();
const formState = reactive({
  displayName: "",
  propertyName: "",
  type: "text",
  placeholder: "",
});

const customDataList = reactive<any[]>([]);

onMounted(() => {
  getPen();
});

const getPen = () => {
  pen.value = selections.pen;
  if (pen.value && pen.value.customData) {
    customDataList.splice(
      0,
      customDataList.length,
      ...Object.keys(pen.value.customData).map((key) => ({
        propertyName: key,
        displayName: pen.value.customData[key].displayName || key,
        value: pen.value.customData[key].value || "",
        type: pen.value.customData[key].type || "text",
        placeholder: pen.value.customData[key].placeholder || "",
        editingPropertyName: false,
      })),
    );
  } else {
    customDataList.splice(0, customDataList.length);
  }
};

// 监听选中不同图元
// @ts-ignore
const watcher = watch(() => selections.pen.id, getPen);

const showModal = () => {
  isEditMode.value = false;
  editingIndex.value = null;
  modalVisible.value = true;
};

const showEditModal = (item: any, index: number) => {
  isEditMode.value = true;
  editingIndex.value = index;
  Object.assign(formState, {
    displayName: item.displayName,
    propertyName: item.propertyName,
    type: item.type,
    placeholder: item.placeholder,
  });
  modalVisible.value = true;
};

const updatePenCustomData = () => {
  if (meta2d && pen.value && pen.value.id) {
    const newCustomData: { [key: string]: any } = {};
    customDataList.forEach((item) => {
      newCustomData[item.propertyName] = {
        displayName: item.displayName,
        value: item.value,
        type: item.type,
        placeholder: item.placeholder,
      };
    });
    // 同步更新pen.value.customData
    pen.value.customData = newCustomData;
    meta2d.setValue(
      {
        id: pen.value.id,
        customData: newCustomData,
      },
      { render: true },
    );
    localStorage.setItem("meta2d", JSON.stringify(meta2d.data()));
  }
};

const handleAddOk = () => {
  if (!formState.displayName || !formState.propertyName) {
    message.error("显示名称和属性名不能为空");
    return;
  }

  if (isEditMode.value && editingIndex.value !== null) {
    // 编辑模式
    const oldPropertyName = customDataList[editingIndex.value].propertyName;
    const item = customDataList[editingIndex.value];

    item.displayName = formState.displayName;
    item.propertyName = formState.propertyName;
    item.type = formState.type;
    item.placeholder = formState.placeholder;

    updatePenCustomData();
    message.success("数据修改成功！");
  } else {
    // 添加模式
    if (
      customDataList.some(
        (item) => item.propertyName === formState.propertyName,
      )
    ) {
      message.error("属性名已存在");
      return;
    }

    customDataList.push({
      displayName: formState.displayName,
      propertyName: formState.propertyName,
      type: formState.type,
      placeholder: formState.placeholder,
      value: "",
    });
    updatePenCustomData();
    message.success("数据添加成功！");
  }

  modalVisible.value = false;
  // 清空表单
  Object.assign(formState, {
    displayName: "",
    propertyName: "",
    type: "text",
    placeholder: "",
  });
  isEditMode.value = false;
  editingIndex.value = null;
};

const handleAddCancel = () => {
  modalVisible.value = false;
  // 清空表单
  Object.assign(formState, {
    displayName: "",
    propertyName: "",
    type: "text",
    placeholder: "",
  });
  isEditMode.value = false;
  editingIndex.value = null;
};

const deleteData = (index: number) => {
  customDataList.splice(index, 1);
  updatePenCustomData();
  message.success("数据删除成功！");
};

onUnmounted(() => {
  watcher();
});
</script>

<style lang="postcss" scoped>
.data-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  border: 1px solid #eee;
  padding: 10px;
  border-radius: 4px;
}
.item-label {
  width: 80px;
  flex-shrink: 0;
}
.item-content {
  flex-grow: 1;
  display: flex;
  align-items: center;
}
</style>
