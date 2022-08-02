// 统一请求路径前缀在libs/axios.js中修改
import { postSupplierRequestWithNoTokenData, getSupplierRequestWithNoToken, getSupplierRequest, postSupplierRequest, putSupplierRequest } from '@/libs/axios';


// 登陆
export const loginSupplier = params => {
  return postSupplierRequestWithNoTokenData("/passport/login/userLogin", params);
};

// 登出
export const loginOutSupplier = params => {
  return postSupplierRequest("/passport/login/logout", params);
};

// 修改密码
export const loginModifyPassSupplier = params => {
  return postSupplierRequest("/passport/login/modifyPass", params);
};

// 刷新token
export const handleRefreshSupplierToken = (token) => {
  return getSupplierRequestWithNoToken(`/passport/login/refresh/${token}`);
};

// 获取供应商信息
export const supplierMsg = (params) => {
  return getSupplierRequest(`/store/store/detail`, params)
}

// 获取商品列表
export const supplierGoodsList = (params) => {
  return getSupplierRequest(`/goods/goods/list`, params)
}

// 获取商品sku列表
export const supplierGoodsSkuList = (params) => {
  return getSupplierRequest(`/goods/goods/sku/list`, params)
}

export function createSupllierGoods(params) {
  return postSupplierRequest("/goods/goods/create", params, {
    "Content-Type": "application/json"
  });
}

export function editSupplierGoods(goodsId, params) {
  return postSupplierRequest(`/goods/goods/update/${goodsId}`, params, {
    "Content-Type": "application/json"
  });
}

// 上架商品
export const upSupplierGoods = params => {
  return putSupplierRequest(`/goods/goods/up`, params);
};
// 删除商品
export const deleteSupplierGoods = params => {
  return putSupplierRequest(`/goods/goods/delete`, params);
};
//  下架商品
export const lowSupllierGoods = params => {
  return putSupplierRequest(`/goods/goods/under`, params);
};

//批量设置运费模板
export const batchSupplierTemplate = params => {
  return putSupplierRequest(`/goods/goods/freight`, params);
};

//  更新商品库存
export const updateSupllierGoodsSkuStocks = params => {
  return putSupplierRequest("/goods/goods/update/stocks", params, {
    "Content-Type": "application/json"
  });
};

// 获取商品sku列表
export const getSupplierHomeData = (params) => {
  return getSupplierRequest(`/statistics/index`, params)
}