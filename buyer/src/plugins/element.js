import zhCn from "element-plus/es/locale/lang/zh-cn";

// 组件样式（css.mjs 会自动传递 base/overlay/scrollbar/popper 等依赖样式）
import "element-plus/es/components/affix/style/css";
import "element-plus/es/components/alert/style/css";
import "element-plus/es/components/avatar/style/css";
import "element-plus/es/components/breadcrumb/style/css";
import "element-plus/es/components/breadcrumb-item/style/css";
import "element-plus/es/components/button/style/css";
import "element-plus/es/components/card/style/css";
import "element-plus/es/components/carousel/style/css";
import "element-plus/es/components/carousel-item/style/css";
import "element-plus/es/components/cascader/style/css";
import "element-plus/es/components/checkbox/style/css";
// container 的 css 会带上 aside/header/main/footer 全部布局组件样式
import "element-plus/es/components/container/style/css";
import "element-plus/es/components/date-picker/style/css";
import "element-plus/es/components/dialog/style/css";
import "element-plus/es/components/divider/style/css";
import "element-plus/es/components/drawer/style/css";
import "element-plus/es/components/dropdown/style/css";
import "element-plus/es/components/dropdown-item/style/css";
import "element-plus/es/components/dropdown-menu/style/css";
import "element-plus/es/components/empty/style/css";
import "element-plus/es/components/form/style/css";
import "element-plus/es/components/form-item/style/css";
import "element-plus/es/components/icon/style/css";
import "element-plus/es/components/image/style/css";
import "element-plus/es/components/input/style/css";
import "element-plus/es/components/input-number/style/css";
import "element-plus/es/components/menu/style/css";
import "element-plus/es/components/menu-item/style/css";
import "element-plus/es/components/option/style/css";
import "element-plus/es/components/pagination/style/css";
import "element-plus/es/components/progress/style/css";
import "element-plus/es/components/radio/style/css";
import "element-plus/es/components/radio-button/style/css";
import "element-plus/es/components/radio-group/style/css";
import "element-plus/es/components/rate/style/css";
import "element-plus/es/components/select/style/css";
import "element-plus/es/components/skeleton/style/css";
import "element-plus/es/components/step/style/css";
import "element-plus/es/components/steps/style/css";
import "element-plus/es/components/sub-menu/style/css";
import "element-plus/es/components/switch/style/css";
import "element-plus/es/components/tab-pane/style/css";
import "element-plus/es/components/table/style/css";
import "element-plus/es/components/table-column/style/css";
import "element-plus/es/components/tabs/style/css";
import "element-plus/es/components/tag/style/css";
import "element-plus/es/components/tooltip/style/css";
import "element-plus/es/components/upload/style/css";
// JS 服务样式（ElMessage/ElMessageBox 在调用处显式 import，这里只需样式）
import "element-plus/es/components/message/style/css";
import "element-plus/es/components/message-box/style/css";
import "element-plus/es/components/loading/style/css";
import "@/assets/styles/element.scss";

import {
  ElAffix,
  ElAlert,
  ElAvatar,
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElButton,
  ElCard,
  ElCarousel,
  ElCarouselItem,
  ElCascader,
  ElCheckbox,
  // ElContainer 的 install 会同时注册 ElAside/ElHeader/ElMain/ElFooter；
  // 单独 app.use(ElAside)/app.use(ElMain) 是 noop（withNoopInstall），不会注册
  ElContainer,
  ElDatePicker,
  ElDialog,
  ElDivider,
  ElDrawer,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElIcon,
  ElImage,
  ElInput,
  ElInputNumber,
  ElMenu,
  ElMenuItem,
  ElOption,
  ElPagination,
  ElProgress,
  ElRadio,
  ElRadioButton,
  ElRadioGroup,
  ElRate,
  ElSelect,
  ElSkeleton,
  ElStep,
  ElSteps,
  ElSubMenu,
  ElSwitch,
  ElTabPane,
  ElTable,
  ElTableColumn,
  ElTabs,
  ElTag,
  ElTooltip,
  ElUpload,
  ElLoading,
  provideGlobalConfig,
} from "element-plus";

const components = [
  ElAffix,
  ElAlert,
  ElAvatar,
  ElBreadcrumb,
  ElBreadcrumbItem,
  ElButton,
  ElCard,
  ElCarousel,
  ElCarouselItem,
  ElCascader,
  ElCheckbox,
  // ElContainer 的 install 会同时注册 ElAside/ElHeader/ElMain/ElFooter；
  // 单独 app.use(ElAside)/app.use(ElMain) 是 noop（withNoopInstall），不会注册
  ElContainer,
  ElDatePicker,
  ElDialog,
  ElDivider,
  ElDrawer,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElEmpty,
  ElForm,
  ElFormItem,
  ElIcon,
  ElImage,
  ElInput,
  ElInputNumber,
  ElMenu,
  ElMenuItem,
  ElOption,
  ElPagination,
  ElProgress,
  ElRadio,
  ElRadioButton,
  ElRadioGroup,
  ElRate,
  ElSelect,
  ElSkeleton,
  ElStep,
  ElSteps,
  ElSubMenu,
  ElSwitch,
  ElTabPane,
  ElTable,
  ElTableColumn,
  ElTabs,
  ElTag,
  ElTooltip,
  ElUpload,
];

export function setupElementPlus(app) {
  components.forEach((component) => app.use(component));
  // 注册 v-loading 指令
  app.use(ElLoading);
  // 不使用 ConfigProvider，直接注入全局配置（locale/尺寸），行为与 app.use(ElementPlus, {...}) 一致
  provideGlobalConfig({ locale: zhCn, size: "default" }, app, true);
}
