<template>
  <div>
    <!-- 选择商品类型 -->
    <Modal v-model="selectGoodsType" width="550" :closable="false">
      <div class="goods-type-list">
        <div
          class="goods-type-item"
          :class="{ 'active-goods-type': item.check }"
          @click="handleClickGoodsType(item)"
          v-for="(item, index) in goodsTypeWay"
          :key="index"
        >
          <img :src="item.img" />
          <div>
            <h2>{{ item.title }}</h2>
            <p>{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </Modal>
    <!-- 商品分类 -->
    <div class="content-goods-publish">
      <div class="goods-category">
        <ul v-if="categoryListLevel1.length > 0">
          <li
            v-for="(item, index) in categoryListLevel1"
            :class="{ activeClass: category[0].name === item.name }"
            @click="handleSelectCategory(item, index, 1)"
            :key="index"
          >
            <span>{{ item.name }}</span>
            <span>&gt;</span>
          </li>
        </ul>
        <ul v-if="categoryListLevel2.length > 0">
          <li
            v-for="(item, index) in categoryListLevel2"
            :class="{ activeClass: category[1].name === item.name }"
            @click="handleSelectCategory(item, index, 2)"
            :key="index"
          >
            <span>{{ item.name }}</span>
            <span>&gt;</span>
          </li>
        </ul>
        <ul v-if="categoryListLevel3.length > 0">
          <li
            v-for="(item, index) in categoryListLevel3"
            :class="{ activeClass: category[2].name === item.name }"
            @click="handleSelectCategory(item, index, 3)"
            :key="index"
          >
            <span>{{ item.name }}</span>
          </li>
        </ul>
      </div>
      <p class="current-goods-category">
        您当前选择的商品类别是：
        <span>{{ category[0].name }}</span>
        <span v-show="category[1].name">> {{ category[1].name }}</span>
        <span v-show="category[2].name">> {{ category[2].name }}</span>
      </p>
    </div>
    <!-- 底部按钮 -->
    <div class="footer">
      <ButtonGroup>
        <Button type="primary" @click="selectGoodsType = true">商品类型</Button>
        <Button type="primary" @click="next">下一步</Button>
      </ButtonGroup>
    </div>
  </div>
</template>
<script>
import * as API_GOODS from "@/api/goods";
export default {
  data() {
    return {
      selectGoodsType: false, // 展示选择商品分类modal
      goodsTypeWay: [
        {
          title: "实物商品",
          img: require("@/assets/goodsType1.png"),
          desc: "零售批发，物流配送",
          type: "PHYSICAL_GOODS",
          check: false,
        },
        {
          title: "虚拟商品",
          img: require("@/assets/goodsType2.png"),
          desc: "虚拟核验，无需物流",
          type: "VIRTUAL_GOODS",
          check: false,
        },
      ],
      // 商品分类选择数组
      category: [
        { name: "", id: "" },
        { name: "", id: "" },
        { name: "", id: "" },
      ],
      // 商品类型
      goodsType: "",
      /** 1级分类列表*/
      categoryListLevel1: [],
      /** 2级分类列表*/
      categoryListLevel2: [],
      /** 3级分类列表*/
      categoryListLevel3: [],
    };
  },
  methods: {
    // 点击商品类型
    handleClickGoodsType(val) {
      this.goodsTypeWay.map((item) => {
        return (item.check = false);
      });

      val.check = !val.check;
      this.goodsType = val.type;
    },
    /** 选择商城商品分类 */
    handleSelectCategory(row, index, level) {
      if (level === 1) {
        this.category.forEach((cate) => {
          (cate.name = ""), (cate.id = "");
        });
        this.category[0].name = row.name;
        this.category[0].id = row.id;
        this.categoryListLevel2 = this.categoryListLevel1[index].children;
        this.categoryListLevel3 = [];
      } else if (level === 2) {
        this.category[1].name = row.name;
        this.category[1].id = row.id;
        this.category[2].name = "";
        this.category[2].id = "";
        this.categoryListLevel3 = this.categoryListLevel2[index].children;
      } else {
        this.category[2].name = row.name;
        this.category[2].id = row.id;
      }
    },
    /** 查询下一级 商城商品分类*/
    GET_NextLevelCategory(row) {
      const _id = row && row.id !== 0 ? row.id : 0;
      API_GOODS.getGoodsCategoryAll().then((res) => {
        if (res.success && res.result) {
          this.categoryListLevel1 = res.result;
        }
      });
    },
    // 下一步
    next() {
      window.scrollTo(0, 0);
      if (!this.goodsType) {
        this.$Message.error("请选择商品类型");
        return;
      }
      if (!this.category[0].name) {
        this.$Message.error("请选择商品分类");
        return;
      } else if (!this.category[2].name) {
        this.$Message.error("必须选择到三级分类");
        return;
      } else if (this.category[2].name) {
        let params = {
          category: this.category,
          goodsType: this.goodsType,
        };
        this.$emit("change", params);
      }
    },
  },
  mounted() {
    this.GET_NextLevelCategory();
  },
};
</script>
<style lang="scss" scoped>
@import "./addGoods.scss";
</style>
