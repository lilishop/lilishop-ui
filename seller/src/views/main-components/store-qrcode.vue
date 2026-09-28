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

<script>
import Cookies from "js-cookie";
import vueQr from "vue-qr";
import { getStoreMpQrcode } from "@/api/index";
import { getBaseSite } from "@/api/common.js";

export default {
  name: "store-qrcode",
  components: { "vue-qr": vueQr },
  data() {
    return {
      visible: false,
      storeId: "",
      wapUrl: "",
      pcUrlBase: "",
      mpQrcode: "",
      mpError: "",
      mpLoaded: false,
    };
  },
  computed: {
    h5Url() {
      if (!this.storeId || !this.wapUrl) return "";
      return this.joinUrl(this.wapUrl, `/pages/product/shopPage?id=${this.storeId}`);
    },
    pcUrl() {
      if (!this.storeId || !this.pcUrlBase) return "";
      return this.joinUrl(this.pcUrlBase, `/merchant?id=${this.storeId}`);
    },
    mpQrSrc() {
      if (!this.mpQrcode) return "";
      const mime = String(this.mpQrcode).startsWith("/9j/")
        ? "image/jpeg"
        : "image/png";
      return `data:${mime};base64,${this.mpQrcode}`;
    },
  },
  methods: {
    joinUrl(base, path) {
      return String(base || "").replace(/\/$/, "") + path;
    },
    parseSettingValue(raw) {
      if (!raw) return {};
      if (typeof raw === "object") return raw;
      try {
        return JSON.parse(raw);
      } catch (e) {
        return {};
      }
    },
    initStore() {
      try {
        const userInfo = JSON.parse(Cookies.get("userInfoSeller") || "{}") || {};
        this.storeId = userInfo.id || userInfo.storeId || "";
      } catch (e) {
        this.storeId = "";
      }
    },
    open() {
      this.initStore();
      this.visible = true;
    },
    loadCodes() {
      this.initStore();
      getBaseSite()
        .then((res) => {
          const data = this.parseSettingValue(res && res.result && res.result.settingValue);
          const fallback = typeof window !== "undefined" ? window.BASE || {} : {};
          // wap/站点地址常配官网，H5、PC 店铺页用买家端域名
          this.wapUrl = fallback.WAP_URL || data.staticPageWapAddress || "";
          this.pcUrlBase = fallback.PC_URL || data.staticPageAddress || "";
        })
        .catch(() => {
          const fallback = typeof window !== "undefined" ? window.BASE || {} : {};
          this.wapUrl = fallback.WAP_URL || "";
          this.pcUrlBase = fallback.PC_URL || "";
        });
      this.loadMpQrcode();
    },
    loadMpQrcode() {
      if (!this.storeId || this.mpLoaded) return;
      this.mpError = "";
      getStoreMpQrcode()
        .then((res) => {
          if (res && res.success && res.result) {
            if (String(res.result).startsWith("eyJ")) {
              this.mpError = "请先配置微信小程序";
              return;
            }
            this.mpQrcode = res.result;
            this.mpLoaded = true;
            this.mpError = "";
          } else {
            this.mpError = "请先配置微信小程序";
          }
        })
        .catch(() => {
          this.mpError = "请先配置微信小程序";
        });
    },
    copyText(text) {
      if (!text) return;
      const ok = () => this.$Message.success("复制成功");
      const fail = () => this.$Message.error("复制失败");
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
    },
  },
};
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
