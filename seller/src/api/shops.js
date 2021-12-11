// 统一请求路径前缀在libs/axios.js中修改
import {getRequest, postRequest, putRequest, deleteRequest, importRequest, getRequestWithNoToken} from '@/libs/axios';


// 获取数据字典
export const getDictData = "/dictData/getByType/"
// Websocket
export const ws = "/ws"


//查询店铺列表
export const getShopListData = (params) => {
  return getRequest('/shop', params)
}
// 获取结算单分页
export const getBillPage = (params) => {
  return getRequest(`/bill/getByPage`, params)
}

// 获取商家结算单流水分页
export const getSellerFlow = (id, params) => {
  return getRequest(`/bill/${id}/getStoreFlow`, params)
}

// 商家核对结算单
export const reconciliation = (id, params) => {
  return putRequest(`/bill/check/${id}/`, params)
}

// 获取商家分销订单流水分页
export const getDistributionFlow = (id, params) => {
  return getRequest(`/bill/${id}/getDistributionFlow`, params)
}

// 获取商家结算单详细
export const getBillDetail = (id, params) => {
  return getRequest(`/bill/get/${id}`, params)
}

// 获取所有物流公司
export const getLogistics = (id, params) => {
  return getRequest(`/logistics`, params)
}

// 开启物流公司
export const logisticsChecked = (id, params) => {
  return postRequest(`/logistics/${id}`, params)
}

// 关闭开启物流公司
export const logisticsUnChecked = (id, params) => {
  return deleteRequest(`/logistics/${id}`, params)
}
// 获取商家自提点
export const getShopAddress = (id, params) => {
  return getRequest(`/storeAddress/`, params)
}

// 修改商家自提点
export const editShopAddress = (id, params) => {
  return putRequest(`/storeAddress/${id}`, params)
}

// 添加商品自提点
export const addShopAddress = (params) => {
  return postRequest(`/storeAddress/`, params)
}

// 添加商品自提点
export const deleteShopAddress = (id) => {
  return deleteRequest(`/storeAddress/${id}`)
}

// 获取商家详细信息
export const getShopInfo = () => {
  return getRequest(`/settings`)
}

// 保存商家详细信息
export const saveShopInfo = (params) => {
  return putRequest(`/settings`, params)
}

//获取商家退货地址
export const getRefundGoodsAddress = () => {
  return getRequest(`/settings/storeAfterSaleAddress`)
}
//修改商家退货地址
export const saveRefundGoodsAddress = (params) => {
  return putRequest(`/settings/storeAfterSaleAddress`, params)
}
//修改im商户id
export const updatEmerchantId = (params) => {
  return putRequest(`/settings/merchantEuid`, params)
}


//修改保存库存预警数
export const updateStockWarning = (params) => {
  return putRequest(`/settings/updateStockWarning`, params)
}
//查询运费模板
export const getShipTemplate = () => {
  return getRequest(`/freightTemplate`)
}
//删除运费模板
export const deleteShipTemplate = (id) => {
  return deleteRequest(`/freightTemplate/${id}`)
}
//新增运费模板
export const addShipTemplate = (params, headers) => {
  return postRequest(`/freightTemplate`, params, headers)
}

//新增运费模板
export const editShipTemplate = (id, params, headers) => {
  return putRequest(`/freightTemplate/${id}`, params, headers)
}


