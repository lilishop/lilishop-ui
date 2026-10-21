<template>
  <div class="layout" :class="{ styled: styled }" :style="wrapperStyle" v-if="texts.length">
    <div class="background" :style="barStyle">
      <img
        v-if="styled && item.img"
        class="notice-icon"
        :src="item.img"
        alt=""
      />
      <div class="title" :style="{ color: item.color, textAlign: alignValue }">
        {{ context }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from "vue";

defineOptions({ title: "公告" });
const props = defineProps(["res"]);

const item = computed(() => props.res?.list?.[0] || {});
const texts = computed(() => {
  const titles = item.value?.title;
  if (!Array.isArray(titles)) return [];
  return titles.filter((t) => t && t.context != null && String(t.context).length > 0);
});

// 面板保存过样式字段才启用自定义样式，老数据保持原样
const styled = computed(() => props.res && props.res.paddingX !== undefined);

const px = (v) => `${(Number(v) || 0) / 2}px`;
const wrapperStyle = computed(() => {
  const res = props.res || {};
  if (!styled.value) return {};
  const bg =
    !res.bgColor2 || res.bgColor1 === res.bgColor2
      ? res.bgColor1
      : `linear-gradient(180deg, ${res.bgColor1}, ${res.bgColor2})`;
  return {
    padding: `${px(res.paddingTop)} ${px(res.paddingX)} ${px(res.paddingBottom)}`,
    background: bg,
    borderRadius: px(res.borderRadius),
    marginBottom: px(res.pageGap),
    overflow: Number(res.borderRadius) > 0 ? "hidden" : "visible",
  };
});
const barStyle = computed(() =>
  styled.value ? {} : { backgroundColor: item.value.bk_color }
);
const alignValue = computed(() =>
  styled.value ? item.value.textAlign || "left" : "left"
);

const index = ref(0);
const context = ref("");
let timer = null;

watch(
  texts,
  (list) => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    index.value = 0;
    context.value = list.length ? String(list[0].context) : "";
    if (list.length > 1) {
      timer = setInterval(() => {
        index.value = (index.value + 1) % list.length;
        context.value = String(list[index.value].context);
      }, 3000);
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.background {
  width: 100%;
  height: 42px;
  text-align: left;
  font-size: 10px;
  background-size: cover;
  display: flex;
  align-items: center;
}
.layout {
  text-align: center;
  position: relative;
  height: 42px;
}
.layout.styled {
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}
.notice-icon {
  width: 65px;
  height: 18px;
  object-fit: contain;
  flex-shrink: 0;
  margin: 0 8px;
}
.title {
  flex: 1;
  min-width: 0;
  line-height: 42px;
  font-size: 10px;
  font-weight: bold;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
