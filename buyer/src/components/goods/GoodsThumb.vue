<template>
  <div class="goods-thumb" :class="{ 'is-loaded': loaded, 'is-error': error }">
    <img v-if="currentSrc" :src="currentSrc" :alt="alt" @load="loaded = true" @error="onError" />
  </div>
</template>

<script>
export default {
  name: "GoodsThumb",
  props: {
    src: {
      type: String,
      default: "",
    },
    alt: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      currentSrc: "",
      loaded: false,
      error: false,
      observer: null,
    };
  },
  watch: {
    src() {
      this.observe();
    },
  },
  mounted() {
    this.observe();
  },
  beforeUnmount() {
    this.disconnect();
  },
  methods: {
    disconnect() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    },
    observe() {
      this.disconnect();
      this.currentSrc = "";
      this.loaded = false;
      this.error = false;
      if (!this.src) {
        this.error = true;
        return;
      }
      if (typeof IntersectionObserver === "undefined") {
        this.currentSrc = this.src;
        return;
      }
      this.observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          this.currentSrc = this.src;
          this.disconnect();
        },
        { rootMargin: "160px 0px" }
      );
      this.observer.observe(this.$el);
    },
    onError() {
      this.error = true;
      this.loaded = false;
      this.currentSrc = "";
    },
  },
};
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
