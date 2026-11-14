/**
 * 商品规格快照的文字展示，兼容 SKU JSON 规格与历史纯文本规格。
 * @author Bulbasaur
 * @since 2026-11-13
 */

/**
 * 将规格快照转换为业务规格文字，过滤图片及非标量数据，不修改原始快照。
 * @param {string|Object|null} specs 原始规格 JSON、规格对象或历史纯文本
 * @returns {string} 规格名和值组成的文字，无有效规格时返回占位符
 */
export function formatGoodsSpecs(specs) {
  let value = specs;
  if (typeof value === "string") {
    value = value.trim();
    if (!value) return "-";
    try {
      value = JSON.parse(value);
    } catch {
      return value;
    }
  }
  if (value == null) return "-";
  if (typeof value !== "object") return String(value) || "-";
  if (Array.isArray(value)) return "-";

  return Object.entries(value)
    .filter(([key, item]) => key !== "images" && item != null
      && ["string", "number", "boolean"].includes(typeof item)
      && String(item).trim() !== "")
    .map(([key, item]) => `${key}：${String(item).trim()}`)
    .join("，") || "-";
}
