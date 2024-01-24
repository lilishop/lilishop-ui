import request, {Method} from '@/plugins/request.js';

/**
 * 获取当前会员分销信息
 */
export function distribution () {
  return request({
    url: `/buyer/distribution/distribution`,
    method: Method.GET,
    needToken: true
  });
}

/**
 * 申请成为分销员
 * @param idNumber 身份证号
 * @param name  名字
 */
export function applyDistribution (params) {
  return request({
    url: `/buyer/distribution/distribution`,
    method: Method.POST,
    needToken: true,
    params
  });
}

/**
 * 获取分销员订单列表
 */
export function getDistOrderList (params) {
  return request({
    url: `/buyer/distribution/order`,
    method: Method.GET,
    needToken: true,
    params
  });
}

/**
 * 获取分销员下级用户列表
 */
export function getDistMemberList (params) {
  return request({
    url: `/buyer/distribution/distribution/memberList`,
    method: Method.GET,
    needToken: true,
    params
  });
}

/**
 * 获取分销商商品列表
 */
export function getDistGoodsList (params) {
  return request({
    url: `/buyer/distribution/goods`,
    method: Method.GET,
    needToken: true,
    params
  });
}

/**
 * 分销员提现历史
 */
export function distCashHistory (params) {
  return request({
    url: `/buyer/distribution/cash`,
    method: Method.GET,
    needToken: true,
    params
  });
}

/**
 * 分销员-团队列表
 */
export function getDistGroupList (params) {
  return request({
    url: `/buyer/distribution/distribution/groupList`,
    method: Method.GET,
    needToken: true,
    params
  });
}

/**
 * 分销商提现
 */
export function distCash (params) {
  return request({
    url: `/buyer/distribution/cash`,
    method: Method.POST,
    needToken: true,
    params
  });
}

/**
 * 绑定分销
 * @param distributionId 商品分销ID
 */
export function getGoodsDistribution (distributionId) {
  return request({
    url: `/buyer/distribution/distribution/bindingDistribution/${distributionId}`,
    method: Method.GET,
    needToken: true
  });
}
