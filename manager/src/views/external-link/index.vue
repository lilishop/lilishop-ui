<template>
  <div class="iframediv">
    <iframe :src="link" ref="ifram" scrolling="auto" id="ifram"></iframe>
  </div>
</template>

<script>
export default {
  name: "ExternalLink",
  data() {
    return {
      link: this.$router.currentRoute.name,
    };
  },
  mounted() {
    let iframe = document.getElementById("ifram");
    const deviceWidth = document.body.clientWidth;
    const deviceHeight = document.body.clientHeight;
    iframe.style.width = deviceWidth + "px";
    iframe.style.height = deviceHeight + "px";
  }
};
</script>
<style lang="scss" scoped>

</style>
