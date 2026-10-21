<template>
  <div class="layout" :style="wrapperStyle">
    <div
      class="menu-list"
      :class="{ styled: styled, single: isSingle }"
      :style="listStyle"
    >
      <div
        class="menu-item"
        :style="itemStyle"
        v-for="(item, index) in visibleList"
        :key="index"
      >
        <div class="menu-img-wrap" :style="imgStyle">
          <img class="menu-img" :src="item.img" alt="" />
        </div>
        <div class="menu-title" :style="titleStyle">{{ item.title }}</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue";
import { cubeWrapperStyle, cubeImgStyle } from "./cubeStyle";

const props = defineProps(["res"]);

// 面板保存过样式字段才启用自定义样式，老数据保持原样
const styled = computed(() => props.res && props.res.paddingTop !== undefined);
const wrapperStyle = computed(() => cubeWrapperStyle(props.res));
const imgStyle = computed(() => cubeImgStyle(props.res));
const listStyle = computed(() =>
  styled.value ? { rowGap: `${(Number(props.res.contentGap) || 0) / 2}px` } : {}
);
const titleStyle = computed(() =>
  styled.value && props.res.textColor ? { color: props.res.textColor } : {}
);

// 展示设置：单行/多行、行数、每行个数，超出部分不展示
const isSingle = computed(
  () => styled.value && props.res.menuDisplay === "single"
);
const cols = computed(() => (styled.value ? Number(props.res.menuCols) || 4 : 4));
const rows = computed(() => Number(props.res.menuRows) || 3);
const itemStyle = computed(() =>
  styled.value ? { flex: `0 0 ${100 / cols.value}%` } : {}
);
const visibleList = computed(() => {
  const list = props.res.list || [];
  if (!styled.value) return list;
  const limit = isSingle.value ? cols.value : rows.value * cols.value;
  return list.slice(0, limit);
});
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.menu-list {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;

  &.single {
    flex-wrap: nowrap;
    overflow: hidden;
  }

  > .menu-item {
    text-align: center;
    width: 25%;
    margin: 10px 0;
  }

  &.styled > .menu-item,
  &.single > .menu-item {
    margin: 0;
    width: auto;
  }
}
.menu-img-wrap {
  width: 44px;
  height: 44px;
  margin: 0 auto;
  overflow: hidden;
}
.menu-img {
  width: 44px;
  height: 44px;
}
.menu-title {
  font-size: 12px;
}
</style>
