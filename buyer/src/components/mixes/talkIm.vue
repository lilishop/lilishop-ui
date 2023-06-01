<template>
  <div></div>
</template>

<script>
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
    // 跳转im客服
    async IMService(id, goodsId, skuId) {

      // 获取访问Token
      let accessToken = Storage.getItem("accessToken");
      await this.getIMDetailMethods();
      const userInfo = await getMemberMsg();
      if (userInfo.success) {
        //携带商品Id,在IM可以发送商品信息
        if(goodsId && skuId){
          window.open(
            this.IMLink + "?token=" + accessToken + "&id=" + id || this.storeMsg.storeId + "&goodsId=" + goodsId + "&skuId=" + skuId
          );
        }else{
          window.open(
            this.IMLink + "?token=" + accessToken + "&id=" + id || this.storeMsg.storeId
          );
        }

      } else {
        this.$Message.error("请登录后再联系客服");
        return;
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
