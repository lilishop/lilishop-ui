<template>
  <el-dialog
    v-model="flag"
    width="800px"
    :close-on-click-modal="false"
    title="绘制热区"
    top="120px"
    destroy-on-close
    @close="clickClose"
  >
    <template v-if="flag">
      <hotzone
        ref="hotzone"
        @change="changeHotzone"
        :zonesInit="res.zoneInfo"
        :image="res.img"
      ></hotzone>
    </template>
    <template #footer>
      <el-button @click="clickClose">取消</el-button>
      <el-button type="primary" @click="clickOK">确定</el-button>
    </template>
  </el-dialog>
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
:deep(.el-dialog) {
  overflow: hidden;
  height: 650px !important;
}
:deep(.el-dialog__body) {
  width: 100%;
  height: 500px;
  overflow: hidden;
}
</style>
