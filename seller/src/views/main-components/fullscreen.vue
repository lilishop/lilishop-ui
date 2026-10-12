<template>
  <div v-if="showFullScreenBtn" @click="handleChange" class="full-screen-btn-con">
    <el-tooltip :content="modelValue ? '退出全屏' : '全屏'" placement="bottom">
      <el-icon :size="24">
        <ScaleToOriginal v-if="modelValue" />
        <FullScreen v-else />
      </el-icon>
    </el-tooltip>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount } from "vue";
import { FullScreen, ScaleToOriginal } from "@element-plus/icons-vue";

defineOptions({ name: "fullScreen" });

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  value: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["update:modelValue", "input", "on-change"]);

const showFullScreenBtn = computed(() => {
  return window.navigator.userAgent.indexOf("MSIE") < 0;
});

function handleFullscreen() {
  const main = document.body;
  if (props.modelValue) {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  } else {
    if (main.requestFullscreen) {
      main.requestFullscreen();
    } else if (main.mozRequestFullScreen) {
      main.mozRequestFullScreen();
    } else if (main.webkitRequestFullScreen) {
      main.webkitRequestFullScreen();
    } else if (main.msRequestFullscreen) {
      main.msRequestFullscreen();
    }
  }
}
function handleChange() {
  handleFullscreen();
}
function emitFullscreenState(isFullscreen) {
  emit("update:modelValue", isFullscreen);
  emit("input", isFullscreen);
  emit("on-change", isFullscreen);
}
function onFullscreenChange() {
  const isFullscreen = !!(
    document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement ||
    document.fullScreen ||
    document.mozFullScreen ||
    document.webkitIsFullScreen
  );
  emitFullscreenState(isFullscreen);
}

const isFullscreen = !!(
  document.fullscreenElement ||
  document.mozFullScreenElement ||
  document.webkitFullscreenElement ||
  document.fullScreen ||
  document.mozFullScreen ||
  document.webkitIsFullScreen
);
emitFullscreenState(isFullscreen);
document.addEventListener("fullscreenchange", onFullscreenChange);
document.addEventListener("mozfullscreenchange", onFullscreenChange);
document.addEventListener("webkitfullscreenchange", onFullscreenChange);
document.addEventListener("msfullscreenchange", onFullscreenChange);

onBeforeUnmount(() => {
  document.removeEventListener("fullscreenchange", onFullscreenChange);
  document.removeEventListener("mozfullscreenchange", onFullscreenChange);
  document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
  document.removeEventListener("msfullscreenchange", onFullscreenChange);
});
</script>
