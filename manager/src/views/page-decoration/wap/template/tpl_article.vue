<template>
  <div class="tpl-article" :class="{ styled: styled }" :style="wrapperStyle">
    <div class="article-title" v-if="title">{{ title }}</div>
    <template v-if="articleList.length">
      <div class="article-item" v-for="item in articleList" :key="item.id">
        <div class="article-text">
          <div class="article-name" :style="nameStyle">{{ item.title }}</div>
          <div class="article-time" v-if="item.createTime">{{ item.createTime }}</div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="article-item" v-for="i in 3" :key="i">
        <div class="article-text">
          <div class="article-name" :style="nameStyle">文章标题示例文章标题示例</div>
        </div>
        <div class="article-thumb"></div>
      </div>
    </template>
  </div>
</template>

<script>
import { getArticle } from "@/api/pages";

export default {
  name: "tpl_article",
  props: {
    res: { type: Object, default: () => ({}) },
  },
  data() {
    return { articleList: [] };
  },
  computed: {
    first() {
      return (this.res.list && this.res.list[0]) || {};
    },
    title() {
      return this.first.title || "";
    },
    count() {
      return this.first.count || 3;
    },
    categoryId() {
      return this.first.categoryId || "";
    },
    // 面板保存过样式字段才启用自定义样式，老数据保持原样
    styled() {
      return this.res && this.res.paddingTop !== undefined;
    },
    nameStyle() {
      return this.styled && this.res.titleColor
        ? { color: this.res.titleColor }
        : {};
    },
    wrapperStyle() {
      if (!this.styled) {
        return {
          background: this.res.bgColor || "#FFFFFF",
          padding: `10px ${this.res.paddingX || 0}px`,
          marginBottom: `${this.res.pageGap !== undefined ? this.res.pageGap : 0}px`,
          borderRadius: `${this.res.borderRadius || 0}px`,
          overflow: "hidden",
        };
      }
      const res = this.res;
      const bg =
        !res.bgColor2 || res.bgColor1 === res.bgColor2
          ? res.bgColor1
          : `linear-gradient(180deg, ${res.bgColor1}, ${res.bgColor2})`;
      const px = (v) => `${(Number(v) || 0) / 2}px`;
      return {
        background: bg,
        padding: `${px(res.paddingTop)} ${px(res.paddingX)} ${px(res.paddingBottom)}`,
        marginBottom: px(res.pageGap),
        borderRadius: px(res.borderRadius),
        overflow: Number(res.borderRadius) > 0 ? "hidden" : "visible",
        display: "flex",
        flexDirection: "column",
        rowGap: px(res.contentGap),
      };
    },
  },
  watch: {
    categoryId() {
      this.loadArticles();
    },
    count() {
      this.loadArticles();
    },
  },
  mounted() {
    this.loadArticles();
  },
  methods: {
    loadArticles() {
      const params = { pageNumber: 1, pageSize: this.count };
      if (this.categoryId) params.categoryId = this.categoryId;
      getArticle(params)
        .then((res) => {
          const records = res && res.result && res.result.records;
          this.articleList = Array.isArray(records)
            ? records.slice(0, this.count)
            : [];
        })
        .catch(() => {
          this.articleList = [];
        });
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
.tpl-article.styled .article-item {
  border-top: none;
  padding: 0;
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
