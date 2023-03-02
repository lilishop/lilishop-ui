import { get } from "@/utils/request";
import config from "@/config/config";

// 获取用户相关设置信息
export const ServeGetUserSetting = () => {
  return get(`${config.BASE_BUYER}/buyer/passport/member`);
};

// 获取店铺相关设置信息
export const ServeGetStoreSetting = () => {
  return get(`${config.BASE_SELLER}/store/member/user`);
};

// 获取用户相关设置信息
export const ServeGetUserDetail = (memberId) => {
  return get(`${config.BASE_SELLER}/store/passport/member/${memberId}`);
};

// 获取店铺相关设置信息
export const ServeGetStoreDetail = (storeId) => {
  return get(`${config.BASE_BUYER}/buyer/store/store/store/${storeId}`);
};

// 获取用户历史足迹
export const ServeGetFootPrint = (params) => {
  return get(`${config.BASE_BUYER}/buyer/member/footprint`, params);
};

// 商家获取用户历史足迹
export const ServeStoreGetFootPrint = (params) => {
  return get(`${config.BASE_SELLER}/store/member/footprint`, params);
};

// 获取用户订单列表信息
export const ServeGetOrderPrint = (params) => {
  return get(`${config.BASE_BUYER}/buyer/order/order`, params);
};

// 商家获取用户订单列表信息
export const ServeStoreGetOrderPrint = (params) => {
  return get(`${config.BASE_SELLER}/store/order/order`, params);
};

// 获取商品信息
export const ServeGetGoodsDetail = (data) => {
  return get(`${config.BASE_BUYER}/buyer/goods/goods/sku/${data.goodsId}/${data.skuId}`);
};
