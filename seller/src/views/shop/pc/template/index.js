import TplCategoryNav from './TplCategoryNav.vue';
import TplChannelGrid from './TplChannelGrid.vue';
import TplCategoryMegaMenu from './TplCategoryMegaMenu.vue';
import TplCarousel from './TplCarousel.vue';
import TplBrandWall from './TplBrandWall.vue';
import TplHotZone from './TplHotZone.vue';
import TplFreeLayout from './TplFreeLayout.vue';
import TplPromoGroup from './TplPromoGroup.vue';
import TplVideo from './TplVideo.vue';
import TplGoods from './TplGoods.vue';
import TplGridFloor from './TplGridFloor.vue';
import TplGoodsGrid from './TplGoodsGrid.vue';
import TplChannelFloor from './TplChannelFloor.vue';
import TplRecommendFeed from './TplRecommendFeed.vue';
import TplTitle from './TplTitle.vue';
import TplNotice from './TplNotice.vue';

export const CANVAS_TEMPLATE_MAP = {
  // 结构 (3)

  // 导航 (3)
  categoryNav: TplCategoryNav,
  channelGrid: TplChannelGrid,
  categoryMegaMenu: TplCategoryMegaMenu,

  // 广告 (6)
  carousel: TplCarousel,
  brandWall: TplBrandWall,
  hotZone: TplHotZone,
  freeLayout: TplFreeLayout,
  promoGroup: TplPromoGroup,
  video: TplVideo,

  // 商品 (8)
  goodsList: TplGoods,
  gridFloor: TplGridFloor,
  goodsGrid: TplGoodsGrid,
  goodsCard: TplGoods,
  bannerFloor: TplGridFloor,
  goodsBar: TplGoods,
  channelFloor: TplChannelFloor,
  recommendFeed: TplRecommendFeed,

  // 营销 (1)

  // 内容 (3)
  titleBar: TplTitle,
  noticeBar: TplNotice
};

export function resolveCanvasTemplate(type) {
  return CANVAS_TEMPLATE_MAP[type] || null;
}
