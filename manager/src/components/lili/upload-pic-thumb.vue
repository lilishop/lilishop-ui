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

<script>
import { Camera, Delete, View } from "@element-plus/icons-vue";
import { uploadFile } from "@/api/index";
import vuedraggable from "vuedraggable";

export default {
  name: "uploadPicThumb",
  components: {
    vuedraggable,
    Camera,
    Delete,
    View,
  },
  props: {
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
  },
  emits: ["update:modelValue", "input", "on-change", "uploadchange"],
  data() {
    return {
      accessToken: {},
      uploadFileUrl: uploadFile,
      uploadList: [],
      viewImage: false,
      imgUrl: "",
    };
  },
  computed: {
    bindValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value;
    },
  },
  methods: {
    draggableItemKey(item) {
      return item.url || item.uid || item.name;
    },
    onEnd() {
      this.returnValue();
    },
    init() {
      this.setData(this.bindValue, true);
      this.accessToken = {
        accessToken: this.getStore("accessToken"),
      };
    },
    handleView(imgUrl) {
      this.imgUrl = imgUrl;
      this.viewImage = true;
    },
    handleRemove(file) {
      this.uploadList = this.uploadList.filter((i) => i.url !== file.url);
      this.returnValue();
    },
    handleSuccess(res, file) {
      if (res.success) {
        file.url = res.result;
        if (!this.multiple && this.uploadList.length > 0) {
          this.uploadList.splice(0, 1);
        }
        this.uploadList.push(file);
        this.returnValue();
      } else {
        this.$Message.error(res.message);
      }
    },
    handleError(error) {
      this.$Message.error(error.toString());
    },
    handleBeforeUpload(file) {
      const okType = ["image/jpeg", "image/png", "image/gif", "image/jpg"].includes(file.type);
      if (!okType) {
        this.$Message.warning("请选择 .jpg .jpeg .png .gif 格式图片");
        return false;
      }
      if (file.size / 1024 > 1024) {
        this.$Message.warning("所选文件大小过大，不能超过 1M");
        return false;
      }
      if (this.multiple && this.uploadList.length >= this.limit) {
        this.$Message.warning("最多只能上传" + this.limit + "张图片");
        return false;
      }
      return true;
    },
    emitValue(val) {
      this.$emit("update:modelValue", val);
      this.$emit("input", val);
      this.$emit("on-change", val);
    },
    returnValue() {
      if (!this.uploadList || this.uploadList.length < 1) {
        const empty = this.multiple ? [] : "";
        this.emitValue(empty);
        return;
      }
      if (!this.multiple) {
        this.emitValue(this.uploadList[0].url);
      } else {
        this.emitValue(this.uploadList.map((e) => e.url));
      }
    },
    setData(v, init) {
      if (typeof v == "string") {
        if (this.multiple) {
          this.$Message.warning("多张上传仅支持数组数据类型");
          return;
        }
        if (!v) {
          return;
        }
        this.uploadList = [{ url: v, status: "finished" }];
        this.$emit("uploadchange", v);
        this.emitValue(v);
      } else if (typeof v == "object" && v) {
        if (!this.multiple) {
          this.$Message.warning("单张上传仅支持字符串数据类型");
          return;
        }
        this.uploadList = [];
        const list = v.length > this.limit ? v.slice(0, this.limit) : v;
        if (v.length > this.limit) {
          this.$Message.warning("最多只能上传" + this.limit + "张图片");
        }
        list.forEach((e) => {
          this.uploadList.push({
            status: "finished",
            ...(typeof e === "string" ? { url: e } : e),
          });
        });
        if (init) {
          this.emitValue(list);
        } else {
          this.$emit("on-change", list);
        }
      }
    },
  },
  watch: {
    modelValue(val) {
      this.setData(val);
    },
    value(val) {
      this.setData(val);
    },
  },
  mounted() {
    this.init();
  },
};
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
