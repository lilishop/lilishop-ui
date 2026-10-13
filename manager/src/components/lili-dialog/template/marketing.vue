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
<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { getAllPromotion } from "@/api/promotion";

const emit = defineEmits(["selected"]);

const totals = ref("");
const loading = ref(true);
const promotionList = ref("");
const selectedIndex = ref(0);
const promotions = ref("");
const index = ref(999);
const params = ref({
  pageNumber: 1,
  pageSize: 20,
});
const showPromotionList = ref([]);

const isSeckillMode = computed(() => {
  return promotions.value === "SECKILL";
});

watch(
  params,
  () => {
    index.value = 999;
    typeOption(promotions.value) && typeOption(promotions.value).methodsed();
  },
  { deep: true }
);

function seckillStatusText(v) {
  if (v === "APPLY") return "申请";
  if (v === "PASS") return "通过";
  return "拒绝";
}
function sortGoods(type) {
  loading.value = false;
  showPromotionList.value = promotionList.value[type];
}
function typeOption(type) {
  switch (type) {
    case "FULL_DISCOUNT":
      return { title: "满减", methodsed: () => { showPromotionList.value = []; sortGoods("FULL_DISCOUNT"); } };
    case "PINTUAN":
      return { title: "拼团", methodsed: () => { showPromotionList.value = []; sortGoods("PINTUAN"); } };
    case "KANJIA":
      return { title: "砍价", methodsed: () => { showPromotionList.value = []; sortGoods("KANJIA"); } };
    case "SECKILL":
      return { title: "秒杀", methodsed: () => { showPromotionList.value = []; sortGoods("SECKILL"); } };
    case "POINTS_GOODS":
      return { title: "积分商品", methodsed: () => { showPromotionList.value = []; sortGoods("POINTS_GOODS"); } };
    default:
      return {};
  }
}
function selectedPromotion(val) {
  val.row.___type = "marketing";
  val.row.___promotion = promotions.value;
  emit("selected", [val.row]);
  index.value = val.index;
}
async function init() {
  const res = await getAllPromotion();
  if (res.success) {
    loading.value = false;
    getPromotion(res);
  } else {
    loading.value = false;
  }
}
function getPromotion(res) {
  if (res.result) {
    promotionList.value = res.result;
    delete promotionList.value.COUPON;
    Object.keys(res.result)[0] && typeOption(Object.keys(res.result)[0]).methodsed();
    promotions.value = Object.keys(res.result)[0];
  }
}
function clickPromotion(val, i) {
  promotions.value = val;
  selectedIndex.value = i;
  params.value.pageNumber = 1;
  typeOption(val) && typeOption(val).methodsed(promotionList.value[val].id);
}

onMounted(() => {
  init();
});
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
