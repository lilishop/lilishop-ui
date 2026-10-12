<template>
  <div class="tpl-article" :style="wrapperStyle">
    <div class="article-title" v-if="title">{{ title }}</div>
    <div class="article-item" v-for="i in 3" :key="i">
      <div class="article-text">
        <div class="article-name">文章标题示例文章标题示例</div>
        <div class="article-time">2026-10-12</div>
      </div>
      <div class="article-thumb"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "tpl_article",
  props: {
    res: { type: Object, default: () => ({}) },
  },
  computed: {
    title() {
      return (this.res.list && this.res.list[0] && this.res.list[0].title) || "";
    },
    wrapperStyle() {
      return {
        background: this.res.bgColor || "#FFFFFF",
        padding: `10px ${this.res.paddingX || 0}px`,
        marginBottom: `${this.res.pageGap !== undefined ? this.res.pageGap : 10}px`,
        borderRadius: `${this.res.borderRadius || 0}px`,
        overflow: "hidden",
      };
    },
  },
};
</script>

<style scoped lang="scss">
.article-title {
  font-size: 15px;
  font-weight: 600;
  padding: 4px 12px 10px;
}
.article-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-top: 1px solid #f5f5f5;
}
.article-text {
  flex: 1;
  min-width: 0;
}
.article-name {
  font-size: 13px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.article-time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}
.article-thumb {
  width: 56px;
  height: 42px;
  background: #f0f0f0;
  border-radius: 4px;
  margin-left: 10px;
  flex-shrink: 0;
}
</style>
