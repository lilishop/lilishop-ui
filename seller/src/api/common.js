import { sellerUrl, getRequest, uploadFileRequest, uploadFile, request} from "@/libs/axios";

// 通过id获取子地区
export const getChildRegion = (id) => {
  return getRequest(`${sellerUrl}/store/common/region/item/${id}`);
};

// 点地图获取地址信息
export const getRegion = (params) => {
  return getRequest(`${sellerUrl}/store/common/region/region`, params);
};

// 获取IM接口前缀
export function getIMDetail() {
  return getRequest(`${sellerUrl}/store/common/IM`);
}

//获取图片logo
export function getBaseSite() {
  return getRequest(`${sellerUrl}/store/common/site`);
}

// 上传文件
export const upLoadFileMethods = (bold) => {
  return uploadFileRequest(uploadFile, bold);
};

/**
 * 发送短信验证码
 */
export function sendSms (params) {
  return getRequest(`${sellerUrl}/store/common/sms/${params.verificationEnums}/${params.mobile}`,params);
}
