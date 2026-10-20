<template>
  <div class="mix-model">
    <!-- 左侧 -->
    <div class="left-card">
      <left :data="data" />
      <div class="setup-box">
        <div>
          <el-button size="small" @click.stop="handleSelectModel('left')"
            >编辑
          </el-button>
        </div>
      </div>
    </div>
    <!-- 右侧 -->
    <div class="right-card">
      <right :data="data" />
      <div class="setup-box">
        <div>
          <el-button size="small" @click.stop="handleSelectModel('right')"
            >编辑
          </el-button>
        </div>
      </div>
    </div>
    <el-dialog
      v-model="showModal"
      title="装修"
      
      width="800"
      
      :close-on-click-modal="false"
     append-to-body destroy-on-close>
      <div v-if="current">
        <div class="modal-tab-bar">
          <div class="current-module-row">
            当前模块 :
            <el-tag>{{ current.model === "goods" ? "商品" : "品牌" }}</el-tag>
          </div>

          <div class="flex image-row">
            <div>图片 :</div>
            <div class="image-config">
              <img class="image" :src="current.data.image.src" alt="" />
              <div class="image-config-detail">
                <div>推荐尺寸：{{ current.data.image.size }}</div>
                <div class="link-src">
                  链接地址：
                  <el-input
                    style="width: 200px"
                    v-model="current.data.image.url"
                    disabled
                  />
                </div>
                <el-button
                  size="small"
                  type="primary"
                  @click="handleSelectImg('default')"
                  >选择图片
                </el-button>
                <el-button
                  size="small"
                  class="ml_10"
                  type="primary"
                  @click="handleSelectLink('image')"
                  >选择链接
                </el-button>
              </div>
            </div>
          </div>
          <div class="flex badge-row" v-if="current.model == 'goods'">
            <div>标签 :</div>
            <el-input
              style="width: 200px"
              type="text"
              v-model="current.data.badge.label"
            />
            <el-input
              style="width: 100px"
              disabled
              type="text"
              v-model="current.data.badge.url"
            />
            <el-button
              size="small"
              type="primary"
              @click="handleSelectLink('badge')"
              >选择链接
            </el-button>
          </div>
          <div class="flex column-list">
            <div
              v-for="(item, index) in current.data.list"
              :key="index"
              class="draggable"
            >
              <div class="flex column-item">
                <img alt="楼层图片" :src="item.img" class="column-img" />
                <el-button
                  size="small"
                  class="ml_10"
                  type="primary"
                  v-if="current.model == 'goods'"
                  @click="handleSelectGoods('list', index)"
                  >选择商品
                </el-button>
                <div class="column-item-config">
                  <div  v-if="current.model == 'brand'" style="margin-bottom: 10px">
                    <el-input disabled v-model="item.url" />
                  </div>
                  <el-button
                    size="small"
                    class="ml_10"
                    type="primary"
                    v-if="current.model == 'brand'"
                    @click="handleSelectLink('list', index)"
                  >
                    选择链接
                  </el-button>
                  <el-button
                    size="small"
                    class="ml_10"
                    type="primary"
                    v-if="current.model == 'brand'"
                    @click="handleSelectImg('list', index)"
                    >选择图片
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="handleCancelModal">取消</el-button>
        <el-button type="primary" @click="handleConfirmModal">确定</el-button>
      </template>
    </el-dialog>

    <!-- 选择商品。链接 -->
    <liliDialog
      ref="liliDialogRef"
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
import left from "./mixs/mix-goods";
import right from "./mixs/mix-brand";
import ossManage from "@/views/sys/oss-manage/ossManage.vue";
import { formatLinkType } from "@/utils/filters";

defineOptions({ name: "mixModel" });

const props = defineProps({
  data: {
    type: Object,
    default: {},
  },
});

const showModal = ref(false);
const current = ref(null); // 当前编辑的模块草稿
const picModelFlag = ref(false);
const selectedData = ref(""); //选中的数据
const goodsIndex = ref(0); // 商品索引
const align = ref("");
const defaultCallbackImageType = ref("");

const liliDialogRef = ref(null);
const ossManageRef = ref(null);

function cloneModule(module) {
  return JSON.parse(JSON.stringify(module || {}));
}

function handleSelectImg(type, index) {
  defaultCallbackImageType.value = type;
  goodsIndex.value = index;
  // 选择图片
  picModelFlag.value = true;
  nextTick(() => {
    if (ossManageRef.value) {
      ossManageRef.value.selectImage = true;
    }
  });
}

function handleSelectGoods(val, index) {
  liliDialogRef.value.open("goods");
  liliDialogRef.value.singleGoods();
  selectedData.value = val;
  goodsIndex.value = index;
}

function handleSelectLink(val, index) {
  // 调起选择链接弹窗
  liliDialogRef.value.open("link");
  selectedData.value = val;
  goodsIndex.value = index;
}

// 回显图片
function callbackSelected(val) {
  picModelFlag.value = false;
  if (!val?.url || !current.value) return;
  if (defaultCallbackImageType.value == "default") {
    current.value.data.image.src = val.url;
  } else {
    current.value.data.list[goodsIndex.value].img = val.url;
  }
}

// 选择商品回调
function selectedGoodsData(val) {
  if (!val?.length || !current.value) return;
  const goods = val[0];
  const item = current.value.data.list[goodsIndex.value];
  item.img = goods.thumbnail;
  item.title = goods.goodsName;
  item.price = goods.price;
  item.url = `/goodsDetail?skuId=${goods.id}&goodsId=${goods.goodsId}`;
}

// 选择链接回调
function selectedLink(val) {
  if (!current.value) return;
  const formattedUrl = formatLinkType(val);
  if (selectedData.value != "list") {
    current.value.data[selectedData.value].url = formattedUrl;
  }
  if (selectedData.value == "list") {
    current.value.data.list[goodsIndex.value].url = formattedUrl;
  }
}

function handleSelectModel(type) {
  align.value = type;
  current.value = cloneModule(props.data.options[type]);
  showModal.value = true;
}

function handleCancelModal() {
  current.value = null;
  showModal.value = false;
}

function handleConfirmModal() {
  if (current.value && align.value) {
    props.data.options[align.value] = cloneModule(current.value);
  }
  current.value = null;
  showModal.value = false;
}
</script>

<style scoped lang="scss">
@import "./setup-box.scss";

.link-src {
  margin: 10px 0;
}

.current-module-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.image-row {
  align-items: flex-start;
  gap: 10px;
}

.badge-row {
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.image-config {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.image-config-detail {
  flex: 1;
  min-width: 0;
}

.column-item {
  align-items: center;
  gap: 12px;
}

.column-item-config {
  flex: 1;
  min-width: 0;
}

.mix-model {
  display: flex;
  justify-content: space-between;
}

.left-card,
.right-card {
  width: 584px;
  height: 344px;
  border-radius: 10px;
  opacity: 1;
  background: #ffffff;
  box-shadow: 0px 1px 13px 0px #e5e5e5;
  position: relative;
  overflow: hidden;

  &:hover {
    .setup-box {
      display: block;
    }
  }
}

.column-img {
  width: 100px;
  height: 100px;
}

.column-list {
  flex-wrap: wrap;

  > div {
    width: 50%;
  }
}

.image {
  max-width: 100px;
}

.modal-tab-bar {
  > .flex {
    align-items: center;
    margin: 10px 0;
  }
}

.draggable {
  margin-bottom: 10px;
}
</style>
