
// 统一请求路径前缀在libs/axios.js中修改
import {getRequest, postRequest, putRequest, deleteRequest, importRequest, getRequestWithNoToken} from '@/libs/axios';

//获取分销设置
export const getDistributionSetting = (params) => {
  return getRequest(`/distribution/setting`, params)
}

//保存更新分销设置
export const saveDistributionSetting = (params) => {
    return putRequest('/distribution/setting', params)
}

//获取分销订单列表
export const getDistributionOrder = (params) => {
    return getRequest('/distribution/order', params)
}

//获取分销商品列表
export const getDistributionGoods = (params) => {
  return getRequest('/distribution/goods', params)
}
