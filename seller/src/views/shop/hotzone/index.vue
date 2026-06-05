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
    <template v-if="flag">
      <hotzone
        ref="hotzone"
        :zonesInit="res.zoneInfo"
        :image="res.img"
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
    };
  },
  props: ["res"],
  methods: {
    changeHotzone(info) {
      this.$emit("changeZone", info);
    },
    clickClose() {
      this.flag = false;
      this.$emit("closeFlag", false);
    },
    clickOK() {
      this.clickClose();
    },
    open() {
      this.flag = true;
    },
    close() {
      this.flag = false;
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
