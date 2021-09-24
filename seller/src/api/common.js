import {commonUrl, getRequest} from '@/libs/axios';

// 通过id获取子地区
export const getChildRegion = (id) => {
  return getRequest(`${commonUrl}/common/region/item/${id}`);
};

// 点地图获取地址信息
export const getRegion = (params) => {
  return getRequest(`${commonUrl}/common/region/region`, params);
};
