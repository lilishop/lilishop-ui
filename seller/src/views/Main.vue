<style lang="scss">
@import "./main.scss";
</style>

<template>
  <div class="main" :class="{ 'menu-collapsed': !showSubMenu }">
    <div class="sidebar-menu-con menu-bar">
      <div class="logo-con">
        <img :src="storeSideLogo" key="max-logo" />
      </div>
      <shrinkable-menu />
    </div>
    <div class="main-header-con" :style="{ height: setting.isUseTabsRouter ? '106px' : '60px' }">
      <div class="main-header">
        <div class="header-avator-con">
          <div></div>
          <div class="user-dropdown-menu-con">
            <el-row
              justify="end"
              align="middle"
              class="user-dropdown-innercon"
            >
              <store-qrcode />
              <ul class="nav-list">
                <li class="nav-item" @click="im">
                  <el-tooltip content="联系客服" placement="bottom">
                    <el-button type="warning" size="small" :loading="load">
                      <el-icon><ChatDotRound /></el-icon>
                      客服
                    </el-button>
                  </el-tooltip>
                </li>
                <li class="nav-item" @click="handleClickSetting">
                  <el-tooltip content="设置" placement="bottom">
                    <el-icon :size="16"><Setting /></el-icon>
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
    <configDrawer ref="configRef" />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ChatDotRound, Setting, UserFilled } from "@element-plus/icons-vue";
import shrinkableMenu from "./main-components/shrinkable-menu/shrinkable-menu.vue";
import tagsPageOpened from "./main-components/tags-page-opened.vue";
import circleLoading from "@/views/my-components/lili/circle-loading.vue";
import configDrawer from "@/views/main-components/config-drawer.vue";
import storeQrcode from "@/views/main-components/store-qrcode.vue";
import Cookies from "js-cookie";
import util from "@/libs/util.js";
import { logout } from "@/api/index";
import { getIMDetail } from "@/api/common";
import { userMsg } from "@/api/index";
import { Message } from "@/utils/message";
import { getStore, setStore } from "@/libs/storage";
import { useAppStore } from "@/stores/app";
import { useUserStore } from "@/stores/user";
import { useSettingStore } from "@/stores/setting";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const userStore = useUserStore();
const settingStore = useSettingStore();

const configRef = ref(null);
const sliceNum = ref(5);
const userInfo = ref({});
const storeSideLogo = ref("");
const IMLink = ref("");
const load = ref(false);

const setting = computed(() => settingStore.setting);
const loading = computed(() => appStore.loading);
const pageTagsList = computed(() => appStore.storeOpenedList);
const showSubMenu = computed(() => appStore.menuList.length > 0);
const lang = computed(() => appStore.lang);

function handleClickSetting() {
  configRef.value.open();
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

function init() {
  const pathArr = util.setCurrentPath(route.name);
  if (pathArr.length >= 2) {
    appStore.addOpenSubmenu(pathArr[1].name);
  }
  storeSideLogo.value = localStorage.getItem("sellerlogoImg");
  window.document.title = localStorage.getItem("sellersiteName");
  const link =
    document.querySelector("link[rel*='icon']") ||
    document.createElement("link");
  link.type = "image/x-icon";
  link.href = localStorage.getItem("sellerIconImg");
  link.rel = "shortcut icon";
  document.getElementsByTagName("head")[0].appendChild(link);

  userInfo.value = JSON.parse(Cookies.get("userInfoSeller"));
  checkTag(route.name);

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
  }
);

watch(lang, () => {
  util.setCurrentPath(route.name);
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
