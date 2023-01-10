import { get } from "@/utils/request";

// 获取用户相关设置信息
export const ServeGetUserSetting = () => {
  return get("/im/user");
};

// 获取店铺相关设置信息
export const ServeGetStoreSetting = () => {
  return get("/im/user/store");
};

// 获取用户相关设置信息
export const ServeGetUserDetail = (memberId) => {
  return get(`/im/user/${memberId}`);
};

// 获取店铺相关设置信息
export const ServeGetStoreDetail = (storeId) => {
  return get(`/im/user/store/${storeId}`);
};

// 获取店铺相关设置信息
export const ServeGetFootPrint = (params) => {
  return get(`/im/user/history`,params);
};
// 获取订单列表信息
export const ServeGetOrderPrint = (params) => {
  return get(`/im/orders/orders`,params);
};
