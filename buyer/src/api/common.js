import request, {Method, buyerUrl} from '@/plugins/request.js';

/**
 * 获取拼图验证
 */
export function getVerifyImg (verificationEnums) {
  return request({
    url: `${buyerUrl}/buyer/common/slider/${verificationEnums}`,
    method: Method.GET,
    needToken: false
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
    params
  });
}
/**
 * 发送短信验证码
 */
export function sendSms (params) {
  return request({
    url: `${buyerUrl}/buyer/common/sms/${params.verificationEnums}/${params.mobile}`,
    method: Method.GET,
    needToken: false,
    params
  });
}

// 地区数据，用于三级联动
export function getRegion (id) {
  return request({
    url: `${buyerUrl}/buyer/common/region/item/${id}`,
    needToken: true,
    method: Method.GET,
    loading: false
  });
}

/**
 * 分页获取文章列表
 * @param cateId 文章分类id
 */
export function articleList (params) {
  return request({
    url: `/buyer/other/article`,
    method: Method.GET,
    params
  });
}

/**
 * 获取帮助中心文章分类列表
 * @param cateId 文章分类id
 */
export function articleCateList () {
  return request({
    url: `/buyer/other/article/articleCategory/list`,
    method: Method.GET
  });
}

// 通过id获取文章
export function articleDetail (id) {
  return request({
    url: `/buyer/other/article/get/${id}`,
    method: Method.GET
  });
}




// 获取IM接口前缀
export function getIMDetail () {
  return request({
    url: `${buyerUrl}/buyer/common/IM`,
    method: Method.GET
  });
}


//获取图片logo
export function getBaseSite(){
  return request ({
    url:`${buyerUrl}/buyer/common/site`,
    method: Method.GET,
    needToken: false
  })
}

// 获取主题色配置
export function getThemeSetting() {
  return request({
    url: `${buyerUrl}/buyer/common/site/theme`,
    method: Method.GET,
    needToken: false,
  });
}
