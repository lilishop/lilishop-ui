<template>
  <div>
    <div class="upload-pic-thumb">
      <div v-if="disable || isView" class="list-group">
        <div v-for="item in uploadList" :key="item.url" class="upload-list">
          <div v-if="item.status == 'finished'" style="height: 60px">
            <img :src="item.url" alt="" />
            <div class="upload-list-cover">
              <el-icon class="action-icon" @click="handleView(item.url)"><View /></el-icon>
              <el-icon v-if="remove" class="action-icon" @click="handleRemove(item)"><Delete /></el-icon>
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
        :disabled="disable || !draggable || !multiple"
        :animation="200"
        class="list-group"
        ghost-class="thumb-ghost"
        item-key="url"
        @end="onEnd"
      >
        <template #item="{ element: item }">
          <div class="upload-list">
            <div v-if="item.status == 'finished'" style="height: 60px">
              <img :src="item.url" alt="" />
              <div class="upload-list-cover">
                <el-icon class="action-icon" @click="handleView(item.url)"><View /></el-icon>
                <el-icon v-if="remove" class="action-icon" @click="handleRemove(item)"><Delete /></el-icon>
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
      <div
        v-if="!isView"
        class="upload-trigger-box"
        @click="handleCLickImg('uploadList')"
      >
        <el-icon :size="20"><Camera /></el-icon>
      </div>
    </div>

    <el-dialog v-model="viewImage" title="图片预览" width="520px" append-to-body>
      <img :src="imgUrl" alt="无效的图片链接" style="width: 100%; display: block; margin: 0 auto" />
      <template #footer>
        <el-button @click="viewImage = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="picModelFlag" width="1200px" append-to-body destroy-on-close>
      <ossManage
        ref="ossManageRef"
        :is-component="true"
        :initialize="picModelFlag"
        :hide-select-footer="true"
        @callback="callbackSelected"
        @selected="(list) => { selectedImage = list }"
      />
      <template #footer>
        <el-button @click="picModelFlag = false">取消</el-button>
        <el-button type="primary" @click="confirmUrls">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { Camera, Delete, View } from "@element-plus/icons-vue";
import { uploadFile } from "@/libs/axios";
import { getStore } from "@/libs/storage";
import { Message } from "@/utils/message";
import vuedraggable from "vuedraggable";
import ossManage from "@/views/sys/oss-manage/ossManage";

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
  disable: {
    type: Boolean,
    default: false,
  },
  remove: {
    type: Boolean,
    default: true,
  },
  limit: {
    type: Number,
    default: 10,
  },
  isView: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["update:modelValue", "input", "on-change", "uploadchange"]);

const accessToken = ref({});
const uploadFileUrl = uploadFile;
const uploadList = ref([]);
const viewImage = ref(false);
const imgUrl = ref("");
const picModelFlag = ref(false);
const selectedFormBtnName = ref("");
const selectedImage = ref([]);

// 模板 ref：与 import 名 ossManage 重名，改名避免互相覆盖
const ossManageRef = ref(null);

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

function handleCLickImg(val) {
  picModelFlag.value = true;
  selectedFormBtnName.value = val;
  selectedImage.value = [];
  nextTick(() => {
    if (ossManageRef.value) {
      ossManageRef.value.selectImage = true;
    }
  });
}
function parseOssSelectionUrl(item) {
  if (!item) {
    return "";
  }
  if (typeof item === "string") {
    const index = item.indexOf(",");
    return index >= 0 ? item.slice(index + 1) : item;
  }
  return item.url || "";
}
function callbackSelected(val) {
  if (props.multiple) {
    return;
  }
  if (!val?.url) {
    return;
  }
  picModelFlag.value = false;
  if (uploadList.value.length > 0) {
    uploadList.value.splice(0, 1);
  }
  uploadList.value.push({ ...val, status: "finished" });
  returnValue();
}
function confirmUrls() {
  if (selectedImage.value.length) {
    selectedImage.value.forEach((element) => {
      const url = parseOssSelectionUrl(element);
      if (url) {
        uploadList.value.push({ url, status: "finished" });
      }
    });
  }
  selectedImage.value = [];
  picModelFlag.value = false;
  returnValue();
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
      if (!v) {
        uploadList.value = [];
        return;
      }
      setData(
        v.split(",").map((s) => s.trim()).filter(Boolean),
        init
      );
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
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.thumb-ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.upload-trigger-box {
  display: inline-block;
  width: 58px;
  height: 58px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  line-height: 58px;
  text-align: center;
  cursor: pointer;
}
</style>
