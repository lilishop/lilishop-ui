<template>
  <div>
    <!-- 选择商品类型 -->
    <Modal v-model="selectGoodsType" width="550" :closable="false">
      <div class="goods-type-list" v-if="!showGoodsTemplates">
        <div class="goods-type-item" :class="{'active-goods-type':item.check}" @click="handleClickGoodsType(item)"
          v-for="(item,index) in goodsTypeWay" :key="index">
          <img :src="item.img"/>
          <div>
            <h2>{{ item.title }}</h2>
            <p>{{ item.desc }}</p>
          </div>
        </div>
      </div>
      <div v-else class="goods-type-list">
        <h2 @click="showGoodsTemplates = !showGoodsTemplates">返回</h2>
        <div class="goods-type-item template-item" @click="handleClickGoodsTemplate(item)"
             v-for="(item,index) in goodsTemplates" :key="index">
          <img :src="item.thumbnail"/>
          <div>
            <h2>{{ item.goodsName }}</h2>
            <p>{{ item.sellingPoint || '' }}</p>
          </div>
        </div>
      </div>
    </Modal>
    <!-- 商品分类 -->
    <div class="content-goods-publish">
      <div class="goods-category">
        <ul v-if="categoryListLevel1 && categoryListLevel1.length > 0">
          <li v-for="(item, index) in categoryListLevel1" :class="{ activeClass: index == activeCategoryIndex1 }"
              @click="handleSelectCategory(item, index, 1)" :key="index">
            <span>{{ item.name }}</span>
            <span>&gt;</span>
          </li>
        </ul>
        <ul v-if="categoryListLevel2 && categoryListLevel2.length > 0">
          <li v-for="(item, index) in categoryListLevel2" :class="{ activeClass: index == activeCategoryIndex2 }"
              @click="handleSelectCategory(item, index, 2)" :key="index">
            <span>{{ item.name }}</span>
            <span>&gt;</span>
          </li>
        </ul>
        <ul v-if="categoryListLevel3 && categoryListLevel3.length > 0">
          <li v-for="(item, index) in categoryListLevel3" :class="{ activeClass: index == activeCategoryIndex3 }"
              @click="handleSelectCategory(item, index, 3)" :key="index">
            <span>{{ item.name }}</span>
          </li>
        </ul>
      </div>
      <p class="current-goods-category">
        您当前选择的商品类别是：
        <span>{{ activeCategoryName1 }}</span>
        <span v-show="activeCategoryName2">> {{ activeCategoryName2 }}</span>
        <span v-show="activeCategoryName3">> {{ activeCategoryName3 }}</span>
      </p>
      <template v-if="!$route.query.id">
        <Divider>已选商品模版:{{checkedTemplate()}}</Divider>
      </template>
    </div>
  </div>
</template>
<script>
import * as API_GOODS from "@/api/goods";
export default {
  data() {
    return {
      selectGoodsType: false, // 展示选择商品分类modal
      goodsTemplates: [], // 商品模板列表
      showGoodsTemplates: false, //是否显示选择商品模板
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
        {
          title: "商品模板导入",
          img: require("@/assets/goodsTypeTpl.png"),
          desc: "商品模板，一键导入",
          check: false,
        },
      ],
      /** 当前点击的1级分类索引*/
      activeCategoryIndex1: -1,

      /** 当前点击的2级分类索引*/
      activeCategoryIndex2: -1,

      /** 当前点击的3级分类索引*/
      activeCategoryIndex3: -1,
      /** 当前商品分类名称1*/
      activeCategoryName1: "",

      /** 当前商品分类名称2*/
      activeCategoryName2: "",

      /** 当前商品分类名称3*/
      activeCategoryName3: "",
      /** 1级分类列表*/
      categoryListLevel1: [],

      /** 2级分类列表*/
      categoryListLevel2: [],

      /** 3级分类列表*/
      categoryListLevel3: [],
    }
  },
  methods: {
      // 获取已选模板
    checkedTemplate () {
      if(this.goodsTemplates.length) {
        return this.goodsTemplates.find(item=>{return item.id == this.$parent.draftId}).goodsName
      } else {
        return ""
      }
    },
    // 点击商品类型
    handleClickGoodsType(val) {
      this.goodsTypeWay.map((item) => {
        return (item.check = false);
      });

      val.check = !val.check;
      if (!val.type) {
        this.showGoodsTemplates = true;
        this.GET_GoodsTemplate()
      } else {
        // this.baseInfoForm.goodsType = val.type;
        // this.draftId = "";
      }
    },
    // 获取商品模板
    GET_GoodsTemplate() {
      let searchParams = {
        saveType: "TEMPLATE",
        sort: "create_time",
        order: "desc",
      };
      API_GOODS.getDraftGoodsListData(searchParams).then((res) => {
        if (res.success) {
          this.goodsTemplates = res.result.records;
        }
      });
    },
    // 选择商品模板
    handleClickGoodsTemplate(val) {
      // this.draftId = val.id;
      this.selectGoodsType = false;
    },
    /** 选择商城商品分类 */
    handleSelectCategory(row, index, level) {
      if (level === 1) {
        // this.baseInfoForm.categoryPath = row.id;
        this.activeCategoryName1 = row.name;
        this.activeCategoryName2 = this.activeCategoryName3 = "";
        this.activeCategoryIndex1 = index;
        this.activeCategoryIndex2 = -1;
        this.activeCategoryIndex3 = -1;
        this.categoryListLevel2 = this.categoryListLevel1[index].children;
        this.categoryListLevel3 = [];
      } else if (level === 2) {
        // this.baseInfoForm.categoryPath =
        //   this.baseInfoForm.categoryPath + "," + row.id;
        this.activeCategoryName2 = row.name;
        this.activeCategoryName3 = "";
        this.activeCategoryIndex2 = index;
        this.activeCategoryIndex3 = -1;
        this.categoryListLevel3 = this.categoryListLevel2[index].children;
      } else {
        // this.baseInfoForm.categoryPath =
        //   this.baseInfoForm.categoryPath + "," + row.id;
        this.activeCategoryName3 = row.name;
        this.activeCategoryIndex3 = index;
      }
      // 设置当前商城分类ID
      // this.baseInfoForm.categoryId = row.id;
      // this.categoryId = row.id;
      // this.baseInfoForm.categoryName = row.name;
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
  },
  mounted () {
    this.GET_NextLevelCategory()
  }
}
</script>
<style lang="scss" scoped>
  @import "./addGoods.scss";
</style>