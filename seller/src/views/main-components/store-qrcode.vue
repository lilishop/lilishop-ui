<template>
  <div class="store-qr-entry">
    <el-button size="small" @click="open">店铺二维码</el-button>
    <el-dialog
      v-model="visible"
      title="店铺二维码"
      width="720px"
      append-to-body
      destroy-on-close
      @opened="loadCodes"
    >
      <div class="store-qr-dialog">
        <div class="store-qr-col">
          <vue-qr
            v-if="h5Url"
            :text="h5Url"
            :margin="0"
            color-dark="#000"
            color-light="#fff"
            :size="180"
          />
          <div v-else class="store-qr-tip">请先在系统设置中填写 wap 站点地址</div>
          <div class="store-qr-title">H5 二维码</div>
        </div>
        <div class="store-qr-col">
          <img v-if="mpQrSrc" class="store-qr-img" :src="mpQrSrc" alt="小程序葵花码" />
          <div v-else class="store-qr-tip">{{ mpError || "小程序码生成中..." }}</div>
          <div class="store-qr-title">小程序葵花码</div>
        </div>
        <div class="store-qr-col">
          <el-button type="primary" :disabled="!pcUrl" @click="copyText(pcUrl)">复制链接</el-button>
          <div class="store-qr-title">PC 店铺首页</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import Cookies from "js-cookie";
import vueQr from "vue-qr";
import { getStoreMpQrcode } from "@/api/index";
import { getBaseSite } from "@/api/common.js";
import { Message } from "@/utils/message";

defineOptions({ name: "store-qrcode" });

const visible = ref(false);
const storeId = ref("");
const wapUrl = ref("");
const pcUrlBase = ref("");
const mpQrcode = ref("");
const mpError = ref("");
const mpLoaded = ref(false);

const h5Url = computed(() => {
  if (!storeId.value || !wapUrl.value) return "";
  return joinUrl(wapUrl.value, `/pages/product/shopPage?id=${storeId.value}`);
});
const pcUrl = computed(() => {
  if (!storeId.value || !pcUrlBase.value) return "";
  return joinUrl(pcUrlBase.value, `/merchant?id=${storeId.value}`);
});
const mpQrSrc = computed(() => {
  if (!mpQrcode.value) return "";
  const mime = String(mpQrcode.value).startsWith("/9j/")
    ? "image/jpeg"
    : "image/png";
  return `data:${mime};base64,${mpQrcode.value}`;
});

function joinUrl(base, path) {
  return String(base || "").replace(/\/$/, "") + path;
}
function parseSettingValue(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}
function initStore() {
  try {
    const userInfo = JSON.parse(Cookies.get("userInfoSeller") || "{}") || {};
    storeId.value = userInfo.id || userInfo.storeId || "";
  } catch (e) {
    storeId.value = "";
  }
}
function open() {
  initStore();
  visible.value = true;
}
function loadCodes() {
  initStore();
  getBaseSite()
    .then((res) => {
      const data = parseSettingValue(res && res.result && res.result.settingValue);
      const fallback = typeof window !== "undefined" ? window.BASE || {} : {};
      // wap/站点地址常配官网，H5、PC 店铺页用买家端域名
      wapUrl.value = fallback.WAP_URL || data.staticPageWapAddress || "";
      pcUrlBase.value = fallback.PC_URL || data.staticPageAddress || "";
    })
    .catch(() => {
      const fallback = typeof window !== "undefined" ? window.BASE || {} : {};
      wapUrl.value = fallback.WAP_URL || "";
      pcUrlBase.value = fallback.PC_URL || "";
    });
  loadMpQrcode();
}
function loadMpQrcode() {
  if (!storeId.value || mpLoaded.value) return;
  mpError.value = "";
  getStoreMpQrcode()
    .then((res) => {
      if (res && res.success && res.result) {
        if (String(res.result).startsWith("eyJ")) {
          mpError.value = "请先配置微信小程序";
          return;
        }
        mpQrcode.value = res.result;
        mpLoaded.value = true;
        mpError.value = "";
      } else {
        mpError.value = "请先配置微信小程序";
      }
    })
    .catch(() => {
      mpError.value = "请先配置微信小程序";
    });
}
function copyText(text) {
  if (!text) return;
  const ok = () => Message.success("复制成功");
  const fail = () => Message.error("复制失败");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(ok).catch(fail);
    return;
  }
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
    ok();
  } catch (e) {
    fail();
  }
  document.body.removeChild(textArea);
}

// 外部无 ref/$refs/$parent 访问（仅 Main.vue 以 <store-qrcode /> 使用），无需暴露成员
defineExpose({});
</script>

<style scoped lang="scss">
.store-qr-entry {
  margin-right: 10px;
}
.store-qr-dialog {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 8px 16px;
}
.store-qr-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  gap: 12px;
}
.store-qr-img {
  width: 180px;
  height: 180px;
  display: block;
}
.store-qr-title {
  font-size: 14px;
  color: #333;
}
.store-qr-tip {
  width: 180px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 13px;
  color: #999;
  line-height: 1.5;
}
</style>
