<template>
  <div>
    <div class="upload-pic-thumb">
      <div v-if="!multiple" class="list-group">
        <div v-for="item in uploadList" :key="draggableItemKey(item)" class="upload-list">
          <div v-if="item.status == 'finished'" style="height: 60px">
            <img :src="item.url" alt="" />
            <div class="upload-list-cover">
              <el-icon class="action-icon" @click="handleView(item.url)"><View /></el-icon>
              <el-icon class="action-icon" @click="handleRemove(item)"><Delete /></el-icon>
            </div>
          </div>
          <div v-else>
            <el-progress
              v-if="item.showProgress"
              :percentage="item.percentage"
              :show-text="false"
            />
          </div>
        </div>
      </div>
      <vuedraggable
        v-else
        v-model="uploadList"
        :disabled="!draggable"
        :animation="200"
        class="list-group"
        ghost-class="thumb-ghost"
        :item-key="draggableItemKey"
        @end="onEnd"
      >
        <template #item="{ element: item }">
          <div class="upload-list">
            <div v-if="item.status == 'finished'" style="height: 60px">
              <img :src="item.url" alt="" />
              <div class="upload-list-cover">
                <el-icon class="action-icon" @click="handleView(item.url)"><View /></el-icon>
                <el-icon class="action-icon" @click="handleRemove(item)"><Delete /></el-icon>
              </div>
            </div>
            <div v-else>
              <el-progress
                v-if="item.showProgress"
                :percentage="item.percentage"
                :show-text="false"
              />
            </div>
          </div>
        </template>
      </vuedraggable>
      <el-upload
        ref="upload"
        class="upload-box"
        :action="uploadFileUrl"
        :headers="accessToken"
        :multiple="multiple"
        :show-file-list="false"
        accept=".jpg,.jpeg,.png,.gif"
        :before-upload="handleBeforeUpload"
        :on-success="handleSuccess"
        :on-error="handleError"
      >
        <div class="upload-trigger">
          <el-icon :size="20"><Camera /></el-icon>
        </div>
      </el-upload>
    </div>

    <el-dialog v-model="viewImage" title="图片预览" width="520px" append-to-body>
      <img :src="imgUrl" alt="无效的图片链接" style="width: 100%; display: block; margin: 0 auto" />
      <template #footer>
        <el-button @click="viewImage = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { Camera, Delete, View } from "@element-plus/icons-vue";
import { uploadFile } from "@/api/index";
import { getStore } from "@/libs/storage";
import { Message } from "@/utils/message";
import vuedraggable from "vuedraggable";

defineOptions({ name: "uploadPicThumb" });

const props = defineProps({
  modelValue: { type: null },
  value: { type: null },
  draggable: {
    type: Boolean,
    default: true,
  },
  multiple: {
    type: Boolean,
    default: true,
  },
  limit: {
    type: Number,
    default: 10,
  },
});
const emit = defineEmits(["update:modelValue", "input", "on-change", "uploadchange"]);

const accessToken = ref({});
const uploadFileUrl = uploadFile;
const uploadList = ref([]);
const viewImage = ref(false);
const imgUrl = ref("");

// el-upload 模板 ref
const upload = ref(null);

const bindValue = computed(() => {
  return props.modelValue !== undefined ? props.modelValue : props.value;
});

watch(
  () => props.modelValue,
  (val) => {
    setData(val);
  }
);
watch(
  () => props.value,
  (val) => {
    setData(val);
  }
);

function draggableItemKey(item) {
  return item.url || item.uid || item.name;
}
function onEnd() {
  returnValue();
}
function init() {
  setData(bindValue.value, true);
  accessToken.value = {
    accessToken: getStore("accessToken"),
  };
}
function handleView(url) {
  imgUrl.value = url;
  viewImage.value = true;
}
function handleRemove(file) {
  uploadList.value = uploadList.value.filter((i) => i.url !== file.url);
  returnValue();
}
function handleSuccess(res, file) {
  if (res.success) {
    file.url = res.result;
    if (!props.multiple && uploadList.value.length > 0) {
      uploadList.value.splice(0, 1);
    }
    uploadList.value.push(file);
    returnValue();
  } else {
    Message.error(res.message);
  }
}
function handleError(error) {
  Message.error(error.toString());
}
function handleBeforeUpload(file) {
  const okType = ["image/jpeg", "image/png", "image/gif", "image/jpg"].includes(file.type);
  if (!okType) {
    Message.warning("请选择 .jpg .jpeg .png .gif 格式图片");
    return false;
  }
  if (file.size / 1024 > 1024) {
    Message.warning("所选文件大小过大，不能超过 1M");
    return false;
  }
  if (props.multiple && uploadList.value.length >= props.limit) {
    Message.warning("最多只能上传" + props.limit + "张图片");
    return false;
  }
  return true;
}
function emitValue(val) {
  emit("update:modelValue", val);
  emit("input", val);
  emit("on-change", val);
}
function returnValue() {
  if (!uploadList.value || uploadList.value.length < 1) {
    const empty = props.multiple ? [] : "";
    emitValue(empty);
    return;
  }
  if (!props.multiple) {
    emitValue(uploadList.value[0].url);
  } else {
    emitValue(uploadList.value.map((e) => e.url));
  }
}
function setData(v, init) {
  if (typeof v == "string") {
    if (props.multiple) {
      Message.warning("多张上传仅支持数组数据类型");
      return;
    }
    if (!v) {
      return;
    }
    uploadList.value = [{ url: v, status: "finished" }];
    emit("uploadchange", v);
    emitValue(v);
  } else if (typeof v == "object" && v) {
    if (!props.multiple) {
      Message.warning("单张上传仅支持字符串数据类型");
      return;
    }
    uploadList.value = [];
    const list = v.length > props.limit ? v.slice(0, props.limit) : v;
    if (v.length > props.limit) {
      Message.warning("最多只能上传" + props.limit + "张图片");
    }
    list.forEach((e) => {
      uploadList.value.push({
        status: "finished",
        ...(typeof e === "string" ? { url: e } : e),
      });
    });
    if (init) {
      emitValue(list);
    } else {
      emit("on-change", list);
    }
  }
}

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.upload-pic-thumb {
  display: flex;
}
.upload-list {
  display: inline-block;
  width: 60px;
  height: 60px;
  text-align: center;
  line-height: 60px;
  border: 1px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
  position: relative;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  margin-right: 5px;
  vertical-align: middle;
}
.upload-list img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.upload-list-cover {
  display: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.upload-list:hover .upload-list-cover {
  display: flex;
}
.action-icon {
  color: #fff;
  font-size: 20px;
  cursor: pointer;
}
.list-group {
  display: inline-block;
}
.thumb-ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.upload-box {
  display: inline-block;
  vertical-align: middle;

  :deep(.el-upload) {
    display: inline-block;
    vertical-align: top;
  }
}
.upload-trigger {
  width: 60px;
  height: 60px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
  }
}
</style>
