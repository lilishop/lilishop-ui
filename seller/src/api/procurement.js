import {
  getRequest,
  postRequest,
  putRequest,
} from "@/libs/axios";

// ========== 采购单 ==========
export const getProcurementOrderPage = params => getRequest("/procurement/order", params);
export const getProcurementOrderStatusCount = params => getRequest("/procurement/order/status-count", params);
export const getProcurementOrderDetail = id => getRequest(`/procurement/order/${id}`);
export const createProcurementOrder = params =>
  postRequest("/procurement/order", params, { "Content-Type": "application/json" });
export const submitProcurementOrder = id => putRequest(`/procurement/order/submit/${id}`);
export const auditProcurementOrder = (id, params) =>
  putRequest(`/procurement/order/audit/${id}`, params, { "Content-Type": "application/json" });
export const closeProcurementOrder = id => putRequest(`/procurement/order/close/${id}`);

// ========== 采购入库单 ==========
export const getProcurementInboundPage = params => getRequest("/procurement/inbound", params);
export const getProcurementInboundDetail = id => getRequest(`/procurement/inbound/${id}`);
export const getProcurementInboundItems = id => getRequest(`/procurement/inbound/${id}/items`);
export const createProcurementInbound = params =>
  postRequest("/procurement/inbound", params, { "Content-Type": "application/json" });

// ========== 盘点单 ==========
export const createInventoryCount = () => postRequest("/procurement/inventory-count");
export const getInventoryCountPage = params => getRequest("/procurement/inventory-count/page", params);
export const getInventoryCountDetail = id => getRequest(`/procurement/inventory-count/${id}`);
export const getInventoryCountItemsPage = (id, params) =>
  getRequest(`/procurement/inventory-count/${id}/items/page`, params);
export const downloadInventoryCountItems = id =>
  getRequest(`/procurement/inventory-count/${id}/download`);
export const exportInventoryCountItems = id =>
  getRequest(`/procurement/inventory-count/${id}/export`, {}, "blob");

// ========== 报损单 ==========
export const getDamageReportPage = params => getRequest("/procurement/damage-report/page", params);
export const getDamageReportStatusCount = params => getRequest("/procurement/damage-report/status-count", params);
export const getDamageReportDetail = id => getRequest(`/procurement/damage-report/${id}`);
export const getDamageReportItems = id => getRequest(`/procurement/damage-report/${id}/items`);
export const createDamageReport = params =>
  postRequest("/procurement/damage-report", params, { "Content-Type": "application/json" });
export const submitDamageReport = id => putRequest(`/procurement/damage-report/${id}/submit`);
export const approveDamageReport = id => putRequest(`/procurement/damage-report/${id}/approve`);
export const rejectDamageReport = (id, remark) =>
  putRequest(`/procurement/damage-report/${id}/reject?remark=${encodeURIComponent(remark || "")}`);
export const cancelDamageReport = id => putRequest(`/procurement/damage-report/${id}/cancel`);
export const completeDamageReport = id => putRequest(`/procurement/damage-report/${id}/complete`);

// ========== 出入库原因 ==========
export const getStockReasonList = params => getRequest("/procurement/reason", params);
