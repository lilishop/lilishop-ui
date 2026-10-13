<template>
  <div>
    <div style="display: flex; gap: 10px; align-items: center; width: 100%">
      <el-input
        v-if="showInput"
        v-model="currentValue"
        :placeholder="placeholder"
        :size="size"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        style="flex: 1"
        @input="handleChange"
      >
        <template #append>
          <el-popover trigger="hover" placement="right" :width="320" title="图片预览">
            <template #reference>
              <el-button class="see-icon">
                <el-icon><View /></el-icon>
              </el-button>
            </template>
            <img
              v-if="currentValue"
              :src="currentValue"
              alt="该资源不存在"
              style="max-width: 280px; display: block; margin: 0 auto"
            />
            <el-button
              v-if="currentValue"
              type="primary"
              link
              style="margin-top: 8px; display: block; text-align: right"
              @click="viewImage = true"
            >
              查看大图
            </el-button>
          </el-popover>
        </template>
      </el-input>
      <el-button @click="handleCLickImg('storeLogo')">选择图片</el-button>
    </div>

    <el-dialog v-model="viewImage" title="图片预览" width="480px" append-to-body>
      <img
        :src="currentValue"
        alt="该资源不存在"
        style="max-width: 100%; margin: 0 auto; display: block"
      />
      <template #footer>
        <el-button @click="viewImage = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="picModalFlag"
      title="选择图片"
      width="1200px"
      append-to-body
      destroy-on-close
      @closed="resetPicModal"
    >
      <ossManage
        ref="ossManageRef"
        :is-component="true"
        :initialize="picModalFlag"
        :max-select="1"
        @callback="handleOssCallback"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { nextTick, ref, useAttrs, watch } from "vue";
import { View } from "@element-plus/icons-vue";
import { uploadFile } from "@/api/index";
import { getStore } from "@/libs/storage";
import ossManage from "@/views/sys/oss-manage/ossManage";

defineOptions({ name: "uploadPicInput" });

const props = defineProps({
  modelValue: String,
  value: String,
  size: {
    default: "default",
    type: String,
  },
  placeholder: {
    type: String,
    default: "图片链接",
  },
  showInput: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  maxlength: Number,
});
const emit = defineEmits(["update:modelValue", "input", "on-change"]);
const attrs = useAttrs();

const accessToken = ref({});
const currentValue = ref(props.modelValue ?? props.value ?? "");
const viewImage = ref(false);
const uploadFileUrl = ref(uploadFile);
const picModalFlag = ref(false);
const selectedFormBtnName = ref("");
const picIndex = ref("");

// 模板 ref：ossManage 与 import 组件同名，改名避免互相覆盖
const ossManageRef = ref(null);

function handleCLickImg(val, index) {
  picModalFlag.value = true;
  selectedFormBtnName.value = val;
  picIndex.value = index;
  nextTick(() => {
    if (ossManageRef.value) {
      ossManageRef.value.selectImage = true;
    }
  });
}
function handleOssCallback(item) {
  picModalFlag.value = false;
  if (!item?.url) return;
  currentValue.value = item.url;
  picIndex.value = "";
  emitValue(currentValue.value);
}
function resetPicModal() {
  selectedFormBtnName.value = "";
  picIndex.value = "";
}
function init() {
  accessToken.value = {
    accessToken: getStore("accessToken"),
  };
}
function emitValue(val) {
  emit("update:modelValue", val);
  emit("input", val);
  emit("on-change", val);
}
function handleChange() {
  emitValue(currentValue.value);
  attrs.rollback && attrs.rollback();
}
function setCurrentValue(value) {
  if (value === currentValue.value) {
    return;
  }
  currentValue.value = value ?? "";
  emitValue(currentValue.value);
}

watch(
  () => props.modelValue,
  (val) => {
    setCurrentValue(val);
  }
);
watch(
  () => props.value,
  (val) => {
    setCurrentValue(val);
  }
);

// 原 created 钩子
init();
</script>

<style lang="scss" scoped>
.see-icon {
  padding: 8px;
}
</style>
