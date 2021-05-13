<template>
  <div>
    <Row class="header">
      <img src="../../assets/logo.png" class="logo" width="220px">
      <!-- <div class="description">{{ $t('LILISHOP-ADMIN') }}</div> -->
    </Row>
  </div>
</template>

<script>
export default {
  name: "header",
};
</script>

<style lang="scss" scoped>
.header {

  margin-bottom: 6vh;
  text-align: center;
  display: flex;
  justify-content: center !important;
}
.logo {
  transform: scale(2);
}
</style>
