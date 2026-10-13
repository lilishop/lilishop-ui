<template>
  <div class="new-goods">
    <div class="left">
      <div
        class="top-header setup-content"
        :style="{ background: options.left.bgColor }"
      >
        <span>{{ options.left.title }}</span>
        <span>{{ options.left.secondTitle }} &gt;</span>
        <div class="setup-box">
          <div>
            <el-button
              size="small"
              @click.stop="handleSelectModel(options.left, true)"
              >编辑</el-button
            >
          </div>
        </div>
      </div>
      <div class="content">
        <div
          class="con-item setup-content"
          v-for="(item, index) in options.left.list"
          :key="index"
        >
          <div>
            <p>{{ item.name }}</p>
            <p class="describe">{{ item.describe }}</p>
          </div>
          <img :src="item.img" alt="" />
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

    <div class="middle">
      <div
        class="top-header setup-content"
        :style="{ background: options.middle.bgColor }"
      >
        <span>{{ options.middle.title }}</span>
        <span>{{ options.middle.secondTitle }} &gt;</span>
        <div class="setup-box">
          <div>
            <el-button
              size="small"
              @click.stop="handleSelectModel(options.middle, true)"
              >编辑</el-button
            >
          </div>
        </div>
      </div>
      <div class="content">
        <div
          class="con-item setup-content"
          v-for="(item, index) in options.middle.list"
          :key="index"
        >
          <div>
            <p>{{ item.name }}</p>
            <p class="describe">{{ item.describe }}</p>
          </div>
          <img :src="item.img" alt="" />
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

    <div class="right">
      <div
        class="top-header setup-content"
        :style="{ background: options.right.bgColor }"
      >
        <span>{{ options.right.title }}</span>
        <span>{{ options.right.secondTitle }} &gt;</span>
        <div class="setup-box">
          <div>
            <el-button
              size="small"
              @click.stop="handleSelectModel(options.right, true)"
              >编辑</el-button
            >
          </div>
        </div>
      </div>
      <div class="content">
        <div
          class="setup-content"
          v-for="(item, index) in options.right.list"
          :key="index"
        >
          <div class="img-wrap">
            <img :src="item.img" alt="" />
            <div class="jiaobiao" :class="'jiaobiao' + (index + 1)">
              {{ index + 1 }}
            </div>
          </div>
          <p>{{ item.name }}</p>
          <p>{{ $filters.unitPrice(item.price, "￥") }}</p>
          <div class="setup-box">
            <div>
              <el-button size="small" @click.stop="handleSelectGoods(item)"
                >编辑</el-button
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 装修内容 -->
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
            v-if="selected.size && selected.size.indexOf('90*90') >= 0"
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
          <el-button size="small" type="primary" @click="handleSelectGoods('')"
            >选择商品</el-button
          >
        </div>
      </div>
      <template #footer>
        <el-button @click="handleCancelModal">取消</el-button>
        <el-button type="primary" @click="handleConfirmModal">确定</el-button>
      </template>
    </el-dialog>
    <!-- 装修标题 -->
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
        ref="ossManageRef"
      />
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, nextTick } from "vue";
import ossManage from "@/views/sys/oss-manage/ossManage";
import { formatLinkType } from "@/utils/filters";

const props = defineProps({
  data: {
    type: Object,
    default: null,
  },
});

const options = ref(props.data.options); // 当前数据
const showModal = ref(false); // modal显隐
const showModal1 = ref(false); // modal显隐
const selected = ref({}); // 弹窗编辑草稿
const editTarget = ref(null); // 确认后写回的原数据
const picModelFlag = ref(false); // 选择图片modal

// ossManageRef：模板 ref 与组件 import 同名，改名避免互相覆盖
const liliDialog = ref(null);
const ossManageRef = ref(null);

function cloneItem(item) {
  return JSON.parse(JSON.stringify(item || {}));
}
// 装修modal
function handleSelectModel(item, type) {
  editTarget.value = item;
  selected.value = cloneItem(item);
  if (type) {
    showModal1.value = true;
  } else {
    showModal.value = true;
  }
}
function handleSelectLink() {
  // 调起选择链接弹窗
  liliDialog.value.open("link");
}
function handleSelectGoods(item) {
  if (item) {
    editTarget.value = item;
    selected.value = cloneItem(item);
  }
  liliDialog.value.open("goods", "single");
  setTimeout(() => {
    liliDialog.value.goodsData = [selected.value];
  }, 500);
}
// 选择链接回调
function selectedLink(val) {
  if (!selected.value) return;
  selected.value.url = formatLinkType(val);
  selected.value.type =
    val.___type === "other" && val.url === "" ? "link" : "other";
}
// 选择商品回调
function selectedGoodsData(val) {
  if (!val?.length || !selected.value) return;
  const goods = val[0];
  selected.value.img = goods.thumbnail;
  selected.value.price = goods.price;
  selected.value.name = goods.goodsName;
  selected.value.url = `/goodsDetail?skuId=${goods.id}&goodsId=${goods.goodsId}`;
  if (editTarget.value && !showModal.value && !showModal1.value) {
    Object.assign(editTarget.value, cloneItem(selected.value));
    editTarget.value = null;
    selected.value = {};
  }
}
function handleSelectImg() {
  // 选择图片
  picModelFlag.value = true;
  nextTick(() => {
    if (ossManageRef.value) {
      ossManageRef.value.selectImage = true;
    }
  });
}
// 选择图片回显
function callbackSelected(val) {
  picModelFlag.value = false;
  if (!val?.url) return;
  selected.value.img = val.url;
}
function handleCancelModal() {
  editTarget.value = null;
  selected.value = {};
  showModal.value = false;
}
function handleConfirmModal() {
  if (editTarget.value) {
    Object.assign(editTarget.value, cloneItem(selected.value));
  }
  editTarget.value = null;
  selected.value = {};
  showModal.value = false;
}
function handleCancelModal1() {
  editTarget.value = null;
  selected.value = {};
  showModal1.value = false;
}
function handleConfirmModal1() {
  if (editTarget.value) {
    Object.assign(editTarget.value, cloneItem(selected.value));
  }
  editTarget.value = null;
  selected.value = {};
  showModal1.value = false;
}
</script>
<style lang="scss" scoped>
@import "./setup-box.scss";
.new-goods {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  > div {
    width: 393px;
    height: 440px;
    overflow: hidden;
  }

  .left > .content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    flex-direction: unset;
    overflow: hidden;
    > div {
      width: 100%;
      height: 100%;
      min-width: 0;
      min-height: 0;
      overflow: hidden;
      box-sizing: border-box;
      display: flex;
      padding: 6px 4px 4px 6px;
      border-style: solid;
      border-color: #eee;
      border-width: 0;
      border-bottom-width: 1px;
      border-right-width: 1px;
      img {
        width: 64px;
        height: 64px;
        margin-top: 2px;
        flex-shrink: 0;
        object-fit: cover;
      }
      > div {
        flex: 1;
        min-width: 0;
        p {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 12px;
          line-height: 1.3;
        }
        .describe {
          margin-top: 4px;
          font-size: 11px;
        }
      }
    }
    > div:nth-child(1) {
      grid-row: span 2;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      text-align: center;
      padding: 8px 6px;
      img {
        width: 120px;
        height: 120px;
        margin-top: 6px;
      }
      > div {
        flex: unset;
        width: 100%;
        p {
          white-space: normal;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .describe {
          margin-top: 6px;
          white-space: normal;
        }
      }
    }
    > div:nth-child(2),
    > div:nth-child(3),
    > div:nth-child(5) {
      border-right-width: 0;
    }
    > div:nth-child(4),
    > div:nth-child(5) {
      border-bottom-width: 0;
    }
  }

  .middle > .content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    flex-direction: unset;
    > div {
      width: 100%;
      height: 100%;
      min-width: 0;
      overflow: hidden;
      box-sizing: border-box;
      border-style: solid;
      border-color: #eee;
      border-width: 0;
      border-bottom-width: 1px;
      border-right-width: 1px;
    }
    > div:nth-child(2n) {
      border-right-width: 0;
    }
    > div:nth-child(n + 5) {
      border-bottom-width: 0;
    }
  }

  .right > .content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    flex-direction: unset;
    flex-wrap: unset;
    font-size: 12px;
    overflow: hidden;
    > div {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 0;
      box-sizing: border-box;
      padding: 4px 4px 2px;
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow: hidden;
      border-bottom: 1px solid #eee;
      border-right: 1px solid #eee;
      .img-wrap {
        position: relative;
        width: 80px;
        height: 80px;
        flex-shrink: 0;
        img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }
        .jiaobiao {
          position: absolute;
          width: 23px;
          height: 23px;
          top: 0;
          right: 0;
          margin: 0;
          padding: 0;
          max-height: none;
          overflow: visible;
          display: block;
          background: url("../../../assets/festival_icon.png") no-repeat;
          color: #fff;
          text-align: center;
          line-height: 23px;
          font-size: 12px;
          -webkit-line-clamp: unset;
          -webkit-box-orient: unset;
        }
        .jiaobiao1,
        .jiaobiao4 {
          background-position: -2px -30px;
        }
        .jiaobiao2,
        .jiaobiao5 {
          background-position: -31px -30px;
        }
        .jiaobiao3,
        .jiaobiao6 {
          background-position: -60px -30px;
        }
      }
      > p:nth-child(2) {
        width: 100%;
        height: auto;
        max-height: 32px;
        line-height: 16px;
        margin-top: 4px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        text-align: center;
      }
      > p:nth-child(3) {
        color: $theme_color;
        margin-top: 2px;
        line-height: 1.2;
        flex-shrink: 0;
      }
    }
    > div:nth-child(3n) {
      border-right: none;
    }
    > div:nth-child(n + 4) {
      border-bottom: none;
    }
  }

  .top-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 50px;
    padding: 0 10px;
    background: #c43d7e;
    color: #fff;
    span:nth-child(1) {
      font-size: 20px;
    }
    span:nth-child(2) {
      font-size: 12px;
    }
  }
  .content {
    padding: 10px 12px 0;
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    height: 370px;
    box-sizing: border-box;
    overflow: hidden;
  }
  .con-item {
    width: 185px;
    height: 120px;
    display: flex;
    padding-left: 10px;
    padding-top: 10px;
    img {
      width: 90px;
      height: 90px;
      margin-top: 10px;
    }
  }
  .middle > .content .con-item {
    width: 100%;
    max-width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    box-sizing: border-box;
    padding: 6px 4px 4px 6px;
    img {
      width: 64px;
      height: 64px;
      margin-top: 2px;
      flex-shrink: 0;
    }
    > div {
      flex: 1;
      min-width: 0;
      p {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 12px;
        line-height: 1.3;
      }
      .describe {
        margin-top: 4px;
        font-size: 11px;
      }
    }
  }
  .left > .content .con-item {
    width: 100%;
    max-width: 100%;
    height: 100%;
  }
  .describe {
    color: #999;
    font-size: 12px;
    margin-top: 15px;
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
