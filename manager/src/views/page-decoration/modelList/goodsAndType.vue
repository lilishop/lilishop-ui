<template>
  <div class="goods-type-wrapper">
    <div class="flex goods-type-line">
      <div class="goods-type-title">{{ data.options.title }}</div>
      <div class="flex goods-type-labels">
        <div
          @click="tabCurrentlyIndex = index"
          :class="{ active: tabCurrentlyIndex === index }"
          class="goods-type-item"
          v-for="(item, index) in data.options.labels"
          :key="index"
        >
          {{ item.label }}
        </div>
      </div>
    </div>

    <!-- 商品部分 -->
    <div class="goods-list flex">
      <div
        class="goods-list-item"
        v-for="(item, index) in data.options.list.filter((subset) => {
          return subset.___index == tabCurrentlyIndex;
        })"
        :key="index"
      >
        <div class="goods-img">
          <img :src="item.img" />
        </div>
        <div>
          <div class="goods-name wes-2">{{ item.title }}</div>
          <div class="goods-desc">{{ item.desc }}</div>
        </div>
        <div class="goods-price">
          {{ item.price | unitPrice("￥") }}
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
        <div class="tab-bar">
          标题
          <Input style="width: 300px" v-model="data.options.title"></Input>
        </div>
        <div class="tab-bar" v-if="data.options.labels[tabCurrentlyIndex]">
          标签
          <Input
            style="width: 300px"
            v-model="data.options.labels[tabCurrentlyIndex].label"
          ></Input>
        </div>
        <Tabs
          type="card"
          @on-click="handleClickTab"
          :value="tabIndex"
          :draggable="true"

        >
          <Button @click="handleTabsAdd" size="small" slot="extra">增加</Button>
          <TabPane
            v-for="(tab,tabIndex) in data.options.labels"
            :key="tabIndex"
            :label="tab.label"
            :name="tab.___index + ''"
          >
            <div class="flex flex-a-c">
              <Button class="del-btn" type="primary" @click="handleContextMenuDelete(tab,tabIndex)">删除当前标签</Button>
              <Button class="add-goods" @click="addCurrentGoods">
                添加商品
              </Button>
            </div>

            <div
              v-for="(item, index) in data.options.list.filter((subset) => {
                return subset.___index == tabCurrentlyIndex;
              })"
              :key="index"
              class="draggable"
            >
              <div class="flex">
                <img :src="item.img" class="column-img" />
                <div class="flex column-goods-config">
                  <div class="column-config">
                    <div>
                      标题：
                      <Input v-model="item.title"></Input>
                    </div>
                    <div>
                      描述：
                      <Input v-model="item.desc"></Input>
                    </div>
                  </div>
                  <Button @click="delGoods(item)">删除</Button>
                </div>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </Modal>

    <!-- 选择商品。链接 -->
    <liliDialog
      ref="liliDialog"
      @selectedLink="selectedLink"
      @selectedGoodsData="selectedGoodsData"
    ></liliDialog>
  </div>
</template>

<script>

export default {
  name: "goods",

  props: {
    data: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      tabIndex:0,
      current: 0,
      showModal: false,
      selected: {}, // 已选数据
      picModelFlag: false,
      tabCurrentlyIndex: 0, // 选项卡索引
    };
  },
  mounted(){
    this.tabIndex = this.data.options.labels[0].___index
  },
  methods: {
    /**
     * 算出最大的index 然后索引叠加
     */
    handleTabsAdd() {
      let findAllIndex = this.data.options.labels.map((item) => {
        return item.___index;
      });
      let max = Math.max.apply(null, findAllIndex);

      this.data.options.labels.push({
        label: "标签" + (max + 1),
        ___index: max + 1,
      });
    },
    // 删除标签
    handleContextMenuDelete(item,index) {
      // 删除标签下关联的商品
      this.data.options.list.forEach((lab,currently)=>{
        if(lab.___index == item.___index){
           this.data.options.list.splice(currently,1)
        }
      })
      // 删除当前标签
      this.data.options.labels.splice(index,1)
    },
    // 删除商品
    delGoods(val) {
      this.data.options.list.forEach((item, i) => {
        if (
          item.title == val.title &&
          item.___index == this.tabCurrentlyIndex
        ) {
          this.data.options.list.splice(i, 1);
        }
      });
    },
    // 切换选项卡
    handleClickTab(name) {
      console.log(name)
      this.tabCurrentlyIndex = name;
    },
    // 添加当前选项卡中的商品
    addCurrentGoods() {

      this.$refs.liliDialog.clearGoodsSelected();
      this.$refs.liliDialog.open("goods");
    },
    // 编辑模块
    handleSelectModel(item) {
      console.log(item);
      this.selected = item;
      this.showModal = true;
    },
    // 选择商品回调
    selectedGoodsData(val) {
      if (val.length) {
        val.forEach((item) => {
          const pushGoodsDetail = {
            img: item.thumbnail,
            price: item.price,
            title: item.goodsName,
            desc: "",
            url: `/goodsDetail?skuId=${item.id}&goodsId=${item.goodsId}`,
            ___index: this.tabCurrentlyIndex,
          };
          this.data.options.list.push(pushGoodsDetail);
        });
      }
    },
    // 选择链接回调
    selectedLink(val) {
      this.selected[this.current].url =
        this.$options.filters.formatLinkType(val);
      this.selected[this.current].type =
        val.___type === "other" && val.url === "" ? "link" : "other";

      console.log(this.selected[this.current]);
    },
    handleSelectLink(index) {
      // 调起选择链接弹窗
      this.$refs.liliDialog.open("link");
      this.current = index;
    },
  },
};
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
.goods-desc {
  font-size: 14px;
  font-weight: normal;
  line-height: 17px;
  text-align: center;
  letter-spacing: 0px;
  margin-bottom: 12.4px;
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
