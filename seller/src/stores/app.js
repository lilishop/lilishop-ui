import { defineStore } from "pinia";
import { otherRouter } from "@/router/router";

// 原 vuex app 模块的 pinia 版本；mutation 全部转为同名 action
// 例外：storeOpenedList mutation 与 state 同名，改名 updateOpenedList；
// clearOtherTags 原接收组件实例 vm，改为直接接收当前路由名 currentName
export const useAppStore = defineStore("app", {
  state: () => ({
    shipTemplates: "",
    regions: [],
    styleStore: "",
    loading: false,
    added: false,
    navList: [],
    currNav: "",
    lang: "",
    openedSubmenuArr: [],
    storeOpenedList: [
      {
        title: "首页",
        path: "",
        name: "home_index",
      },
    ],
    menuList: [],
    routers: [otherRouter],
    tagsList: [...otherRouter.children],
    refMenu: "",
  }),
  actions: {
    childrenMenu(v) {
      this.refMenu = v;
    },
    updateAppRouter(routes) {
      this.routers.push(...routes);
    },
    updateDefaultRouter() {},
    setLoading(v) {
      this.loading = v;
    },
    setAdded(v) {
      this.added = v;
    },
    setNavList(list) {
      this.navList = list;
    },
    setCurrNav(v) {
      this.currNav = v;
    },
    setTagsList(list) {
      this.tagsList.push(...list);
    },
    updateMenulist(routes) {
      this.menuList = routes;
    },
    addOpenSubmenu(name) {
      if (name.length && this.openedSubmenuArr.indexOf(name) === -1) {
        this.openedSubmenuArr.push(name);
      }
    },
    removeTag(name) {
      this.storeOpenedList.map((item, index) => {
        if (item.name == name) {
          this.storeOpenedList.splice(index, 1);
        }
      });
    },
    updateOpenedList(get) {
      let openedPage = this.storeOpenedList[get.index];
      if (get.argu) openedPage.argu = get.argu;
      if (get.query) openedPage.query = get.query;
      this.storeOpenedList.splice(get.index, 1, openedPage);
      localStorage.storeOpenedList = JSON.stringify(this.storeOpenedList);
    },
    clearAllTags() {
      this.storeOpenedList.splice(1);
      localStorage.storeOpenedList = JSON.stringify(this.storeOpenedList);
    },
    clearOtherTags(currentName) {
      let currentIndex = 0;
      this.storeOpenedList.forEach((item, index) => {
        if (item.name == currentName) {
          currentIndex = index;
        }
      });
      if (currentIndex == 0) {
        this.storeOpenedList.splice(1);
      } else {
        this.storeOpenedList.splice(currentIndex + 1);
        this.storeOpenedList.splice(1, currentIndex - 1);
      }
      localStorage.storeOpenedList = JSON.stringify(this.storeOpenedList);
    },
    setOpenedList() {
      this.storeOpenedList = localStorage.storeOpenedList
        ? JSON.parse(localStorage.storeOpenedList)
        : [otherRouter.children[0]];
    },
    setAvatarPath(path) {
      localStorage.avatorImgPath = path;
    },
    switchLang(lang) {
      this.lang = lang;
      localStorage.lang = lang;
    },
    clearOpenedSubmenu() {
      this.openedSubmenuArr.length = 0;
    },
    increateTag(tagObj) {
      this.storeOpenedList.push(tagObj);
      localStorage.storeOpenedList = JSON.stringify(this.storeOpenedList);
    },
  },
});
