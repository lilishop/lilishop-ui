<template>
  <el-dialog
    v-model="flag"
    :width="width"
    :close-on-click-modal="false"
    title="绘制热区"
    top="120px"
    destroy-on-close
    @close="clickClose"
  >
    <template v-if="flag && hotzoneRes">
      <hotzone
        ref="hotzoneRef"
        @change="changeHotzone"
        :zonesInit="hotzoneRes.zoneInfo"
        :image="hotzoneRes.img"
      ></hotzone>
    </template>
    <template #footer>
      <el-button @click="clickClose">取消</el-button>
      <el-button type="primary" @click="clickOK">确定</el-button>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref } from "vue";
import hotzone from "./components/Hotzone.vue";

const props = defineProps({
  width: {
    type: String,
    default: "800px",
  },
});

const emit = defineEmits(["changeZone", "closeFlag"]);

const flag = ref(false);
const hotzoneRes = ref(null);

// hotzoneRef：模板 ref 与组件 import 同名，改名避免互相覆盖
const hotzoneRef = ref(null);

function changeHotzone(info) {
  if (hotzoneRes.value) {
    hotzoneRes.value.zoneInfo = info;
  }
  emit("changeZone", info);
}

function clickClose() {
  flag.value = false;
  hotzoneRes.value = null;
  emit("closeFlag", false);
}

function clickOK() {
  clickClose();
}

function open(val) {
  hotzoneRes.value = val || null;
  if (hotzoneRes.value && !hotzoneRes.value.zoneInfo) {
    hotzoneRes.value.zoneInfo = [];
  }
  flag.value = true;
}

function close() {
  flag.value = false;
  hotzoneRes.value = null;
}

// decorate.vue 通过 hotzoneRef.value.open(val) 调用
defineExpose({ open, close });
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
