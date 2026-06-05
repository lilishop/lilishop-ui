<template>
  <div>
    <div class="upload-pic-thumb">
      <vuedraggable
        :list="uploadList"
        :disabled="!draggable || !multiple"
        :animation="200"
        class="list-group"
        ghost-class="thumb-ghost"
        @end="onEnd"
      >
        <div v-for="(item, index) in uploadList" :key="index" class="upload-list">
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
        ref="ossManage"
        :is-component="true"
        :initialize="picModelFlag"
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

<script>
import { Camera, Delete, View } from "@element-plus/icons-vue";
import { uploadFile } from "@/libs/axios";
import vuedraggable from "vuedraggable";
import ossManage from "@/views/shop/ossManages";

export default {
  name: "uploadPicThumb",
  components: {
    vuedraggable,
    ossManage,
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
  },
  emits: ["update:modelValue", "input", "on-change", "uploadchange"],
  data() {
    return {
      accessToken: {},
      uploadFileUrl: uploadFile,
      uploadList: [],
      viewImage: false,
      imgUrl: "",
      picModelFlag: false,
      selectedFormBtnName: "",
      selectedImage: [],
    };
  },
  computed: {
    bindValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value;
    },
  },
  methods: {
    handleCLickImg(val) {
      this.$refs.ossManage.selectImage = true;
      this.picModelFlag = true;
      this.selectedFormBtnName = val;
    },
    callbackSelected(val) {
      this.picModelFlag = false;
      if (!this.multiple && this.uploadList.length > 0) {
        this.uploadList.splice(0, 1);
      }
      this.uploadList.push({ ...val, status: "finished" });
      this.returnValue();
    },
    confirmUrls() {
      if (this.selectedImage.length) {
        this.selectedImage.forEach((element) => {
          this.uploadList.push({ url: element.url, status: "finished" });
        });
      }
      this.picModelFlag = false;
      this.returnValue();
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
