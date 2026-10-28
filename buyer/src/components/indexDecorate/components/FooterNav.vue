<template>
  <div class="decor-footer-nav" :style="customStyle">
    <div class="footer-inner">
      <!-- 1. 服务保障条 -->
      <div class="assurance-row" v-if="options.showAssurance && options.assurances?.length">
        <div
          v-for="(item, idx) in options.assurances"
          :key="idx"
          class="assurance-col"
        >
          <div class="code-badge">{{ item.code }}</div>
          <div class="text-info">
            <span class="main-t">{{ item.title }}</span>
            <span class="sub-t">{{ item.desc }}</span>
          </div>
        </div>
      </div>

      <!-- 2. 服务指南与链接列 -->
      <div class="guides-row" v-if="options.guideGroups?.length">
        <div
          v-for="(group, gIdx) in options.guideGroups"
          :key="gIdx"
          class="guide-col"
        >
          <h4 class="col-title">{{ group.title }}</h4>
          <ul class="col-links">
            <li v-for="(link, lIdx) in group.links" :key="lIdx">
              <router-link :to="link.url || '/article'">{{ link.text }}</router-link>
            </li>
          </ul>
        </div>
      </div>

      <!-- 3. 版权与备案 -->
      <div class="copyright-row">
        <p class="icp-text" v-if="options.icpText">{{ options.icpText }}</p>
        <p class="copy-text">{{ options.copyright || 'Copyright © 2026 Lilishop. All Rights Reserved.' }}</p>
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
  return {
    backgroundColor: s.backgroundColor || '#f1f5f9'
  };
});
</script>

<style lang="scss" scoped>
.decor-footer-nav {
  width: 100%;
  padding: 40px 0 30px;
  border-top: 1px solid #e2e8f0;

  .footer-inner {
    max-width: 1600px;
    margin: 0 auto;
    padding: 0 20px;

    .assurance-row {
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding-bottom: 30px;
      border-bottom: 1px solid #e2e8f0;

      .assurance-col {
        display: flex;
        align-items: center;
        gap: 12px;

        .code-badge {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 2px solid #e11d48;
          color: #e11d48;
          font-size: 20px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .text-info {
          display: flex;
          flex-direction: column;

          .main-t {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
          }

          .sub-t {
            font-size: 13px;
            color: #94a3b8;
          }
        }
      }
    }

    .guides-row {
      display: flex;
      justify-content: space-around;
      padding: 30px 0;
      border-bottom: 1px solid #e2e8f0;

      .guide-col {
        .col-title {
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 14px;
        }

        .col-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;

          li a {
            color: #64748b;
            font-size: 13px;
            text-decoration: none;
            transition: color 0.2s;

            &:hover {
              color: #e11d48;
            }
          }
        }
      }
    }

    .copyright-row {
      text-align: center;
      padding-top: 24px;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.8;
    }
  }
}
</style>
