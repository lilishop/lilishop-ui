/**
 * PC 前台装修楼层组件注册表
 * 映射 6 大分类、24 个组件
 */
import TopBar from './components/TopBar.vue';
import SearchHeader from './components/SearchHeader.vue';
import FooterNav from './components/FooterNav.vue';
import CategoryNav from './components/CategoryNav.vue';
import ChannelGrid from './components/ChannelGrid.vue';
import CategoryMegaMenu from './components/CategoryMegaMenu.vue';
import Carousel from './components/Carousel.vue';
import BrandWall from './components/BrandWall.vue';
import HotZone from './components/HotZone.vue';
import FreeLayout from './components/FreeLayout.vue';
import PromoGroup from './components/PromoGroup.vue';
import VideoPlayer from './components/VideoPlayer.vue';
import GoodsList from './components/GoodsList.vue';
import GridFloor from './components/GridFloor.vue';
import GoodsGrid from './components/GoodsGrid.vue';
import ChannelFloor from './components/ChannelFloor.vue';
import RecommendFeed from './components/RecommendFeed.vue';
import CouponList from './components/CouponList.vue';
import UserBenefits from './components/UserBenefits.vue';
import TitleBar from './components/TitleBar.vue';
import ArticleContent from './components/ArticleContent.vue';
import NoticeBar from './components/NoticeBar.vue';

export const COMPONENT_MAP = {
  // 1. 结构 (3)
  topBar: TopBar,
  searchHeader: SearchHeader,
  footerNav: FooterNav,

  // 2. 导航 (3)
  categoryNav: CategoryNav,
  channelGrid: ChannelGrid,
  categoryMegaMenu: CategoryMegaMenu,

  // 3. 广告 (6)
  carousel: Carousel,
  brandWall: BrandWall,
  hotZone: HotZone,
  freeLayout: FreeLayout,
  promoGroup: PromoGroup,
  video: VideoPlayer,

  // 4. 商品 (8)
  goodsList: GoodsList,
  gridFloor: GridFloor,
  goodsGrid: GoodsGrid,
  goodsCard: GoodsList,
  bannerFloor: GridFloor,
  goodsBar: GoodsList,
  channelFloor: ChannelFloor,
  recommendFeed: RecommendFeed,

  // 5. 营销 (1)
  couponList: CouponList,
  userBenefits: UserBenefits,

  // 6. 内容 (3)
  titleBar: TitleBar,
  articleContent: ArticleContent,
  noticeBar: NoticeBar
};

/**
 * 根据组件 type 解析 Vue 组件
 */
export function resolveComponent(type) {
  if (!type) return null;
  return COMPONENT_MAP[type] || null;
}
