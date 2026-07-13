
import {managerApiUrl, getRequestWithNoToken, postRequestWithNoToken} from '@/libs/axios';


// 获取拼图验证
export const getVerifyImg = (verificationEnums) => {
  return getRequestWithNoToken(`${managerApiUrl}/manager/common/slider/${verificationEnums}`);
};

// 拼图验证
export const postVerifyImg = (params) => {
  return postRequestWithNoToken(`${managerApiUrl}/manager/common/slider/${params.verificationEnums}`, params);
};
