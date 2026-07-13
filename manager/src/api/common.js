import {managerApiUrl, getRequest, getRequestWithNoToken, postRequestWithNoToken,uploadFileRequest,uploadFile} from '@/libs/axios';

// 通过id获取子地区
export const getChildRegion = (id) => {
  return getRequest(`${managerApiUrl}/manager/common/region/item/${id}`);
};

// 点地图获取地址信息
export const getRegion = (params) => {
  return getRequest(`${managerApiUrl}/manager/common/region/region`, params);
};

// 获取拼图验证
export const getVerifyImg = (verificationEnums) => {
  return getRequestWithNoToken(`${managerApiUrl}/manager/common/slider/${verificationEnums}`);
};

// 拼图验证
export const postVerifyImg = (params) => {
  return postRequestWithNoToken(`${managerApiUrl}/manager/common/slider/${params.verificationEnums}`, params);
};


// 获取系统基础信息（登录页等场景无需 token）
export const getBaseSite = () => {
  return getRequestWithNoToken(`${managerApiUrl}/manager/common/site`);
};

// 上传文件
export const upLoadFile = (bold) =>{
  return uploadFileRequest(uploadFile,bold);
}
