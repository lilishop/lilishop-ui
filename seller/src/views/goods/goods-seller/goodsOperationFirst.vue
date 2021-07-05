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
        <ul v-if="categoryListLevel1.length > 0">
          <li v-for="(item, index) in categoryListLevel1" :class="{ activeClass: category[0].name }"
              @click="handleSelectCategory(item, index, 1)" :key="index">
            <span>{{ item.name }}</span>
            <span>&gt;</span>
          </li>
        </ul>
        <ul v-if="categoryListLevel2.length > 0">
          <li v-for="(item, index) in categoryListLevel2" :class="{ activeClass: category[1].name }"
              @click="handleSelectCategory(item, index, 2)" :key="index">
            <span>{{ item.name }}</span>
            <span>&gt;</span>
          </li>
        </ul>
        <ul v-if="categoryListLevel3.length > 0">
          <li v-for="(item, index) in categoryListLevel3" :class="{ activeClass: category[2].name }"
              @click="handleSelectCategory(item, index, 3)" :key="index">
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
      <template>
        <Divider>已选商品模版:{{checkedTemplate()}}</Divider>
      </template>
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
import bus from '@/libs/eventBus'
export default {
  data() {
    return {
      draftId: '',
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
      // 商品分类选择数组
      category: [
        {name: '', id: ''},
        {name: '', id: ''},
        {name: '', id: ''}
      ],

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
        return this.goodsTemplates.find(item=>{return item.id == this.draftId}).goodsName
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
      this.selectGoodsType = false;
    },
    /** 选择商城商品分类 */
    handleSelectCategory(row, index, level) {
      if (level === 1) {
        this.category.forEach(cate => {
          cate.name = '',
          cate.id = ''
        })
        this.category[0].name = row.name;
        this.category[0].id = row.id;
        this.categoryListLevel2 = this.categoryListLevel1[index].children;
        this.categoryListLevel3 = [];
      } else if (level === 2) {
        this.category[1].name = row.name;
        this.category[1].id = row.id;
        this.category[2].name = '';
        this.category[2].id = '';
        this.categoryListLevel3 = this.categoryListLevel2[index].children;
      } else {
        this.category[2].name = row.name
        this.category[2].id = row.id
      }
      // 设置当前商品分类ID
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
    // 下一步
    next() {
      window.scrollTo(0, 0);
      if (this.$route.query.draftId) {
        this.activestep = 1;
        this.GET_GoodData();
        return;
      }
      /** 1级校验 */
      this.loading = true;
      if (!this.baseInfoForm.goodsType) {
        this.$Message.error('请选择商品类型')
        this.loading = false;
        return
      }
      if (!this.activeCategoryName1) {
        this.$Message.error("请选择商品分类");
        return;
      } else if (this.activeCategoryIndex3 === -1) {
        this.$Message.error("必须选择到三级分类");
        return;
      } else if (this.activeCategoryName3) {
        /** 获取该商城分类下 商品参数信息 */
        this.GET_GoodsParams();
        /** 查询品牌列表 */
        this.getGoodsBrandList();
        /** 查询分类绑定的规格信息 */
        this.Get_SkuInfoByCategory(this.baseInfoForm.categoryId);
        // 获取商品单位
        this.GET_GoodsUnit();
        // 获取当前店铺分类
        this.GET_ShopGoodsLabel();
      }
    },
  },
  mounted () {
    this.GET_NextLevelCategory()
    this.selectGoodsType = true;
  }
}
</script>
<style lang="scss" scoped>
  @import "./addGoods.scss";
</style>