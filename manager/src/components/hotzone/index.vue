<template>
  <Modal
    :styles="{ top: '120px' }"
    width="800"
    @on-cancel="clickClose"
    @on-ok="clickOK"
    v-model="flag"
    :mask-closable="false"
    title="绘制热区"
    scrollable
  >
    <template v-if="flag">
      <hotzone
        ref="hotzone"
        @change="changeHotzone"
        :zonesInit="res.zoneInfo"
        :image="res.img"
      ></hotzone>
    </template>
  </Modal>
</template>
<script>
import hotzone from "./components/Hotzone.vue";

export default {
  components: {
    hotzone,
  },
  data() {
    return {
      flag: false, // modal显隐
    };
  },
  props: ["res"],
  mounted() {},
  methods: {
    changeHotzone(info) {
      this.$emit("changeZone", info);
    },
    // 关闭弹窗
    clickClose() {
      this.$emit("closeFlag", false);
    },
    // 点击确认
    clickOK() {
      this.clickClose();
    },
    // 打开组件方法
    open(type, mutiple) {
      this.flag = true;
    },
    // 关闭组件
    close() {
      this.flag = false;
    },
  },
};
</script>
<style scoped lang="scss">
/deep/ .ivu-modal {
  overflow: hidden;
  height: 650px !important;
}
/deep/ .ivu-modal-body {
  width: 100%;
  height: 500px;
  overflow: hidden;
}
</style>
