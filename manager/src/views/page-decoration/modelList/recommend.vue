<template>
  <div class="recommend">
    <div class="recommend-left">
      <div
        class="head-recommend setup-content"
        :style="{ background: msgLeft.bgColor }"
      >
        <span>{{ msgLeft.title }}</span>
        <span>{{ msgLeft.secondTitle }}&gt;</span>
        <div class="setup-box">
          <div>
            <el-button size="small" @click.stop="handleSelectModel(msgLeft, true)"
              >编辑</el-button
            >
          </div>
        </div>
      </div>
      <div class="content-left">
        <div class="setup-content">
          <img :src="msgLeft.list[0].img" width="160" height="160" alt="" />
          <div class="margin-left">{{ msgLeft.list[0].name }}</div>
          <div class="margin-left">{{ msgLeft.list[0].describe }}</div>
          <el-button
            size="small"
            :style="{ background: msgLeft.bgColor }"
            class="fz_12 view-btn"
            >点击查看</el-button
          >
          <div class="setup-box">
            <div>
              <el-button
                size="small"
                @click.stop="handleSelectModel(msgLeft.list[0])"
                >编辑</el-button
              >
            </div>
          </div>
        </div>
        <div>
          <template v-for="(item, index) in msgLeft.list">
            <div v-if="index != 0" :key="index" class="setup-content">
              <img :src="item.img" width="80" height="80" alt="" />
              <div>
                <div>{{ item.name }}</div>
                <div>{{ item.describe }}</div>
              </div>
              <div class="setup-box">
                <div>
                  <el-button size="small" @click.stop="handleSelectModel(item)"
                    >编辑</el-button
                  >
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div class="recommend-right">
      <div
        class="head-recommend setup-content"
        :style="{ background: msgRight.bgColor }"
      >
        <span>{{ msgRight.title }}</span>
        <span>{{ msgRight.secondTitle }}&gt;</span>
        <div class="setup-box">
          <div>
            <el-button size="small" @click.stop="handleSelectModel(msgRight, true)"
              >编辑</el-button
            >
          </div>
        </div>
      </div>
      <div class="content-right">
        <div
          v-for="(item, index) in msgRight.list"
          :key="index"
          class="setup-content"
        >
          <div class="right-item">
            <div>
              <span :style="{ background: msgRight.bgColor }">{{
                item.name
              }}</span>
              <span>{{ item.describe }}</span>
            </div>
            <div class="right-img">
              <img :src="item.img" alt="" />
            </div>
          </div>
          <div class="setup-box">
            <div>
              <el-button size="small" @click.stop="handleSelectModel(item)"
                >编辑</el-button
              >
            </div>
          </div>
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
            width="160"
            height="160"
            v-if="selected.size && selected.size.indexOf('160*160') >= 0"
            :src="selected.img"
            alt
          />
          <img
            class="show-image"
            width="80"
            height="80"
            v-if="selected.size && selected.size.indexOf('80*80') >= 0"
            :src="selected.img"
            alt
          />
          <img
            class="show-image"
            width="100"
            height="100"
            v-if="selected.size && selected.size.indexOf('100*100') >= 0"
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
        <div class="modal-form-item modal-form-actions">
          <el-button size="small" type="primary" @click="handleSelectImg"
            >选择图片</el-button
          >
          <el-button size="small" type="primary" @click="handleSelectGoods"
            >选择商品</el-button
          >
        </div>
      </div>
      <template #footer>
        <el-button @click="handleCancelModal">取消</el-button>
        <el-button type="primary" @click="handleConfirmModal">确定</el-button>
      </template>
    </el-dialog>
    <el-dialog
      v-model="showModal1"
      title="装修"
      width="800px"
      :close-on-click-modal="false"
      append-to-body
      destroy-on-close
    >
      <div class="modal-top-advert">
        <div class="modal-form-item">
          <span class="modal-label">主标题：</span>
          <el-input v-model="selected.title" />
        </div>
        <div class="modal-form-item">
          <span class="modal-label">副标题：</span>
          <el-input v-model="selected.secondTitle" />
        </div>
        <div class="modal-form-item modal-form-link">
          <span class="modal-label">副标题链接：</span>
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
          <span class="modal-label">背景色：</span>
          <div class="modal-color-field">
            <el-input v-model="selected.bgColor" />
            <el-color-picker v-if="selected.bgColor" v-model="selected.bgColor" />
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="handleCancelModal1">取消</el-button>
        <el-button type="primary" @click="handleConfirmModal1">确定</el-button>
      </template>
    </el-dialog>
    <!-- 选择商品。链接 -->
    <liliDialog
      ref="liliDialog"
      @selectedLink="selectedLink"
      @selectedGoodsData="selectedGoodsData"
    ></liliDialog>
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
      default: {},
    },
  },
  components: {
    ossManage,
  },
  data() {
    return {
      msgLeft: this.data.options.contentLeft, // 左侧数据
      msgRight: this.data.options.contentRight, // 右侧数据
      showModal: false, // modal显隐
      showModal1: false, // modal显隐
      selected: {}, // 弹窗编辑草稿
      editTarget: null, // 确认后写回的原数据
      picModelFlag: false, // 图片选择
    };
  },
  methods: {
    cloneItem(item) {
      return JSON.parse(JSON.stringify(item || {}));
    },
    // 编辑
    handleSelectModel(item, type) {
      this.editTarget = item;
      this.selected = this.cloneItem(item);
      if (type) {
        this.showModal1 = true;
      } else {
        this.showModal = true;
      }
    },
    handleSelectLink(item, index) {
      // 调起选择链接弹窗
      this.$refs.liliDialog.open("link");
    },
    handleSelectGoods(item) {
      // 调起选择商品
      this.$refs.liliDialog.open("goods", "single");
    },
    // 选择链接回调
    selectedLink(val) {
      this.selected.url = this.$filters.formatLinkType(val);
      this.selected.type =
        val.___type === "other" && val.url === "" ? "link" : "other";
    },
    // 选择商品回调
    selectedGoodsData(val) {
      console.log(val);
      let goods = val[0];
      this.selected.img = goods.thumbnail;
      this.selected.price = goods.price;
      this.selected.name = goods.goodsName;
      this.selected.url = `/goodsDetail?skuId=${goods.id}&goodsId=${goods.goodsId}`;
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
    handleCancelModal1() {
      this.editTarget = null;
      this.selected = {};
      this.showModal1 = false;
    },
    handleConfirmModal1() {
      if (this.editTarget) {
        Object.assign(this.editTarget, this.cloneItem(this.selected));
      }
      this.editTarget = null;
      this.selected = {};
      this.showModal1 = false;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "./setup-box.scss";
.recommend {
  display: flex;
  justify-content: space-between;
  .recommend-left {
    width: 595px;
    .content-left {
      display: flex;
      align-items: stretch;
      padding-top: 10px;
      font-size: 12px;
      box-sizing: content-box;
      > div:nth-child(1) {
        width: 189px;
        border-right: 1px solid #eee;
        height: 360px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        img {
          margin: 40px 0 0 15px;
        }
        .margin-left {
          margin-left: 15px;
          width: 145px;
        }
        div:nth-of-type(1) {
          font-weight: bold;
          border-top: 1px solid #eee;
          padding-top: 10px;
          padding-bottom: 10px;
        }
        div:nth-of-type(2) {
          color: #999;
        }
        .view-btn {
          align-self: center;
          width: 145px;
          margin-top: auto;
          margin-bottom: 15px;
          color: #fff;
        }
      }
      > div:nth-child(2) {
        width: 405px;
        height: 360px;
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
        box-sizing: border-box;
        > div {
          display: flex;
          align-items: center;
          width: 200px;
          height: 120px;
          img {
            margin: 0 10px;
          }
          > div:nth-child(2) {
            // margin: 0 10px;
            :nth-child(2) {
              color: #449dae;
            }
          }
        }
      }
    }
  }

  .recommend-right {
    width: 595px;

    .head-recommend {
      background: #a25684;
    }
    .content-right {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
      height: 360px;
      padding-top: 10px;
      box-sizing: content-box;

      > div {
        width: 100%;
        height: 100%;
        text-align: center;
        padding: 0;
        border-right: 1px solid #eee;
        border-bottom: 1px solid #eee;
        box-sizing: border-box;

        &:nth-child(2n) {
          border-right: none;
        }

        &:nth-child(n + 3) {
          border-bottom: none;
        }

        .right-item {
          border-bottom: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          margin: 0;
          padding: 10px 15px;
          font-size: 12px;
          box-sizing: border-box;

          > div:nth-child(1) {
            flex: 1;
            min-width: 0;
            margin-top: 0;
            text-align: left;

            span:nth-child(1) {
              color: #fff;
              border-radius: 10px;
              padding: 0 5px;
              background-color: #a25684;
              display: block;
              max-width: 120px;
              overflow: hidden;
              white-space: nowrap;
              margin: 0 0 10px;
            }

            span:nth-child(2) {
              font-size: 12px;
              color: #666;
              display: block;
            }
          }

          .right-img {
            width: 100px;
            height: 100px;
            flex-shrink: 0;
            text-align: center;
            margin: 0;

            img {
              max-height: 100px;
              max-width: 100px;
            }
          }
        }
      }
    }
  }

  .head-recommend {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 50px;
    padding: 0 10px;
    background: #449dae;
    color: #fff;
    span:nth-child(1) {
      font-size: 20px;
    }
    span:nth-child(2) {
      font-size: 12px;
    }
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

  .modal-form-actions {
    padding-left: 112px;
    gap: 10px;
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

  .tips {
    padding-left: 112px;
    margin-bottom: 16px;
    color: #999;
    font-size: 12px;
  }
}
</style>
