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
          {{ $filters.unitPrice(item.price, "￥") }}
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
      <div class="modal-tab-bar" v-if="draftOptions">
        <div class="tab-bar">
          标题
          <el-input style="width: 300px" v-model="draftOptions.title" />
        </div>
        <div class="tab-bar" v-if="draftOptions.labels[tabCurrentlyIndex]">
          标签
          <el-input
            style="width: 300px"
            v-model="draftOptions.labels[tabCurrentlyIndex].label"
           />
        </div>
        <el-button @click="handleTabsAdd" size="small" class="mb_10">增加</el-button>
        <el-tabs
          type="card"
          v-model="tabIndex"
          @tab-click="handleClickTab"
        >
          <el-tab-pane
            v-for="(tab,tabIndex) in draftOptions.labels"
            :key="tabIndex"
            :label="tab.label"
            :name="tab.___index + ''"
          >
            <div class="flex flex-a-c">
              <el-button class="del-btn" type="primary" @click="handleContextMenuDelete(tab,tabIndex)">删除当前标签</el-button>
              <el-button class="add-goods" @click="addCurrentGoods">
                添加商品
              </el-button>
            </div>

            <div
              v-for="(item, index) in draftOptions.list.filter((subset) => {
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
                      <el-input v-model="item.title" />
                    </div>
                    <div>
                      描述：
                      <el-input v-model="item.desc" />
                    </div>
                  </div>
                  <el-button @click="delGoods(item)">删除</el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
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
      tabIndex: 0,
      current: 0,
      showModal: false,
      draftOptions: null,
      tabCurrentlyIndex: 0, // 选项卡索引
    };
  },
  mounted(){
    this.tabIndex = this.data.options.labels[0].___index
  },
  methods: {
    cloneOptions(options) {
      return JSON.parse(JSON.stringify(options || {}));
    },
    /**
     * 算出最大的index 然后索引叠加
     */
    handleTabsAdd() {
      if (!this.draftOptions) return;
      const findAllIndex = this.draftOptions.labels.map((item) => item.___index);
      const max = Math.max.apply(null, findAllIndex);

      this.draftOptions.labels.push({
        label: "标签" + (max + 1),
        ___index: max + 1,
      });
    },
    // 删除标签
    handleContextMenuDelete(item, index) {
      if (!this.draftOptions) return;
      this.draftOptions.list = this.draftOptions.list.filter(
        (lab) => lab.___index != item.___index
      );
      this.draftOptions.labels.splice(index, 1);
    },
    // 删除商品
    delGoods(val) {
      if (!this.draftOptions) return;
      this.draftOptions.list.forEach((item, i) => {
        if (
          item.title == val.title &&
          item.___index == this.tabCurrentlyIndex
        ) {
          this.draftOptions.list.splice(i, 1);
        }
      });
    },
    // 切换选项卡
    handleClickTab(name) {
      this.tabCurrentlyIndex = name.paneName ?? name;
    },
    // 添加当前选项卡中的商品
    addCurrentGoods() {
      this.$refs.liliDialog.clearGoodsSelected();
      this.$refs.liliDialog.open("goods");
    },
    // 编辑模块
    handleSelectModel() {
      this.draftOptions = this.cloneOptions({
        title: this.data.options.title,
        labels: this.data.options.labels,
        list: this.data.options.list,
      });
      this.tabCurrentlyIndex = this.draftOptions.labels[0]?.___index ?? 0;
      this.tabIndex = String(this.tabCurrentlyIndex);
      this.showModal = true;
    },
    // 选择商品回调
    selectedGoodsData(val) {
      if (!val?.length || !this.draftOptions) return;
      val.forEach((item) => {
        this.draftOptions.list.push({
          img: item.thumbnail,
          price: item.price,
          title: item.goodsName,
          desc: "",
          url: `/goodsDetail?skuId=${item.id}&goodsId=${item.goodsId}`,
          ___index: this.tabCurrentlyIndex,
        });
      });
    },
    // 选择链接回调
    selectedLink(val) {
      if (!this.draftOptions?.list?.length) return;
      const item = this.draftOptions.list[this.current];
      if (!item) return;
      item.url = this.$filters.formatLinkType(val);
      item.type =
        val.___type === "other" && val.url === "" ? "link" : "other";
    },
    handleSelectLink(index) {
      this.$refs.liliDialog.open("link");
      this.current = index;
    },
    handleCancelModal() {
      this.draftOptions = null;
      this.showModal = false;
    },
    handleConfirmModal() {
      if (this.draftOptions) {
        const saved = this.cloneOptions(this.draftOptions);
        this.data.options.title = saved.title;
        this.data.options.labels.splice(
          0,
          this.data.options.labels.length,
          ...saved.labels
        );
        this.data.options.list.splice(
          0,
          this.data.options.list.length,
          ...saved.list
        );
      }
      this.draftOptions = null;
      this.showModal = false;
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
