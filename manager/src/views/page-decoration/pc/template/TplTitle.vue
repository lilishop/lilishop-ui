<template>
  <div
    class="tpl-title-bar"
    :class="[
      `align-${options.align || 'left'}`,
      isMini ? 'is-mini' : (isCompact ? 'is-compact' : '')
    ]"
  >
    <div class="title-content">
      <span class="main-t">{{ options.mainTitle || '楼层主标题' }}</span>
      <span class="sub-t" v-if="options.subtitle">{{ options.subtitle }}</span>
    </div>
    <span class="more-link" v-if="options.showMore">{{ options.moreText || '查看更多 >' }}</span>
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

const isMini = computed(() => props.componentStyle?.widthRatio === '16.67%');
const isCompact = computed(() => props.componentStyle?.widthRatio === '33.33%');
</script>

<style lang="scss" scoped>
.tpl-title-bar {
  width: 100%;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  user-select: none;
  box-sizing: border-box;
  gap: 8px;

  &.align-center {
    justify-content: center;
    position: relative;
    .more-link {
      position: absolute;
      right: 0;
    }
  }

  .title-content {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 4px 10px;
    min-width: 0;

    .main-t {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sub-t {
      font-size: 13px;
      color: #94a3b8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .more-link {
    font-size: 13px;
    color: #64748b;
    white-space: nowrap;
    flex-shrink: 0;
  }

  &.is-compact {
    .title-content {
      .main-t {
        font-size: 18px;
      }
      .sub-t {
        font-size: 12px;
      }
    }
    .more-link {
      font-size: 12px;
    }
  }

  &.is-mini {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;

    &.align-center {
      align-items: center;
      .more-link {
        position: static;
        margin-top: 2px;
      }
    }

    .title-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;

      .main-t {
        font-size: 16px;
      }
      .sub-t {
        font-size: 12px;
      }
    }

    &.align-center .title-content {
      align-items: center;
      text-align: center;
    }

    .more-link {
      font-size: 12px;
      margin-top: 2px;
    }
  }
}
</style>
