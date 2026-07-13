
import {sellerUrl, getRequestWithNoToken, postRequestWithNoToken} from '@/libs/axios';


// 获取拼图验证
export const getVerifyImg = (verificationEnums) => {
  return getRequestWithNoToken(`${sellerUrl}/store/common/slider/${verificationEnums}`);
};

// 拼图验证
export const postVerifyImg = (params) => {
  return postRequestWithNoToken(`${sellerUrl}/store/common/slider/${params.verificationEnums}`, params);
};
