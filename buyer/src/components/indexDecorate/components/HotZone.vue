<template>
  <div class="decor-hot-zone" :style="customStyle">
    <div class="hot-zone-wrap" v-if="displayImageUrl">
      <img :src="displayImageUrl" alt="hotzone" class="base-image" />
      <router-link
        v-for="(zone, idx) in displayZones"
        :key="idx"
        :to="zone.url || '/'"
        class="zone-link"
        :style="{
          top: `${zone.top || 0}%`,
          left: `${zone.left || 0}%`,
          width: `${zone.width || 10}%`,
          height: `${zone.height || 10}%`
        }"
        :title="zone.title"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  options: {
    type: Object,
    default: () => ({})
  },
  componentStyle: {
    type: Object,
    default: () => ({})
  }
});

const defaultZones = [
  { title: '大促主会场 · 领券中心', url: '/couponCenter', left: 3.5, top: 12, width: 28.5, height: 76 },
  { title: '数码潮电馆 · 爆款直降', url: '/goodsList?category=1', left: 35.5, top: 12, width: 28.5, height: 76 },
  { title: '美妆奢品馆 · 5折特惠', url: '/goodsList?category=2', left: 67.5, top: 12, width: 29, height: 76 }
];

const displayImageUrl = computed(() => {
  return props.options?.imageUrl || 'https://lilishop-pc.oss-cn-beijing.aliyuncs.com/static/hot-zone/hotzone_default.png';
});

const displayZones = computed(() => {
  if (Array.isArray(props.options?.zones) && props.options.zones.length > 0) {
    return props.options.zones;
  }
  return defaultZones;
});

const customStyle = computed(() => {
  const s = props.componentStyle || {};
  return {
    backgroundColor: s.backgroundColor || 'transparent',
    padding: Array.isArray(s.padding)
      ? `${s.padding[0]}px ${s.padding[1]}px ${s.padding[2]}px ${s.padding[3]}px`
      : '10px 0',
    borderRadius: Array.isArray(s.radius)
      ? `${s.radius[0]}px ${s.radius[1]}px ${s.radius[2]}px ${s.radius[3]}px`
      : '8px',
    overflow: 'hidden'
  };
});
</script>

<style lang="scss" scoped>
.decor-hot-zone {
  width: 100%;
  box-sizing: border-box;

  .hot-zone-wrap {
    position: relative;
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
    border-radius: inherit;
    overflow: hidden;

    .base-image {
      width: 100%;
      display: block;
      border-radius: inherit;
      object-fit: cover;
    }

    .zone-link {
      position: absolute;
      display: block;
      cursor: pointer;
      border-radius: 6px;
      transition: background 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.08);
      }
    }
  }
}
</style>
