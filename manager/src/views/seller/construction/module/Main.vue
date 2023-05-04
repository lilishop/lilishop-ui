<template>
  <div class="wrapper flex">
    <Card
      style="width: 320px; margin: 20px"
      v-for="(item, index) in mainWay"
      :key="index"
    >
      <div class="main-box">
        <h3>{{ item.title }}</h3>
        <div class="desc">{{ item.desc }}</div>
        <Button type="default" @click="handleClick(item)">选择</Button>
      </div>
    </Card>
  </div>
</template>

<script>

export default {
  data() {
    return {

    };
  },
  computed:{
    mainWay(){
      return this.$store.state.app.weChatApplyList
    }
  },
  mounted() {},
  methods: {
    //点击选择主体
    handleClick(val) {

      this.$emit('callback',val.value)
    },
  },
};
</script>

<style lang="scss" scoped>
.wrapper {
  padding: 32px;
  flex-wrap: wrap;
}
.main-box {
  cursor: pointer;
  text-align: center;
  > h3,
  div {
    margin-bottom: 10px;
  }
}
</style>
