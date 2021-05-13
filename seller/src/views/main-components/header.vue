<template>
  <div>
    <Row class="header">
      <img src="../../assets/lili.png" class="logo" width="220px">

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
  align-items: center;
  display: flex;
  justify-content: center !important;
}
.logo {
  transform: scale(3);
}
</style>
