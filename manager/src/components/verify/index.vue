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

<script>
import { Refresh, DArrowRight } from "@element-plus/icons-vue";
import { getVerifyImg, postVerifyImg } from "./verify.js";

export default {
  components: { Refresh, DArrowRight },
  props: {
    verifyType: {
      default: "LOGIN",
      type: String,
    },
  },
  data() {
    return {
      show: false,
      type: "LOGIN",
      data: {
        backImage: "",
        slidingImage: "",
        originalHeight: 150,
        originalWidth: 300,
        sliderWidth: 60,
        sliderHeight: 60,
      },
      distance: 0,
      flag: false,
      downX: 0,
      bgColor: "#04ad11",
      verifyText: "拖动滑块解锁",
    };
  },
  methods: {
    mouseDown(e) {
      this.downX = e.clientX;
      this.flag = true;
    },
    mouseMove(e) {
      if (this.flag) {
        const offset = e.clientX - this.downX;
        if (offset > this.data.originalWidth - 43) {
          this.distance = this.data.originalWidth - 43;
        } else if (offset < 0) {
          this.distance = 0;
        } else {
          this.distance = offset;
        }
      }
    },
    mouseUp() {
      if (!this.flag) return false;
      this.flag = false;
      const params = {
        verificationEnums: this.type,
        xPos: this.distance,
      };
      postVerifyImg(params)
        .then((res) => {
          if (res.success) {
            if (res.result) {
              this.bgColor = "green";
              this.verifyText = "解锁成功";
              this.$emit("change", { status: true, distance: this.distance });
            } else {
              this.bgColor = "red";
              this.verifyText = "解锁失败";
              setTimeout(() => this.init(), 1000);
              this.$emit("change", { status: false, distance: this.distance });
            }
          } else {
            this.init();
          }
        })
        .catch(() => {
          this.init();
        });
    },
    init() {
      this.flag = false;
      this.downX = 0;
      this.distance = 0;
      this.bgColor = "#04ad11";
      this.verifyText = "拖动滑块解锁";
      getVerifyImg(this.type).then((res) => {
        if (res.result) {
          this.data = res.result;
          this.show = true;
        } else {
          this.$Message.warning("请求失败请重试！");
        }
      });
    },
  },
  watch: {
    verifyType: {
      immediate: true,
      handler(v) {
        this.type = v;
      },
    },
  },
};
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
