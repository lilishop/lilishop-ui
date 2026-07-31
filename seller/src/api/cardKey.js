/**
 * 卡密商品（E_COUPON）— 商家端卡池 HTTP 封装
 *
 * Base Path：/store/goods/card-key（axios 已带 /store 前缀）
 * 对应 card-key-goods-api.md API-S-01a ~ S-07；导出为同步文件流（S-08）。
 *
 * @author Mike
 * @date 2026-07-31
 */
import {
  getRequest,
  postRequestWithNoForm,
  putRequest,
  uploadFileRequest,
} from "@/libs/axios";
import { downloadBlob } from "@/utils/downloadBlob";

/** API-S-01a 下载卡密导入模板（同步文件流） */
export const downloadImportTemplateBlob = () => {
  return getRequest("/goods/card-key/import/template", {}, "blob");
};

export const downloadImportTemplate = async () => {
  const blob = await downloadImportTemplateBlob();
  downloadBlob(blob, "card-key-import-template.xlsx");
};

/** API-S-01 批量导入卡密 */
export const importCardKey = (skuId, file) => {
  const formData = new FormData();
  formData.append("skuId", skuId);
  formData.append("file", file);
  return uploadFileRequest("/goods/card-key/import", formData);
};

/** API-S-02 单条新增卡密（后端 @RequestBody，须 application/json） */
export const addCardKey = (data) => {
  return postRequestWithNoForm("/goods/card-key/add", data);
};

/** API-S-03 卡池分页列表 */
export const getCardKeyList = (params) => {
  return getRequest("/goods/card-key/list", params);
};

/** API-S-04 作废卡密 */
export const voidCardKey = (id) => {
  return putRequest(`/goods/card-key/void/${id}`);
};

/** API-S-05 卡池状态统计 */
export const getCardKeyStats = (skuId) => {
  return getRequest(`/goods/card-key/stats/${skuId}`);
};

/** API-S-07 卡池导出（同步文件流） */
export const exportCardKeyBlob = (params) => {
  return getRequest("/goods/card-key/export", params, "blob");
};

export const exportCardKey = async (params, skuId) => {
  const blob = await exportCardKeyBlob(params);
  const ts = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
  downloadBlob(blob, `card-key-${skuId || "export"}-${ts}.xlsx`);
};
