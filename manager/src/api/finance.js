/**
 * 管理端财务中心 API。
 * 导出类接口返回 blob，需配合 downloadBlob 触发浏览器下载。
 */
import { getRequest, postBlobRequest } from "@/libs/axios";

/** 导出支付流水（筛选条件同 paymentLog 列表） */
export const exportPaymentFlow = (params) => {
  return getRequest("/finance/payment-flow/export", params, "blob");
};

/** 导出退款流水 */
export const exportRefundFlow = (params) => {
  return getRequest("/finance/refund-flow/export", params, "blob");
};

/** 导出钱包流水 */
export const exportWalletLog = (params) => {
  return getRequest("/finance/wallet-log/export", params, "blob");
};

/** 导出结算单列表（仅汇总行） */
export const exportBillList = (params) => {
  return getRequest("/finance/bill-list/export", params, "blob");
};

/** 批量下载结算单 ZIP */
export const batchDownloadBills = (billIds) => {
  return postBlobRequest("/finance/bill/batchDownload", billIds);
};

/** 平台经营报表查询 */
export const getPlatformReport = (params) => {
  return getRequest("/finance/report/platform", params);
};

/** 导出平台经营报表 */
export const exportPlatformReport = (params) => {
  return getRequest("/finance/report/platform/export", params, "blob");
};

/** 店铺结算汇总查询 */
export const getStoreSettlementReport = (params) => {
  return getRequest("/finance/report/store-settlement", params);
};

/** 导出店铺结算汇总 */
export const exportStoreSettlementReport = (params) => {
  return getRequest("/finance/report/store-settlement/export", params, "blob");
};

/** 支付方式汇总查询 */
export const getPaymentMethodReport = (params) => {
  return getRequest("/finance/report/payment-method", params);
};

/** 导出支付方式汇总 */
export const exportPaymentMethodReport = (params) => {
  return getRequest("/finance/report/payment-method/export", params, "blob");
};

/** 结算台账查询 */
export const getSettlementLedger = (params) => {
  return getRequest("/finance/report/settlement-ledger", params);
};

/** 导出结算台账 */
export const exportSettlementLedger = (params) => {
  return getRequest("/finance/report/settlement-ledger/export", params, "blob");
};

/** 退款流水分页（财务中心页面复用） */
export const refundLogPage = (params) => {
  return getRequest("/order/refundLog", params);
};
