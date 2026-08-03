/**
 * 卡密商品（E_COUPON）— 商家端公共常量
 *
 * @author Mike
 * @date 2026-08-02
 */
export const E_COUPON_GOODS_TYPE = "E_COUPON";

export function isECoupon(goodsType) {
  return goodsType === E_COUPON_GOODS_TYPE;
}

export function goodsTypeLabel(goodsType) {
  const map = {
    E_COUPON: "电子卡券",
    VIRTUAL_GOODS: "虚拟商品",
    PHYSICAL_GOODS: "实物商品",
  };
  return map[goodsType] || goodsType || "—";
}

export function goodsTypeTagType(goodsType) {
  if (goodsType === E_COUPON_GOODS_TYPE) return "warning";
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

export function collectCardKeyFulfillLines(orderItems = [], giftSummaries = []) {
  const lines = [];
  (orderItems || []).forEach((item) => {
    if (!isCardKeyFulfillApplicable(item)) return;
    lines.push(normalizeCardKeyFulfillLine(item));
  });
  (giftSummaries || []).forEach((gift) => {
    lines.push(normalizeCardKeyFulfillLine({ ...gift, isGift: true }));
  });
  return lines;
}

export function orderHasCardKeySection({ orderItems, giftSummaries, isECouponOrder } = {}) {
  if (isECouponOrder) return true;
  if (Array.isArray(giftSummaries) && giftSummaries.length > 0) return true;
  if (collectCardKeyFulfillLines(orderItems, []).length > 0) return true;
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

/** 订单是否含已交付卡密（含满赠子单） */
export function orderHasCardKeyContent(orderItems, giftSummaries) {
  return flattenCardKeyFulfillLines(collectCardKeyFulfillLines(orderItems, giftSummaries)).length > 0;
}

export function flattenOrderCardKeys(orderItems, withGoodsName = false, giftSummaries) {
  const lines = collectCardKeyFulfillLines(orderItems, giftSummaries);
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
