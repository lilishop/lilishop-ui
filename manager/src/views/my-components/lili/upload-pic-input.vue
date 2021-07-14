<template>
  <div>
    <div style="display:flex;">
      <Input
        v-model="currentValue"
        @on-change="handleChange"
        v-show="showInput"
        :placeholder="placeholder"
        :size="size"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
      >
        <Poptip slot="append" transfer trigger="hover" title="图片预览" placement="right" width="350">
          <Icon type="md-eye" class="see-icon" />
          <div slot="content">
            <img :src="currentValue" alt="该资源不存在" style="width: 100%;margin: 0 auto;display: block;" />
            <a @click="viewImage=true" style="margin-top:5px;text-align:right;display:block">查看大图</a>
          </div>
        </Poptip>
      </Input>
      
      <Upload
        :action="uploadFileUrl"
        :headers="accessToken"
        :on-success="handleSuccess"
        :on-error="handleError"
        :format="['jpg','jpeg','png','gif','bmp']"
        accept=".jpg, .jpeg, .png, .gif, .bmp"
        :max-size="maxSize*1024"
        :on-format-error="handleFormatError"
        :on-exceeded-size="handleMaxSize"
        :before-upload="beforeUpload"
        :show-upload-list="false"
        ref="up"
        class="upload"
      >
        <Button :loading="loading" :size="size" :disabled="disabled">上传图片</Button>
      </Upload>
    </div>

    <Modal title="图片预览" v-model="viewImage" :styles="{top: '30px'}" draggable>
      <img :src="currentValue" alt="该资源不存在" style="width: 100%;margin: 0 auto;display: block;" />
      <div slot="footer">
        <Button @click="viewImage=false">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import { uploadFile } from "@/api/index";
export default {
  name: "uploadPicInput",
  props: {
    value: String,
    size: String,
    placeholder: {
      type: String,
      default: "图片链接"
    },
    showInput: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    maxSize: {
      type: Number,
      default: 5
    },
    maxlength: Number,
    icon: {
      type: String,
      default: "ios-cloud-upload-outline"
    }
  },
  data() {
    return {
      accessToken: {}, // 验证token
      currentValue: this.value, // 当前值
      loading: false, // 加载状态
      viewImage: false, // 预览图片modal
      uploadFileUrl: uploadFile // 上传地址
    };
  },
  methods: {
    init() {
      this.accessToken = {
        accessToken: this.getStore("accessToken")
      };
    },
    handleFormatError(file) {
      this.loading = false;
      this.$Notice.warning({
        title: "不支持的文件格式",
        desc:
          "所选文件‘ " +
          file.name +
          " ’格式不正确, 请选择 .jpg .jpeg .png .gif .bmp格式文件"
      });
    },
    handleMaxSize(file) {
      this.loading = false;
      this.$Notice.warning({
        title: "文件大小过大",
        desc: "所选文件‘ " + file.name + " ’大小过大, 不得超过 " + this.maxSize + "M."
      });
    },
    beforeUpload() {
      this.loading = true;
      return true;
    },
    handleSuccess(res, file) {
      this.loading = false;
      if (res.success) {
        this.currentValue = res.result;
        this.$emit("input", this.currentValue);
        this.$emit("on-change", this.currentValue);
      } else {
        this.$Message.error(res.message);
      }
    },
    handleError(error, file, fileList) {
      this.loading = false;
      this.$Message.error(error.toString());
    },
    handleChange(v) {
      this.$emit("input", this.currentValue);
      this.$emit("on-change", this.currentValue);
      this.$attrs.rollback && this.$attrs.rollback()
    },
    setCurrentValue(value) {
      if (value === this.currentValue) {
        return;
      }
      this.currentValue = value;
      this.$emit("on-change", this.currentValue);
    }
  },
  watch: {
    value(val) {
      this.setCurrentValue(val);
    }
  },
  created() {
    this.init();
  }
};
</script>

<style lang="scss" scoped>
.see-icon {
  font-size: 16px;
  margin-left: -32px;
  margin-top: 3px;
  padding: 7px;
  cursor: pointer;
}

.upload {
  display: inline-block;
  margin-left: 10px;
}
</style>

