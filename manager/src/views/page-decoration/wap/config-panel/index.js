// 新组件配置面板映射：type → 面板组件
// 面板契约：props res（整个楼层条目），直接修改 res.options.*，保存链路自动感知
import PanelBlank from "./PanelBlank.vue";
import PanelLine from "./PanelLine.vue";
import PanelRichText from "./PanelRichText.vue";
import PanelIntegral from "./PanelIntegral.vue";
import PanelCoupon from "./PanelCoupon.vue";
import PanelArticle from "./PanelArticle.vue";
import PanelShop from "./PanelShop.vue";
import PanelFlexOne from "./PanelFlexOne.vue";
import PanelCarousel from "./PanelCarousel.vue";
import PanelAdCube from "./PanelAdCube.vue";
import PanelMenu from "./PanelMenu.vue";
import PanelSearch from "./PanelSearch.vue";
import PanelNotice from "./PanelNotice.vue";
import PanelVideo from "./PanelVideo.vue";
import PanelTitle from "./PanelTitle.vue";
import PanelPromotion from "./PanelPromotion.vue";
import PanelGoods from "./PanelGoods.vue";
import PanelHomeComb from "./PanelHomeComb.vue";

// 图片魔方及其全部可选风格共用 PanelAdCube
const adCubeTypes = [
  "tpl_ad_list",
  "leftOneRightTwo",
  "leftTwoRightOne",
  "flexThree",
  "flexTwo",
  "topOneBottomTwo",
  "topTwoBottomOne",
  "flexFive",
  "flexFour",
  "textPicture",
];

export default {
  homeComb: PanelHomeComb,
  blank: PanelBlank,
  line: PanelLine,
  richText: PanelRichText,
  integral: PanelIntegral,
  coupon: PanelCoupon,
  article: PanelArticle,
  shop: PanelShop,
  flexOne: PanelFlexOne,
  carousel: PanelCarousel,
  menu: PanelMenu,
  search: PanelSearch,
  notice: PanelNotice,
  video: PanelVideo,
  title: PanelTitle,
  promotionDetail: PanelPromotion,
  goods: PanelGoods,
  ...Object.fromEntries(adCubeTypes.map((t) => [t, PanelAdCube])),
};
