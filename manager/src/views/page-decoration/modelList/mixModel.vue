<template>
  <div class="mix-model">
    <!-- 左侧 -->
    <div class="left-card">
      <left :data="data" />
      <div class="setup-box">
        <div>
          <Button size="small" @click.stop="handleSelectModel('left')"
            >编辑
          </Button>
        </div>
      </div>
    </div>
    <!-- 右侧 -->
    <div class="right-card">
      <right :data="data" />
      <div class="setup-box">
        <div>
          <Button size="small" @click.stop="handleSelectModel('right')"
            >编辑
          </Button>
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
      <div v-if="current">
        <div class="modal-tab-bar">
          <div>
            当前模块 :
            <ButtonGroup>
              <Button :type="current.model == 'goods' ? 'primary' : 'default'"
                >商品</Button
              >
              <Button :type="current.model == 'brand' ? 'primary' : 'default'"
                >品牌</Button
              >
            </ButtonGroup>
          </div>

          <div class="flex">
            <div>图片 :</div>
            <div>
              <img class="image" :src="current.data.image.src" alt="" />
              <div>
                <div>推荐尺寸：{{ current.data.image.size }}</div>
                <div class="link-src">
                  链接地址：
                  <Input
                    style="width: 200px"
                    v-model="current.data.image.url"
                    disabled
                  />
                </div>
                <Button
                  size="small"
                  type="primary"
                  @click="handleSelectImg('default')"
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
          <div class="flex" v-if="current.model == 'goods'">
            <div>标签 :</div>
            <Input
              style="width: 200px"
              type="text"
              v-model="current.data.badge.label"
            />
            <Input
              style="width: 100px; margin-left: 10px"
              disabled
              type="text"
              v-model="current.data.badge.url"
            />
            <Button
              size="small"
              class="ml_10"
              type="primary"
              @click="handleSelectLink('badge')"
              >选择链接
            </Button>
          </div>
          <div class="flex column-list">
            <div
              v-for="(item, index) in current.data.list"
              :key="index"
              class="draggable"
            >
              <div class="flex">
                <img :src="item.img" class="column-img" />
                <Button
                  size="small"
                  class="ml_10"
                  type="primary"
                  v-if="current.model == 'goods'"
                  @click="handleSelectGoods('list', index)"
                  >选择商品
                </Button>
                <div>
                  <div  v-if="current.model == 'brand'" style="margin-bottom: 10px">
                    <Input disabled v-model="item.url" />
                  </div>
                  <Button
                    size="small"
                    class="ml_10"
                    type="primary"
                    v-if="current.model == 'brand'"
                    @click="handleSelectLink('list', index)"
                  >
                    选择链接
                  </Button>
                  <Button
                    size="small"
                    class="ml_10"
                    type="primary"
                    v-if="current.model == 'brand'"
                    @click="handleSelectImg('list', index)"
                    >选择图片
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
import left from "./mixs/mix-goods";
import right from "./mixs/mix-brand";
import ossManage from "@/views/sys/oss-manage/ossManage.vue";

export default {
  name: "mixModel",
  data() {
    return {
      showModal: false,
      current: "", //当前选择的模块
      picModelFlag: false,
      selectedData: "", //选中的数据
      goodsIndex: 0, // 商品索引
      align: "",
      defaultCallbackImageType: "",
    };
  },
  props: {
    data: {
      type: Object,
      default: {},
    },
  },
  components: {
    left,
    right,
    ossManage,
  },
  mounted() {},
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
      if (this.defaultCallbackImageType == "default") {
        console.log(this.current.data.image);
        this.current.data.image.src = val.url;
      } else {
        console.log(this.goodsIndex, this.data.options[this.align].data.list);
        this.data.options[this.align].data.list[this.goodsIndex].img = val.url;

        // this.data.options[this.align].data[this.selectedData][this.goodsIndex].url = val.img
      }
    },
    // 选择商品回调
    selectedGoodsData(val) {
      console.log(val);
      this.$nextTick(() => {
        this.data.options[this.align].data.list[this.goodsIndex].img =
          val[0].thumbnail;
        this.data.options[this.align].data.list[this.goodsIndex].title =
          val[0].goodsName;
        this.data.options[this.align].data.list[this.goodsIndex].price =
          val[0].price;
        this.data.options[this.align].data.list[this.goodsIndex].url =
          val[0].url;
      });
      console.log(this.data.options[this.align].data.list[this.goodsIndex]);
      this.$forceUpdate();
    },
    // 选择链接回调
    selectedLink(val) {
      if (this.selectedData != "list") {
        this.data.options[this.align].data[this.selectedData].url = this.$options.filters.formatLinkType(val);
        console.log(this.data.options[this.align].data[this.selectedData])
      }
      if (this.selectedData == "list") {
         this.data.options[this.align].data[this.selectedData][this.goodsIndex]
        .url = this.$options.filters.formatLinkType(val);
      }
    },
    /*
     * 点击不同模块进行编辑
     * 判断也很简单，就是第一个第二个模块进行判断
     *
     * */
    handleSelectModel(align) {
      this.align = align;
      this.current = this.data.options[align];
      console.log(this.data.options[align]);
      this.showModal = true;
    },
  },
};
</script>

<style scoped lang="scss">
@import "./setup-box.scss";

.link-src {
  margin: 10px 0;
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
  > .flex {
    align-items: center;
  }
}
</style>
