<template>
  <div>
    <!-- 选择商品类型 -->
    <el-dialog v-model="selectGoodsType" width="550px" :show-close="false">
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
      <template #footer>
        <div class="goods-type-actions">
          <el-button @click="cancelGoodsType">取消</el-button>
          <el-button type="primary" @click="confirmGoodsType">确认</el-button>
        </div>
      </template>
    </el-dialog>
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
      <div class="footer-btns">
        <el-button type="primary" @click="openGoodsTypeDialog">商品类型</el-button>
        <el-button type="primary" @click="next">下一步</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import * as API_GOODS from "@/api/goods";
import goodsType1Img from "@/assets/goodsType1.png";
import goodsType2Img from "@/assets/goodsType2.png";
export default {
  data() {
    return {
      selectGoodsType: false, // 展示选择商品分类modal
      /** 商品类型选项；E_COUPON 为卡密商品（与 VIRTUAL_GOODS 核销型区分，见 FR-S-01） */
      goodsTypeWay: [
        {
          title: "实物商品",
          img: goodsType1Img,
          desc: "零售批发，物流配送",
          type: "PHYSICAL_GOODS",
          check: false,
        },
        {
          title: "虚拟商品",
          img: goodsType2Img,
          desc: "虚拟核验，无需物流",
          type: "VIRTUAL_GOODS",
          check: false,
        },
        {
          title: "电子卡券",
          img: goodsType2Img,
          desc: "卡密自动发卡，无需物流",
          type: "E_COUPON", // goodsType；库存由卡池同步，非手动填写
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
      pendingGoodsType: "",
      /** 1级分类列表*/
      categoryListLevel1: [],
      /** 2级分类列表*/
      categoryListLevel2: [],
      /** 3级分类列表*/
      categoryListLevel3: [],
    };
  },
  watch: {
    selectGoodsType(val) {
      if (val) {
        this.syncGoodsTypeSelection();
      }
    },
  },
  methods: {
    syncGoodsTypeSelection() {
      this.pendingGoodsType = this.goodsType;
      this.goodsTypeWay.forEach((item) => {
        item.check = item.type === this.goodsType;
      });
    },
    openGoodsTypeDialog() {
      this.selectGoodsType = true;
    },
    // 点击商品类型（仅临时选中，确认后才生效）
    handleClickGoodsType(val) {
      this.goodsTypeWay.forEach((item) => {
        item.check = item.type === val.type;
      });
      this.pendingGoodsType = val.type;
    },
    cancelGoodsType() {
      this.syncGoodsTypeSelection();
      this.selectGoodsType = false;
    },
    confirmGoodsType() {
      if (!this.pendingGoodsType) {
        this.$Message.error("请选择商品类型");
        return;
      }
      this.goodsType = this.pendingGoodsType;
      this.selectGoodsType = false;
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

.footer {
  display: flex;
  justify-content: center;
}

.footer-btns {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.goods-type-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  width: 100%;
}

.content-goods-publish {
  .goods-category li.activeClass {
    background-color: #409eff;
    border-color: #409eff;
    color: #fff;
  }
}
</style>
