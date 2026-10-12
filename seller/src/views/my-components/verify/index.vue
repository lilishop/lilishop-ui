<template>
  <div
    class="verify-content"
    v-if="show"
    @mousemove="mouseMove"
    @mouseup="mouseUp"
    @click.stop
  >
    <div
      class="imgBox"
      :style="{
        width: data.originalWidth + 'px',
        height: data.originalHeight + 'px',
      }"
    >
      <img :src="data.backImage" style="width: 100%; height: 100%" alt="" />
      <img
        class="slider"
        :src="data.slidingImage"
        :style="{ left: distance + 'px', top: data.randomY + 'px' }"
        :width="data.sliderWidth"
        :height="data.sliderHeight"
        alt=""
      />
      <el-icon class="refresh" @click="init"><Refresh /></el-icon>
    </div>
    <div class="handle" :style="{ width: data.originalWidth + 'px' }">
      <span
        class="bgcolor"
        :style="{ width: distance + 'px', background: bgColor }"
      ></span>
      <span class="swiper" :style="{ left: distance + 'px' }" @mousedown="mouseDown">
        <el-icon><DArrowRight /></el-icon>
      </span>
      <span class="text">{{ verifyText }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { Refresh, DArrowRight } from "@element-plus/icons-vue";
import { getVerifyImg, postVerifyImg } from "./verify.js";
import { Message } from "@/utils/message";

const props = defineProps({
  verifyType: {
    default: "LOGIN",
    type: String,
  },
});
const emit = defineEmits(["change"]);

const show = ref(false);
const type = ref("LOGIN");
const data = ref({
  backImage: "",
  slidingImage: "",
  originalHeight: 150,
  originalWidth: 300,
  sliderWidth: 60,
  sliderHeight: 60,
});
const distance = ref(0);
const flag = ref(false);
const downX = ref(0);
const bgColor = ref("#04ad11");
const verifyText = ref("拖动滑块解锁");

watch(
  () => props.verifyType,
  (v) => {
    type.value = v;
  },
  { immediate: true }
);

function mouseDown(e) {
  downX.value = e.clientX;
  flag.value = true;
}
function mouseMove(e) {
  if (flag.value) {
    const offset = e.clientX - downX.value;
    if (offset > data.value.originalWidth - 43) {
      distance.value = data.value.originalWidth - 43;
    } else if (offset < 0) {
      distance.value = 0;
    } else {
      distance.value = offset;
    }
  }
}
function mouseUp() {
  if (!flag.value) return false;
  flag.value = false;
  const params = {
    verificationEnums: type.value,
    xPos: distance.value,
  };
  postVerifyImg(params)
    .then((res) => {
      if (res.success) {
        if (res.result) {
          bgColor.value = "green";
          verifyText.value = "解锁成功";
          emit("change", { status: true, distance: distance.value });
        } else {
          bgColor.value = "red";
          verifyText.value = "解锁失败";
          setTimeout(() => init(), 1000);
          emit("change", { status: false, distance: distance.value });
        }
      } else {
        init();
      }
    })
    .catch(() => {
      init();
    });
}
function init() {
  flag.value = false;
  downX.value = 0;
  distance.value = 0;
  bgColor.value = "#04ad11";
  verifyText.value = "拖动滑块解锁";
  getVerifyImg(type.value)
    .then((res) => {
      if (res.result) {
        data.value = res.result;
        show.value = true;
      } else {
        Message.warning("请求失败请重试！");
      }
    })
    .catch(() => {
      Message.warning("验证码加载失败，请点击重试");
    });
}

// login.vue / ForgetPassword.vue 通过 verifyRef.value.show = false 关闭、verifyRef.value.init() 打开
defineExpose({ show, init });
</script>

<style lang="scss" scoped>
.verify-content {
  padding: 10px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 5px;
  box-shadow: 1px 1px 3px #999;
}
.imgBox {
  width: 300px;
  height: 150px;
  position: relative;
  overflow: hidden;

  .slider {
    position: absolute;
    cursor: pointer;
  }

  .refresh {
    position: absolute;
    right: 5px;
    top: 5px;
    font-size: 20px;
    color: #fff;
    cursor: pointer;
  }
}
.handle {
  border: 1px solid #e4dede;
  margin-top: 5px;
  height: 42px;
  background: #ddd;
  position: relative;

  .bgcolor {
    position: absolute;
    top: 0;
    left: 0;
    width: 40px;
    height: 40px;
    opacity: 0.5;
    background: #04ad11;
  }

  .swiper {
    position: absolute;
    width: 40px;
    height: 40px;
    background-color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }

  .text {
    display: inline-block;
    width: inherit;
    text-align: center;
    line-height: 42px;
    font-size: 14px;
    user-select: none;
  }
}
</style>
