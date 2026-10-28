<template>
  <div class="tpl-footer-nav" :style="customStyle">
    <div class="footer-wrap">
      <!-- 1. 服务保障条 -->
      <div class="assurances" v-if="options.showAssurance !== false && options.assurances?.length">
        <component
          :is="item.url ? 'a' : 'div'"
          v-for="(item, idx) in options.assurances"
          :key="idx"
          class="ass-item"
          :class="{ 'is-link': !!item.url }"
          :href="item.url || 'javascript:;'"
          @click.prevent
        >
          <span class="code">{{ item.code }}</span>
          <div class="ass-text">
            <span class="t">{{ item.title }}</span>
            <span class="desc" v-if="item.desc">{{ item.desc }}</span>
          </div>
        </component>
      </div>

      <!-- 2. 帮助与指南分组列表 -->
      <div class="guide-groups" v-if="options.guideGroups && options.guideGroups.length">
        <div v-for="(group, gIdx) in options.guideGroups" :key="gIdx" class="guide-col">
          <div class="guide-title">{{ group.title }}</div>
          <div class="guide-links" v-if="group.links && group.links.length">
            <a
              v-for="(link, lIdx) in group.links"
              :key="lIdx"
              class="guide-link"
              :href="link.url || 'javascript:;'"
              @click.prevent
            >
              {{ link.text }}
            </a>
          </div>
        </div>
      </div>

      <!-- 3. 版权与 ICP 备案 -->
      <div class="copyright">
        <template v-if="options.icpText">
          <a
            v-if="options.icpLink"
            class="footer-link"
            :href="options.icpLink"
            target="_blank"
            rel="noopener noreferrer"
            @click.stop
          >{{ options.icpText }}</a>
          <span v-else>{{ options.icpText }}</span>
          <span class="divider"> | </span>
        </template>
        <a
          v-if="options.copyrightLink"
          class="footer-link"
          :href="options.copyrightLink"
          target="_blank"
          rel="noopener noreferrer"
          @click.stop
        >{{ options.copyright || 'Copyright © 2026 Lilishop. All Rights Reserved.' }}</a>
        <span v-else>{{ options.copyright || 'Copyright © 2026 Lilishop. All Rights Reserved.' }}</span>
      </div>
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

const customStyle = computed(() => {
  const s = props.componentStyle || {};
  let bg = s.backgroundColor;
  if (bg && /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*0\s*\)$/.test(bg.trim())) {
    bg = bg.trim().replace(/,\s*0\s*\)$/, ', 1)');
  }
  return {
    backgroundColor: (bg && bg !== 'transparent') ? bg : 'transparent'
  };
});
</script>

<style lang="scss" scoped>
.tpl-footer-nav {
  width: 100%;
  padding: 30px 0 20px;
  user-select: none;

  .footer-wrap {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;

    .assurances {
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding-bottom: 24px;
      border-bottom: 1px solid #e2e8f0;

      .ass-item {
        display: flex;
        align-items: center;
        gap: 12px;
        text-decoration: none;

        &.is-link {
          cursor: pointer;
          transition: transform 0.15s ease, opacity 0.15s ease;

          &:hover {
            opacity: 0.85;
            transform: translateY(-1px);
          }
        }

        .code {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid #e11d48;
          color: #e11d48;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          flex-shrink: 0;
        }

        .ass-text {
          display: flex;
          flex-direction: column;
          gap: 2px;

          .t {
            font-size: 15px;
            font-weight: 600;
            color: #1e293b;
            line-height: 1.2;
          }

          .desc {
            font-size: 12px;
            color: #64748b;
            line-height: 1.2;
          }
        }
      }
    }

    .guide-groups {
      display: flex;
      justify-content: space-between;
      padding: 28px 20px 24px;
      border-bottom: 1px solid #e2e8f0;

      .guide-col {
        display: flex;
        flex-direction: column;

        .guide-title {
          font-size: 14px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 12px;
        }

        .guide-links {
          display: flex;
          flex-direction: column;
          gap: 8px;

          .guide-link {
            font-size: 12px;
            color: #64748b;
            text-decoration: none;
            transition: color 0.15s ease;

            &:hover {
              color: #e11d48;
            }
          }
        }
      }
    }

    .copyright {
      text-align: center;
      padding-top: 20px;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.6;

      .footer-link {
        color: inherit;
        text-decoration: none;
        transition: color 0.15s ease;

        &:hover {
          color: #e11d48;
          text-decoration: underline;
        }
      }

      .divider {
        margin: 0 4px;
      }
    }
  }
}
</style>
