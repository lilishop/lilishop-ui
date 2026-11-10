<style lang="scss">
@import "./main.scss";
</style>

<template>
  <div class="main">
    <div class="sidebar-menu-con menu-bar">
      <shrinkable-menu />
    </div>
    <div class="main-header-con">
      <div class="logo-con">
        <img alt="平台 Logo" :src="storeSideLogo" key="max-logo" @error="onLogoError" />
      </div>
      <div class="main-header">
        <div class="header-avator-con">
          <div class="user-dropdown-menu-con">
            <el-row
              justify="end"
              align="middle"
              class="user-dropdown-innercon"
            >
              <store-qrcode />
              <ul class="nav-list">
                <li class="nav-item">
                  <el-tooltip
                    :content="unreadMessageCount > 0 ? `有 ${unreadMessageCount} 条未读消息` : '暂无未读消息'"
                    placement="bottom"
                  >
                    <button
                      type="button"
                      class="header-icon-button header-message-btn"
                      :aria-label="unreadMessageCount > 0 ? `有 ${unreadMessageCount} 条未读消息` : '消息中心'"
                      @click="openMessagePage"
                    >
                      <el-badge
                        :value="unreadMessageCount"
                        :max="99"
                        :hidden="unreadMessageCount <= 0"
                        class="header-message-badge"
                      >
                        <el-icon :size="18"><Bell /></el-icon>
                      </el-badge>
                    </button>
                  </el-tooltip>
                </li>
                <li class="nav-item">
                  <el-tooltip content="联系客服" placement="bottom">
                    <el-button type="warning" size="small" :loading="load" @click="im">
                      <el-icon><ChatDotRound /></el-icon>
                      客服
                    </el-button>
                  </el-tooltip>
                </li>
              </ul>
              <el-dropdown trigger="hover" @command="handleClickUserDropdown">
                <div class="dropList">
                  <el-avatar
                    :size="32"
                    :src="userInfo.storeLogo"
                    style="background: #fff; margin-left: 10px"
                  >
                    <el-icon><UserFilled /></el-icon>
                  </el-avatar>
                  <span class="header-store-name">{{ userInfo.storeName || '我的店铺' }}</span>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="changePass">修改密码</el-dropdown-item>
                    <el-dropdown-item divided command="loginOut">退出</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-row>
          </div>
        </div>
      </div>
    </div>
    <div class="single-page-con">
      <div class="page-path-bar">
        <div class="header-page-info">
          <template v-for="(part, index) in currentPathParts" :key="index">
            <span v-if="index > 0" class="header-divider">/</span>
            <strong v-if="index === currentPathParts.length - 1">{{ part }}</strong>
            <span v-else class="workspace-label">{{ part }}</span>
          </template>
        </div>
      </div>
      <div class="single-page">
        <router-view v-slot="{ Component }">
          <component :is="Component" v-if="Component" :key="$route.fullPath" />
        </router-view>
      </div>
    </div>
    <circleLoading class="loading-position" v-show="loading" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Bell, ChatDotRound, UserFilled } from "@element-plus/icons-vue";
import shrinkableMenu from "./main-components/shrinkable-menu/shrinkable-menu.vue";
import circleLoading from "@/views/my-components/lili/circle-loading.vue";
import storeQrcode from "@/views/main-components/store-qrcode.vue";
import Cookies from "js-cookie";
import util from "@/libs/util.js";
import { flattenNavigation, findNavigationItem } from "@/libs/seller-navigation";
import defaultLogo from "@/assets/logo.png";
import { loadSiteSettings } from "@/composables/useSiteSettings";
import { getMessageSendData, logout, userMsg } from "@/api/index";
import { getIMDetail } from "@/api/common";
import { Message } from "@/utils/message";
import { getStore, setStore } from "@/libs/storage";
import { useAppStore } from "@/stores/app";
import { useUserStore } from "@/stores/user";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();

const sliceNum = ref(5);
const userInfo = ref({});
const storeSideLogo = ref(defaultLogo);
const IMLink = ref("");
const load = ref(false);

const loading = computed(() => appStore.loading);
const unreadMessageCount = computed(() => appStore.unreadMessageCount);
const pageTagsList = computed(() => appStore.storeOpenedList);
const currentPageTitle = computed(() => {
  if (route.name === "full-discount-detail") {
    const type = route.query?.activityType;
    const isDetail = Boolean(route.query?.id);
    if (type === "FULL_GIFT") return isDetail ? "满赠活动详情" : "添加满赠活动";
    if (type === "FULL_RATE") return isDetail ? "满折活动详情" : "添加满折活动";
    return isDetail ? "满减活动详情" : "添加满减活动";
  }
  return route.meta.title || pageTagsList.value.find((item) => item.name === route.name)?.title || '工作台';
});
const navigationItems = computed(() => flattenNavigation(appStore.navigationMenus || []));
const currentPathParts = computed(() => {
  const matched = findNavigationItem(navigationItems.value, route.name, route.query);
  const rawParts = matched
    ? [
        matched.topTitle,
        matched.groupTitle,
        matched.title,
        route.name !== matched.name ? currentPageTitle.value : "",
      ]
    : ["商家后台", currentPageTitle.value];
  return rawParts.filter((part, idx, arr) => part && part !== arr[idx - 1]);
});
const lang = computed(() => appStore.lang);

/**
 * 跳转至系统消息页面。
 */
function openMessagePage() {
  util.openNewPage("message_index");
  router.push({ name: "message_index" });
}

/**
 * 拉取当前店铺未读消息总数，更新右上角消息角标。
 */
function loadUnreadMessageCount() {
  getMessageSendData({ status: "UN_READY", pageNumber: 1, pageSize: 1 })
    .then((res) => {
      if (res && res.success && res.result) {
        appStore.setUnreadMessageCount(res.result.total);
      }
    })
    .catch(() => {});
}

async function im() {
  const accessToken = getStore("accessToken");
  load.value = true;
  await getIMDetailMethods();
  const userInfo = await userMsg();
  load.value = false;
  if (userInfo.success && IMLink.value) {
    window.open(`${IMLink.value}?token=` + accessToken);
  } else {
    Message.error("请登录后再联系客服");
  }
}

async function getIMDetailMethods() {
  const res = await getIMDetail();
  if (res.success) {
    IMLink.value = res.result;
  }
}

/**
 * 更新页面站点图标。
 * @param {string} href 图标地址
 */
function applyFavicon(href) {
  if (!href || href === "undefined" || href === "null") return;
  const link =
    document.querySelector("link[rel*='icon']") ||
    document.createElement("link");
  link.type = "image/x-icon";
  link.href = href;
  link.rel = "shortcut icon";
  document.getElementsByTagName("head")[0].appendChild(link);
}

/**
 * 平台 Logo 加载失败时回退为默认 Logo。
 * @param {Event} e 图片加载错误事件
 */
function onLogoError(e) {
  if (e?.target && e.target.src !== defaultLogo) {
    e.target.src = defaultLogo;
  }
}

function init() {
  const pathArr = util.setCurrentPath(route.name);
  if (pathArr.length >= 2) {
    appStore.addOpenSubmenu(pathArr[1].name);
  }
  const cachedLogo = localStorage.getItem("sellerlogoImg");
  storeSideLogo.value =
    cachedLogo && cachedLogo !== "undefined" && cachedLogo !== "null"
      ? cachedLogo
      : defaultLogo;
  util.title(currentPageTitle.value);
  applyFavicon(localStorage.getItem("sellerIconImg"));

  loadSiteSettings()
    .then((data) => {
      if (data) {
        const logo = data.storeSideLogo || data.domainLogo || "";
        const icon = data.storeSideIcon || data.domainIcon || "";
        if (logo) {
          localStorage.setItem("sellerlogoImg", logo);
          storeSideLogo.value = logo;
        }
        if (icon) {
          localStorage.setItem("sellerIconImg", icon);
          applyFavicon(icon);
        }
        if (data.siteName) {
          localStorage.setItem("sellersiteName", data.siteName);
        }
      }
    })
    .catch(() => {});

  userInfo.value = JSON.parse(Cookies.get("userInfoSeller"));
  checkTag(route.name);
  loadUnreadMessageCount();

  const currWidth = document.body.clientWidth;
  if (currWidth <= 1200) {
    sliceNum.value = 2;
  }
}

function handleClickUserDropdown(name) {
  if (name === "changePass") {
    util.openNewPage("change_pass");
    router.push({ name: "change_pass" });
  } else if (name === "loginOut") {
    logout().then(() => {
      Cookies.set("accessToken", "");
      userStore.logout();
      appStore.clearOpenedSubmenu();
      setStore("accessToken", "");
      setStore("refreshToken", "");
      router.push({ path: "/login" });
    });
  }
}

function checkTag(name) {
  const openpageHasTag = pageTagsList.value.some((item) => item.name === name);
  if (!openpageHasTag) {
    util.openNewPage(name, route.params || {}, route.query || {});
  }
}

function resize() {
  const currWidth = document.body.clientWidth;
  const count = currWidth / 300;
  sliceNum.value = count > 6 ? 6 : count;
}

watch(
  () => route.name,
  (name) => {
    const pathArr = util.setCurrentPath(name);
    if (pathArr.length > 2) {
      appStore.addOpenSubmenu(pathArr[1].name);
    }
    checkTag(name);
    util.title(currentPageTitle.value);
    loadUnreadMessageCount();
  }
);

watch(lang, () => {
  util.setCurrentPath(route.name);
});

// 刷新时权限菜单晚于布局挂载；目录到达后补齐当前标签和标题，无需再切换一次栏目。
watch(() => appStore.tagsList, () => {
  checkTag(route.name);
  util.title(currentPageTitle.value);
});

appStore.setOpenedList();

onMounted(() => {
  init();
  resize();
  window.addEventListener("resize", resize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resize);
});
</script>
