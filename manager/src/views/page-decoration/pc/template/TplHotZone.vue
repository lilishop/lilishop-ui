<template>
  <div class="tpl-hot-zone" :style="customStyle">
    <div class="zone-wrap" v-if="displayImageUrl">
      <img :src="displayImageUrl" alt="hotzone" />
      <div
        v-for="(zone, idx) in displayZones"
        :key="idx"
        class="zone-mask"
        :style="{
          top: `${zone.top || 0}%`,
          left: `${zone.left || 0}%`,
          width: `${zone.width || 10}%`,
          height: `${zone.height || 10}%`
        }"
      >
        <span class="zone-label">{{ zone.title || `热区 ${idx + 1}` }}</span>
      </div>
    </div>
    <div v-else class="hotzone-empty">
      <span>热区图待配置底图</span>
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
.tpl-hot-zone {
  width: 100%;
  position: relative;
  user-select: none;
  box-sizing: border-box;

  .zone-wrap {
    position: relative;
    width: 100%;
    border-radius: inherit;
    overflow: hidden;

    img {
      width: 100%;
      display: block;
      border-radius: inherit;
      object-fit: cover;
    }

    .zone-mask {
      position: absolute;
      background: rgba(37, 99, 235, 0.22);
      border: 1.5px dashed #2563eb;
      color: #ffffff;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(1px);
      box-shadow: 0 0 10px rgba(37, 99, 235, 0.35);
      transition: all 0.2s ease;

      &:hover {
        background: rgba(37, 99, 235, 0.35);
        border-color: #3b82f6;
      }

      .zone-label {
        font-size: 12px;
        font-weight: 600;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
        padding: 3px 6px;
        background: rgba(15, 23, 42, 0.65);
        border-radius: 4px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        max-width: 90%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: center;
      }
    }
  }

  .hotzone-empty {
    padding: 40px;
    background: #f8fafc;
    border: 1px dashed #cbd5e1;
    text-align: center;
    color: #94a3b8;
    font-size: 13px;
  }
}
</style>
