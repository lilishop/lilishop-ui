/**
 * 卡密商品（E_COUPON / 电子卡券）— 买家端公共常量与工具
 *
 * 与 VIRTUAL_GOODS（核销型虚拟）区分：E_COUPON 仅立即购买（BUY_NOW），
 * 支付后自动发卡，订单终态 COMPLETED；可售库存优先读 poolStock。
 * 需求：lilishop/docs/requirements/card-key-goods-v4.md
 *
 * @author Mike
 * @date 2026-07-31
 */
export const E_COUPON_GOODS_TYPE = "E_COUPON";
export const E_COUPON_ORDER_TYPE = "E_COUPON";

/** 单次购买数量上限（O-09 待拍板默认值：min(poolStock, 999)） */
export const E_COUPON_MAX_BUY_NUM = 999;

export function isECoupon(goodsType) {
  return goodsType === E_COUPON_GOODS_TYPE;
}

export function isECouponOrder(orderType) {
  return orderType === E_COUPON_ORDER_TYPE;
}

/** 可售库存：优先 poolStock */
export function getECouponStock(sku) {
  if (!sku) return 0;
  const pool = sku.poolStock;
  if (pool !== undefined && pool !== null) {
    return Number(pool) || 0;
  }
  return Number(sku.quantity) || 0;
}

export function getECouponMaxBuyNum(sku) {
  const stock = getECouponStock(sku);
  if (stock <= 0) return 1;
  return Math.min(stock, E_COUPON_MAX_BUY_NUM);
}
