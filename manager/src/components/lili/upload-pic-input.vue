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
        ref="ossManage"
        :is-component="true"
        :initialize="picModalFlag"
        :max-select="1"
        @callback="handleOssCallback"
      />
    </el-dialog>
  </div>
</template>

<script>
import { View } from "@element-plus/icons-vue";
import { uploadFile } from "@/api/index";
import ossManage from "@/views/sys/oss-manage/ossManage";

export default {
  name: "uploadPicInput",
  components: {
    ossManage,
    View,
  },
  props: {
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
  },
  emits: ["update:modelValue", "input", "on-change"],
  data() {
    return {
      accessToken: {},
      currentValue: this.modelValue ?? this.value ?? "",
      viewImage: false,
      uploadFileUrl: uploadFile,
      picModalFlag: false,
      selectedFormBtnName: "",
      picIndex: "",
    };
  },
  methods: {
    handleCLickImg(val, index) {
      this.picModalFlag = true;
      this.selectedFormBtnName = val;
      this.picIndex = index;
      this.$nextTick(() => {
        if (this.$refs.ossManage) {
          this.$refs.ossManage.selectImage = true;
        }
      });
    },
    handleOssCallback(item) {
      this.picModalFlag = false;
      if (!item?.url) return;
      this.currentValue = item.url;
      this.picIndex = "";
      this.emitValue(this.currentValue);
    },
    resetPicModal() {
      this.selectedFormBtnName = "";
      this.picIndex = "";
    },
    init() {
      this.accessToken = {
        accessToken: this.getStore("accessToken"),
      };
    },
    emitValue(val) {
      this.$emit("update:modelValue", val);
      this.$emit("input", val);
      this.$emit("on-change", val);
    },
    handleChange() {
      this.emitValue(this.currentValue);
      this.$attrs.rollback && this.$attrs.rollback();
    },
    setCurrentValue(value) {
      if (value === this.currentValue) {
        return;
      }
      this.currentValue = value ?? "";
      this.emitValue(this.currentValue);
    },
  },
  watch: {
    modelValue(val) {
      this.setCurrentValue(val);
    },
    value(val) {
      this.setCurrentValue(val);
    },
  },
  created() {
    this.init();
  },
};
</script>

<style lang="scss" scoped>
.see-icon {
  padding: 8px;
}
</style>
