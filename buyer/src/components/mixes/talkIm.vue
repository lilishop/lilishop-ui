<template>
  <div></div>
</template>

<script>
import { Modal } from "@/utils/message";
import { getIMDetail } from "@/api/common";
import Storage from "@/plugins/storage";
import { getMemberMsg } from "@/api/login";
export default {
  data() {
    return {
      Storage,
      IMLink: "",
    };
  },
  methods: {
    promptLogin() {
      Modal.confirm({
        title: "温馨提示",
        content: "请登录后执行此操作",
        okText: "立即登录",
        cancelText: "取消",
        onOk: () => {
          this.$router.push({
            path: "/login",
            query: {
              rePath: this.$route.path,
              query: JSON.stringify(this.$route.query || {}),
            },
          });
        },
      });
    },
    // 跳转im客服
    async IMService(id, goodsId, skuId) {
      if (!Storage.getItem("accessToken")) {
        this.promptLogin();
        return;
      }

      try {
        await this.getIMDetailMethods();
        const userInfo = await getMemberMsg();
        if (!userInfo.success) {
          this.promptLogin();
          return;
        }

        const accessToken = Storage.getItem("accessToken");
        const storeId = id || this.storeMsg?.storeId;
        const baseUrl = `${this.IMLink}?token=${accessToken}&id=${storeId}`;

        if (goodsId && skuId) {
          window.open(`${baseUrl}&goodsId=${goodsId}&skuId=${skuId}`);
        } else {
          window.open(baseUrl);
        }
      } catch {
        // token 过期等场景由 request 拦截器处理；未登录时避免未捕获异常
        if (!Storage.getItem("accessToken")) {
          this.promptLogin();
        }
      }
    },
    // 获取im信息
    async getIMDetailMethods() {
      let res = await getIMDetail();
      if (res.success) {
        this.IMLink = res.result;
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
