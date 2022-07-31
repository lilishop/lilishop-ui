// 统一请求路径前缀在libs/axios.js中修改
import { postSupplierRequestWithNoTokenData } from '@/libs/axios';


// 登陆
export const loginSupplier = params => {
  return postSupplierRequestWithNoTokenData("/passport/login/userLogin", params);
};