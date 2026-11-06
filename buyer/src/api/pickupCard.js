/**
 * 提货卡选品、试算及一次兑换接口。
 * @author Bulbasaur
 * @since 2026-11-05
 */
import request, { Method } from '@/plugins/request.js';

/** 查询当前会员的卡规则及候选 SKU。 */
export const getPickupCard = id => request({ url: `/buyer/promotion/pickupCard/${encodeURIComponent(id)}`, method: Method.GET, needToken: true });
/** 服务端校验商品与地址，返回零现金试算。 */
export const previewPickupCard = data => request({ url: '/buyer/promotion/pickupCard/preview', method: Method.POST, needToken: true, headers: { 'Content-Type': 'application/json' }, data });
/** 一次兑换；重试返回同一卡已创建的交易。 */
export const redeemPickupCard = data => request({ url: '/buyer/promotion/pickupCard/redeem', method: Method.POST, needToken: true, headers: { 'Content-Type': 'application/json' }, data });
