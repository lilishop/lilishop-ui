<template>
  <!-- 头部广告 -->
  <div class="advertising" v-if="show && data" :style="{'background-color': data.bgColor}">
    <img :src="data.img" class="hover-pointer" @click="linkTo(data.url)"/>
    <el-icon :size="20" @click="show = false"><CircleClose /></el-icon>
  </div>
</template>
<script>
import { CircleClose } from '@element-plus/icons-vue';
export default {
  components: { CircleClose },
  props: {
    data: { // 传入的广告信息
      type: Object,
      default: null
    }
  },
  data () {
    return {
      show: true // 是否显示头部广告
    }
  }
};
</script>
<style scoped lang="scss">
.advertising {
  height: 80px;
  width: 100%;

  text-align: center;
  overflow: hidden;
  position: relative;
  > img {
    width: 1200px;
    height: 100%;
  }
  *:nth-child(2){
    position: relative;
    right: 36px;
    top: -57px;
    cursor: pointer;
  }
}
</style>
