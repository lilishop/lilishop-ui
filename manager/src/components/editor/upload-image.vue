<template>
  <div class="wrapper">
    <el-button @click="handleClickUploadImage">上传图片</el-button>
    <el-dialog v-model="show" width="850px" title="上传图片" append-to-body :z-index="3500">
      <div class="import-oss" @click="importOSS">从资源库中导入</div>
      <div class="upload-images-wrap">
        <vuedraggable
          v-model="images"
          :animation="200"
          :item-key="draggableItemKey"
          class="upload-images-draggable"
        >
          <template #item="{ element, index }">
            <div class="upload-list">
              <img alt="image" :src="element.url" />
              <div class="upload-list-cover">
                <div>
                  <el-icon class="action-icon" :size="30" @click="handleView(element.url)">
                    <ZoomIn />
                  </el-icon>
                  <el-icon
                    class="action-icon"
                    :size="30"
                    @click="handleRemoveGoodsPicture(index)"
                  >
                    <Delete />
                  </el-icon>
                </div>
              </div>
            </div>
          </template>
        </vuedraggable>
        <div class="upload-box">
          <el-upload
            ref="upload"
            :action="uploadFileUrl"
            :headers="accessToken"
            :show-file-list="false"
            accept=".jpg,.jpeg,.png"
            drag
            multiple
            :before-upload="handleBeforeUpload"
            :on-success="handleSuccessGoodsPicture"
            :on-error="handleUploadError"
          >
            <div class="upload-trigger">
              <el-icon :size="20"><Plus /></el-icon>
            </div>
          </el-upload>
        </div>
      </div>
      <template #footer>
        <el-button @click="show = false">取消</el-button>
        <el-button type="primary" @click="callback">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showOssManager"
      width="1000px"
      append-to-body
      :z-index="3600"
      destroy-on-close
      @closed="resetOssSelection"
    >
      <OssManage
        ref="ossManage"
        :is-component="true"
        :initialize="showOssManager"
        :hide-select-footer="true"
        @selected="handleOssSelected"
      />
      <template #footer>
        <el-button @click="cancelOssImport">取消</el-button>
        <el-button type="primary" @click="confirmUrls">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="viewImage" title="图片预览" width="520px" append-to-body :z-index="3700">
      <img :src="previewUrl" alt="预览" style="width: 100%; display: block; margin: 0 auto" />
      <template #footer>
        <el-button @click="viewImage = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { Delete, Plus, ZoomIn } from "@element-plus/icons-vue";
import vuedraggable from "vuedraggable";
import { uploadFile } from "@/libs/axios";
import OssManage from "@/views/sys/oss-manage/ossManage.vue";

export default {
  name: "upload-image",
  components: {
    OssManage,
    vuedraggable,
    Delete,
    Plus,
    ZoomIn,
  },
  data() {
    return {
      show: false,
      uploadFileUrl: uploadFile,
      accessToken: {},
      showOssManager: false,
      images: [],
      selectedImage: [],
      viewImage: false,
      previewUrl: "",
    };
  },
  mounted() {
    this.accessToken = {
      accessToken: this.getStore("accessToken"),
    };
  },
  methods: {
    draggableItemKey(item) {
      return item?.url || item;
    },
    handleClickUploadImage() {
      this.show = true;
    },
    handleView(url) {
      this.previewUrl = url;
      this.viewImage = true;
    },
    callback() {
      const formatImages = this.images.map((item) => item.url);
      this.$emit("callback", formatImages);
      this.show = false;
    },
    handleRemoveGoodsPicture(__index) {
      this.images.splice(__index, 1);
    },
    handleBeforeUpload(file) {
      const okType = ["image/jpeg", "image/png", "image/jpg"].includes(file.type);
      if (!okType) {
        this.$Message.warning("文件 " + file.name + " 的格式不正确，请选择 jpg/jpeg/png");
        return false;
      }
      if (file.size / 1024 / 1024 > 10) {
        this.$Message.warning("图片大小不能超过10MB");
        return false;
      }
      return true;
    },
    handleSuccessGoodsPicture(res) {
      const url = res?.result ?? res?.data?.result;
      if (url) {
        this.images.push({ url });
      } else {
        this.$Message.error(res?.message || "上传失败");
      }
    },
    handleUploadError(err) {
      this.$Message.error(err?.message || String(err));
    },
    confirmUrls() {
      this.applySelectedImages();
      this.showOssManager = false;
    },
    cancelOssImport() {
      this.selectedImage = [];
      this.showOssManager = false;
    },
    resetOssSelection() {
      this.selectedImage = [];
    },
    handleOssSelected(list) {
      this.selectedImage = Array.isArray(list) ? list : [];
    },
    parseOssSelectionUrl(item) {
      if (!item) {
        return "";
      }
      if (typeof item === "string") {
        const index = item.indexOf(",");
        return index >= 0 ? item.slice(index + 1) : item;
      }
      return item.url || "";
    },
    applySelectedImages() {
      (this.selectedImage || []).forEach((item) => {
        const url = this.parseOssSelectionUrl(item);
        if (url) {
          this.images.push({ url });
        }
      });
    },
    importOSS() {
      this.selectedImage = [];
      this.showOssManager = true;
      this.$nextTick(() => {
        if (this.$refs.ossManage) {
          this.$refs.ossManage.selectImage = true;
        }
      });
    },
  },
};
</script>

<style scoped lang="scss">
.import-oss {
  margin-bottom: 10px;
  text-align: right;
  color: $theme_color;
  cursor: pointer;
}
.wrapper {
  margin: 10px 0;
}
$upload-item-size: 150px;
.upload-images-wrap {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}
.upload-images-draggable {
  display: flex;
  flex-wrap: wrap;
}
.upload-list {
  width: $upload-item-size;
  height: $upload-item-size;
  text-align: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: inline-block;
  background: #fff;
  position: relative;
  margin: 0 4px 4px 0;
  overflow: hidden;
  flex-shrink: 0;
}
.upload-box {
  width: $upload-item-size;
  height: $upload-item-size;
  margin: 0 4px 4px 0;
  display: inline-block;
  flex-shrink: 0;

  :deep(.el-upload) {
    width: $upload-item-size;
    height: $upload-item-size;
    display: block;
  }

  :deep(.el-upload-dragger) {
    width: $upload-item-size;
    height: $upload-item-size;
    min-height: $upload-item-size;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    box-sizing: border-box;
  }
}
.upload-trigger {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
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
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
}
.upload-list:hover .upload-list-cover {
  display: flex;
}
.upload-list-cover div {
  margin-top: 50px;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 8px;
}
.action-icon {
  color: #fff;
  cursor: pointer;
}
</style>
