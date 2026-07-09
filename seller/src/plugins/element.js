import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import "element-plus/dist/index.css";
import "@/styles/element.scss";

export function setupElementPlus(app) {
  app.use(ElementPlus, {
    locale: zhCn,
    size: "default",
  });
}
