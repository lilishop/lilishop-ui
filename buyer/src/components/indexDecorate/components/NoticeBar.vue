<template>
  <div
    class="decor-notice-bar"
    :class="[
      isMini ? 'is-mini' : (isCompact ? 'is-compact' : '')
    ]"
    :style="customStyle"
    @mouseenter="stopTimer"
    @mouseleave="startTimer"
  >
    <!-- 左侧快讯徽章 -->
    <div class="notice-badge-box">
      <div class="badge-icon">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/>
        </svg>
      </div>
      <span class="badge-title">{{ options.title || '公告快讯' }}</span>
      <span class="badge-divider"></span>
    </div>

    <!-- 中间动态滚动快讯区 (Vertical Carousel) -->
    <div class="notice-content-viewport">
      <div
        class="notice-items-strip"
        :style="{ transform: `translateY(-${currentIndex * 40}px)` }"
      >
        <div
          v-for="(item, idx) in noticeList"
          :key="idx"
          class="notice-strip-item"
        >
          <span class="notice-item-tag" :class="getTagClass(item.tag)">
            {{ item.tag || '最新' }}
          </span>
          <router-link :to="item.url || item.href || '/article'" class="notice-item-link">
            {{ item.title || item.text }}
          </router-link>
          <span class="notice-item-time" v-if="item.time && !isMini && !isCompact">
            {{ item.time }}
          </span>
        </div>
      </div>
    </div>

    <!-- 右侧更多链接 -->
    <div class="notice-more-action" v-if="options.showMore !== false && !isMini">
      <router-link :to="options.moreUrl || '/article'" class="more-link">
        {{ options.moreText || '更多' }} &gt;
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  component: {
    type: Object,
    default: () => ({})
  },
  options: {
    type: Object,
    default: () => ({})
  },
  componentStyle: {
    type: Object,
    default: () => ({})
  }
});

const isMini = computed(() => {
  const r = props.componentStyle?.widthRatio;
  return r === '16.67%' || r === '16.6%' || r === '16.7%';
});

const isCompact = computed(() => {
  const r = props.componentStyle?.widthRatio;
  return r === '33.33%' || r === '33.3%';
});

const defaultItems = [
  { tag: '最新', title: '商城秋季大促重磅开启，全场满300立减50元！', time: '10-28', url: '/article' },
  { tag: '活动', title: '会员专享积分商城全新上线，精选好礼0元兑换', time: '10-27', url: '/article' },
  { tag: '通知', title: '关于商城系统例行优化维护及物流发货保障通知', time: '10-26', url: '/article' },
  { tag: '热议', title: '品质生活馆场景专区火热来袭，领券最高减100', time: '10-25', url: '/article' }
];

const noticeList = computed(() => {
  const list = props.options?.items || props.options?.notices;
  if (Array.isArray(list) && list.length > 0) {
    return list;
  }
  return defaultItems;
});

const currentIndex = ref(0);
let timer = null;

function startTimer() {
  if (timer) clearInterval(timer);
  if (noticeList.value.length <= 1) return;
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % noticeList.value.length;
  }, 3500);
}

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

onMounted(() => {
  startTimer();
});

onUnmounted(() => {
  stopTimer();
});

function getTagClass(tag) {
  if (tag === '活动') return 'tag-promo';
  if (tag === '通知') return 'tag-notice';
  if (tag === '热议') return 'tag-hot';
  return 'tag-new';
}

const customStyle = computed(() => {
  const s = props.componentStyle || {};
  return {
    backgroundColor: s.backgroundColor || '#ffffff',
    padding: Array.isArray(s.padding)
      ? `${s.padding[0]}px ${s.padding[1]}px ${s.padding[2]}px ${s.padding[3]}px`
      : '0 16px',
    borderRadius: Array.isArray(s.radius)
      ? `${s.radius[0]}px ${s.radius[1]}px ${s.radius[2]}px ${s.radius[3]}px`
      : '8px'
  };
});
</script>

<style lang="scss" scoped>
.decor-notice-bar {
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  border: 1px solid #eef2f6;
  gap: 12px;

  .notice-badge-box {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;

    .badge-icon {
      color: #ef4444;
      display: flex;
      align-items: center;
    }

    .badge-title {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      white-space: nowrap;
      letter-spacing: -0.2px;
    }

    .badge-divider {
      width: 1px;
      height: 14px;
      background: #e2e8f0;
      margin-left: 6px;
    }
  }

  .notice-content-viewport {
    flex: 1;
    height: 40px;
    overflow: hidden;
    position: relative;
    min-width: 0;

    .notice-items-strip {
      transition: transform 0.4s ease-in-out;

      .notice-strip-item {
        height: 40px;
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;

        .notice-item-tag {
          font-size: 10px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 3px;
          flex-shrink: 0;

          &.tag-new {
            background: #fee2e2;
            color: #dc2626;
          }
          &.tag-promo {
            background: #ffedd5;
            color: #ea580c;
          }
          &.tag-notice {
            background: #eff6ff;
            color: #2563eb;
          }
          &.tag-hot {
            background: #fdf2f8;
            color: #db2777;
          }
        }

        .notice-item-link {
          flex: 1;
          font-size: 13px;
          color: #334155;
          text-decoration: none;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          min-width: 0;
          transition: color 0.2s;

          &:hover {
            color: #ef4444;
          }
        }

        .notice-item-time {
          font-size: 11px;
          color: #94a3b8;
          white-space: nowrap;
          flex-shrink: 0;
          margin-right: 4px;
        }
      }
    }
  }

  .notice-more-action {
    flex-shrink: 0;

    .more-link {
      font-size: 12px;
      color: #64748b;
      text-decoration: none;
      transition: color 0.2s;

      &:hover {
        color: #ef4444;
      }
    }
  }

  &.is-compact {
    gap: 8px;

    .notice-badge-box {
      .badge-title {
        font-size: 13px;
      }
      .badge-divider {
        margin-left: 2px;
      }
    }

    .notice-content-viewport {
      .notice-strip-item {
        .notice-item-link {
          font-size: 12px;
        }
      }
    }
  }

  &.is-mini {
    gap: 4px;
    padding: 0 8px !important;

    .notice-badge-box {
      .badge-title {
        display: none;
      }
      .badge-divider {
        display: none;
      }
    }

    .notice-content-viewport {
      .notice-strip-item {
        .notice-item-tag {
          display: none;
        }
        .notice-item-link {
          font-size: 11px;
        }
      }
    }
  }
}
</style>
