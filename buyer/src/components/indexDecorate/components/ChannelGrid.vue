<template>
  <div class="decor-channel-grid" :style="customStyle">
    <div
      class="grid-container"
      :style="{
        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        gap: `${options.gap ?? 12}px`
      }"
    >
      <router-link
        v-for="(item, idx) in options.items"
        :key="idx"
        :to="item.url || '/goods'"
        class="channel-card"
        :class="[
          `is-${layoutMode}`,
          { 'is-compact': isCompact }
        ]"
      >
        <!-- 图标/图片 -->
        <div
          class="card-thumb"
          :style="{ borderRadius: `${options.imageRadius ?? 10}px` }"
        >
          <img
            v-if="item.img"
            :src="item.img"
            :alt="item.title"
            class="thumb-img"
          />
          <div v-else class="thumb-placeholder">
            <span>{{ (item.title || '频').charAt(0) }}</span>
          </div>
        </div>

        <!-- 主标题与副标题 -->
        <div class="card-info">
          <div class="card-title">{{ item.title || '频道名称' }}</div>
          <div class="card-sub">{{ item.subtitle || '副标题文案' }}</div>
        </div>
      </router-link>
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

// 排版宽度比例 (整行: 100%, 三分之二: 66.67%, 一半: 50%, 三分之一: 33.33%, 六分之一: 16.67%)
const widthRatio = computed(() => {
  return props.componentStyle?.widthRatio || '100%';
});

// 响应式列数：50%、33.33%、16.67% 为 2 列；100%、66.67% 为 4 列
const gridColumns = computed(() => {
  const w = widthRatio.value;
  if (w === '50%' || w === '33.33%' || w === '33.3%' || w === '16.67%' || w === '16.6%') {
    return 2;
  }
  return 4;
});

// 卡片内部排布方式：
// 100% (整行)、50% (一半) -> 水平横向 (左图右文)
// 66.67% (三分之二)、33.33% (三分之一)、16.67% (六分之一) -> 垂直纵向 (上图下文居中)
const layoutMode = computed(() => {
  const w = widthRatio.value;
  if (w === '66.67%' || w === '66.6%' || w === '33.33%' || w === '33.3%' || w === '16.67%' || w === '16.6%') {
    return 'vertical';
  }
  return 'horizontal';
});

// 六分之一紧凑模式
const isCompact = computed(() => {
  const w = widthRatio.value;
  return w === '16.67%' || w === '16.6%';
});

const customStyle = computed(() => {
  const s = props.componentStyle || {};
  return {
    backgroundColor: s.backgroundColor || 'transparent',
    padding: Array.isArray(s.padding)
      ? `${s.padding[0]}px ${s.padding[1]}px ${s.padding[2]}px ${s.padding[3]}px`
      : '10px 0'
  };
});
</script>

<style lang="scss" scoped>
.decor-channel-grid {
  width: 100%;
  box-sizing: border-box;

  .grid-container {
    max-width: 1600px;
    margin: 0 auto;
    display: grid;
    width: 100%;
    box-sizing: border-box;

    .channel-card {
      background: #ffffff;
      border: 1px solid #f1f5f9;
      border-radius: 8px;
      text-decoration: none;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
      box-sizing: border-box;
      transition: all 0.25s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
        border-color: #e2e8f0;

        .card-thumb .thumb-img {
          transform: scale(1.06);
        }

        .card-info .card-title {
          color: #ea580c;
        }
      }

      .card-thumb {
        flex-shrink: 0;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8fafc;

        .thumb-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.2s ease;
        }

        .thumb-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
        }
      }

      .card-info {
        min-width: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;

        .card-title {
          font-weight: 600;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.2s;
        }

        .card-sub {
          color: #94a3b8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      // 1. 水平横向排布 (整行 100%、一半 50%)
      &.is-horizontal {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;

        .card-thumb {
          width: 44px;
          height: 44px;
        }

        .card-info {
          flex: 1;
          gap: 3px;
          text-align: left;

          .card-title {
            font-size: 14px;
            line-height: 1.3;
          }

          .card-sub {
            font-size: 12px;
            line-height: 1.2;
          }
        }
      }

      // 2. 垂直纵向排布 (三分之二 66.67%、三分之一 33.33%、六分之一 16.67%)
      &.is-vertical {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 8px;
        padding: 14px 10px 12px 10px;

        .card-thumb {
          width: 44px;
          height: 44px;
          margin: 0 auto;
        }

        .card-info {
          width: 100%;
          gap: 2px;
          text-align: center;

          .card-title {
            font-size: 13px;
            line-height: 1.3;
          }

          .card-sub {
            font-size: 12px;
            line-height: 1.2;
          }
        }
      }

      // 3. 六分之一紧凑模式
      &.is-compact {
        padding: 10px 6px 8px 6px;
        gap: 5px;

        .card-thumb {
          width: 36px;
          height: 36px;
        }

        .card-info {
          gap: 1px;

          .card-title {
            font-size: 12px;
          }

          .card-sub {
            font-size: 11px;
            transform: scale(0.95);
          }
        }
      }
    }
  }
}
</style>
