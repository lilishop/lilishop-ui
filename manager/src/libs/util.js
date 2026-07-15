import lazyLoading from "./lazyLoading.js";
import { getRouter } from "./router-holder";
import Cookies from "js-cookie";

let util = {};

/** 已弃用、前端未实现或已移除的菜单 frontRoute，注册路由时跳过 */
const DEPRECATED_FRONT_ROUTES = new Set([
  "goods/goods-manage/spec",
  "distribution/distrbutionGrade",
]);

function isDeprecatedMenu(menu) {
  return menu.frontRoute && DEPRECATED_FRONT_ROUTES.has(menu.frontRoute);
}

/** 动态菜单路由 name，用于登出或重新注册时清理 */
util.dynamicRouteNames = [];

util.normalizeRoutePath = function (path) {
  return String(path || "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
};

util.isSameRoutePage = function (a, b) {
  if (!a || !b) return false;
  if (a.name && b.name && a.name === b.name) return true;
  const pathA = util.normalizeRoutePath(a.path);
  const pathB = util.normalizeRoutePath(b.path);
  return !!(pathA && pathB && pathA === pathB);
};

util.findOpenedPageIndex = function (pageOpenedList, name, path) {
  const normalizedPath = util.normalizeRoutePath(path);
  return pageOpenedList.findIndex(
    (item) =>
      item.name === name ||
      (normalizedPath &&
        util.normalizeRoutePath(item.path) === normalizedPath)
  );
};

util.clearDynamicRoutes = function () {
  const router = getRouter();
  if (!router) return;
  util.dynamicRouteNames.forEach((name) => {
    if (router.hasRoute(name)) {
      router.removeRoute(name);
    }
  });
  util.dynamicRouteNames = [];
};

util.collectLeafRoutes = function (routes, result = [], parentPath = "") {
  routes.forEach((route) => {
    let segment = route.path != null ? String(route.path) : "";
    segment = segment.replace(/^\//, "");
    const fullPath = [parentPath, segment].filter(Boolean).join("/");
    const hasChildren = route.children && route.children.length > 0;

    if (hasChildren) {
      util.collectLeafRoutes(route.children, result, fullPath);
    } else if (
      route.name &&
      route.component &&
      !String(route.name).endsWith("__layout")
    ) {
      result.push({
        path: fullPath || segment || route.name,
        name: route.name,
        component: route.component,
        meta: route.meta || {},
      });
    }
  });
  return result;
};

/** Vue Router 4：动态路由必须挂到 otherRouter 下，且刷新/热更新后需重新注册 */
util.registerDynamicRoutes = function (menuData, options = {}) {
  const router = getRouter();
  if (!router) return;
  const { rematch = true } = options;
  const pendingPath = router.currentRoute.value.fullPath;
  const pendingUnmatched = router.currentRoute.value.matched.length === 0;

  util.clearDynamicRoutes();
  const constRoutes = [];
  util.initAllMenuData(constRoutes, menuData);

  const leaves = [];
  constRoutes.forEach((top) => {
    const base = (top.path || "").replace(/^\//, "");
    if (top.children && top.children.length) {
      util.collectLeafRoutes(top.children, leaves, base);
    } else if (
      top.name &&
      top.component &&
      !String(top.name).endsWith("__layout")
    ) {
      leaves.push({
        path: base || top.name,
        name: top.name,
        component: top.component,
        meta: top.meta || {},
      });
    }
  });

  leaves.forEach((leaf) => {
    const path = util.normalizeRoutePath(leaf.path || leaf.name);
    if (router.hasRoute(leaf.name)) {
      return;
    }
    router.addRoute("otherRouter", {
      path,
      name: leaf.name,
      component: leaf.component,
      meta: leaf.meta,
    });
    util.dynamicRouteNames.push(leaf.name);
  });

  if (!router.hasRoute("error-404")) {
    router.addRoute({
      path: "/:pathMatch(.*)*",
      name: "error-404",
      component: lazyLoading("error-page/404"),
      meta: { title: "404-页面不存在" },
    });
    util.dynamicRouteNames.push("error-404");
  }

  if (
    rematch &&
    pendingUnmatched &&
    pendingPath &&
    pendingPath !== "/login"
  ) {
    const resolved = router.resolve(pendingPath);
    if (resolved.matched.length > 0) {
      router.replace(pendingPath).catch(() => {});
    }
  }
};

/** 从 localStorage 恢复动态路由（刷新深链前必须先注册，避免 /member/xxx 无匹配） */
util.bootstrapDynamicRoutesFromCache = function () {
  if (!Cookies.get("userInfoManager")) {
    return false;
  }
  try {
    const raw = window.localStorage.getItem("menuData");
    if (!raw) {
      return false;
    }
    util.registerDynamicRoutes(JSON.parse(raw), { rematch: false });
    return true;
  } catch (e) {
    console.warn("[router] menuData parse failed", e);
    return false;
  }
};

util.title = function(title) {
  title = title || "运营后台";
  window.document.title = title;
};
// 判断元素是否存在于数组中
util.oneOf = function(ele, targetArr) {
  if (targetArr.indexOf(ele) >= 0) {
    return true;
  } else {
    return false;
  }
};

// 打开新的页面
util.openNewPage = function(vm, name, argu, query) {
  if (!vm.$store) {
    return;
  }
  let pageOpenedList = vm.$store.state.app.pageOpenedList;
  const currentPath = vm.$route ? vm.$route.path : "";
  const openedIndex = util.findOpenedPageIndex(pageOpenedList, name, currentPath);
  if (openedIndex >= 0) {
    vm.$store.commit("pageOpenedList", {
      index: openedIndex,
      argu: argu,
      query: query
    });
    return;
  }
  let tag = vm.$store.state.app.tagsList.filter(item => {
    if (item.children) {
      return name == item.children[0].name;
    } else {
      return name == item.name;
    }
  });
  tag = tag[0];
  if (!tag) {
    tag = vm.$store.state.app.tagsList.find((item) => {
      const candidate = item.children ? item.children[0] : item;
      return util.isSameRoutePage(candidate, { name, path: currentPath });
    });
    if (tag && tag.children) {
      tag = tag.children[0];
    }
  }
  if (tag) {
    tag = tag.children ? tag.children[0] : tag;
    const tagObj = { ...tag, name: name || tag.name };
    if (argu) {
      tagObj.argu = argu;
    }
    if (query) {
      tagObj.query = query;
    }
    vm.$store.commit("increateTag", tagObj);
  }
};

util.toDefaultPage = function(routers, name, route, next) {
  let len = routers.length;
  let i = 0;
  let notHandle = true;
  while (i < len) {
    if (
      routers[i].name == name &&
      routers[i].children &&
      routers[i].redirect == undefined
    ) {
      route.replace({
        name: routers[i].children[0].name
      });
      notHandle = false;
      next();
      break;
    }
    i++;
  }
  if (notHandle) {
    next();
  }
};

util.initRouter = function(vm) {
  // 初始化路由
  const constRoutes = [];
  const otherRoutes = [];

  // 404路由需要和动态路由一起加载
  const otherRouter = [
    {
      path: "/:pathMatch(.*)*",
      name: "error-404",
      meta: {
        title: "404-页面不存在"
      },
      frontRoute: "error-page/404"
    }
  ];
  // 判断用户是否登录
  let userInfo = Cookies.get("userInfoManager");
  if (!userInfo) {
    // 未登录
    return;
  }
  if (!vm.$store.state.app.added) {
    // 第一次加载 读取数据
    // 加载菜单
    import("@/api/index").then(({ getCurrentPermissionList }) => {
      getCurrentPermissionList().then(res => {
      if (!res.success) return false;
      let menuData = res.result;

      // 格式化数据，设置 空children 为 null
      for (let i = 0; i < menuData.length; i++) {
        let t = menuData[i].children;
        for (let k = 0; k < t.length; k++) {
          let tt = t[k].children;
          for (let z = 0; z < tt.length; z++) {
            tt[z].children = null;
            // 给所有三级路由添加字段，显示一级菜单name，方便点击页签时的选中筛选
            tt[z].firstRouterName = menuData[i].name;
          }
        }
      }

      if (!menuData) {
        return;
      }
      util.initAllMenuData(constRoutes, menuData);
      util.registerDynamicRoutes(menuData);
      vm.$store.commit(
        "updateAppRouter",
        constRoutes.filter((item) => item.children && item.children.length > 0)
      );
      util.initMenuData(vm, menuData);
      // 缓存数据 修改加载标识
      window.localStorage.setItem("menuData", JSON.stringify(menuData));
      vm.$store.commit("setAdded", true);
      });
    });
  } else {
    // 读取缓存数据
    let data = window.localStorage.getItem("menuData");
    if (!data) {
      vm.$store.commit("setAdded", false);
      return;
    }
    let menuData = JSON.parse(data);
    util.registerDynamicRoutes(menuData);
    util.initMenuData(vm, menuData);
  }
};

// 添加所有顶部导航栏下的菜单路由
util.initAllMenuData = function(constRoutes, data) {
  let allMenuData = [];
  data.forEach(e => {
    if (e.level == 0) {
      e.children.forEach(item => {
        allMenuData.push(item);
      });
    }
  });
  util.initRouterNode(constRoutes, allMenuData);
};

// 生成菜单格式数据
util.initMenuData = function(vm, data) {
  const menuRoutes = [];
  let menuData = data;
  // 顶部菜单
  let navList = [];
  menuData.forEach(e => {
    let nav = {
      name: e.name,
      title: e.title
    };
    navList.push(nav);
  });
  if (navList.length < 1) {
    return;
  }
  // 存入vuex
  vm.$store.commit("setNavList", navList);
  let currNav = window.localStorage.getItem("currNav");
  if (currNav) {
    // 读取缓存title
    for (var item of navList) {
      if (item.name == currNav) {
        vm.$store.commit("setCurrNavTitle", item.title);
        break;
      }
    }
  } else {
    // 默认第一个
    currNav = navList[0].name;
    vm.$store.commit("setCurrNavTitle", navList[0].title);
  }
  vm.$store.commit("setCurrNav", currNav);
  for (let item of menuData) {
    if (item.name == currNav) {
      // 过滤
      menuData = item.children;
      break;
    }
  }
  util.initRouterNode(menuRoutes, menuData);
  // 刷新界面菜单
  vm.$store.commit(
    "updateMenulist",
    menuRoutes.filter(item => item.children.length > 0)
  );

  let tagsList = [];
  vm.$store.state.app.routers.map(item => {
    if (item.children.length <= 1) {
      tagsList.push(item.children[0]);
    } else {
      tagsList.push(...item.children);
    }
  });
  vm.$store.commit("setTagsList", tagsList);
};

// 生成路由节点
util.initRouterNode = function(routers, data) {
  // data为所有子菜单数据

  for (let item of data) {
    if (isDeprecatedMenu(item)) {
      continue;
    }
    const menu = Object.assign({}, item);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      menu.children = [];
      // Vue Router 4：父子路由 name 必须不同，后端菜单常出现同名父子节点
      if (menu.name) {
        menu.name = `${menu.name}__layout`;
      }
      util.initRouterNode(menu.children, item.children);
      // 分组节点通常无页面，仅在有 frontRoute 时挂载组件
      if (menu.frontRoute) {
        menu.component = lazyLoading(menu.frontRoute);
      } else {
        delete menu.component;
      }
    } else if (menu.frontRoute) {
      menu.component = lazyLoading(menu.frontRoute);
    }

    const meta = {};
    meta.title = menu.title ? menu.title + " - 运营后台" : null;
    meta.firstRouterName = item.firstRouterName;
    menu.meta = meta;

    routers.push(menu);
  }
};

export default util;
