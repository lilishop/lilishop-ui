/** 平台免费抽奖配置和流水接口。@author Bulbasaur @since 2026-11-14 */
import { getRequest, postRequest, putRequest } from '@/libs/axios';
const base = '/promotion/lottery';
/** 分页查询活动及库存。 */
export const listLottery = params => getRequest(base, params);
/** 保存未发布草稿。 */
export const saveLottery = data => postRequest(base, data, { 'Content-Type': 'application/json' });
/** 首次上架冻结规则，下架保留记录。 */
export const setLotteryStatus = (id, enabled) => putRequest(`${base}/${id}/status`, { enabled });
/** 查询抽奖流水。 */
export const listLotteryRecords = params => getRequest(`${base}/records`, params);
