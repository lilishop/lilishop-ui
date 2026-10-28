<template>
  <div
    class="decor-title-bar"
    :class="[
      `align-${options.align || 'left'}`,
      isMini ? 'is-mini' : (isCompact ? 'is-compact' : '')
    ]"
  >
    <div class="title-wrap">
      <h2 class="main-title">{{ options.mainTitle || '楼层标题' }}</h2>
      <p class="subtitle" v-if="options.subtitle">{{ options.subtitle }}</p>
    </div>
    <router-link :to="options.moreUrl || '/goods'" class="more-link" v-if="options.showMore">
      {{ options.moreText || '查看更多 >' }}
    </router-link>
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
.decor-title-bar {
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  box-sizing: border-box;
  gap: 12px;

  &.align-center {
    justify-content: center;
    text-align: center;
    position: relative;

    .more-link {
      position: absolute;
      right: 0;
      bottom: 0;
    }
  }

  .title-wrap {
    min-width: 0;

    .main-title {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      line-height: 1.2;
      word-break: break-word;
    }

    .subtitle {
      font-size: 14px;
      color: #94a3b8;
      margin: 6px 0 0 0;
      word-break: break-word;
    }
  }

  .more-link {
    font-size: 13px;
    color: #64748b;
    text-decoration: none;
    transition: color 0.2s;
    white-space: nowrap;
    flex-shrink: 0;

    &:hover {
      color: #e11d48;
    }
  }

  &.is-compact {
    .title-wrap {
      .main-title {
        font-size: 20px;
      }
      .subtitle {
        font-size: 13px;
        margin-top: 4px;
      }
    }
    .more-link {
      font-size: 12px;
    }
  }

  &.is-mini {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;

    &.align-center {
      align-items: center;
      text-align: center;

      .more-link {
        position: static;
        margin-top: 4px;
      }
    }

    .title-wrap {
      .main-title {
        font-size: 16px;
      }
      .subtitle {
        font-size: 12px;
        margin-top: 2px;
      }
    }

    .more-link {
      font-size: 12px;
    }
  }
}
</style>
