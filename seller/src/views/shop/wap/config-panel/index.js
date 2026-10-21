// 店铺端组件配置面板映射：type → 面板组件
// 面板契约：props res（整个楼层条目），直接修改 res.options.*，保存链路自动感知
import PanelBlank from "./PanelBlank.vue";
import PanelLine from "./PanelLine.vue";
import PanelRichText from "./PanelRichText.vue";
import PanelCoupon from "./PanelCoupon.vue";
import PanelFlexOne from "./PanelFlexOne.vue";
import PanelCarousel from "./PanelCarousel.vue";
import PanelAdCube from "./PanelAdCube.vue";
import PanelSearch from "./PanelSearch.vue";
import PanelNotice from "./PanelNotice.vue";
import PanelVideo from "./PanelVideo.vue";
import PanelTitle from "./PanelTitle.vue";
import PanelGoods from "./PanelGoods.vue";

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
  blank: PanelBlank,
  line: PanelLine,
  richText: PanelRichText,
  coupon: PanelCoupon,
  flexOne: PanelFlexOne,
  carousel: PanelCarousel,
  search: PanelSearch,
  notice: PanelNotice,
  video: PanelVideo,
  title: PanelTitle,
  goods: PanelGoods,
  ...Object.fromEntries(adCubeTypes.map((t) => [t, PanelAdCube])),
};
