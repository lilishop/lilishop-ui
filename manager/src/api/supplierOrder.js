// 统一请求路径前缀在libs/axios.js中修改
import {
  getRequest,
  postRequest,
  putRequest,
  deleteRequest
} from '@/libs/axios';

//  查询订单列表
export const getOrderList = (params) => {
  return getRequest(`/supplier/order`, params)
}
//  获取售后订单列表
export const getAfterSaleOrderPage = (params) => {
  return getRequest('/supplier/afterSale/page', params)
}
