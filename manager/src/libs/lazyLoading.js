const viewContext = require.context("@/views", true, /\.vue$/);

// 独立营销页面使用明确导入，保证新目录加入开发服务时能建立模块依赖。
const VIEW_LOADERS = {
  "promotions/lottery/LotteryManage": () => import("@/views/promotions/lottery/LotteryManage.vue"),
};

/** 后端菜单 frontRoute 与前端实际路径不一致时的映射 */
const VIEW_ALIASES = {
  "customWords/index": "custom-words/index",
  "sensitiveWords/index": "sensitive-words/index",
  "sys/message/noticeMessageTemplate": "sys/message/messageTemplate",
};

function resolveViewPath(url) {
  return VIEW_ALIASES[url] || url;
}

export default (url) => {
  const viewPath = resolveViewPath(url);
  return VIEW_LOADERS[viewPath] || (() => Promise.resolve(viewContext(`./${viewPath}.vue`)));
};
