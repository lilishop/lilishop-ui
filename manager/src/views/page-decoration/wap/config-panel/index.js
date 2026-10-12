// 新组件配置面板映射：type → 面板组件
// 面板契约：props res（整个楼层条目），直接修改 res.options.*，保存链路自动感知
import PanelBlank from "./PanelBlank.vue";
import PanelLine from "./PanelLine.vue";
import PanelRichText from "./PanelRichText.vue";
import PanelIntegral from "./PanelIntegral.vue";
import PanelCoupon from "./PanelCoupon.vue";

export default {
  blank: PanelBlank,
  line: PanelLine,
  richText: PanelRichText,
  integral: PanelIntegral,
  coupon: PanelCoupon,
};
