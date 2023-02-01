<template>
  <div class="welcome-box">
    <div class="famous-box">
      <img src="~@/assets/image/chat.png" width="300" />
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  data () {
    return {}
  },
  created () { },
  methods: {},
}
</script>
<style lang="less" scoped>
.welcome-box {
  height: 100%;
  width: 100%;

  .famous-box {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100%;
    font-size: 24px;
    user-select: none;

    p {
      width: 100%;
      font-weight: 300;
      text-align: center;
      font-size: 15px;
      color: #b9b4b4;
      margin-top: -30px;
    }
  }
}
</style>
