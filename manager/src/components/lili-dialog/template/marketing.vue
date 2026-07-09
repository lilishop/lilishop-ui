<template>
  <div class="wrapper">
    <div class="list">
      <div
        v-for="(item, index) in Object.keys(promotionList)"
        :key="index"
        class="list-item"
        :class="{ active: selectedIndex == index }"
        @click="clickPromotion(item, index)"
      >
        {{ typeOption(item).title }}
      </div>
    </div>
    <div class="content">
      <div v-if="showPromotionList">
        <div class="tables">
          <el-table v-loading="loading" border height="350" :data="showPromotionList" style="width: 100%">
            <template v-if="isSeckillMode">
              <el-table-column prop="goodsName" label="商品名称" min-width="200" show-overflow-tooltip />
              <el-table-column prop="storeName" label="店铺名称" show-overflow-tooltip />
              <el-table-column label="活动时间" show-overflow-tooltip>
                <template #default="{ row }">
                  <span v-if="row">{{ row.timeLine }}点</span>
                </template>
              </el-table-column>
              <el-table-column label="原价" show-overflow-tooltip>
                <template #default="{ row }">
                  <span v-if="row">{{ $filters.unitPrice(row.originalPrice) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="现价" show-overflow-tooltip>
                <template #default="{ row }">
                  <span v-if="row">{{ $filters.unitPrice(row.price, "￥") }}</span>
                </template>
              </el-table-column>
              <el-table-column label="状态" show-overflow-tooltip>
                <template #default="{ row }">
                  <span v-if="row">{{ seckillStatusText(row.promotionApplyStatus) }}</span>
                </template>
              </el-table-column>
            </template>
            <template v-else>
              <el-table-column prop="goodsName" label="商品名称" show-overflow-tooltip />
              <el-table-column prop="storeName" label="店铺名称" show-overflow-tooltip />
              <el-table-column prop="startTime" label="开始时间" show-overflow-tooltip />
              <el-table-column prop="endTime" label="结束时间" show-overflow-tooltip />
            </template>
            <el-table-column label="操作" width="100" fixed="right" align="center">
              <template #default="{ row, $index }">
                <a v-if="row" class="link-text" @click="selectedPromotion({ row, index: $index })">
                  {{ index === $index ? "已选" : "选择" }}
                </a>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="params.pageNumber"
            v-model:page-size="params.pageSize"
            class="mt_10"
            :total="Number(totals)"
            layout="prev, pager, next, jumper"
            size="small"
            @current-change="(val) => { params.pageNumber = val; }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { getAllPromotion } from "@/api/promotion";

export default {
  data() {
    return {
      totals: "",
      loading: true,
      promotionList: "",
      selectedIndex: 0,
      promotions: "",
      index: 999,
      params: {
        pageNumber: 1,
        pageSize: 20,
      },
      showPromotionList: [],
    };
  },
  computed: {
    isSeckillMode() {
      return this.promotions === "SECKILL";
    },
  },
  mounted() {
    this.init();
  },
  watch: {
    params: {
      handler() {
        this.index = 999;
        this.typeOption(this.promotions) && this.typeOption(this.promotions).methodsed();
      },
      deep: true,
    },
  },
  methods: {
    seckillStatusText(v) {
      if (v === "APPLY") return "申请";
      if (v === "PASS") return "通过";
      return "拒绝";
    },
    sortGoods(type) {
      this.loading = false;
      this.showPromotionList = this.promotionList[type];
    },
    typeOption(type) {
      switch (type) {
        case "FULL_DISCOUNT":
          return { title: "满减", methodsed: () => { this.showPromotionList = []; this.sortGoods("FULL_DISCOUNT"); } };
        case "PINTUAN":
          return { title: "拼团", methodsed: () => { this.showPromotionList = []; this.sortGoods("PINTUAN"); } };
        case "KANJIA":
          return { title: "砍价", methodsed: () => { this.showPromotionList = []; this.sortGoods("KANJIA"); } };
        case "SECKILL":
          return { title: "秒杀", methodsed: () => { this.showPromotionList = []; this.sortGoods("SECKILL"); } };
        case "POINTS_GOODS":
          return { title: "积分商品", methodsed: () => { this.showPromotionList = []; this.sortGoods("POINTS_GOODS"); } };
        default:
          return {};
      }
    },
    selectedPromotion(val) {
      val.row.___type = "marketing";
      val.row.___promotion = this.promotions;
      this.$emit("selected", [val.row]);
      this.index = val.index;
    },
    async init() {
      const res = await getAllPromotion();
      if (res.success) {
        this.loading = false;
        this.getPromotion(res);
      } else {
        this.loading = false;
      }
    },
    getPromotion(res) {
      if (res.result) {
        this.promotionList = res.result;
        delete this.promotionList.COUPON;
        Object.keys(res.result)[0] && this.typeOption(Object.keys(res.result)[0]).methodsed();
        this.promotions = Object.keys(res.result)[0];
      }
    },
    clickPromotion(val, i) {
      this.promotions = val;
      this.selectedIndex = i;
      this.params.pageNumber = 1;
      this.typeOption(val) && this.typeOption(val).methodsed(this.promotionList[val].id);
    },
  },
};
</script>
<style lang="scss" scoped>
.link-text {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}
.tables {
  height: 400px;
  margin-top: 20px;
  overflow: auto;
  width: 100%;
}
.list {
  margin: 0 1.5%;
  height: 400px;
  overflow: auto;
  flex: 1;
  width: auto;
  > .list-item {
    padding: 10px;
    transition: 0.35s;
    cursor: pointer;
  }
  .list-item:hover {
    background: #ededed;
  }
}
.content {
  overflow: hidden;
  flex: 4;
}
.active {
  background: #ededed;
}
.wrapper {
  overflow: hidden;
  display: flex;
}
</style>
