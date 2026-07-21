import { getRequest } from "@/libs/axios";

/** 营业概况 */
export const getBusinessOverview = (params) => {
  return getRequest("/statistics/overview", params);
};

/** 收款构成 */
export const getBusinessSource = (params) => {
  return getRequest("/statistics/overview/source", params);
};

/** 营业构成 */
export const getBusinessComposition = (params) => {
  return getRequest("/statistics/overview/businessComposition", params);
};

/** 商品概况 */
export const getGoodsOverview = (params) => {
  return getRequest("/statistics/goods/overview", params);
};

/** 退货排行榜 TOP10 */
export const getGoodsRefundRank = (params) => {
  return getRequest("/statistics/goods/rank/refund", params);
};

/** 畅销排行榜 TOP10 */
export const getGoodsSalesRank = (params) => {
  return getRequest("/statistics/goods/rank/sales", params);
};

/** 分类排行 */
export const getGoodsCategoryRank = (params) => {
  return getRequest("/statistics/goods/getCategoryByPage", params);
};

/** 会员概况 */
export const getMemberOverview = (params) => {
  return getRequest("/statistics/member/overview", params);
};

/** 会员新增人数趋势 */
export const getMemberNewTrend = (params) => {
  return getRequest("/statistics/member/trend", params);
};

/** 客户分析 */
export const getMemberAnalysis = (params) => {
  return getRequest("/statistics/member/analysis", params);
};

/** 性别分布 */
export const getMemberGenderDistribution = (params) => {
  return getRequest("/statistics/member/distribution/gender", params);
};

/** 地域分布 */
export const getMemberRegionDistribution = (params) => {
  return getRequest("/statistics/member/distribution/region", params);
};

/** 积分分析概览 */
export const getPointsOverview = () => {
  return getRequest("/statistics/points");
};

/** 客户可用积分分布 */
export const getPointsDistribution = () => {
  return getRequest("/statistics/points/distribution");
};

/** 积分累计分发分布 */
export const getPointsSourceDistribution = () => {
  return getRequest("/statistics/points/sourceDistribution");
};

/** 客户身份积分累计统计 */
export const getPointsIdentityStat = () => {
  return getRequest("/statistics/points/identityStat");
};

/** 储值余额分布 */
export const getDepositBalanceDistribution = () => {
  return getRequest("/statistics/deposit/balanceDistribution");
};

/** 储值充值次数分布 */
export const getDepositRechargeTimesDistribution = () => {
  return getRequest("/statistics/deposit/rechargeTimesDistribution");
};

/** 储值充值金额分布 */
export const getDepositRechargeAmountDistribution = () => {
  return getRequest("/statistics/deposit/rechargeAmountDistribution");
};

/** 营销概况 */
export const getMarketingOverview = (params) => {
  return getRequest("/statistics/marketing", params);
};

/** 分销概况 */
export const getDistributionOverview = (params) => {
  return getRequest("/statistics/distribution", params);
};

/** TOP分销员 */
export const getDistributionRankDistributor = (params) => {
  return getRequest("/statistics/distribution/rank/distributor", params);
};

/** TOP分销商品 */
export const getDistributionRankGoods = (params) => {
  return getRequest("/statistics/distribution/rank/goods", params);
};

/** 店铺业绩报表 */
export const getStorePerformanceReport = (params) => {
  return getRequest("/statistics/report/store-performance", params);
};

export const exportStorePerformanceReport = (params) => {
  return getRequest("/statistics/report/store-performance/export", params, "blob");
};

/** 商品同比环比报表 */
export const getGoodsComparisonReport = (params) => {
  return getRequest("/statistics/report/goods-comparison", params);
};

export const exportGoodsComparisonReport = (params) => {
  return getRequest("/statistics/report/goods-comparison/export", params, "blob");
};

/** 销售订单明细报表 */
export const getSalesOrderDetailReport = (params) => {
  return getRequest("/statistics/report/sales-order-detail", params);
};

export const exportSalesOrderDetailReport = (params) => {
  return getRequest("/statistics/report/sales-order-detail/export", params, "blob");
};

/** 商品销售汇总报表 */
export const getGoodsSalesSummaryReport = (params) => {
  return getRequest("/statistics/report/goods-sales-summary", params);
};

export const exportGoodsSalesSummaryReport = (params) => {
  return getRequest("/statistics/report/goods-sales-summary/export", params, "blob");
};
