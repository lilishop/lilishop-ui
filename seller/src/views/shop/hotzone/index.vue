<template>
  <el-dialog
    v-model="flag"
    title="绘制热区"
    width="800px"
    top="8vh"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
    @close="clickClose"
  >
    <template v-if="flag && hotzoneRes">
      <hotzone
        ref="hotzone"
        :zonesInit="hotzoneRes.zoneInfo"
        :image="hotzoneRes.img"
        @change="changeHotzone"
      />
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
      flag: false,
      hotzoneRes: null,
    };
  },
  methods: {
    changeHotzone(info) {
      if (this.hotzoneRes) {
        this.hotzoneRes.zoneInfo = info;
      }
      this.$emit("changeZone", info);
    },
    clickClose() {
      this.flag = false;
      this.hotzoneRes = null;
      this.$emit("closeFlag", false);
    },
    clickOK() {
      this.clickClose();
    },
    open(val) {
      this.hotzoneRes = val || null;
      if (this.hotzoneRes && !this.hotzoneRes.zoneInfo) {
        this.hotzoneRes.zoneInfo = [];
      }
      this.flag = true;
    },
    close() {
      this.flag = false;
      this.hotzoneRes = null;
    },
  },
};
</script>
<style scoped lang="scss">
:deep(.el-dialog__body) {
  overflow: hidden;
  height: 500px;
}
</style>
