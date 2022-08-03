
import request, {Method, supplierUrl} from '@/plugins/request.js';

/**
 * 账号密码登录
 */
export function login (params) {
  return request({
    url: '/supplier/passport/login/userLogin',
    method: Method.POST,
    needToken: false,
    data: params,
    headers: { 'clientType': 'PC' }
  });
}

/**
 * 手机号验证码登录
 */
export function smsLogin (params) {
  return request({
    url: '/supplier/passport/login/smsLogin',
    method: Method.POST,
    needToken: false,
    data: params,
    headers: { 'clientType': 'PC' }
  });
}

/**
 * 获取用户信息
 */
export function getMemberMsg (params) {
  return request({
    url: '/supplier/passport/login',
    method: Method.GET,
    needToken: true,
    params
  });
}

/**
 * 忘记密码  验证手机验证码
 */
export function validateCode (params) {
  return request({
    url: `/supplier/passport/member/resetByMobile`,
    method: Method.POST,
    needToken: false,
    params
  });
}

/**
 * 忘记密码 重置密码
 */
export function resetPassword (params) {
  return request({
    url: `/supplier/passport/member/resetPassword`,
    method: Method.POST,
    needToken: false,
    params
  });
}
