// 统一请求路径前缀在libs/axios.js中修改
import {
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
} from "@/libs/axios";



// 分页获取物流公司
export const getLogisticsPage = params => {
  return getRequest(`/other/logistics/getByPage`, params);
};
// 删除
export const delLogistics = id => {
  return deleteRequest(`/other/logistics/${id}`);
};
// 添加
function buildLogisticsFormBody(params) {
  const parts = [];
  const appendField = (key, value) => {
    if (value === undefined || value === null || value === "") return;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  };
  appendField("name", params.name);
  appendField("code", params.code);
  appendField("disabled", params.disabled);
  appendField("standBy", params.standBy);
  appendField("formItems", params.formItems);
  return parts.join("&");
}

export const addLogistics = params => {
  const body = buildLogisticsFormBody(params);
  return postRequest("/other/logistics", body, {
    "Content-Type": "application/x-www-form-urlencoded",
  });
};
// 通过id查询详情
export const getLogisticsDetail = id => {
  return getRequest(`/other/logistics/get/${id}`);
};
// 编辑
export const updateLogistics = (id,params) => {
  return putRequest(`/other/logistics/${id}`,params);
};


