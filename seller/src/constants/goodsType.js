/**
 * 卡密商品（E_COUPON）— 商家端公共常量
 *
 * @author Mike
 * @date 2026-08-02
 */
export const E_COUPON_GOODS_TYPE = "E_COUPON";
export const APPOINTMENT_GOODS_TYPE = "APPOINTMENT_GOODS";

export function isECoupon(goodsType) {
  return goodsType === E_COUPON_GOODS_TYPE;
}

export function isAppointmentGoods(goodsType) {
  return goodsType === APPOINTMENT_GOODS_TYPE;
}

export function goodsTypeLabel(goodsType) {
  const map = {
    E_COUPON: "电子卡券",
    APPOINTMENT_GOODS: "预约商品",
    VIRTUAL_GOODS: "虚拟商品",
    PHYSICAL_GOODS: "实物商品",
  };
  return map[goodsType] || goodsType || "—";
}

export function goodsTypeTagType(goodsType) {
  if (goodsType === E_COUPON_GOODS_TYPE) return "warning";
  if (goodsType === APPOINTMENT_GOODS_TYPE) return "success";
  if (goodsType === "VIRTUAL_GOODS") return "info";
  return "";
}

/** E_COUPON 活动库存提示 */
export function eCouponStockHint(goodsType) {
  if (!isECoupon(goodsType)) return "";
  return "库存来自卡池同步（quantity）";
}

/** 活动价下限：E_COUPON 允许 0 元 */
export function promotionPriceMin(goodsType) {
  return isECoupon(goodsType) ? 0 : 0.01;
}

export const CARD_KEY_FULFILL_STATUS = {
  PENDING: "PENDING",
  DELIVERED: "DELIVERED",
  FAILED: "FAILED",
  NOT_APPLICABLE: "NOT_APPLICABLE",
};

export const CARD_KEY_FULFILL_STATUS_TEXT = {
  PENDING: "待发放",
  DELIVERED: "已发放",
  FAILED: "发放失败",
  NOT_APPLICABLE: "不适用",
};

export function cardKeyFulfillAlertType(status) {
  const map = { PENDING: "info", DELIVERED: "success", FAILED: "warning" };
  return map[status] || "info";
}

export function formatCardKeyFulfillStatus(status) {
  return CARD_KEY_FULFILL_STATUS_TEXT[status] || status || "—";
}

export function resolveCardKeyFulfillMessage(line) {
  if (line && line.message) return line.message;
  return formatCardKeyFulfillStatus(line?.status);
}

export function isCardKeyFulfillApplicable(item) {
  if (!item) return false;
  const status = item.cardKeyFulfillStatus;
  if (status) return status !== CARD_KEY_FULFILL_STATUS.NOT_APPLICABLE;
  if (item.cardKeyDelivered != null || (item.cardKeys && item.cardKeys.length)) return true;
  return item.goodsType === E_COUPON_GOODS_TYPE;
}

function normalizeCardKeyFulfillLine(source) {
  const status =
    source.cardKeyFulfillStatus ||
    (source.cardKeyDelivered
      ? CARD_KEY_FULFILL_STATUS.DELIVERED
      : CARD_KEY_FULFILL_STATUS.PENDING);
  const cardKeys =
    status === CARD_KEY_FULFILL_STATUS.DELIVERED && source.cardKeyDelivered
      ? source.cardKeys || []
      : [];
  return {
    key: source.sn || source.orderSn || source.id || source.skuId,
    goodsName: source.goodsName,
    status,
    message: source.cardKeyFulfillMessage,
    cardKeys,
    isGift: !!source.isGift,
  };
}

/** 汇总当前订单 orderItems 中的卡密履约行（不含满赠子单；赠品卡密在赠品子单详情单独查看） */
export function collectCardKeyFulfillLines(orderItems = []) {
  const lines = [];
  (orderItems || []).forEach((item) => {
    if (!isCardKeyFulfillApplicable(item)) return;
    lines.push(normalizeCardKeyFulfillLine(item));
  });
  return lines;
}

export function orderHasCardKeySection({ orderItems, isECouponOrder } = {}) {
  if (isECouponOrder) return true;
  if (collectCardKeyFulfillLines(orderItems).length > 0) return true;
  return (orderItems || []).some(
    (item) =>
      item.goodsType === E_COUPON_GOODS_TYPE ||
      (Array.isArray(item.cardKeys) && item.cardKeys.length > 0)
  );
}

export function flattenCardKeyFulfillLines(lines, withGoodsName = false) {
  const rows = [];
  (lines || []).forEach((line) => {
    if (line.status !== CARD_KEY_FULFILL_STATUS.DELIVERED) return;
    (line.cardKeys || []).forEach((ck) => {
      rows.push(withGoodsName ? { ...ck, goodsName: line.goodsName } : { ...ck });
    });
  });
  return rows;
}

/** 当前订单是否含已交付卡密（仅 orderItems） */
export function orderHasCardKeyContent(orderItems) {
  return flattenCardKeyFulfillLines(collectCardKeyFulfillLines(orderItems)).length > 0;
}

export function flattenOrderCardKeys(orderItems, withGoodsName = false) {
  const lines = collectCardKeyFulfillLines(orderItems);
  if (lines.some((line) => line.status)) {
    return flattenCardKeyFulfillLines(lines, withGoodsName);
  }
  const rows = [];
  (orderItems || []).forEach((item) => {
    if (!item.cardKeyDelivered || !item.cardKeys || !item.cardKeys.length) return;
    item.cardKeys.forEach((ck) => {
      rows.push(withGoodsName ? { ...ck, goodsName: item.goodsName } : { ...ck });
    });
  });
  return rows;
}
