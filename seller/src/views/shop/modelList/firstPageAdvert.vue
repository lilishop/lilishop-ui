<template>
  <div class="first-page-advert">
    <div
      class="item setup-content"
      :style="{
        backgroundImage: `linear-gradient(to right, ${item.fromColor}, ${item.toColor})`,
      }"
      v-for="(item, index) in options.list"
      :key="index"
    >
      <div>
        <span class="line top-line"></span>
        <p>{{ item.name }}</p>
        <span class="line btm-line"></span>
        <p>{{ item.describe }}</p>
      </div>
      <img :src="item.img" width="170" height="170" alt="" />
      <div class="setup-box">
        <div>
          <el-button size="small" @click.stop="handleSelectModel(item)"
            >编辑</el-button
          >
        </div>
      </div>
    </div>
    <el-dialog
      v-model="showModal"
      title="装修"
      width="800px"
      :close-on-click-modal="false"
      append-to-body
      destroy-on-close
    >
      <div class="modal-top-advert">
        <div class="modal-form-item modal-form-preview">
          <img
            class="show-image"
            width="170"
            height="170"
            :src="selected.img"
            alt
          />
        </div>
        <div class="modal-form-item">
          <span class="modal-label">图片主标题：</span>
          <el-input v-model="selected.name" />
        </div>
        <div class="modal-form-item">
          <span class="modal-label">图片描述：</span>
          <el-input v-model="selected.describe" />
        </div>
        <div class="tips">建议尺寸：{{ selected.size }}</div>
        <div class="modal-form-item modal-form-link">
          <span class="modal-label">图片链接：</span>
          <div class="modal-link-field">
            <el-input
              class="outsideUrl"
              v-model="selected.url"
              :disabled="!!selected.type && selected.type !== 'link'"
              placeholder="https://"
            />
            <el-button size="small" type="primary" @click="handleSelectLink"
              >选择链接</el-button
            >
          </div>
        </div>
        <div class="modal-form-item">
          <span class="modal-label">渐变背景色：</span>
          <div class="modal-color-field">
            <el-input v-model="selected.fromColor" />
            <el-color-picker
              v-if="selected.fromColor"
              v-model="selected.fromColor"
            />
          </div>
        </div>
        <div class="modal-form-item">
          <span class="modal-label">渐变背景色：</span>
          <div class="modal-color-field">
            <el-input v-model="selected.toColor" />
            <el-color-picker
              v-if="selected.toColor"
              v-model="selected.toColor"
            />
          </div>
        </div>
        <div class="modal-form-item modal-form-exhibition">
          <div
            :style="{
              backgroundImage: `linear-gradient(to right, ${selected.fromColor}, ${selected.toColor})`,
            }"
            class="exhibition"
          ></div>
        </div>
        <div class="modal-form-item">
          <span class="modal-label">选择图片：</span>
          <el-button size="small" type="primary" @click="handleSelectImg"
            >选择图片</el-button
          >
        </div>
      </div>
      <template #footer>
        <el-button @click="handleCancelModal">取消</el-button>
        <el-button type="primary" @click="handleConfirmModal">确定</el-button>
      </template>
    </el-dialog>
    <!-- 选择商品。链接 -->
    <liliDialog ref="liliDialog" @selectedLink="selectedLink"></liliDialog>
    <!-- 选择图片 -->
    <el-dialog v-model="picModelFlag" width="1200px" append-to-body destroy-on-close>
      <ossManage
        @callback="callbackSelected"
        :is-component="true"
        :initialize="picModelFlag"
        :max-select="1"
        ref="ossManage"
      />
    </el-dialog>
  </div>
</template>
<script>
import ossManage from "@/views/sys/oss-manage/ossManage";
export default {
  props: {
    data: {
      type: Object,
      default: null,
    },
  },
  components: { ossManage },
  data() {
    return {
      options: this.data.options, // 当前类型数据
      showModal: false, // modal显隐
      selected: {}, // 弹窗编辑草稿
      editTarget: null, // 确定后写回的原数据
      picModelFlag: false, // 图片选择器
    };
  },
  methods: {
    cloneItem(item) {
      return JSON.parse(JSON.stringify(item || {}));
    },
    // 打开装修modal
    handleSelectModel(item, type) {
      this.editTarget = item;
      this.selected = this.cloneItem(item);
      this.showModal = true;
    },
    handleSelectLink(item, index) {
      // 调起选择链接弹窗
      this.$refs.liliDialog.open("link");
    },
    // 选择链接回调
    selectedLink(val) {
      this.selected.url = this.$filters.formatLinkType(val);
      this.selected.type =
        val.___type === "other" && val.url === "" ? "link" : "other";
    },
    handleSelectImg() {
      // 选择图片
      this.picModelFlag = true;
      this.$nextTick(() => {
        if (this.$refs.ossManage) {
          this.$refs.ossManage.selectImage = true;
        }
      });
    },
    // 选择图片回调
    callbackSelected(val) {
      this.picModelFlag = false;
      if (!val?.url) return;
      this.selected.img = val.url;
    },
    handleCancelModal() {
      this.editTarget = null;
      this.selected = {};
      this.showModal = false;
    },
    handleConfirmModal() {
      if (this.editTarget) {
        Object.assign(this.editTarget, this.cloneItem(this.selected));
      }
      this.editTarget = null;
      this.selected = {};
      this.showModal = false;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "./setup-box.scss";
.first-page-advert {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  .item {
    width: 393px;
    height: 170px;
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      margin-left: 20px;
    }

    &:nth-of-type(1),
    &:nth-of-type(2),
    &:nth-of-type(3) {
      margin-top: 0;
    }

    p:nth-of-type(1) {
      margin: 3px 0;
      font-size: 18px;
      color: #fff;
    }
    p:nth-of-type(2) {
      margin-top: 3px;
      color: #fff;
    }
  }
  .line {
    position: relative;
    display: block;
    height: 2px;
    background: url(../../../assets/festival_icon.png);
    z-index: 1;
  }
  .top-line {
    width: 78px;
    background-position: -1px -3px;
  }
  .btm-line {
    background-position: 0 -11px;
    width: 154px;
  }
}

.modal-top-advert {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0 20px;
  width: 100%;
  box-sizing: border-box;

  .modal-form-item {
    display: flex;
    align-items: center;
    width: 100%;
    margin-bottom: 16px;

    .modal-label {
      flex-shrink: 0;
      width: 100px;
      text-align: right;
      padding-right: 12px;
    }

    .el-input {
      flex: 1;
    }
  }

  .modal-form-preview {
    justify-content: center;
    margin-bottom: 8px;
  }

  .modal-form-link {
    align-items: flex-start;

    .modal-label {
      padding-top: 8px;
    }

    .modal-link-field {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;

      .outsideUrl {
        flex: 1;
        min-width: 0;
      }
    }
  }

  .modal-color-field {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;

    .el-input {
      flex: 1;
    }
  }

  .modal-form-exhibition {
    padding-left: 112px;
    box-sizing: border-box;

    .exhibition {
      width: 100%;
      height: 50px;
      border-radius: 4px;
    }
  }

  .tips {
    padding-left: 112px;
    margin-bottom: 16px;
    color: #999;
    font-size: 12px;
  }
}
</style>
