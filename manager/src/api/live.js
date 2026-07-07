import axios from 'axios'
import { getStore } from '@/libs/storage'
import {
  deleteRequest,
  getRequest,
  managerUrl,
  postRequest,
  putRequest,
} from '@/libs/axios'

function deleteRequestWithBody(url, data) {
  const accessToken = getStore('accessToken')
  return axios({
    method: 'delete',
    baseURL: managerUrl,
    url,
    data,
    headers: {
      accessToken,
      'Content-Type': 'application/json',
    },
  }).then(res => res.data)
}

// ========== 直播间 ==========
export const queryLivePage = params => getRequest('/live/room/page', params)

export const getLiveInfo = id => getRequest(`/live/room/${id}`)

export const createLive = params =>
  postRequest('/live/room', params, { 'Content-type': 'application/json' })

export const updateLive = (id, params) =>
  putRequest(`/live/room/${id}`, params, { 'Content-type': 'application/json' })

export const startLive = id => putRequest(`/live/room/start/${id}`)

export const endLive = id => putRequest(`/live/room/end/${id}`)

export const deleteLive = id => deleteRequest(`/live/room/${id}`)

// ========== 直播商品 ==========
export const getLiveGoodsList = liveId => getRequest(`/live/goods/list/${liveId}`)

export const saveBatchLiveGoods = params =>
  postRequest('/live/goods/batch', params, { 'Content-type': 'application/json' })

export const removeBatchLiveGoods = ids => deleteRequestWithBody('/live/goods/batch', ids)

export const setRecommendLiveGoods = id => putRequest(`/live/goods/recommend/${id}`)

export const cancelRecommendLiveGoods = id => deleteRequest(`/live/goods/recommend/${id}`)

export const setLiveGoodsSoldOut = (id, soldOutFlag) =>
  putRequest(`/live/goods/sold-out/${id}`, { soldOutFlag })

export const getLiveGoodsPopularity = (id, liveId) =>
  getRequest(`/live/goods/popularity/${id}`, { liveId })

export const setLiveGoodsPopularity = (id, liveId, popularity) =>
  putRequest(`/live/goods/set/popularity/${id}`, { liveId, popularity })

// ========== 直播优惠券 ==========
export const getLiveCouponList = liveId => getRequest(`/live/coupon/list/${liveId}`)

export const saveBatchLiveCoupon = params =>
  postRequest('/live/coupon/batch', params, { 'Content-type': 'application/json' })

export const removeBatchLiveCoupon = ids => deleteRequest('/live/coupon/batch', { ids: ids.join(',') })

export const setRecommendLiveCoupon = id => putRequest(`/live/coupon/recommend/${id}`)

export const cancelRecommendLiveCoupon = id => deleteRequest(`/live/coupon/recommend/${id}`)

// ========== 直播消息 ==========
export const queryLiveMessagePage = params => getRequest('/live/message/page', params)

export const authLiveMessage = params =>
  putRequest('/live/message/auth', params, { 'Content-type': 'application/json' })

export const postSendMessage = params =>
  postRequest('/live/message/send', params, { 'Content-type': 'application/json' })

// ========== 直播用户 / 拉黑 ==========
export const liveUserList = params => getRequest('/live/user/page', params)

export const editLiveUserMute = params => putRequest('/live/user/edit/mute', params)

export const getLiveBlockPage = params => postRequest('/live/block/page', params, { 'Content-type': 'application/json' })

export const blockUser = params => postRequest('/live/block/user', params)

export const unblockUser = params => postRequest('/live/block/user/unblock', params)

// ========== 直播订单 ==========
export const queryLiveOrderPage = params => getRequest('/live/order/page', params)

export const getLiveOrderStatistics = liveRoomId =>
  getRequest('/live/order/statistics', { liveRoomId })
