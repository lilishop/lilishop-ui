<template>
  <div class="verify-content" v-if="show" @mousemove="mouseMove" @mouseup="mouseUp" @click.stop>
    <div class="imgBox" :style="{width:data.originalWidth+'px',height:data.originalHeight + 'px'}">
      <img :src="data.backImage" style="width:100%;height:100%" alt="">
      <img class="slider" :src="data.slidingImage" :style="{left:distance+'px',top:data.randomY+'px'}" :width="data.sliderWidth" :height="data.sliderHeight" alt="">
      <el-icon class="refresh" @click="init"><Refresh /></el-icon>
    </div>
    <div class="handle" :style="{width:data.originalWidth+'px'}">
      <span class="bgcolor" :style="{width:distance + 'px',background:bgColor}"></span>
      <span class="swiper" :style="{left:distance + 'px'}" @mousedown="mouseDown">
        <el-icon><ArrowRight /></el-icon>
      </span>
      <span class="text">{{verifyText}}</span>
    </div>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue';
import { Message } from "@/utils/message";
import { Refresh, ArrowRight } from '@element-plus/icons-vue';
import { getVerifyImg, postVerifyImg } from './verify.js';

const props = defineProps({
  // 传入数据，判断是登录、注册、修改密码
  verifyType: {
    defalut: 'LOGIN',
    type: String
  }
});

const emit = defineEmits(['change']);

const show = ref(false); // 验证码显隐
const type = ref('LOGIN'); // 请求类型
const data = ref({ // 验证码数据
  backImage: '',
  slidingImage: '',
  originalHeight: 150,
  originalWidth: 300,
  sliderWidth: 60,
  sliderHeight: 60
});
const distance = ref(0); // 拼图移动距离
const flag = ref(false); // 判断滑块是否按下
const downX = ref(0); // 鼠标按下位置
const bgColor = ref('#04ad11'); // 滑动背景颜色
const verifyText = ref('拖动滑块解锁'); // 文字提示

// 鼠标按下事件，开始拖动滑块
function mouseDown (e) {
  downX.value = e.clientX;
  flag.value = true;
}
// 鼠标移动事件，计算距离
function mouseMove (e) {
  if (flag.value) {
    let offset = e.clientX - downX.value;

    if (offset > data.value.originalWidth - 43) {
      distance.value = data.value.originalWidth - 43;
    } else if (offset < 0) {
      distance.value = 0;
    } else {
      distance.value = offset;
    }
  }
}
// 鼠标抬起事件，验证是否正确
function mouseUp () {
  if (!flag.value) return false;
  flag.value = false;
  let params = {
    verificationEnums: type.value,
    xPos: distance.value
  };
  postVerifyImg(params).then(res => {
    if (res.success) {
      if (res.result) {
        bgColor.value = 'green';
        verifyText.value = '解锁成功';
        emit('change', { status: true, distance: distance.value });
      } else {
        bgColor.value = 'red';
        verifyText.value = '解锁失败';
        setTimeout(() => {
          init();
        }, 1000);
        emit('change', { status: false, distance: distance.value });
      }
    } else {
      init()
    }

  }).catch(()=>{
    init()
  });
}
function close () {
  show.value = false;
}
function init () { // 初始化数据
  flag.value = false;
  downX.value = 0;
  distance.value = 0;
  bgColor.value = '#04ad11';
  verifyText.value = '拖动滑块解锁';
  getVerifyImg(type.value).then(res => {
    if (res.result) {
      data.value = res.result;
      show.value = true;
    } else {
      Message.warning('请求失败请重试！')
    }
  });
}

// 父组件通过 ref 调用 init/close
defineExpose({ init, close });

watch(() => props.verifyType, (v) => {
  type.value = v;
}, { immediate: true });
</script>
<style lang="scss" scoped>
.verify-content{
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
    .el-icon {
      font-size: 20px;
    }
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
