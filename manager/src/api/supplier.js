// 统一请求路径前缀在libs/axios.js中修改
import {getRequest, postRequest, putRequest} from '@/libs/axios';

//查询供应商列表
export const getBillPage = (params) => {
  return getRequest('/', params)
}
//查询供应商列表
export const getSupplierListData = (params) => {
    return getRequest('/supplier', params)
}
//禁用供应商
export const disableSupplier = (id) => {
    return putRequest(`/supplier/disable/${id}`)
}
//开启供应商
export const enableSupplier = (id) => {
    return putRequest(`/supplier/enable/${id}`)
}

//查询供应商详细
export const supplierDetail = (id, params) => {
    return getRequest(`/supplier/detail/${id}`, params)
}

//增加供应商列表
export const supplierAdd = (params) => {
    return postRequest(`/supplier/add`, params)
}

//修改供应商列表
export const supplierEdit = (id,params) => {
    return putRequest(`/supplier/edit/${id}`, params)
}

//审核供应商
export const supplierAudit = (id, passed) => {
    return putRequest(`/supplier/audit/${id}/${passed}`)
}




// 获取结算单分页
export const getBuyBillPage = (params) => {
  return getRequest(`/order/bill/getByPage`,params)
}

// 获取结算单详情
export const getBuyBillDetail = (id) => {
  return getRequest(`/order/bill/get/${id}`)
}


// 获取商家结算单流水分页
export const getStoreFlow = (id,params) => {
  return getRequest(`/order/bill/${id}/getStoreFlow`,params)
}

// 审核结算单

export const examine = (id) => {
  return putRequest(`/order/bill/examine/${id}`)
}
// 审核结算单

export const pay = (id) => {
  return putRequest(`/order/bill/pay/${id}`)
}

//获取所有商家
export const getSupplierList = () => {
  return getRequest(`/supplier/all`)
}

//根据id获取供应商信息
export const getSupplierByMemberId = (id) => {
  return getRequest(`/supplier/${id}/member`)
}
