<template>
  <div class="goods-type-wrapper">
    <!-- 商品部分 -->
    <div class="goods-list flex">
      <div
        class="goods-list-item"
        v-for="(item, index) in data.options.list"
        :key="index"
      >
        <div>
          <div class="goods-name wes-2">{{ item.title }}</div>
          <div class="goods-desc">{{ item.desc }}</div>
        </div>
        <div class="goods-img">
          <img alt="楼层图片" :src="item.img" />
        </div>
      </div>
      <div class="setup-box">
        <div>
          <el-button
            size="small"
            @click.stop="handleSelectModel"
          >编辑</el-button
          >
        </div>
      </div>
    </div>

    <el-dialog
      v-model="showModal"
      title="装修"
      
      width="800"
      
      :close-on-click-modal="false"
     append-to-body destroy-on-close>
      <div class="modal-tab-bar" v-if="draftList">
            <div class="flex flex-a-c">
              <el-button class="add-goods" @click="addCurrentGoods">
                添加商品
              </el-button>
            </div>

            <div
              v-for="(item, index) in draftList"
              :key="index"
              class="draggable"
            >
              <div class="flex">
                <img alt="楼层图片" :src="item.img" class="column-img" />
                <div class="flex column-goods-config">
                  <div class="column-config">
                    <div>
                      标题：
                      <el-input v-model="item.title" />
                    </div>
                    <div>
                      描述：
                      <el-input v-model="item.desc" />
                    </div>
                  </div>
                  <el-button @click="delGoods(item,index)">删除</el-button>
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
  </div>
</template>

<script setup>
import { ref } from "vue";
import { formatLinkType } from "@/utils/filters";

defineOptions({ name: "onlyGoodsList" });

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
});

const current = ref(0);
const showModal = ref(false);
const draftList = ref([]);

const liliDialogRef = ref(null);

function cloneList(list) {
  return JSON.parse(JSON.stringify(list || []));
}

// 删除商品
function delGoods(val, i) {
  draftList.value.splice(i, 1);
}

// 添加当前选项卡中的商品
function addCurrentGoods() {
  liliDialogRef.value.open("goods");
}

// 编辑模块
function handleSelectModel() {
  draftList.value = cloneList(props.data.options.list);
  showModal.value = true;
}

// 选择商品回调
function selectedGoodsData(val) {
  if (!val?.length || !draftList.value) return;
  val.forEach((item) => {
    if (isGoodsInDraftList(item)) return;
    draftList.value.push({
      img: item.thumbnail,
      price: item.price,
      title: item.goodsName,
      desc: "",
      skuId: item.id,
      goodsId: item.goodsId,
      url: `/goodsDetail?skuId=${item.id}&goodsId=${item.goodsId}`,
    });
  });
}

function isGoodsInDraftList(goods) {
  const targetUrl = `/goodsDetail?skuId=${goods.id}&goodsId=${goods.goodsId}`;
  return draftList.value.some(
    (draft) =>
      (draft.skuId && String(draft.skuId) === String(goods.id)) ||
      (draft.url && draft.url === targetUrl)
  );
}

// 选择链接回调
function selectedLink(val) {
  if (!draftList.value?.length) return;
  const item = draftList.value[current.value];
  item.url = formatLinkType(val);
  item.type =
    val.___type === "other" && val.url === "" ? "link" : "other";
}

function handleSelectLink(index) {
  // 调起选择链接弹窗
  liliDialogRef.value.open("link");
  current.value = index;
}

function handleCancelModal() {
  draftList.value = [];
  showModal.value = false;
}

function handleConfirmModal() {
  const saved = cloneList(draftList.value);
  props.data.options.list.splice(0, props.data.options.list.length, ...saved);
  draftList.value = [];
  showModal.value = false;
}
</script>

<style scoped lang="scss">
@import "./setup-box.scss";
.goods-type-wrapper {
  position: relative;
}
.del-btn{
  margin-left:10px;
}
.tab-bar {
  margin-bottom: 20px;
}
.draggable {
  padding: 10px;
  border-bottom: 1px solid #ededed;
  transition: 0.35s;

  &:hover {
    background-color: #ededed;
  }
}
.column-config {
  margin-left: 10px;
  > * {
    margin: 4px;
  }
}
.column-img {
  width: 100px;
  height: 100px;
}
.add-goods {
  margin-left: 20px;
  margin-bottom: 10px;
}
.goods-list {
  position: relative;
  flex-wrap: wrap;
  justify-content: space-between;
  &:hover {
    > .setup-box {
      display: block;
    }
  }
}
.column-goods-config {
  flex: 2;
  align-items: center;
  justify-content: space-between;
}
.goods-list-item {
  padding-top: 34.8px;
  margin-bottom: 14.3px;
  width: 287px;
  height: 343.7px;
  border-radius: 9.8px;
  opacity: 1;
  cursor: pointer;
  background: #ffffff;
  transition: 0.35s;
  box-shadow: 0px 1px 13px 0px #e5e5e5;
  &:hover {
    box-shadow: 0px 1px 14px 0px #c5c5c5;
  }
}
.goods-img {
  text-align: center;
  > img {
    width: auto;
    max-height: 183px;
  }
}
.goods-name {
  margin-bottom: 11.9px;
  font-size: 25px;
  font-weight: normal;
  line-height: 30px;
  text-align: center;
  letter-spacing: 0px;

  color: #333333;

  -webkit-text-stroke: #979797 0.7px; /* 浏览器可能不支持 */
}
.goods-desc {
  margin-bottom: 30px;
  font-size: 16px;
  font-weight: normal;
  line-height: 19px;
  text-align: center;
  letter-spacing: 0px;

  color: #666666;

  -webkit-text-stroke: #979797 0.7px; /* 浏览器可能不支持 */
}
.goods-price {
  font-size: 25.2px;
  font-weight: normal;
  line-height: 30px;
  text-align: center;
  letter-spacing: 0px;

  color: #f31947;
  -webkit-text-stroke: #979797 0.7px; /* 浏览器可能不支持 */
}
.goods-type-line {
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}
.goods-type-title {
  font-size: 31px;
  font-weight: normal;
  line-height: 37px;
  letter-spacing: 0px;

  color: #333333;
}
.active {
  color: #f31947;
}
.goods-type-labels {
  font-size: 21px;
  font-weight: normal;
  line-height: 25px;
  letter-spacing: 0px;
}
.goods-type-item {
  margin-left: 28px;
}
</style>
