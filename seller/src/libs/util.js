import { getCurrentPermissionList } from "@/api/index";
import lazyLoading from "./lazyLoading.js";
import { router } from "@/router/index";
import Cookies from "js-cookie";
import config from "@/config/index";
import { useAppStore } from "@/stores/app";

let util = {};

// 避免旧缓存中的已下线菜单重新注册路由。
const DEPRECATED_FRONT_ROUTES = new Set([
  "promotion/flash-discount/flash-discount",
  "promotion/nth-item-discount/nth-item-discount",
]);

/** 店铺主页一级菜单 */
export const HOME_NAV_NAME = "home";
export const HOME_NAV_ITEM = { name: HOME_NAV_NAME, title: "主页" };

/** 静态路由名，禁止被动态路由清理误删 */
const STATIC_ROUTE_NAMES = new Set([
  "home_index",
  "change_pass",
  "message_index",
  "main",
  "renovation",
  "login",
  "forgetPassword",
]);

util.dynamicRouteNames = [];

/**
 * 提取商家端会话必需的基础展示字段，避免超长经营范围或入驻详情导致 Cookie 超限
 *
 * @param {Object} raw 商家信息对象
 * @returns {Object} 核心会话档案对象
 */
util.pickSellerProfile = function (raw) {
  if (!raw) return {};
  return {
    id: raw.id,
    storeId: raw.storeId || raw.id,
    storeName: raw.storeName,
    storeLogo: raw.storeLogo,
    nickName: raw.nickName,
    storeDisable: raw.storeDisable,
    serviceScore: raw.serviceScore,
    deliveryScore: raw.deliveryScore,
    descriptionScore: raw.descriptionScore,
  };
};

util.clearDynamicRoutes = function () {
  util.dynamicRouteNames.forEach((name) => {
    if (STATIC_ROUTE_NAMES.has(name)) {
      return;
    }
    if (router.hasRoute(name)) {
      router.removeRoute(name);
    }
  });
  util.dynamicRouteNames = util.dynamicRouteNames.filter(
    (name) => !STATIC_ROUTE_NAMES.has(name)
  );
};

util.resolveRouteComponent = function (menu) {
  const routeKey =
    menu.frontRoute ||
    (typeof menu.component === "string" &&
    menu.component &&
    menu.component !== "Main"
      ? menu.component
      : "");
  return routeKey ? lazyLoading(routeKey) : null;
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
      typeof route.component === "function" &&
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

util.registerDynamicRoutes = function (menuData, options = {}) {
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
      typeof top.component === "function" &&
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
    const path = (leaf.path || leaf.name || "").replace(/^\//, "");
    let component = leaf.component;
    if (typeof component === "string") {
      component = util.resolveRouteComponent({ component });
    }
    if (
      typeof component !== "function" ||
      STATIC_ROUTE_NAMES.has(leaf.name) ||
      router.hasRoute(leaf.name)
    ) {
      return;
    }
    router.addRoute("otherRouter", {
      path,
      name: leaf.name,
      component,
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

util.bootstrapDynamicRoutesFromCache = function () {
  if (!Cookies.get("userInfoSeller")) {
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

/** 站点名称：优先取接口下发并缓存的站点名，兜底用本地配置 */
util.getSiteName = function () {
  return window.localStorage.getItem("sellersiteName") || config.title;
};

util.title = function (title) {
  const siteName = util.getSiteName();
  title = title ? `${title} - ${siteName}商家后台` : `${siteName} 商家后台`;
  window.document.title = title;
};

util.oneOf = function (ele, targetArr) {
  return targetArr.indexOf(ele) >= 0;
};

util.getRouterObjByName = function (routers, name) {
  if (!name || !routers || !routers.length) {
    return null;
  }
  let routerObj;
  for (let item of routers) {
    if (item.name == name) {
      return item;
    }
    routerObj = util.getRouterObjByName(item.children, name);
    if (routerObj) {
      return routerObj;
    }
  }
  return null;
};

util.handleTitle = function (vm, item) {
  if (!item) {
    return "";
  }
  if (typeof item.title == "object") {
    return item.title;
  }
  return item.title;
};

util.setCurrentPath = function (name) {
  const appStore = useAppStore();
  let title = "";
  let isOtherRouter = false;
  appStore.routers.forEach((item) => {
    if (item.children.length == 1) {
      if (item.children[0].name == name) {
        title = util.handleTitle(null, item);
        if (item.name == "otherRouter") {
          isOtherRouter = true;
        }
      }
    } else {
      item.children.forEach((child) => {
        if (child.name == name) {
          title = util.handleTitle(null, child);
          if (item.name == "otherRouter") {
            isOtherRouter = true;
          }
        }
      });
    }
  });
  let currentPathArr;
  if (name == "home_index") {
    currentPathArr = [
      {
        title: util.handleTitle(
          null,
          util.getRouterObjByName(appStore.routers, "home_index")
        ),
        path: "",
        name: "home_index",
      },
    ];
  } else if ((name.indexOf("_index") >= 0 || isOtherRouter) && name !== "home_index") {
    currentPathArr = [
      {
        title: util.handleTitle(
          null,
          util.getRouterObjByName(appStore.routers, "home_index")
        ),
        path: "/home",
        name: "home_index",
      },
      {
        title: title,
        path: "",
        name: name,
      },
    ];
  } else {
    let currentPathObj = appStore.routers.filter((item) => {
      if (item.children.length <= 1) {
        return item.children[0].name == name;
      }
      let i = 0;
      let childArr = item.children;
      let len = childArr.length;
      while (i < len) {
        if (childArr[i].name == name) {
          return true;
        }
        i++;
      }
      return false;
    })[0];
    if (!currentPathObj) {
      currentPathArr = [];
    } else if (currentPathObj.children.length <= 1 && currentPathObj.name == "home") {
      currentPathArr = [
        {
          title: "首页",
          path: "",
          name: "home_index",
        },
      ];
    } else if (currentPathObj.children.length <= 1 && currentPathObj.name !== "home") {
      currentPathArr = [
        {
          title: "首页",
          path: "/home",
          name: "home_index",
        },
        {
          title: currentPathObj.title,
          path: "",
          name: name,
        },
      ];
    } else {
      let childObj = currentPathObj.children.filter((child) => {
        return child.name == name;
      })[0];
      currentPathArr = [
        {
          title: "首页",
          path: "/home",
          name: "home_index",
        },
        {
          title: currentPathObj.title,
          path: "",
          name: currentPathObj.name,
        },
        {
          title: childObj.title,
          path: currentPathObj.path + "/" + childObj.path,
          name: name,
        },
      ];
    }
  }

  return currentPathArr;
};

util.openNewPage = function (name, argu, query) {
  const appStore = useAppStore();
  let storeOpenedList = appStore.storeOpenedList;
  let openedPageLen = storeOpenedList.length;
  let i = 0;
  let tagHasOpened = false;
  while (i < openedPageLen) {
    if (name == storeOpenedList[i].name) {
      appStore.updateOpenedList({
        index: i,
        argu: argu,
        query: query,
      });
      tagHasOpened = true;
      break;
    }
    i++;
  }
  if (!tagHasOpened) {
    let tag = appStore.tagsList.filter((item) => {
      if (item.children) {
        return name == item.children[0].name;
      }
      return name == item.name;
    });
    tag = tag[0];
    if (tag) {
      tag = tag.children ? tag.children[0] : tag;
      if (argu) tag.argu = argu;
      if (query) tag.query = query;
      appStore.increateTag(tag);
    }
  }
};

util.toDefaultPage = function (routers, name, route, next) {
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
        name: routers[i].children[0].name,
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

util.initRouter = function () {
  const appStore = useAppStore();
  const constRoutes = [];
  let userInfo = Cookies.get("userInfoSeller");
  if (!userInfo) {
    return;
  }
  if (!appStore.added) {
    getCurrentPermissionList().then((res) => {
      if (!res.success) return false;
      let menuData = res.result;

      for (let i = 0; i < menuData.length; i++) {
        let t = menuData[i].children;
        for (let k = 0; k < t.length; k++) {
          let tt = t[k].children;
          for (let z = 0; z < tt.length; z++) {
            tt[z].children = null;
            tt[z].firstRouterName = menuData[i].name;
          }
        }
      }

      if (!menuData) {
        return;
      }
      util.initAllMenuData(constRoutes, menuData);
      util.registerDynamicRoutes(menuData);
      appStore.updateAppRouter(
        constRoutes.filter((item) => item.children && item.children.length > 0)
      );
      util.initMenuData(menuData);
      window.localStorage.setItem("menuData", JSON.stringify(menuData));
      appStore.setAdded(true);
    });
  } else {
    let data = window.localStorage.getItem("menuData");
    if (!data) {
      appStore.setAdded(false);
      util.initRouter();
      return;
    }
    let menuData = JSON.parse(data);
    util.registerDynamicRoutes(menuData);
    util.initMenuData(menuData);
  }
};

util.initAllMenuData = function (constRoutes, data) {
  let allMenuData = [];
  data.forEach((e) => {
    if (e.level == 0) {
      e.children.forEach((item) => {
        allMenuData.push(item);
      });
    }
  });
  util.initRouterNode(constRoutes, allMenuData);
};

util.initMenuData = function (data) {
  const appStore = useAppStore();
  // 全量导航与搜索只使用当前账号权限接口返回的菜单，沿用已下线菜单过滤规则。
  appStore.navigationMenus = data.map((top) => {
    const children = [];
    util.initRouterNode(children, top.children || []);
    return { ...top, children: children.filter((group) => group.children?.length) };
  }).filter((top) => top.children.length);
  let navList = [HOME_NAV_ITEM];
  appStore.navigationMenus.forEach((e) => {
    navList.push({ name: e.name, title: e.title });
  });
  appStore.setNavList(navList);
  let currNav = window.localStorage.getItem("currNav");
  if (!navList.some((item) => item.name === currNav)) {
    currNav = HOME_NAV_NAME;
  }
  appStore.setCurrNav(currNav);

  // 首页也必须准备全部标签入口；切换栏目只更新展示，不能依赖再次初始化路由补齐标签。
  appStore.tagsList = appStore.routers.flatMap((item) => item.children || []);

  appStore.updateMenulist(
    appStore.navigationMenus.find((item) => item.name === currNav)?.children || []
  );
};

util.initRouterNode = function (routers, data) {
  for (let item of data) {
    if (DEPRECATED_FRONT_ROUTES.has(item.frontRoute)) {
      continue;
    }
    const menu = Object.assign({}, item);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      menu.children = [];
      if (menu.name) {
        menu.name = `${menu.name}__layout`;
      }
      util.initRouterNode(menu.children, item.children);
      const layoutComponent = util.resolveRouteComponent(menu);
      if (layoutComponent) {
        menu.component = layoutComponent;
      } else {
        delete menu.component;
      }
    } else {
      const component = util.resolveRouteComponent(menu);
      if (component) {
        menu.component = component;
      } else {
        delete menu.component;
      }
    }

    const meta = {};
    // 站点后缀统一由 util.title 在路由跳转时动态拼接，避免初始化时定死
    meta.title = menu.title ? menu.title : null;
    meta.firstRouterName = item.firstRouterName;
    meta.keepAlive = menu.keepAlive ? true : false;
    menu.meta = meta;

    routers.push(menu);
  }
};

util.getFirstRouterName = function (routeName) {
  if (!routeName) {
    return null;
  }
  const raw = window.localStorage.getItem("menuData");
  if (!raw) {
    return null;
  }
  try {
    const menuData = JSON.parse(raw);
    for (const top of menuData) {
      const level1 = top.children || [];
      for (const mid of level1) {
        const leaves = mid.children || [];
        for (const leaf of leaves) {
          if (leaf.name === routeName) {
            return leaf.firstRouterName || top.name;
          }
        }
      }
    }
  } catch (e) {
    console.warn("[util] getFirstRouterName failed", e);
  }
  return null;
};

export default util;
