import { post, get, upload, del } from "@/utils/request";

export const ServeGetGoodsDetail = (data) => {
    return get(`/im/goods/goods/sku/${data.goodsId}/${data.skuId}`);
  };
