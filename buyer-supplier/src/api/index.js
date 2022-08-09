import request, {Method} from '@/plugins/request.js'


/**
 * 账号密码登录
 */
export function login (params) {
  return request({
    url: '/buyer/passport/member/userLogin',
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
    url: '/buyer/passport/member',
    method: Method.GET,
    needToken: true,
    params
  });
}

// 获取首页楼层装修数据
export function indexData (params) {
  return request({
    url: '/buyer/other/pageData',
    method: Method.GET,
    needToken: false,
    params
  })
}

/**
 * 楼层装修数据
 * @param pageClientType 客户端类型,可用值:PC,H5,WECHAT_MP,APP
 * @param pageType 页面类型,可用值:INDEX,STORE,SPECIAL
 */
export function pageData (params) {
  return request({
    url: `/supplier/other/pageData`,
    method: Method.GET,
    needToken: false,
    params
  })
}
/**
 * 刷新token
 */
export function handleRefreshToken (token) {
  return request({
    url: `/supplier/passport/member/refresh/${token}`,
    method: Method.GET,
    needToken: false
  })
}
