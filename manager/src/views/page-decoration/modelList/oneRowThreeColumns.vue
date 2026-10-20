<template>
  <div class="line flex flex-j-sb">
    <div class="column" v-for="(item,index) in data.options.list" :key="index">
      <div v-if="!item.img" class="placeholder">占位符</div>
      <img alt="楼层图片" v-else :src="item.img" class="three-column-img">
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
    <el-dialog
      v-model="showModal"
      title="装修"
      
      width="800"
      
      :close-on-click-modal="false"
     append-to-body destroy-on-close>
      <div class="modal-tab-bar">
        <div v-for="(item,index) in draftList" :key="index">
          <img alt="楼层图片" :src="item.img" class="three-column-img">
          <div>推荐尺寸：{{item.size}}</div>
          <el-button
            size="small"
            class="ml_10"
            type="primary"
            @click="handleSelectImg(index)"
          >选择图片</el-button
          >
          <el-button
            size="small"
            class="ml_10"
            type="primary"
            @click="handleSelectLink(index)"
          >选择链接</el-button
          >
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
import ossManage from "@/views/sys/oss-manage/ossManage";
import { formatLinkType } from "@/utils/filters";

defineOptions({ name: "oneRowThreeColumns" });

const props = defineProps({
  data: {
    type: Object,
    default: {}
  }
});

const showModal = ref(false);
const draftList = ref([]);
const picModelFlag = ref(false);
const current = ref(0);

const liliDialogRef = ref(null);
const ossManageRef = ref(null);

function cloneList(list) {
  return JSON.parse(JSON.stringify(list || []));
}
// 回显图片
function callbackSelected(val) {
  picModelFlag.value = false;
  if (!val?.url) return;
  draftList.value[current.value].img = val.url;
}
// 编辑模块
function handleSelectModel() {
  draftList.value = cloneList(props.data.options.list);
  showModal.value = true;
}
// 选择商品回调
function selectedGoodsData(val) {
  const goods = val[0];
  if (!goods) return;
  const item = draftList.value[current.value];
  item.img = goods.thumbnail;
  item.price = goods.price;
  item.name = goods.goodsName;
  item.url = `/goodsDetail?skuId=${goods.id}&goodsId=${goods.goodsId}`;
}
// 选择链接回调
function selectedLink(val) {
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
function handleSelectImg(index) {
  // 选择图片
  current.value = index;
  picModelFlag.value = true;
  nextTick(() => {
    if (ossManageRef.value) {
      ossManageRef.value.selectImage = true;
    }
  });
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
.three-column-img{
  width:385px;
  height: 165px
}
.line:hover{
  >.setup-box{
    display: block;
  }
}
.placeholder{
  background: #666;
  width: 100%;
  height: 100%;
}
.line{
  position: relative;
  justify-content: space-between;
}
.column{
  width: 385px;
  height: 165px;

  >img{
    width: 100%;
    height: 100%;
  }
}
</style>
