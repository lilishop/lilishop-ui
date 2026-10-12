<template>
  <div>
    <div v-if="keyword" class="suggest-section">
      <div v-if="suggesting && !suggestions.length" class="suggest-empty">正在查找...</div>
      <button
        v-for="item in suggestions"
        :key="item"
        type="button"
        class="suggest-item"
        @click="$emit('pick', item)"
      >
        <span v-for="(part, index) in parts(item)" :key="index" :class="{ hit: part.hit }">{{ part.text }}</span>
      </button>
      <div v-if="!suggesting && !suggestions.length" class="suggest-empty">没有匹配的商品，回车查看全部结果</div>
    </div>
    <template v-else>
      <div v-if="history.length" class="suggest-section">
        <div class="suggest-head">
          <span>搜索历史</span>
          <button type="button" class="suggest-clear" @click="$emit('clear')">清空</button>
        </div>
        <div class="suggest-tags">
          <button
            v-for="item in history"
            :key="item"
            type="button"
            class="suggest-tag"
            @click="$emit('pick', item)"
          >{{ item }}</button>
        </div>
      </div>
      <div v-if="hotWords.length" class="suggest-section">
        <div class="suggest-head"><span>热门搜索</span></div>
        <div class="suggest-tags">
          <button
            v-for="item in hotWords"
            :key="item"
            type="button"
            class="suggest-tag"
            @click="$emit('pick', item)"
          >{{ item }}</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
defineOptions({ name: "SearchSuggest" });

const props = defineProps({
  keyword: { type: String, default: "" },
  history: { type: Array, default: () => [] },
  hotWords: { type: Array, default: () => [] },
  suggestions: { type: Array, default: () => [] },
  suggesting: { type: Boolean, default: false },
});

defineEmits(["pick", "clear"]);

function parts(text) {
  const value = String(text || "");
  const key = props.keyword;
  if (!key) return [{ text: value, hit: false }];
  const index = value.toLowerCase().indexOf(key.toLowerCase());
  if (index < 0) return [{ text: value, hit: false }];
  return [
    { text: value.slice(0, index), hit: false },
    { text: value.slice(index, index + key.length), hit: true },
    { text: value.slice(index + key.length), hit: false },
  ].filter((part) => part.text);
}
</script>

<style scoped lang="scss">
.suggest-section + .suggest-section {
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid #f5f5f5;
}

.suggest-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 16px;
  color: #999;
  font-size: 13px;
}

.suggest-clear {
  border: none;
  background: transparent;
  color: #999;
  font-size: 13px;
  cursor: pointer;
}

.suggest-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 16px 8px;
}

.suggest-tag {
  max-width: 180px;
  padding: 4px 10px;
  border: none;
  border-radius: 14px;
  background: #f5f5f5;
  color: #333;
  font-size: 13px;
  line-height: 20px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.suggest-item {
  display: block;
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: #333;
  font-size: 14px;
  line-height: 22px;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    background: #fafafa;
  }

  .hit {
    color: $theme_color;
  }
}

.suggest-empty {
  padding: 10px 16px;
  color: #999;
  font-size: 13px;
}
</style>
