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
          @click.stop="handleSelectModel(data.options.list)"
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
        <div v-for="(item,index) in data.options.list" :key="index">
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
import { nextTick, ref } from "vue";
import { formatLinkType } from "@/utils/filters";
import ossManage from "@/views/sys/oss-manage/ossManage";

defineOptions({ name: "oneRowThreeColumns" });

defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
});

const showModal = ref(false);
const selected = ref({}); // 已选数据
const picModelFlag = ref(false);
const current = ref(0);

const liliDialogRef = ref(null);
const ossManageRef = ref(null);

// 回显图片
function callbackSelected(val) {
  picModelFlag.value = false;
  selected.value[current.value].img = val.url;
}

// 编辑模块
function handleSelectModel(item) {
  selected.value = item;
  showModal.value = true;

}

// 选择商品回调
function selectedGoodsData(val) {
  let goods = val[0];
  selected.value.img = goods.thumbnail;
  selected.value.price = goods.price;
  selected.value.name = goods.goodsName;
  selected.value.url = `/goodsDetail?skuId=${goods.id}&goodsId=${goods.goodsId}`;
}

// 选择链接回调
function selectedLink(val) {
  selected.value.url = formatLinkType(val);
  selected.value.type =
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
