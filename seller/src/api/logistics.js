// 统一请求路径前缀在libs/axios.js中修改
import {
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
  importRequest,
  getRequestWithNoToken
} from "@/libs/axios";



// 分页获取物流公司
export const getLogisticsPage = params => {
  return getRequest(`/logistics/getByPage`, params);
};
// 删除
export const delLogistics = id => {
  return deleteRequest(`/logistics/delete/${id}`);
};
// 添加
export const addLogistics = params => {
  return postRequest(`/logistics/save`,params);
};
// 通过id查询详情
export const getLogisticsDetail = id => {
  return getRequest(`/logistics/get/${id}`);
};
// 编辑
export const updateLogistics = (id,params) => {
  return putRequest(`/logistics/${id}`,params);
};


