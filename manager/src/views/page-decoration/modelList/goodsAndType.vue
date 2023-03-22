<template>
    <div class="goods-type-wrapper">
      <div class="flex goods-type-line">
          <div class="goods-type-title">{{data.options.title}}</div>
          <div class="flex goods-type-labels">
            <div :class="{'active':current === index}" class="goods-type-item" v-for="(item,index) in data.options.labels" :key="index">
              {{item.label}}
            </div>
          </div>
      </div>
      <!-- 商品部分 -->
      <div class="goods-list">
          <div class="goods-list-item" v-for="(item,index) in data.options.list" :key="index">
              <div class="goods-img">
                <img :src="item.img">
              </div>
              <div>
                <div class="goods-name wes-2">{{item.title}}</div>
                <div class="goods-desc">{{item.desc}}</div>

              </div>
              <div class="goods-price">
                {{item.price | unitPrice("￥")}}
              </div>
          </div>

      </div>
      <div class="setup-box">
        <div>
          <Button
            size="small"
            @click.stop="handleSelectModel(data.options.list)"
          >编辑</Button
          >
        </div>
      </div>
      <Modal
        v-model="showModal"
        title="装修"
        draggable
        width="800"
        :z-index="100"
        :mask-closable="false"
      >
        <div class="modal-tab-bar">

          <Tabs type="card" :draggable="true" @on-drag-drop="handleDragDrop">
            <TabPane v-for="(tab, index) in data.options.labels" :key="index" :label="tab.label" :name="index">
              
            </TabPane>
          </Tabs>

          <div v-for="(item,index) in data.options.list" :key="index">
            <img :src="item.img" class="column-img">

            <Button
              size="small"
              class="ml_10"
              type="primary"
              @click="handleSelectImg(index)"
            >选择图片</Button
            >
            <Button
              size="small"
              class="ml_10"
              type="primary"
              @click="handleSelectLink(index)"
            >选择链接</Button
            >
          </div>

        </div>
      </Modal>


      <!-- 选择商品。链接 -->
      <liliDialog
        ref="liliDialog"
        @selectedLink="selectedLink"
        @selectedGoodsData="selectedGoodsData"
      ></liliDialog>
      <!-- 选择图片 -->
      <Modal width="1200px" v-model="picModelFlag" footer-hide>
        <ossManage
          @callback="callbackSelected"
          :isComponent="true"
          ref="ossManage"
        />
      </Modal>
    </div>
</template>

<script>
import ossManage from "@/views/sys/oss-manage/ossManage";
export default {
  name: "goods",
  components:{ossManage},
  props: {
    data: {
      type: Object,
      default: {}
    }
  },
  data(){
    return{
      current:0,
      showModal:false,
      selected: {}, // 已选数据
      picModelFlag:false,
    }
  },
  methods:{
    handleDragDrop (name, newName, a, b, names) {
      // names 为调整后的 name 集合
      this.data.options.labels.splice(b,1,...this.data.options.labels.splice(a, 1 , this.data.options.labels[b]));
    },
    // 回显图片
    callbackSelected(val) {
      this.picModelFlag = false;
      this.selected[this.current].img = val.url;
      console.log(this.selected)
    },
    // 编辑模块
    handleSelectModel(item) {
      console.log(item)
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
      this.selected.url = this.$options.filters.formatLinkType(val);
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
      this.$refs.ossManage.selectImage = true;
      this.picModelFlag = true;
      this.current = index;
    }
  }
}
</script>

<style scoped lang="scss">
@import "./setup-box.scss";
.goods-type-wrapper{
  position: relative;
  &:hover{
    >.setup-box{
      display: block;
    }
  }
}
.column-img{
  width: 100px;
  height: 100px;
}
.goods-list-item{
  width: 287px;
  height: 343.7px;
  border-radius: 9.8px;
  opacity: 1;
  cursor: pointer;
  background: #FFFFFF;
  transition: 0.35s;
  box-shadow: 0px 1px 13px 0px #E5E5E5;
  &:hover{
    box-shadow: 0px 1px 14px 0px #C5C5C5;
  }
}
.goods-img{
  text-align: center;
  >img{
    width: auto;
    max-height: 183px;
  }
}
.goods-name{
  font-size: 18px;

  font-weight: normal;
  line-height: 22px;
  text-align: center;
  letter-spacing: 0px;
  width: 200px;
  margin: 0 auto 12.4px auto;
  color: #333333;
  -webkit-text-stroke: #979797 0.7px; /* 浏览器可能不支持 */
}
.goods-desc{
  font-size: 14px;
  font-weight: normal;
  line-height: 17px;
  text-align: center;
  letter-spacing: 0px;
  margin-bottom: 12.4px;
  color: #666666;

  -webkit-text-stroke: #979797 0.7px; /* 浏览器可能不支持 */
}
.goods-price{
  font-size: 25.2px;
  font-weight: normal;
  line-height: 30px;
  text-align: center;
  letter-spacing: 0px;

  color: #F31947;
  -webkit-text-stroke: #979797 0.7px; /* 浏览器可能不支持 */
}
.goods-type-line{
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}
.goods-type-title{
  font-size: 31px;
  font-weight: normal;
  line-height: 37px;
  letter-spacing: 0px;

  color: #333333;
}
.active{
  color: #F31947;
}
.goods-type-labels{
  font-size: 21px;
  font-weight: normal;
  line-height: 25px;
  letter-spacing: 0px;

}
.goods-type-item{
  margin-left: 28px;
}
</style>
