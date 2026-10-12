<template>
  <div>
    <div class="abs-module" v-show="isShow">
      <div class="abs-box">
        <legacy-el-icon name="el-icon-circle-close" @click="close" />
        <a href="https://www.aliyun.com/minisite/goods?userCode=kqyyppx2">
          <img src="~@/assets/image/aliyun-abs.jpg" width="300" />
        </a>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";

const isShow = ref(false);

const getNum = () => {
  return parseInt(sessionStorage.getItem("ABS_BOX")) || 0;
};

const close = () => {
  sessionStorage.setItem("ABS_BOX", getNum() + 1);
  isShow.value = false;
};

if (getNum() <= 2) {
  setTimeout(() => {
    isShow.value = true;
  }, 1000 * 60 * 2);
}
</script>
<style lang="less" scoped>
.abs-module {
  position: fixed;
  width: 300px;
  height: 163.63px;
  right: 20px;
  top: 20px;
  border-radius: 5px;
  z-index: 9999;
  overflow: hidden;
  transition: all 2s;
  animation: absfade 1000ms infinite;

  .abs-box {
    width: 100%;
    height: 100%;
    position: relative;

    i {
      position: absolute;
      right: 10px;
      top: 10px;
      color: white;
      cursor: pointer;
      font-size: 22px;
    }
  }
}

@keyframes absfade {
  from {
    transform: scale(1);
  }

  50% {
    transform: scale(1.02);
  }

  to {
    transform: scale(1);
  }
}
</style>
