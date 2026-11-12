/**
 * 商家端库存管理 API（出库单与库存流水）
 * @author Bulbasaur
 * @since 2026-11-12
 */
import {
  getRequest,
  postRequest,
  putRequest,
} from "@/libs/axios";

// ========== 出库单 ==========
export const getStockReasonList = params => getRequest("/procurement/reason", params);
export const getStockOutboundPage = params => getRequest("/stock/outbound", params);
export const getStockOutboundDetail = id => getRequest(`/stock/outbound/${id}`);
export const createStockOutbound = params =>
  postRequest("/stock/outbound", params, { "Content-Type": "application/json" });
export const updateStockOutbound = (id, params) =>
  putRequest(`/stock/outbound/${id}`, params, { "Content-Type": "application/json" });
export const submitStockOutbound = id => putRequest(`/stock/outbound/submit/${id}`);
export const auditStockOutbound = (id, params) =>
  putRequest(`/stock/outbound/audit/${id}`, params, { "Content-Type": "application/json" });
export const cancelStockOutbound = id => putRequest(`/stock/outbound/cancel/${id}`);

// ========== 库存流水 ==========
export const getStockFlowPage = params => getRequest("/stock/flow", params);
