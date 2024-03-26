<template>
  <div class="model" v-if="data">
    <div class="for-your">{{ data.options.title }}</div>

    <div class="flex card">
      <div class="left">
        <img :src="data.options.data.image.src" alt="" />
      </div>
      <div class="right flex">
        <!-- 商品区 -->
        <div class="goods-list">
          <div
            class="goods-item"
            :key="index"
            v-for="(item, index) in data.options.data.list"
          >
            <div>
              <div class="goods-name">{{ item.title }}</div>
              <div class="goods-desc">{{ item.desc }}</div>
            </div>
            <img class="goods-img" :src="item.img" alt="" />
          </div>
        </div>
        <!-- 热卖区 -->
        <div class="hot-list">
          <div class="hot-title">{{ data.options.data.hot.title }}</div>
          <div
            class="hot-item flex flex-a-c"
            v-for="(item, index) in data.options.data.hot.list"
            :key="index"
          >
            <img :src="item.img" alt="" />
            <div class="hot-goods">
              <div class="hot-goods-title">{{ item.title }}</div>
              <div>
                <div class="hot-price">￥{{ item.price | unitPrice }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="setup-box">
        <div>
          <Button size="small" @click.stop="handleSelectModel()">编辑 </Button>
        </div>
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
      <div>
        <div class="modal-tab-bar">
          <div>
            主标题:
            <Input style="width: 200px" v-model="data.options.title"></Input>
          </div>
          <Divider>左侧商品部分</Divider>
          <div class="flex">
            <div>图片 :</div>
            <div>
              <img class="image" :src="data.options.data.image.src" alt="" />
              <div>
                <div>推荐尺寸：{{ data.options.data.image.size }}</div>
                <div class="link-src">
                  链接地址：
                  <Input
                    style="width: 200px"
                    v-model="data.options.data.image.url"
                    disabled
                  />
                </div>
                <Button
                  size="small"
                  type="primary"
                  @click="handleSelectImg('image')"
                  >选择图片
                </Button>
                <Button
                  size="small"
                  class="ml_10"
                  type="primary"
                  @click="handleSelectLink('image')"
                  >选择链接
                </Button>
              </div>
            </div>
          </div>

          <Divider>中间商品部分</Divider>
          <div class="flex column-list">
            <div
              v-for="(item, index) in data.options.data.list"
              :key="index"
              class="draggable"
            >
              <div class="flex">
                <img :src="item.img" class="column-img" />
                <div class="column-goods-list">
                  <div><Input v-model="item.title"></Input></div>
                  <div><Input v-model="item.desc"></Input></div>
                  <div><Input disabled v-model="item.url"></Input></div>
                  <div>{{ item.size }}</div>
                  <Button
                    size="small"
                    class="ml_10"
                    type="primary"
                    @click="handleSelectLink('list', index)"
                    >选择链接
                  </Button>
                  <Button
                    size="small"
                    class="ml_10"
                    type="primary"
                    @click="handleSelectImg('list', index)"
                    >选择图片
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <Divider>右侧商品部分</Divider>
          <div class="flex">
            <div>右侧标题 :</div>
            <Input
              style="width: 200px"
              v-model="data.options.data.hot.title"
            ></Input>
          </div>
          <div class="flex column-list">
            <div
              v-for="(item, index) in data.options.data.hot.list"
              :key="index"
              class="draggable"
            >
              <div class="flex">
                <img :src="item.img" class="column-img" />
                <div class="column-goods-list">
                  <Button
                    size="small"
                    class="ml_10"
                    type="primary"
                    @click="handleSelectGoods('hot', index)"
                    >选择商品
                  </Button>
                </div>
              </div>
            </div>
          </div>
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
        :initialize="picModelFlag"
        ref="ossManage"
      />
    </Modal>
  </div>
</template>

<script>
import ossManage from "@/views/sys/oss-manage/ossManage.vue";

export default {
  name: "forYour",
  data() {
    return {
      showModal: false,

      picModelFlag: false,
      selectedData: "", //选中的数据
      goodsIndex: 0, // 商品索引
      align: "",
      defaultCallbackImageType: "",
      current: "",
    };
  },
  props: {
    data: {
      type: Object,
      default: {},
    },
  },
  components: {
    ossManage,
  },
  mounted() {
   },
  methods: {
    handleSelectImg(type, index) {
      this.defaultCallbackImageType = type;
      this.goodsIndex = index;
      // 选择图片
      this.$refs.ossManage.selectImage = true;
      this.picModelFlag = true;
    },

    handleSelectGoods(val, index) {
      this.$refs.liliDialog.open("goods");
      this.$refs.liliDialog.singleGoods();
      this.selectedData = val;
      this.goodsIndex = index;
    },
    handleSelectLink(val, index) {
      // 调起选择链接弹窗
      this.$refs.liliDialog.open("link");
      this.selectedData = val;

      this.goodsIndex = index;
    },
    // 回显图片
    callbackSelected(val) {
      this.picModelFlag = false;
      if (this.defaultCallbackImageType == "image") {
        this.data.options.data.image.src = val.url;
      } else {
        this.data.options.data[this.defaultCallbackImageType][
          this.goodsIndex
        ].img = val.url;
      }
    },
    // 选择商品回调
    selectedGoodsData(val) {
      this.data.options.data.hot.list[this.goodsIndex].img = val[0].thumbnail;
      this.data.options.data.hot.list[this.goodsIndex].title = val[0].goodsName;
      this.data.options.data.hot.list[this.goodsIndex].price = val[0].price;
      this.data.options.data.hot.list[this.goodsIndex].url =
        this.$options.filters.formatLinkType(val[0]);

      console.log(val, this.selectedData, this.goodsIndex);
    },
    // 选择链接回调
    selectedLink(val) {
      console.log(val,this.selectedData)
      if (this.selectedData == "image") {
        this.data.options.data.image.url =
          this.$options.filters.formatLinkType(val);
      } else {
        console.log(this.data.options.data.list,this.goodsIndex)
        this.data.options.data.list[
          this.goodsIndex
        ].url =  this.$options.filters.formatLinkType(val);
      }
    },
    /*
     * 点击不同模块进行编辑
     * 判断也很简单，就是第一个第二个模块进行判断
     *
     * */
    handleSelectModel() {
      this.showModal = true;
    },
  },
};
</script>

<style scoped lang="scss">
@import "./setup-box.scss";
.goods-list {
  display: flex;
  width: 558px;
  flex-wrap: wrap;
}
.goods-item {
  width: 278px;
  height: 277px;
  text-align: center;
  box-sizing: border-box;
  border-right: 1.4px solid #e2e2e2;
  &:nth-of-type(3) {
    border-top: 1.4px solid #e2e2e2;
  }
  &:nth-of-type(4) {
    border-top: 1.4px solid #e2e2e2;
  }
}
.active {
  color: #f31947;
}

.goods-name {
  margin-top: 23px;
  font-size: 25px;
  font-weight: normal;
  line-height: 30px;
  text-align: center;
  letter-spacing: 0px;

  color: #333333;
}
.goods-img {
  width: 190px;
  height: 156px;
  border-radius: 10px;
  margin-top: 19px;
}
.goods-desc {
  font-size: 14px;
  font-weight: normal;
  line-height: 17px;
  text-align: center;
  margin-top: 11px;
  letter-spacing: 0px;

  color: #333333;
}
.for-your {
  font-size: 35px;
  font-weight: normal;
  line-height: 42px;
  text-align: center;
  letter-spacing: 0px;
  margin-bottom: 32px;

  color: #333333;
}
.column-goods-list {
  > div {
    margin: 10px;
  }
}
.link-src {
  margin: 10px 0;
}

.card,
.right-card {
  opacity: 1;
  background: #ffffff;

  position: relative;

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
  margin: 10px 0;
  > .flex {
    align-items: center;
  }
}
.left {
  width: 346px;
  height: 554px;
  border-radius: 9.8px 0px 0px 9.8px;
  > img {
    max-width: 100%;
    height: 100%;
  }
}
.right {
  width: 839px;
  height: 554px;
  border-radius: 0px 9.8px 9.8px 0px;
}
.hot-list {
  width: 279px;
}
.hot-title {
  margin-left: 25px;
  line-height: 63px;
  font-size: 17px;
  font-weight: normal;

  letter-spacing: 0px;
  color: #333333;
  height: 63px;
}
.hot-item {
  box-sizing: border-box;
  border-top: 1.4px solid #e2e2e2;
  height: 122px;
  padding-left: 14px;
  align-items: center;
  > img {
    width: 76.3px;
    height: 77.7px;
  }
}
.hot-goods {
  margin-left: 14px;
}
.hot-goods-title {
  font-size: 13px;
  font-weight: normal;
  line-height: 16px;
  letter-spacing: 0px;

  color: #333333;
}
.hot-price {
  margin-top: 10.3px;
  font-size: 24px;
  font-weight: normal;
  line-height: 29px;
  letter-spacing: 0px;

  color: #f31947;
}
</style>
