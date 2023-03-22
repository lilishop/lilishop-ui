<template>
    <div class="line flex flex-a-c flex-j-sb">
        <div class="column" v-for="(item,index) in data.options.list" :key="index">
          <img  :src="item.img" class="three-column-img">
        </div>
    </div>
</template>

<script>
export default {
  name: "oneRowThreeColumns",
  props: {
    data: {
      type: Object,
      default: {}
    }
  },
  data () {
    return {

    };
  },
  methods: {}
}
</script>

<style scoped lang="scss">
.column{
  width: 385px;
  height: 165px;
  >img{
    width: 100%;
    height: 100%;
  }
}
</style>
