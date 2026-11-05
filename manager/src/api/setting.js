import {
  getRequest,
  putRequest,
  deleteRequest,
  postRequest
} from '@/libs/axios';

// 查询站内信信息
export const getMessageData = params => {
  return getRequest("/other/message", params);
};
//修改站内信模板
export const editNoticeMessage = (id, params) => {
  return putRequest(`/setting/noticeMessage/${id}`, params)
}

//微信消息同步
export const wechatMessageSync = (params) => {
  return getRequest("/wechat/wechatMessage/init", params)
}

//微信消息码同步
export const wechatMPMessageSync = (params) => {
  return getRequest("/wechat/wechatMPMessage/init", params)
}


// 查询站内信模板信息
export const getNoticeMessageData = params => {
  return getRequest("/setting/noticeMessage", params);
};
//删除站内信
export const deleteMessage = (id) => {
  return deleteRequest(`/other/message/${id}`);
};
// 开启站内信模板
export const openNoticeMessage = (id) => {
  return putRequest(`/setting/noticeMessage/${id}/open`);
};
// 修改站内信状态
export const updateMessageStatus = (id,status) => {
  return putRequest(`/setting/noticeMessage/${id}/${status}`);
};
//获取设置
export const getSetting = (key) => {
  return getRequest(`/setting/setting/get/${key}`);
};
//根据类型查看配置信息
export const getSettingList = (params) => {
  return getRequest(`/setting/setting/all`, params);
};
//设置配置信息
export const setSetting = (key, params) => {
  return postRequest(`/setting/setting/put/${key}`, params);
};

//获取设置
export const getExperienceData = (key) => {
  return getRequest(`/setting/experience/get/${key}`);
};
//保存
export const setExperienceData = (key, params) => {
  return postRequest(`/setting/experience/put/${key}`, params);
};

//根据类型获取积分设置
export const getPointData = (key) => {
  return getRequest(`/setting/point/get/${key}`);
};
//保存
export const setPointData = (key, params) => {
  return postRequest(`/setting/point/put/${key}`, params);
};

//根据类型获取积分设置
export const getKuaidiSetting = (key) => {
  return getRequest(`/setting/kuaidi/get/${key}`);
};
//保存
export const setKuaidiSetting = (key, params) => {
  return postRequest(`/setting/kuaidi/put/${key}`, params);
};

//获取所有的物流公司
export const getLogisticsList = () => {
  return getRequest(`/setting/logistics/all`);
};
//分页获取物流公司
export const getLogisticsPage = (params) => {
  return getRequest(`/setting/logistics/getByPage`, params);
};
//添加物流公司
export const addLogistics = (params) => {
  return postRequest(`/setting/logistics`, params);
};
//获取物流公司详情
export const getLogisticsDetail = (id) => {
  return getRequest(`/setting/logistics/get/${id}`);
};
//编辑物流公司
export const editLogistics = (id, params) => {
  return putRequest(`/setting/logistics/${id}`, params);
};
//删除物流公司
export const delLogistics = (id) => {
  return deleteRequest(`/setting/logistics/delete/${id}`);
};

//禁用启用物流公司
export const openLogistics = (id) => {
  return putRequest(`/setting/logistics/open/${id}`);
};

//获取所有的物流公司
export const getLogisticsAll = () => {
  return getRequest(`/setting/logistics/all`);
};

// 验证码源文件添加
export const createVerification = (params) => {
  return postRequest(`/other/verificationSource`, params)
}
// 验证码源文件修改
export const updateVerification = (id, params) => {
  return putRequest(`/other/verificationSource/${id}`, params)
}
// 验证码源文件删除
export const deleteVerification = (id) => {
  return deleteRequest(`/other/verificationSource/${id}`)
}
// 验证码源文件列表
export const verificationPage = (params) => {
  return getRequest(`/other/verificationSource`, params)
}

//获取通知类站内信
export const getNoticeMessageDetail = (id, params) => {
  return getRequest(`/setting/noticeMessage/${id}`, params)
}

// 统一消息模板聚合分页（站内信 + 短信 + 微信服务号 + 小程序订阅）
export const getMessageTemplateAggregatePage = params => {
  return getRequest("/setting/messageTemplate/page", params);
};

// 快速切换渠道开关 (channel: NOTICE / SMS / WECHAT_OA / WECHAT_MP, status: OPEN / CLOSE)
export const updateMessageChannelSwitch = params => {
  return putRequest("/setting/messageTemplate/switch", params);
};

// 保存站内信配置 (title, content, status)
export const updateNoticeMessageTemplate = params => {
  return putRequest("/setting/messageTemplate/notice", params);
};

// 保存短信配置 (smsTemplateCode, status; 内容只读不可编辑)
export const updateSmsMessageTemplateConfig = params => {
  return putRequest("/setting/messageTemplate/sms", params);
};

// 保存微信公众号服务号配置 (code, enable; 内容只读)
export const updateWechatOaMessageTemplate = params => {
  return putRequest("/setting/messageTemplate/wechat-oa", params);
};

// 保存微信小程序订阅消息配置 (code, enable; 内容只读)
export const updateWechatMpMessageTemplate = params => {
  return putRequest("/setting/messageTemplate/wechat-mp", params);
};


// -------------------------------------------------------------
// 补充缺失的系统配置、版本及验证码 API
// -------------------------------------------------------------




// 支付支持方式表单 (PAYMENT_SUPPORT.vue)
export const getPaymentSupportForm = () => {
  return getRequest(`/setting/settingx/paymentSupport`);
};

// 验证码源管理别名 (slider.vue)
export const addVerification = createVerification;
export const editVerification = updateVerification;
export const delVerification = deleteVerification;

// APP版本管理 (appVersion.vue)
export const appVersionPage = (params) => {
  return getRequest(`/other/appVersion`, params);
};
export const addVersion = (params) => {
  return postRequest(`/other/appVersion`, params);
};
export const editVersion = (params, id) => {
  return putRequest(`/other/appVersion/${id}`, params);
};
export const deleteVersion = (id) => {
  return deleteRequest(`/other/appVersion/${id}`);
};
