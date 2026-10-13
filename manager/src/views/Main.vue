<style lang="scss">
@import "./main.scss";
</style>
<template>
  <div class="main" :class="{ 'home-only': !menuList.length }">
    <div class="sidebar-menu-con menu-bar">
      <shrinkable-menu />
    </div>
    <div
      class="main-header-con"
      :class="{ 'has-tabs': setting.isUseTabsRouter }"
      :style="{ height: setting.isUseTabsRouter ? '106px' : '60px' }"
    >
      <div class="main-header">
        <div class="header-logo-con">
          <img :src="domainLogo" key="max-logo" />
        </div>
        <div class="header-avator-con">
          <div class="flex flex-a-c user-module" style="height: 100%">
            <message-tip v-if="tipsMessage" :res="tipsMessage" />
            <div class="user-dropdown-menu-con" style="margin-left: 24px; display: flex; align-items: center; height: 100%">
              <el-row
                type="flex"
                justify="end"
                align="middle"
                class="user-dropdown-innercon"
              >
                <el-dropdown trigger="hover" @command="handleClickUserDropdown">
                  <div class="dropList">
                    <span class="main-user-name">{{ userInfo.nickName }}</span>
                    <el-avatar
                      :size="32"
                      :src="avatarPath"
                      style="background: #fff; margin-left: 10px"
                    >
                      <el-icon><UserFilled /></el-icon>
                    </el-avatar>
                  </div>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="personalCenter">
                        {{ $t("userCenter") }}
                      </el-dropdown-item>
                      <el-dropdown-item command="changePass">
                        {{ $t("changePass") }}
                      </el-dropdown-item>
                      <el-dropdown-item divided command="loginOut">
                        {{ $t("logout") }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </el-row>
            </div>
          </div>
        </div>
      </div>
      <div class="tags-con" v-if="setting.isUseTabsRouter">
        <tags-page-opened :pageTagsList="pageTagsList" />
      </div>
    </div>
    <div
      class="single-page-con"
      :style="{
        top: setting.isUseTabsRouter ? '106px' : '60px',
        height: setting.isUseTabsRouter ? 'calc(100% - 116px)' : 'calc(100% - 70px)',
      }"
    >
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
import { UserFilled } from "@element-plus/icons-vue";
import shrinkableMenu from "./main-parts/shrinkable-menu/shrinkable-menu.vue";
import tagsPageOpened from "./main-parts/tags-page-opened.vue";
import messageTip from "./main-parts/message-tip.vue";
import circleLoading from "@/components/lili/circle-loading.vue";
import Cookies from "js-cookie";
import util from "@/libs/util.js";
import { getNoticePage, logout } from "@/api/index";
import config from "@/config/index.js";
import defaultLogo from "@/assets/logo.png";
import { setStore } from "@/libs/storage";
import { useAppStore } from "@/stores/app";
import { useUserStore } from "@/stores/user";
import { useSettingStore } from "@/stores/setting";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();
const settingStore = useSettingStore();

const sliceNum = ref(5);
const userInfo = ref("");
const tipsMessage = ref("");
const domainLogo = ref("");

const setting = computed(() => settingStore.setting);
const loading = computed(() => appStore.loading);
const menuList = computed(() => appStore.menuList || []);
const pageTagsList = computed(() => appStore.pageOpenedList);
const avatarPath = computed(() => localStorage.avatorImgPath);

function init() {
  const userInfoData = JSON.parse(Cookies.get("userInfoManager"));
  userInfo.value = userInfoData;
  checkTag(route.name);
  domainLogo.value = localStorage.getItem("icon") || defaultLogo;
  const link =
    document.querySelector("link[rel*='icon']") ||
    document.createElement("link");
  link.type = "image/x-icon";
  link.href = localStorage.getItem("domainIcon");
  link.rel = "shortcut icon";
  document.getElementsByTagName("head")[0].appendChild(link);
  window.document.title = localStorage.getItem("title") + " - 运营后台";
  getNoticePage({}).then((res) => {
    if (res.success) {
      tipsMessage.value = res.result;
      appStore.notices = res.result;
    }
  });
}

function handleClickUserDropdown(name) {
  if (name === "personalCenter") {
    util.openNewPage("personal-center");
    router.push({ name: "personal-center" });
  } else if (name === "changePass") {
    util.openNewPage("change-password");
    router.push({ name: "change_password" });
  } else if (name === "loginOut") {
    logout().then(() => {
      userStore.logout();
      appStore.setAdded(false);
      setStore("accessToken", "");
      setStore("refreshToken", "");
      router.push({ path: "/login" });
    });
  }
}

function checkTag(name) {
  const openpageHasTag = util.findOpenedPageIndex(
    pageTagsList.value,
    name,
    route.path
  ) >= 0;
  if (!openpageHasTag) {
    util.openNewPage(name, route.params || {}, route.query || {});
  }
}

function resize() {
  const currWidth = document.body.clientWidth;
  const count = currWidth / 300;
  sliceNum.value = count > 6 ? 6 : count;
}

function onLogoError(e) {
  if (e?.target && e.target.src !== defaultLogo) {
    e.target.src = defaultLogo;
  }
}

watch(
  () => route.name,
  (name) => {
    checkTag(name);
    localStorage.currentPageName = name;
  }
);

appStore.setOpenedList();

onMounted(() => {
  init();
  resize();
  window.addEventListener("resize", resize);
  appStore.setOpenedList();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", resize);
});
</script>
