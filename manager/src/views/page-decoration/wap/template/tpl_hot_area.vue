<template>
  <div class="layout">
    <div class="hot-area">
      <!-- <img :src="res.list[0].img" alt="" /> -->
      <hotzone @change="changeHotzone" :zonesInit="res.list[0].zoneInfo" :image="res.list[0].img"></hotzone>
    </div>
  </div>
</template>
<script>
import hotzone from "@/components/hotzone";

export default {
  components: {
    hotzone,
  },
  props: ["res"],
  methods: {
    changeHotzone(info) {
      this.res.list[0].zoneInfo = info;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.hot-area {
  width: 100%;
  display: block;
  overflow: hidden;
  > img {
    width: 300px;
    height: 500px;
  }
}
</style>