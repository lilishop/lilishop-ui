/**
 * 卡密商品（E_COUPON）— 商家端常量
 *
 * 卡池状态 UNUSED / ALLOCATED / VOIDED；Tab 与列表筛选、标签色映射。
 * 需求：card-key-goods-api.md §2.1~2.3
 *
 * @author Mike
 * @date 2026-07-31
 */
/** 卡密状态枚举（与后端 CardKeyStatusEnum 一致） */
export const CARD_KEY_STATUS = {
  UNUSED: "UNUSED",
  ALLOCATED: "ALLOCATED",
  RESERVED: "RESERVED",
  VOIDED: "VOIDED",
};

export const CARD_KEY_STATUS_TEXT = {
  UNUSED: "未使用",
  ALLOCATED: "已分配",
  RESERVED: "已预占",
  VOIDED: "已作废",
};

export const CARD_KEY_STATUS_TAG = {
  UNUSED: "success",
  ALLOCATED: "info",
  RESERVED: "warning",
  VOIDED: "danger",
};

/** Tab：全部 + 各状态 */
export const CARD_KEY_STATUS_TABS = [
  { key: "", label: "全部" },
  { key: CARD_KEY_STATUS.UNUSED, label: "未使用" },
  { key: CARD_KEY_STATUS.RESERVED, label: "已预占" },
  { key: CARD_KEY_STATUS.ALLOCATED, label: "已分配" },
  { key: CARD_KEY_STATUS.VOIDED, label: "已作废" },
];

export const E_COUPON_GOODS_TYPE = "E_COUPON";

export function formatCardKeyStatus(status) {
  return CARD_KEY_STATUS_TEXT[status] || status || "—";
}
