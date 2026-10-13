<template>
  <div class="goods-thumb" ref="rootEl" :class="{ 'is-loaded': loaded, 'is-error': error }">
    <img v-if="currentSrc" :src="currentSrc" :alt="alt" @load="loaded = true" @error="onError" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

defineOptions({ name: "GoodsThumb" });

const props = defineProps({
  src: {
    type: String,
    default: "",
  },
  alt: {
    type: String,
    default: "",
  },
});

const rootEl = ref(null);
const currentSrc = ref("");
const loaded = ref(false);
const error = ref(false);
let observer = null;

watch(
  () => props.src,
  () => {
    observe();
  }
);

function disconnect() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

function observe() {
  disconnect();
  currentSrc.value = "";
  loaded.value = false;
  error.value = false;
  if (!props.src) {
    error.value = true;
    return;
  }
  if (typeof IntersectionObserver === "undefined") {
    currentSrc.value = props.src;
    return;
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      currentSrc.value = props.src;
      disconnect();
    },
    { rootMargin: "160px 0px" }
  );
  observer.observe(rootEl.value);
}

function onError() {
  error.value = true;
  loaded.value = false;
  currentSrc.value = "";
}

onMounted(() => {
  observe();
});

onBeforeUnmount(() => {
  disconnect();
});
</script>

<style scoped lang="scss">
.goods-thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f3f3f3;
}

.goods-thumb::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #f3f3f3 25%, #e8e8e8 37%, #f3f3f3 63%);
  background-size: 400% 100%;
  animation: goods-thumb-loading 1.2s ease infinite;
}

.goods-thumb.is-loaded::before,
.goods-thumb.is-error::before {
  display: none;
}

.goods-thumb img {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

@keyframes goods-thumb-loading {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: 0 0;
  }
}
</style>
