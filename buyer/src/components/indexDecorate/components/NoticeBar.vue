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
      <img
        v-if="options.badgeImg || options.icon"
        :src="options.badgeImg || options.icon"
        class="badge-custom-img"
        alt="icon"
      />
      <div v-else class="badge-icon">
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
          <a
            href="javascript:;"
            class="notice-item-link"
            @click="handleNavigate(item.url || item.href || '/article')"
          >
            {{ item.title || item.text }}
          </a>
          <span class="notice-item-time" v-if="item.time && !isMini && !isCompact">
            {{ item.time }}
          </span>
        </div>
      </div>
    </div>

    <!-- 右侧更多链接 -->
    <div class="notice-more-action" v-if="options.showMore !== false && !isMini">
      <a
        href="javascript:;"
        class="more-link"
        @click="handleNavigate(options.moreUrl || '/article')"
      >
        {{ options.moreText || '更多' }} &gt;
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

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

function handleNavigate(url) {
  if (!url) return;
  if (/^https?:\/\//i.test(url)) {
    window.open(url, '_blank');
  } else {
    router.push(url);
  }
}

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
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
  gap: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  overflow: hidden;

  &.is-mini {
    gap: 6px;
    padding: 0 8px !important;

    .notice-badge-box {
      .badge-title, .badge-divider {
        display: none;
      }
    }
  }

  &.is-compact {
    gap: 8px;
    padding: 0 10px !important;

    .notice-badge-box {
      .badge-divider {
        display: none;
      }
    }
  }

  .notice-badge-box {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    .badge-icon {
      color: #f97316;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .badge-custom-img {
      width: 18px;
      height: 18px;
      object-fit: contain;
      flex-shrink: 0;
    }

    .badge-title {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
    }

    .badge-divider {
      width: 1px;
      height: 14px;
      background: #cbd5e1;
      margin-left: 4px;
    }
  }

  .notice-content-viewport {
    flex: 1;
    min-width: 0;
    height: 40px;
    overflow: hidden;
    position: relative;

    .notice-items-strip {
      transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1);
      display: flex;
      flex-direction: column;

      .notice-strip-item {
        height: 40px;
        display: flex;
        align-items: center;
        gap: 8px;
        box-sizing: border-box;

        .notice-item-tag {
          font-size: 11px;
          padding: 1px 6px;
          border-radius: 4px;
          font-weight: 600;
          flex-shrink: 0;

          &.tag-new {
            background: #eff6ff;
            color: #2563eb;
            border: 1px solid #bfdbfe;
          }

          &.tag-promo {
            background: #fef2f2;
            color: #ef4444;
            border: 1px solid #fecaca;
          }

          &.tag-notice {
            background: #fffbeb;
            color: #d97706;
            border: 1px solid #fde68a;
          }

          &.tag-hot {
            background: #fdf2f8;
            color: #db2777;
            border: 1px solid #fbcfe8;
          }
        }

        .notice-item-link {
          flex: 1;
          min-width: 0;
          font-size: 13px;
          color: #334155;
          text-decoration: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.15s ease;
          cursor: pointer;

          &:hover {
            color: #f97316;
          }
        }

        .notice-item-time {
          font-size: 11px;
          color: #94a3b8;
          flex-shrink: 0;
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
      transition: color 0.15s ease;
      cursor: pointer;

      &:hover {
        color: #f97316;
      }
    }
  }
}
</style>
