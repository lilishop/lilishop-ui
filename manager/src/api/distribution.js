
// 统一请求路径前缀在libs/axios.js中修改
import {getRequest, postRequest, postRequestWithNoForm, putRequest, putRequestWithNoForm, deleteRequest, importRequest} from '@/libs/axios';

//查询分销员
export const getDistributionListData = (params) => {
    return getRequest('/distribution/distribution/getByPage', params)
}
// 分销员聚合分页(V2)
export const getDistributionMemberPage = (params) => {
    return getRequest('/distribution/distribution/memberPage', params)
}
export const getDistributionMemberDetail = (id) => {
    return getRequest(`/distribution/distribution/memberDetail/${id}`)
}
export const updateDistributionMember = (id, params) => {
    return putRequestWithNoForm(`/distribution/distribution/member/${id}`, params)
}
export const createDistributionMember = (params) => {
    return postRequestWithNoForm('/distribution/distribution/member', params)
}
export const batchUpdateDistributionGrade = (params) => {
    return putRequestWithNoForm('/distribution/distribution/member/batchGrade', params)
}
export const exportDistributionMembers = (params) => {
    return getRequest('/distribution/distribution/memberExport', params, 'blob')
}
export const downloadDistributionImportTemplate = () => {
    return getRequest('/distribution/memberImport/template', {}, 'blob')
}
export const importDistributionMembers = (formData) => {
    return importRequest('/distribution/memberImport/import', formData)
}
export const getDistributionImportBatches = (params) => {
    return getRequest('/distribution/memberImport/batch', params)
}
export const getDistributionImportItems = (batchId, params) => {
    return getRequest(`/distribution/memberImport/batch/${batchId}/items`, params)
}
export const downloadDistributionImportFailItems = (batchId) => {
    return getRequest(`/distribution/memberImport/batch/${batchId}/failExport`, {}, 'blob')
}
//审核分销员
export const auditDistribution = (id, params) => {
    return putRequest(`/distribution/distribution/audit/${id}`, params)
}
// 清退分销员
export const retreatDistribution = (id, params) => {
    return putRequest(`/distribution/distribution/retreat/${id}`, params)
}
//修改分销员
export const editDistribution = (params) => {
  return putRequest(`/distribution/distribution/${params.id}`, params)
}

// 恢复分销员
export const resumeDistribution = (id, params) => {
    return putRequest(`/distribution/distribution/resume/${id}`, params)
}

//保存更新分销设置
export const saveDistributionSetting = (params) => {
    return postRequest('/distribution/setting/insertOrUpdate', params)
}

//获取分销设置
export const getDistributionSetting = (id, params) => {
    return getRequest(`/distribution/setting/get/${id}`, params)
}

// V2客户关系设置
export const getDistributionCustomerSetting = () => getRequest('/distribution/setting/v2/customer')
export const putDistributionCustomerSetting = (params) => putRequestWithNoForm('/distribution/setting/v2/customer', params)
// V2结算方案设置
export const getDistributionSettlementSetting = () => getRequest('/distribution/setting/v2/settlement')
export const putDistributionSettlementSetting = (params) => putRequestWithNoForm('/distribution/setting/v2/settlement', params)
// 分销商品设置
export const getDistributionFeaturedGoodsSetting = () => getRequest('/distribution/setting/v2/featured-goods')
export const putDistributionFeaturedGoodsSetting = (params) => putRequestWithNoForm('/distribution/setting/v2/featured-goods', params)
// 平台海报设置
export const getDistributionPromotionPosterSetting = () => getRequest('/distribution/setting/v2/promotion-poster')
export const putDistributionPromotionPosterSetting = (params) => putRequestWithNoForm('/distribution/setting/v2/promotion-poster', params)
// 邀请卡设置
export const getDistributionInviteCardSetting = () => getRequest('/distribution/setting/v2/invite-card')
export const putDistributionInviteCardSetting = (params) => putRequestWithNoForm('/distribution/setting/v2/invite-card', params)
// 分销等级
export const getDistributionGrades = () => getRequest('/distribution/grade')
export const saveAllDistributionGrades = (params) => putRequestWithNoForm('/distribution/grade/batch', params)
export const deleteDistributionGrade = (id) => deleteRequest(`/distribution/grade/${id}`)
export const getDistributionGradeHistoryPage = (params) => getRequest('/distribution/gradeHistory', params)

// 客户关系
export const getCustomerRelations = (params) => getRequest('/distribution/customerRelation', params)
export const getCustomerRelationDetail = (id) => getRequest(`/distribution/customerRelation/${id}`)
export const getCustomerRelationLogs = (id) => getRequest(`/distribution/customerRelation/${id}/logs`)
export const rebindCustomerRelation = (params) => putRequest('/distribution/customerRelation/rebind', params)
export const unbindCustomerRelation = (params) => putRequest('/distribution/customerRelation/unbind', params)

// 分销招募设置
export const getCurrentRecruitPlan = () => getRequest('/distribution/recruit/plan/current')
export const getPublishedRecruitPlan = () => getRequest('/distribution/recruit/plan/published')
export const saveRecruitPlan = (params) => postRequestWithNoForm('/distribution/recruit/plan', params)
export const getDistributionRecruitSetting = () => getRequest('/distribution/setting/v2/recruit')
export const putDistributionRecruitSetting = (params) => putRequestWithNoForm('/distribution/setting/v2/recruit', params)
export const publishRecruitPlan = (planId) => putRequest(`/distribution/recruit/plan/publish/${planId}`)
export const auditRecruitApplication = (applicationId, params) => putRequest(`/distribution/recruit/application/audit/${applicationId}`, params)

// 统计V2
export const getDistributionOverviewV2 = (params) => getRequest('/statistics/distribution/v2/overview', params)
export const getDistributionBehaviorV2 = (params) => getRequest('/statistics/distribution/v2/behavior', params)
export const getDistributionGoodsV2 = (params) => getRequest('/statistics/distribution/v2/goods', params)

// 钱包流水
export const getDistributionWalletLogs = (params) => getRequest('/distribution/walletLog', params)

//获取分销订单列表
export const getDistributionOrder = (params) => {
    return getRequest('/distribution/order/getByPage', params)
}

//获取分销商品列表
export const getDistributionGoods = (params) => {
    return getRequest('/distribution/goods/getByPage', params)
}
//删除分销商品
export const delDistributionGoods = (ids) => {
    return deleteRequest(`/distribution/goods/delByIds/${ids}`)
}

export const auditDistributionGoods = (params) => {
    return putRequestWithNoForm('/distribution/goods/audit', params)
}
//获取分销佣金信息
export const getDistributionCash = (params) => {
    return getRequest('/distribution/cash/getByPage', params)
}
//审核分销佣金申请
export const auditDistributionCash = (id,params) => {
    return postRequest(`/distribution/cash/audit/${id}`, params)
}

// 兼容别名导出
export const getDistributionCustomerPage = (params) => getCustomerRelations(params);
export const getDistributionBindLogPage = (params) => {
    if (params && params.id) {
        return getCustomerRelationLogs(params.id);
    }
    return getRequest('/distribution/customerRelation/logs', params);
};
export const rebindDistributionCustomer = (params) => {
    return rebindCustomerRelation({
        memberId: params.memberId,
        distributionId: params.distributionId,
        reason: params.reason || params.remark
    });
};
