import { ElLoading, provideGlobalConfig } from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import "element-plus/dist/index.css";
import "@/styles/element.scss";

// Element Plus 组件经 unplugin-vue-components 按需引入（见 vue.config.js），
// 此处仅注册指令（v-loading 不走按需解析）与全局配置（语言/尺寸）
export function setupElementPlus(app) {
  app.use(ElLoading);
  provideGlobalConfig(
    {
      locale: zhCn,
      size: "default",
    },
    app,
    true
  );
}
