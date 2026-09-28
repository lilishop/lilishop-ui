/**
 * 运营端预约服务 API
 */
import { getRequest, postRequestWithNoForm, putRequestWithNoForm } from "@/libs/axios";

export const getManagerWorkOrderPage = (params) =>
  getRequest("/appointment/work-orders", params);

export const getAppointmentOrderSettings = () => getRequest("/appointment/settings");

export const saveAppointmentOrderSettings = (params) =>
  putRequestWithNoForm("/appointment/settings", params);

export const platformRefund = (orderSn, params) =>
  postRequestWithNoForm(`/appointment/orders/${orderSn}/platform-refund`, params);

export const noShowRefund = (orderSn, params) =>
  postRequestWithNoForm(`/appointment/orders/${orderSn}/no-show-refund`, params);

export const getAppointmentOrderDetail = (orderSn) =>
  getRequest(`/appointment/orders/${orderSn}`);
