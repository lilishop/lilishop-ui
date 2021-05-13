// 统一请求路径前缀在libs/axios.js中修改
import {getRequest, postRequest, putRequest} from '@/libs/axios';

//查询店铺列表
export const getBillPage = (params) => {
  return getRequest('/', params)
}
//查询店铺列表
export const getShopListData = (params) => {
    return getRequest('/store', params)
}
//禁用店铺
export const disableShop = (id) => {
    return putRequest(`/store/disable/${id}`)
}
//开启店铺
export const enableBrand = (id) => {
    return putRequest(`/store/enable/${id}`)
}

//查询店铺详细
export const getShopDetailData = (id, params) => {
    return getRequest(`/store/get/detail/${id}`, params)
}

//增加店铺列表
export const shopAdd = (params) => {
    return postRequest(`/store/add`, params)
}

//修改店铺列表
export const shopEdit = (id,params) => {
    return putRequest(`/store/edit/${id}`, params)
}

//审核店铺
export const shopAudit = (id, passed) => {
    return putRequest(`/store/audit/${id}/${passed}`)
}

//查询店铺详情
export const shopDetail = (id) => {
    return getRequest(`/store/get/detail/${id}`)
}



// 获取结算单分页
export const getBuyBillPage = (params) => {
  return getRequest(`/store/bill/getByPage`,params)
}

// 获取结算单详情
export const getBuyBillDetail = (id) => {
  return getRequest(`/store/bill/get/${id}`)
}


// 获取商家结算单流水分页
export const getStoreFlow = (id,params) => {
  return getRequest(`/store/bill/${id}/getStoreFlow`,params)
}

// 审核结算单

export const examine = (id) => {
  return putRequest(`/store/bill/examine/${id}`)
}
// 审核结算单

export const pay = (id) => {
  return putRequest(`/store/bill/pay/${id}`)
}

//获取所有商家
export const getShopList = () => {
  return getRequest(`/store/all`)
}

//根据id获取店铺信息
export const getShopByMemberId = (id) => {
  return getRequest(`/store/${id}/member`)
}
