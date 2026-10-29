<template>
  <div
    class="decor-title-bar"
    :class="[
      `align-${options.align || 'left'}`,
      isMini ? 'is-mini' : (isCompact ? 'is-compact' : '')
    ]"
  >
    <div class="title-wrap" :class="{ 'with-icon': options.titleImg || options.icon }">
      <img
        v-if="options.titleImg || options.icon"
        :src="options.titleImg || options.icon"
        class="title-custom-icon"
        alt="icon"
      />
      <div class="title-text-group">
        <h2
          class="main-title"
          :class="{ 'clickable': Boolean(options.titleUrl) }"
          @click="options.titleUrl && handleNavigate(options.titleUrl)"
        >
          {{ options.mainTitle || '楼层标题' }}
        </h2>
        <p class="subtitle" v-if="options.subtitle">{{ options.subtitle }}</p>
      </div>
    </div>
    <a
      href="javascript:;"
      class="more-link"
      v-if="options.showMore"
      @click="handleNavigate(options.moreUrl || '/goods')"
    >
      {{ options.moreText || '查看更多 >' }}
    </a>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

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

function handleNavigate(url) {
  if (!url) return;
  if (/^https?:\/\//i.test(url)) {
    window.open(url, '_blank');
  } else {
    router.push(url);
  }
}

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
    display: flex;
    align-items: center;
    gap: 10px;

    .title-custom-icon {
      width: 28px;
      height: 28px;
      object-fit: contain;
      flex-shrink: 0;
    }

    .title-text-group {
      min-width: 0;

      .main-title {
        font-size: 26px;
        font-weight: 800;
        color: #0f172a;
        margin: 0;
        line-height: 1.2;
        word-break: break-word;

        &.clickable {
          cursor: pointer;
          transition: color 0.15s ease;
          &:hover {
            color: #f97316;
          }
        }
      }

      .subtitle {
        font-size: 14px;
        color: #94a3b8;
        margin: 6px 0 0 0;
        word-break: break-word;
      }
    }
  }

  .more-link {
    font-size: 13px;
    color: #64748b;
    text-decoration: none;
    transition: color 0.2s;
    white-space: nowrap;
    flex-shrink: 0;
    cursor: pointer;

    &:hover {
      color: #e11d48;
    }
  }

  &.is-compact {
    .title-wrap {
      .title-custom-icon {
        width: 22px;
        height: 22px;
      }

      .title-text-group {
        .main-title {
          font-size: 20px;
        }
        .subtitle {
          font-size: 13px;
          margin-top: 4px;
        }
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
      .title-custom-icon {
        width: 18px;
        height: 18px;
      }

      .title-text-group {
        .main-title {
          font-size: 16px;
        }
        .subtitle {
          font-size: 12px;
          margin-top: 2px;
        }
      }
    }

    .more-link {
      font-size: 12px;
    }
  }
}
</style>
