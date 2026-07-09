<template>
  <div class="line flex flex-j-sb">
    <div class="column" v-for="(item,index) in data.options.list" :key="index">
      <div v-if="!item.img" class="placeholder">占位符</div>
      <img v-else :src="item.img" class="three-column-img">
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
          <img :src="item.img" class="three-column-img">
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
  name: "oneRowThreeColumns",
  components:{ossManage},
  props: {
    data: {
      type: Object,
      default: {}
    }
  },
  data () {
    return {
      showModal:false,
      draftList: [],
      picModelFlag:false,
      current:0,
    };
  },
  methods: {
    cloneList(list) {
      return JSON.parse(JSON.stringify(list || []));
    },
    // 回显图片
    callbackSelected(val) {
      this.picModelFlag = false;
      if (!val?.url) return;
      this.draftList[this.current].img = val.url;
    },
    // 编辑模块
    handleSelectModel() {
      this.draftList = this.cloneList(this.data.options.list);
      this.showModal = true;
    },
    // 选择商品回调
    selectedGoodsData(val) {
      const goods = val[0];
      if (!goods) return;
      const item = this.draftList[this.current];
      item.img = goods.thumbnail;
      item.price = goods.price;
      item.name = goods.goodsName;
      item.url = `/goodsDetail?skuId=${goods.id}&goodsId=${goods.goodsId}`;
    },
    // 选择链接回调
    selectedLink(val) {
      const item = this.draftList[this.current];
      item.url = this.$filters.formatLinkType(val);
      item.type =
        val.___type === "other" && val.url === "" ? "link" : "other";
    },
    handleSelectLink(index) {
      // 调起选择链接弹窗
      this.$refs.liliDialog.open("link");
      this.current = index;
    },
    handleSelectImg(index){
      // 选择图片
      this.current = index;
      this.picModelFlag = true;
      this.$nextTick(() => {
        if (this.$refs.ossManage) {
          this.$refs.ossManage.selectImage = true;
        }
      });
    },
    handleCancelModal() {
      this.draftList = [];
      this.showModal = false;
    },
    handleConfirmModal() {
      const saved = this.cloneList(this.draftList);
      this.data.options.list.splice(0, this.data.options.list.length, ...saved);
      this.draftList = [];
      this.showModal = false;
    },
  }
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
