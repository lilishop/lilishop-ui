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
      selected: {}, // 已选数据
      picModelFlag:false,
      current:0,
    };
  },
  methods: {
    // 回显图片
    callbackSelected(val) {
      this.picModelFlag = false;
      this.selected[this.current].img = val.url;
      console.log(this.selected)
    },
    // 编辑模块
    handleSelectModel(item) {
      this.selected = item;
      this.showModal = true;

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
    // 选择链接回调
    selectedLink(val) {
      this.selected.url = this.$filters.formatLinkType(val);
      this.selected.type =
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
    }
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
