// 统一请求路径前缀在libs/axios.js中修改
import { getRequest, postRequest, putRequest ,postRequestWithNoForm } from "@/libs/axios";

import { baseUrl } from "@/libs/axios.js";

// 下载待发货的订单列表
export const verificationCode = verificationCode => {
  return getRequest(`/orders/getOrderByVerificationCode/${verificationCode}`);
};

// 下载待发货的订单列表
export const downLoadDeliverExcel = params => {
  return getRequest(`/orders/downLoadDeliverExcel`, params, 'blob');
};
// 导出待发货订单
export const queryExportOrder = params => {
  return getRequest(`/orders/queryExportOrder`, params);
};


// 上传待发货的订单列表
export const uploadDeliverExcel = params => {
  return postRequestWithNoForm(`/orders/batchDeliver`, params );
};

// 获取普通订单列表
export const getOrderList = params => {
  return getRequest(`/orders`, params);
};

// 获取普通订单详细信息
export const getOrderDetail = sn => {
  return getRequest(`/orders/${sn}`);
};

// 调整订单金额
export const modifyOrderPrice = (sn, params) => {
  return putRequest(`/orders/update/${sn}/price`, params);
};

// 取消订单
export const cancelOrder = (sn, params) => {
  return postRequest(`/orders/${sn}/cancel`, params);
};

// 修改收货地址
export const editOrderConsignee = (sn, params) => {
  return postRequest(`/orders/update/${sn}/consignee`, params);
};
//获取投诉列表
export const getComplainPage = params => {
  return getRequest(`/complain`, params);
};

//获取投诉详情
export const getComplainDetail = id => {
  return getRequest(`/complain/${id}`);
};

//添加交易投诉对话
export const addOrderComplaint = params => {
  return postRequest(`/complain/communication/`, params);
};

//添加交易投诉对话
export const appeal = params => {
  return putRequest(`/complain/appeal`, params);
};

//获取订单日志
export const getOrderLog = (sn, params) => {
  return getRequest(`/orderLog/${sn}`, params);
};

// 订单发货
export const orderDelivery = (sn, params) => {
  return postRequest(`/orders/${sn}/delivery`, params);
};

// 获取商家选中的物流公司
export const getLogisticsChecked = () => {
  return getRequest(`/logistics/getChecked`);
};

// 订单核验
export const orderTake = (sn, verificationCode) => {
  return putRequest(`/orders/take/${sn}/${verificationCode}`);
};

// 售后服务单
export const afterSaleOrderPage = params => {
  return getRequest(`/afterSale/page`, params);
};

// 售后服务单详情
export const afterSaleOrderDetail = sn => {
  return getRequest(`/afterSale/${sn}`);
};

// 商家审核
export const afterSaleSellerReview = (sn, params) => {
  return putRequest(`/afterSale/review/${sn}`, params);
};

// 商家确认收货
export const afterSaleSellerConfirm = (sn, params) => {
  return putRequest(`/afterSale/confirm/${sn}`, params);
};

// 商家换货业务发货
export const afterSaleSellerDelivery = (sn, params) => {
  return postRequest(`/afterSale/${sn}/delivery`, params);
};
//查询物流
export const getTraces = (sn, params) => {
  return getRequest(`/orders/getTraces/${sn}`, params);
};
//售后单查询物流
export const getSellerDeliveryTraces = (sn, params) => {
  return getRequest(`/afterSale/getSellerDeliveryTraces/${sn}`, params);
};
//售后单查询物流
export const getAfterSaleTraces = (sn, params) => {
  return getRequest(`/afterSale/getDeliveryTraces/${sn}`, params);
};
//获取发票列表
export const getReceiptPage = params => {
  return getRequest(`/receipt`, params);
};

//获取发票列表
export const invoicing = id => {
  return postRequest(`receipt/${id}/invoicing`);
};
