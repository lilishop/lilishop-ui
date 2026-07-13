
import request, {Method, buyerUrl} from '@/plugins/request.js';
import storage from '@/plugins/storage.js';

/**
 * 获取拼图验证
 */
export function getVerifyImg (verificationEnums) {
  return request({
    url: `${buyerUrl}/buyer/common/slider/${verificationEnums}`,
    method: Method.GET,
    needToken: false,
    headers: {uuid: storage.getItem('uuid')}
  });
}

/**
 * 验证码校验
 */
export function postVerifyImg (params) {
  return request({
    url: `${buyerUrl}/buyer/common/slider/${params.verificationEnums}`,
    method: Method.POST,
    needToken: false,
    params,
    headers: {uuid: storage.getItem('uuid')}
  });
}
