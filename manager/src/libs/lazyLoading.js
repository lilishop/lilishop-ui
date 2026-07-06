const viewContext = require.context("@/views", true, /\.vue$/);

/** 后端菜单 frontRoute 与前端实际路径不一致时的映射 */
const VIEW_ALIASES = {};

function resolveViewPath(url) {
  return VIEW_ALIASES[url] || url;
}

export default (url) => () => Promise.resolve(viewContext(`./${resolveViewPath(url)}.vue`));
