<template>
  <div class="empty">
    <img  src="../../assets/empty.png" alt="">
    暂无数据
  </div>
</template>
<script>
export default {

}
</script>
<style lang="scss" scoped>
.empty{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  >img{
    margin-bottom: 10px;
  }
}
</style>
