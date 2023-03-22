// 统一请求路径前缀在libs/axios.js中修改
import {
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
  getRequestHasHeader,
  importRequest,
  getRequestWithNoToken
} from "@/libs/axios";



// 分页获取物流公司
export const getLogisticsPage = params => {
  return getRequest(`/other/logistics/getByPage`, params);
};
// 删除
export const delLogistics = id => {
  return deleteRequest(`/other/logistics/delete/${id}`);
};
// 添加
export const addLogistics = params => {
  return postRequest(`/other/logistics/save`,params);
};
// 通过id查询详情
export const getLogisticsDetail = id => {
  return getRequest(`/other/logistics/get/${id}`);
};
// 编辑
export const updateLogistics = (id,params) => {
  return putRequest(`/other/logistics/${id}`,params);
};

export const getCheckedOn = params =>{
  return getRequest(`/other/logistics/getCheckedFaceSheet`,params);
}

//获取物流设置
export const getLogisticsSetting = () =>{
  return getRequest(`/other/logistics`);
}

export const getShunFengFaceSheet = (url,headers) =>{
  return getRequestHasHeader(`${url}`,null,headers);
}


