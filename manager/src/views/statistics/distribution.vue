<template>
  <div class="wrapper">
    <el-affix :offset="100">
      <el-card class="card fixed-bottom">
        <affixTime @selected="clickBreadcrumb" />
      </el-card>
    </el-affix>

    <el-card class="card">
      <el-tabs v-model="activeTab" @tab-change="onTabChange">
        <el-tab-pane label="概览" name="overview">
          <h4>分销概况</h4>
          <div class="metric-grid">
            <div class="metric-item" v-for="item in metricDefs" :key="item.key">
              <div class="metric-label">
                <span>{{ item.label }}</span>
                <el-tooltip v-if="item.tip" :content="item.tip" placement="top">
                  <el-icon class="metric-tip"><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
              <div class="metric-value">
                <template v-if="item.isMoney">
                  {{ $filters.unitPrice(overview[item.key] || 0, "￥") }}
                </template>
                <template v-else>
                  {{ formatNumber(overview[item.key]) }}
                </template>
              </div>
            </div>
          </div>

          <h4 class="section-title">今日数据</h4>
          <div class="metric-grid">
            <div class="metric-item" v-for="item in todayMetricDefs" :key="item.key">
              <div class="metric-label">{{ item.label }}</div>
              <div class="metric-value">
                <template v-if="item.isMoney">
                  <priceColorScheme :value="overviewV2[item.key]" :color="$mainColor" />
                </template>
                <template v-else>
                  {{ formatNumber(overviewV2[item.key]) }}
                </template>
              </div>
            </div>
          </div>

          <h4 class="section-title">累计数据</h4>
          <div class="metric-grid">
            <div class="metric-item" v-for="item in totalMetricDefs" :key="item.key">
              <div class="metric-label">{{ item.label }}</div>
              <div class="metric-value">
                <template v-if="item.isMoney">
                  <priceColorScheme :value="overviewV2[item.key]" :color="$mainColor" />
                </template>
                <template v-else>
                  {{ formatNumber(overviewV2[item.key]) }}
                </template>
              </div>
            </div>
          </div>

          <h4 class="section-title">分销排行</h4>
          <el-row :gutter="16">
            <el-col :xs="24" :md="12">
              <div class="rank-title">TOP分销员</div>
              <el-table :data="distributorRank" stripe style="width: 100%">
                <el-table-column prop="rank" label="排名" width="70" />
                <el-table-column prop="name" label="分销员" min-width="140" show-overflow-tooltip />
                <el-table-column label="佣金" min-width="120">
                  <template #default="{ row }">
                    {{ $filters.unitPrice(row.amount || 0, "￥") }}
                  </template>
                </el-table-column>
                <el-table-column prop="num" label="订单数" min-width="100" />
              </el-table>
            </el-col>
            <el-col :xs="24" :md="12">
              <div class="rank-title">TOP分销商品</div>
              <el-table :data="goodsRank" stripe style="width: 100%">
                <el-table-column prop="rank" label="排名" width="70" />
                <el-table-column prop="name" label="商品" min-width="160" show-overflow-tooltip />
                <el-table-column label="佣金" min-width="120">
                  <template #default="{ row }">
                    {{ $filters.unitPrice(row.amount || 0, "￥") }}
                  </template>
                </el-table-column>
                <el-table-column prop="num" label="销量" min-width="100" />
              </el-table>
            </el-col>
          </el-row>
        </el-tab-pane>

        <el-tab-pane label="行为数据" name="behavior">
          <el-table v-loading="behaviorLoading" :data="behaviorData" stripe border style="width: 100%">
            <el-table-column prop="nickname" label="昵称" min-width="120" show-overflow-tooltip />
            <el-table-column prop="mobile" label="手机号" min-width="120" />
            <el-table-column prop="gradeName" label="等级" width="100" />
            <el-table-column label="新增销售额" min-width="120">
              <template #default="{ row }">
                <priceColorScheme v-if="row" :value="row.newSalesAmount" :color="$mainColor" />
              </template>
            </el-table-column>
            <el-table-column prop="newCustomerCount" label="新增客户数" width="110" />
            <el-table-column prop="paidCustomerCount" label="支付客户数" width="110" />
            <el-table-column prop="newInviteCount" label="新增邀请数" width="110" />
            <el-table-column prop="orderInviteCount" label="开单邀请数" width="110" />
            <el-table-column prop="shareCount" label="商品分享数" width="110" />
            <el-table-column prop="sharedGoodsCount" label="分享商品数" width="110" />
            <el-table-column prop="shareVisitorCount" label="分享引流" width="100" />
            <el-table-column prop="shareVisitCount" label="分享浏览量" width="110" />
          </el-table>
          <div class="mt_10" style="display: flex; justify-content: flex-end">
            <el-pagination
              v-model:current-page="behaviorPage.pageNumber"
              v-model:page-size="behaviorPage.pageSize"
              :page-sizes="[20, 50, 100]"
              :total="behaviorTotal"
              layout="total, sizes, prev, pager, next, jumper"
              size="small"
              @current-change="loadBehavior"
              @size-change="onBehaviorSizeChange"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="商品数据" name="goods">
          <el-table v-loading="goodsLoading" :data="goodsData" stripe border style="width: 100%">
            <el-table-column prop="goodsName" label="商品名称" min-width="160" show-overflow-tooltip />
            <el-table-column prop="shareDistributorCount" label="分享人数" width="100" />
            <el-table-column prop="shareCount" label="分享次数" width="100" />
            <el-table-column prop="visitVisitorCount" label="访问人数" width="100" />
            <el-table-column label="成交金额" min-width="120">
              <template #default="{ row }">
                <priceColorScheme v-if="row" :value="row.dealAmount" :color="$mainColor" />
              </template>
            </el-table-column>
            <el-table-column label="支出佣金" min-width="120">
              <template #default="{ row }">
                <priceColorScheme v-if="row" :value="row.commissionAmount" :color="$mainColor" />
              </template>
            </el-table-column>
            <el-table-column label="访问转化率" width="110">
              <template #default="{ row }">
                <span v-if="row">{{ formatRate(row.visitConversionRate) }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="mt_10" style="display: flex; justify-content: flex-end">
            <el-pagination
              v-model:current-page="goodsPage.pageNumber"
              v-model:page-size="goodsPage.pageSize"
              :page-sizes="[20, 50, 100]"
              :total="goodsTotal"
              layout="total, sizes, prev, pager, next, jumper"
              size="small"
              @current-change="loadGoods"
              @size-change="onGoodsSizeChange"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import * as API_Statistics from "@/api/statistics";
import {
  getDistributionOverviewV2,
  getDistributionBehaviorV2,
  getDistributionGoodsV2,
} from "@/api/distribution";
import affixTime from "@/components/affix-time";
import { QuestionFilled } from "@element-plus/icons-vue";

const activeTab = ref("overview");
const params = ref({
  searchType: "LAST_SEVEN",
  year: "",
  month: "",
  storeId: "",
});
const overview = ref({});
const overviewV2 = ref({});
const distributorRank = ref([]);
const goodsRank = ref([]);
const behaviorData = ref([]);
const behaviorTotal = ref(0);
const behaviorLoading = ref(false);
const behaviorPage = ref({ pageNumber: 1, pageSize: 20 });
const goodsData = ref([]);
const goodsTotal = ref(0);
const goodsLoading = ref(false);
const goodsPage = ref({ pageNumber: 1, pageSize: 20 });
const metricDefs = ref([
  { key: "distributorNum", label: "分销员数", tip: "已通过审核的分销员数量" },
  { key: "applyNum", label: "待审核分销员", tip: "申请中待审核的分销员数量" },
  { key: "distributionOrderNum", label: "分销订单数", tip: "周期内分销订单笔数" },
  { key: "distributionOrderAmount", label: "分销订单金额", isMoney: true, tip: "周期内分销订单佣金合计" },
  { key: "settledCommission", label: "已结算佣金", isMoney: true, tip: "周期内已完成结算的佣金" },
  { key: "pendingCommission", label: "待结算佣金", isMoney: true, tip: "周期内待结算的佣金" },
  { key: "cashAmount", label: "提现金额", isMoney: true, tip: "周期内分销员提现金额" },
]);
const todayMetricDefs = ref([
  { key: "todayNewDistributorCount", label: "今日新增分销员" },
  { key: "todayNewSubDistributorCount", label: "今日新增下级分销员" },
  { key: "todaySalesAmount", label: "今日分销员销售额", isMoney: true },
  { key: "todayPaidCustomerCount", label: "今日成交客户数" },
  { key: "todayCommissionAmount", label: "今日支出佣金", isMoney: true },
]);
const totalMetricDefs = ref([
  { key: "totalDistributorCount", label: "累计分销员数" },
  { key: "totalSubDistributorCount", label: "累计下级分销员数" },
  { key: "totalSalesAmount", label: "累计分销员销售额", isMoney: true },
  { key: "totalPaidCustomerCount", label: "累计成交客户数" },
  { key: "totalShareVisitorCount", label: "商品分享引流" },
  { key: "totalCommissionAmount", label: "累计支出佣金", isMoney: true },
]);

watch(
  params,
  () => {
    loadOverviewData();
    if (activeTab.value === "behavior") {
      loadBehavior();
    } else if (activeTab.value === "goods") {
      loadGoods();
    }
  },
  { deep: true, immediate: true }
);

function clickBreadcrumb(item) {
  params.value = {
    searchType: item.searchType || "",
    year: item.year || "",
    month: item.month || "",
    storeId: item.storeId || "",
  };
}
function onTabChange(name) {
  if (name === "behavior") {
    loadBehavior();
  } else if (name === "goods") {
    loadGoods();
  }
}
function formatNumber(val) {
  if (val == null || val === "") return 0;
  const num = Number(val);
  return Number.isNaN(num) ? 0 : Math.round(num);
}
function formatRate(val) {
  if (val == null || val === "") return "-";
  return `${(Number(val) * 100).toFixed(2)}%`;
}
async function loadOverviewData() {
  const query = { ...params.value };
  const [overviewRes, distributorRes, goodsRes, overviewV2Res] = await Promise.all([
    API_Statistics.getDistributionOverview(query),
    API_Statistics.getDistributionRankDistributor(query),
    API_Statistics.getDistributionRankGoods(query),
    getDistributionOverviewV2(),
  ]);
  if (overviewRes && overviewRes.success) {
    overview.value = overviewRes.result || {};
  }
  if (distributorRes && distributorRes.success) {
    distributorRank.value = distributorRes.result || [];
  }
  if (goodsRes && goodsRes.success) {
    goodsRank.value = goodsRes.result || [];
  }
  if (overviewV2Res && overviewV2Res.success) {
    overviewV2.value = overviewV2Res.result || {};
  }
}
function loadBehavior() {
  behaviorLoading.value = true;
  getDistributionBehaviorV2({
    pageNumber: behaviorPage.value.pageNumber,
    pageSize: behaviorPage.value.pageSize,
  }).then((res) => {
    behaviorLoading.value = false;
    if (res.success) {
      behaviorData.value = res.result.records || [];
      behaviorTotal.value = res.result.total || 0;
    }
  });
}
function onBehaviorSizeChange() {
  behaviorPage.value.pageNumber = 1;
  loadBehavior();
}
function loadGoods() {
  goodsLoading.value = true;
  getDistributionGoodsV2({
    pageNumber: goodsPage.value.pageNumber,
    pageSize: goodsPage.value.pageSize,
  }).then((res) => {
    goodsLoading.value = false;
    if (res.success) {
      goodsData.value = res.result.records || [];
      goodsTotal.value = res.result.total || 0;
    }
  });
}
function onGoodsSizeChange() {
  goodsPage.value.pageNumber = 1;
  loadGoods();
}
</script>

<style scoped lang="scss">
.wrapper {
  padding-bottom: 200px;
}
.card {
  margin-bottom: 10px;
}
h4 {
  margin: 0 0 20px 0;
}
.section-title {
  margin-top: 24px;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.metric-item {
  background: #f3f5f7;
  border-radius: 8px;
  padding: 20px 16px;
  min-height: 90px;
}
.metric-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}
.metric-tip {
  font-size: 14px;
  color: #999;
  cursor: pointer;
}
.metric-value {
  font-size: 22px;
  font-weight: 700;
  color: $theme_color;
}
.rank-title {
  font-weight: 700;
  margin-bottom: 12px;
}
@media (max-width: 1200px) {
  .metric-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .rank-title {
    margin-top: 16px;
  }
}
</style>
