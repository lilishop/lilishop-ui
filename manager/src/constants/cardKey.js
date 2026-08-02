/**
 * 卡密商品（E_COUPON）— 平台端订单展示用常量
 *
 * 平台不管理卡池明文（S-04）；本模块仅用于订单详情卡密状态文案。
 *
 * @author Mike
 * @date 2026-07-31
 */
/** 卡密状态文案（与后端 CardKeyStatusEnum 一致） */
export const CARD_KEY_STATUS_TEXT = {
  UNUSED: "未使用",
  ALLOCATED: "已分配",
  RESERVED: "已预占",
  VOIDED: "已作废",
};

export function formatCardKeyStatus(status) {
  return CARD_KEY_STATUS_TEXT[status] || status || "—";
}
