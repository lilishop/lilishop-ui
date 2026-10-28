<template>
  <div class="tpl-article" :style="customStyle">
    <!-- 文章顶部标题区 -->
    <div class="article-header" v-if="options.showTitle !== false && options.title">
      <h2 class="article-main-title">{{ options.title }}</h2>
      <p class="article-sub-title" v-if="options.subtitle">{{ options.subtitle }}</p>
      
      <div class="article-meta-bar" v-if="options.showMeta !== false">
        <span class="meta-tag">{{ options.tag || '品牌专栏' }}</span>
        <span class="meta-item author" v-if="options.author">作者：{{ options.author }}</span>
        <span class="meta-item date" v-if="options.date">发布于 {{ options.date }}</span>
        <span class="meta-item views">阅读 2.4k+</span>
      </div>
    </div>

    <!-- 文章正文排版区 (Rich Text Article Body) -->
    <div
      class="article-body-typography"
      :class="[`align-${options.textAlign || 'left'}`]"
      :style="{ fontSize: `${options.fontSize || 15}px` }"
      v-html="renderedContent"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

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

const defaultArticleHtml = `
<h3>关于我们 · 甄选美好生活</h3>
<p>我们始终坚信，一件好的产品不仅能改善日常生活的品质，更传递着对美好生活的执着追求。自创立以来，我们严选全球顶尖供应链，深耕每一道生产工艺与质检环节，力求将兼具美学价值与极致实用性的商品送达每一位用户手中。</p>
<blockquote>品质是我们的信仰，体验是我们的底线。从选材到交付，每一步都经得起时光检验。</blockquote>
<h4>四大核心服务保障</h4>
<ul>
  <li><strong>100% 官方正品</strong>：源头品牌直采，全链路防伪溯源，假一赔十保障。</li>
  <li><strong>极速顺丰冷链</strong>：全国多仓联动发货，核心城市支持当日达/次日达。</li>
  <li><strong>7天无理由退换</strong>：专业客服团队 7×24 小时贴心守护，售后无忧。</li>
  <li><strong>会员专享权益</strong>：尊享积分抵现、生日特权礼及专属品鉴沙龙。</li>
</ul>
<p>感谢一路相伴的每一位朋友，未来我们将持续探索更多优质生活场景，与您共同见证品质生活的美好绽放。</p>
`.trim();

const renderedContent = computed(() => {
  return props.options?.content || defaultArticleHtml;
});

const customStyle = computed(() => {
  const s = props.componentStyle || {};
  return {
    backgroundColor: s.backgroundColor || '#ffffff',
    padding: Array.isArray(s.padding)
      ? `${s.padding[0]}px ${s.padding[1]}px ${s.padding[2]}px ${s.padding[3]}px`
      : '24px 28px',
    borderRadius: Array.isArray(s.radius)
      ? `${s.radius[0]}px ${s.radius[1]}px ${s.radius[2]}px ${s.radius[3]}px`
      : '12px'
  };
});
</script>

<style lang="scss" scoped>
.tpl-article {
  width: 100%;
  box-sizing: border-box;
  user-select: none;

  .article-header {
    padding-bottom: 16px;
    margin-bottom: 18px;
    border-bottom: 1px solid #f1f5f9;

    .article-main-title {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.35;
      margin: 0 0 8px 0;
      letter-spacing: -0.3px;
    }

    .article-sub-title {
      font-size: 14px;
      color: #64748b;
      line-height: 1.5;
      margin: 0 0 12px 0;
    }

    .article-meta-bar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 12px;
      color: #94a3b8;

      .meta-tag {
        font-size: 11px;
        font-weight: 600;
        background: #eff6ff;
        color: #2563eb;
        padding: 2px 8px;
        border-radius: 4px;
      }

      .meta-item {
        display: inline-flex;
        align-items: center;
      }
    }
  }

  /* 文章排版样式系统 (Editorial Typography) */
  .article-body-typography {
    color: #334155;
    line-height: 1.8;
    letter-spacing: 0.2px;

    &.align-center {
      text-align: center;
    }
    &.align-justify {
      text-align: justify;
    }

    :deep(h2), :deep(h3), :deep(h4) {
      color: #0f172a;
      font-weight: 700;
      line-height: 1.4;
      margin-top: 20px;
      margin-bottom: 10px;
    }

    :deep(h2) {
      font-size: 20px;
      border-left: 4px solid #2563eb;
      padding-left: 10px;
    }

    :deep(h3) {
      font-size: 18px;
      color: #1e293b;
    }

    :deep(h4) {
      font-size: 16px;
    }

    :deep(p) {
      margin: 0 0 14px 0;
      line-height: 1.8;
    }

    :deep(blockquote) {
      margin: 16px 0;
      padding: 12px 18px;
      background: #f8fafc;
      border-left: 4px solid #3b82f6;
      border-radius: 0 8px 8px 0;
      color: #475569;
      font-style: italic;
      line-height: 1.7;
    }

    :deep(ul), :deep(ol) {
      margin: 12px 0 16px 20px;
      padding: 0;

      li {
        margin-bottom: 6px;
        line-height: 1.7;
      }
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      display: block;
      margin: 16px auto;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
    }

    :deep(strong) {
      color: #0f172a;
      font-weight: 700;
    }
  }
}
</style>
