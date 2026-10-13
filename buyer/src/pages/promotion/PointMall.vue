<template>
  <div class="point-mall">
    <BaseHeader></BaseHeader>
    <Search></Search>
    <cateNav></cateNav>
    <h3 class="promotion-decorate">积分商品</h3>
    <el-select @select="selectCate" size="small" class="cate-select-con" v-model="cateId">
      <el-option v-for="(cate, index) in cateList" :value="cate.id" :key="index">{{cate.name}}</el-option>
    </el-select>
    <!-- 列表 -->
    <div class="goods-list">
      <empty v-if="goodsList.length === 0" />
      <div
        v-else
        class="goods-show-info"
        v-for="(item, index) in goodsList"
        :key="index"
        @click="goGoodsDetail(item.id)"
      >
        <div class="goods-show-img">
          <img :src="itemThumbnail(item)" loading="lazy" decoding="async" />
        </div>
        <div class="goods-show-price">
          <span>
            <span class="seckill-price text-danger">{{item.points}}积分</span>
          </span>
        </div>
        <div class="goods-show-detail">
          <span>{{ itemGoodsName(item) }}</span>
        </div>
        <div class="goods-show-num">
          已有<span>{{ item.commentNum || 0 }}</span>人评价
        </div>
        <div class="goods-show-seller">
          <span>{{ item.storeName }}</span>
        </div>
      </div>
    </div>
    <div class="page-size">
      <el-pagination v-model:current-page="params.pageNumber" v-model:page-size="params.pageSize"
        :total="total" @current-change="changePageNum"
        @size-change="changePageSize" layout="total, sizes, prev, pager, next"></el-pagination>
    </div>
    <BaseFooter></BaseFooter>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { pointGoods, pointGoodsCategory } from "@/api/promotion.js";

const route = useRoute();
const router = useRouter();

const goodsList = ref([]); // 积分商品列表
const cateList = ref([{ // 商品分类
  name: "全部分类",
  id: 0,
}]); // 积分分类列表
// 商品列表请求参数
const params = reactive({
  pageNumber: 1,
  pageSize: 20,
  pointsGoodsCategoryId: "",
});
const total = ref(0); // 商品总数
const cateId = ref(""); // 店铺分类id

onMounted(() => {
  params.pointsGoodsCategoryId = route.query.categoryId || "";
  cateId.value = route.query.categoryId || 0;
  getList();
  getCate();
});

/** 列表 API 返回 PointsGoods（thumbnail/goodsName 在顶层）；详情 API 才有 goodsSku */
function itemThumbnail(item) {
  return item?.goodsSku?.thumbnail || item?.thumbnail || "";
}

function itemGoodsName(item) {
  return item?.goodsSku?.goodsName || item?.goodsName || "";
}

// 获取列表
function getList() {
  pointGoods(params).then((res) => {
    if (res.success) {
      goodsList.value = res.result.records;
      total.value = res.result.total;
    }
  });
}

// 获取分类
function getCate() {
  pointGoodsCategory(params).then((res) => {
    if (res.success) {
      cateList.value.push(...res.result.records);
    }
  });
}

// 选择商品分类
function selectCate(item) {
  let cateId = item.value === 0 ? "" : item.value;
  params.pointsGoodsCategoryId = cateId;
  getList();
  router.push({ query: { categoryId: cateId } });
}

// 跳转商品详情
function goGoodsDetail(id) {
  router.push({ path: "/pointGoodsDetail", query: { id } });
  // let routerUrl = router.resolve({
  //   path: '/pointGoodsDetail',
  //   query: {id}
  // })
  // window.open(routerUrl.href, '_blank')
}

// 修改页码
function changePageNum(val) {
  params.pageNumber = val;
  getList();
}

// 修改页数
function changePageSize(val) {
  params.pageNumber = 1;
  params.pageSize = val;
  getList();
}
</script>
<style lang="scss" scoped>
@import '../../assets/styles/goodsList.scss';
.seckill-price {
  font-size: 18px;
}
.point-mall{
  position: relative;
}
.category {
  width: 1200px;
  margin: 0 auto;
  display: flex;
  height: 30px;
  line-height: 30px;
  background-color:#005aa0;
  color: #fff;
  li{
    margin: 0 10px;
    &:hover{
      cursor: pointer;
      color: $theme_color;
    }
  }

  .selected-cate{
    color: $theme_color;
  }
}
.page-size {
  width: 1200px;
  margin: 10px auto;
  display: flex;
  justify-content: flex-end;
}
.promotion-decorate::before,.promotion-decorate::after{
  background-image: url('/src/assets/images/sprite@2x.png');
}
.cate-select-con{
  display: block;
  margin: 0 auto;
  position: relative;
  top: -60px;
  left: 200px;
  width: 100px;
}
</style>
