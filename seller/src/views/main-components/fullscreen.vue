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

<script>
import { FullScreen, ScaleToOriginal } from "@element-plus/icons-vue";

export default {
  name: "fullScreen",
  components: { FullScreen, ScaleToOriginal },
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "input", "on-change"],
  computed: {
    showFullScreenBtn() {
      return window.navigator.userAgent.indexOf("MSIE") < 0;
    },
  },
  methods: {
    handleFullscreen() {
      const main = document.body;
      if (this.modelValue) {
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
    },
    handleChange() {
      this.handleFullscreen();
    },
    emitFullscreenState(isFullscreen) {
      this.$emit("update:modelValue", isFullscreen);
      this.$emit("input", isFullscreen);
      this.$emit("on-change", isFullscreen);
    },
    onFullscreenChange() {
      const isFullscreen = !!(
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.fullScreen ||
        document.mozFullScreen ||
        document.webkitIsFullScreen
      );
      this.emitFullscreenState(isFullscreen);
    },
  },
  created() {
    const isFullscreen = !!(
      document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement ||
      document.fullScreen ||
      document.mozFullScreen ||
      document.webkitIsFullScreen
    );
    this.emitFullscreenState(isFullscreen);
    document.addEventListener("fullscreenchange", this.onFullscreenChange);
    document.addEventListener("mozfullscreenchange", this.onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", this.onFullscreenChange);
    document.addEventListener("msfullscreenchange", this.onFullscreenChange);
  },
  beforeUnmount() {
    document.removeEventListener("fullscreenchange", this.onFullscreenChange);
    document.removeEventListener("mozfullscreenchange", this.onFullscreenChange);
    document.removeEventListener("webkitfullscreenchange", this.onFullscreenChange);
    document.removeEventListener("msfullscreenchange", this.onFullscreenChange);
  },
};
</script>
