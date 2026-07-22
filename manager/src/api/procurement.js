import {
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
} from "@/libs/axios";

// ========== 采购单（只读） ==========
export const getProcurementOrderPage = params => getRequest("/procurement/order", params);
export const getProcurementOrderDetail = id => getRequest(`/procurement/order/${id}`);

// ========== 采购入库单（只读） ==========
export const getProcurementInboundPage = params => getRequest("/procurement/inbound", params);
export const getProcurementInboundDetail = id => getRequest(`/procurement/inbound/${id}`);
export const getProcurementInboundItems = id => getRequest(`/procurement/inbound/${id}/items`);

// ========== 盘点单（只读） ==========
export const getInventoryCountPage = params => getRequest("/procurement/inventory-count/page", params);
export const getInventoryCountDetail = id => getRequest(`/procurement/inventory-count/${id}`);
export const getInventoryCountItemsPage = (id, params) =>
  getRequest(`/procurement/inventory-count/${id}/items/page`, params);
export const downloadInventoryCountItems = id =>
  getRequest(`/procurement/inventory-count/${id}/download`);
export const exportInventoryCountItems = id =>
  getRequest(`/procurement/inventory-count/${id}/export`, {}, "blob");

// ========== 报损单（只读） ==========
export const getDamageReportPage = params => getRequest("/procurement/damage-report/page", params);
export const getDamageReportDetail = id => getRequest(`/procurement/damage-report/${id}`);
export const getDamageReportItems = id => getRequest(`/procurement/damage-report/${id}/items`);

// ========== 出入库原因 CRUD ==========
export const getStockReasonPage = params => getRequest("/procurement/reason", params);
export const addStockReason = params =>
  postRequest("/procurement/reason", params, { "Content-Type": "application/json" });
export const updateStockReason = params =>
  putRequest("/procurement/reason", params, { "Content-Type": "application/json" });
export const deleteStockReason = id => deleteRequest(`/procurement/reason/${id}`);
