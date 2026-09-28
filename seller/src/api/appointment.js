/**
 * 预约服务 — 商家端 HTTP 封装
 *
 * Base Path：/store/appointment/*（axios 已带 /store 前缀）
 */
import {
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
  postRequestWithNoForm,
  putRequestWithNoForm,
} from "@/libs/axios";

/** 店铺预约通用配置 */
export const getAppointmentSettings = () => getRequest("/appointment/settings");
export const saveAppointmentSettings = (params) =>
  putRequest("/appointment/settings", params);

/** 到店服务设置 */
export const getInStoreSettings = () => getRequest("/appointment/settings/in-store");
export const saveInStoreSettings = (params) =>
  putRequestWithNoForm("/appointment/settings/in-store", params);

/** 上门服务设置 */
export const getOnSiteSettings = () => getRequest("/appointment/settings/on-site");
export const saveOnSiteSettings = (params) =>
  putRequestWithNoForm("/appointment/settings/on-site", params);

/** 服务人员 §14 */
export const getServiceStaffPage = (params) =>
  getRequest("/appointment/service-staff", params);
export const createServiceStaff = (params) =>
  postRequestWithNoForm("/appointment/service-staff", params);
export const updateServiceStaff = (id, params) =>
  postRequestWithNoForm("/appointment/service-staff", { ...params, id });
export const updateServiceStaffStatus = (id, status) =>
  putRequest(`/appointment/service-staff/${id}/status`, { status });
export const deleteServiceStaff = (id) =>
  deleteRequest(`/appointment/service-staff/${id}`);

/** 工单管理 §15 */
export const getWorkOrderPage = (params) =>
  getRequest("/appointment/work-orders", params);
export const getWorkOrderStatusCounts = () =>
  getRequest("/appointment/work-orders/status-counts");
export const claimWorkOrder = (id) =>
  postRequest(`/appointment/work-orders/${id}/claim`);
export const reassignWorkOrder = (id, params) =>
  postRequestWithNoForm(`/appointment/work-orders/${id}/reassign`, params);
export const endWorkOrderService = (id) =>
  postRequest(`/appointment/work-orders/${id}/end-service`);

/** 预约核销 §17 */
export const getEnabledServiceStaff = () =>
  getRequest("/appointment/service-staff/enabled");
export const getAppointmentVerificationByOrderSn = (orderSn) =>
  getRequest(`/appointment/verification/order-by-sn/${orderSn}`);
export const getAppointmentOrderByCode = (code) =>
  getRequest(`/appointment/verification/order/${code}`);
export const verifyAppointmentCode = (params) =>
  postRequestWithNoForm("/appointment/verification/verify", params);

/** 服务月历 §16 */
export const getServiceCalendarMonth = (month) =>
  getRequest("/appointment/calendar", { month });
export const getServiceCalendarDay = (params) =>
  getRequest("/appointment/calendar/day", params);

/** 预约单列表 §24 */
export const getAppointmentBookPage = (params) =>
  getRequest("/appointment/books", params);
