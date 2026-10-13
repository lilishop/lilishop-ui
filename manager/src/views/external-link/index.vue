<template>
  <div class="iframediv">
    <iframe :src="link" ref="ifram" scrolling="auto" id="ifram"></iframe>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

defineOptions({ name: "ExternalLink" });

const router = useRouter();

const link = ref(router.currentRoute.name);

onMounted(() => {
  let iframe = document.getElementById("ifram");
  const deviceWidth = document.body.clientWidth;
  const deviceHeight = document.body.clientHeight;
  iframe.style.width = deviceWidth + "px";
  iframe.style.height = deviceHeight + "px";
});
</script>
<style lang="scss" scoped>

</style>
