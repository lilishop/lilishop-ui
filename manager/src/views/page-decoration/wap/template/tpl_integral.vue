<template>
  <div class="layout" :style="wrapperStyle">
    <div class="integral-head" :style="headStyle">
      <img
        v-if="styled && res.titleType === 'image' && res.titleImage"
        class="integral-head-img"
        :src="res.titleImage"
        alt=""
      />
      <div v-else class="integral-head-title" :style="headTitleStyle">{{ title }}</div>
      <div class="integral-head-space"></div>
      <div class="integral-head-more" :style="moreStyle">更多 &gt;</div>
    </div>
    <!-- 老数据：原始四列样式 -->
    <div v-if="!styled" class="join-box">
      <div class="join-item" v-for="item in 4" :key="item">
        <div class="item-img-box">
          <img
            class="item-img"
            src="https://picsum.photos/id/268/200/200"
            alt
          />
        </div>
        <div class="item-price">
          <span>20积分</span>
        </div>
        <div class="item-line-through">
          <span>30积分</span>
        </div>
      </div>
    </div>
    <!-- 样式一：两列大卡片 -->
    <div v-else-if="layoutStyle === '1'" class="ig-grid2" :style="gapStyle">
      <div class="ig-g2-item" v-for="(g, i) in displayData" :key="i">
        <div class="ig-g2-img-box" :style="imgRadiusStyle">
          <img class="ig-img" :src="g.thumbnail ? g.thumbnail : g.goodsImage" alt />
        </div>
        <div class="ig-g2-name" :style="nameStyle">{{ g.goodsName ? g.goodsName : g.name }}</div>
        <div class="ig-price-row">
          <div class="ig-price" :style="pointStyle">
            <span class="ig-coin">¥</span>{{ g.points != null ? g.points : 0 }}积分
          </div>
          <s class="ig-original" v-if="g.originalPrice">¥{{ g.originalPrice }}</s>
        </div>
      </div>
    </div>
    <!-- 样式二：三列，积分价在名称上方 -->
    <div v-else-if="layoutStyle === '2'" class="ig-grid3" :style="gapStyle">
      <div class="ig-g3-item" v-for="(g, i) in displayData" :key="i">
        <div class="ig-g3-img-box" :style="imgRadiusStyle">
          <img class="ig-img" :src="g.thumbnail ? g.thumbnail : g.goodsImage" alt />
        </div>
        <div class="ig-price ig-price-sm" :style="pointStyle">
          <span class="ig-coin ig-coin-sm">¥</span>{{ g.points != null ? g.points : 0 }}积分
        </div>
        <div class="ig-g3-name" :style="nameStyle">{{ g.goodsName ? g.goodsName : g.name }}</div>
      </div>
    </div>
    <!-- 样式三：三列，仅积分价 -->
    <div v-else class="ig-grid3" :style="gapStyle">
      <div class="ig-g3-item" v-for="(g, i) in displayData" :key="i">
        <div class="ig-g3-img-box" :style="imgRadiusStyle">
          <img class="ig-img" :src="g.thumbnail ? g.thumbnail : g.goodsImage" alt />
        </div>
        <div class="ig-price ig-price-sm" :style="pointStyle">
          <span class="ig-coin ig-coin-sm">¥</span>{{ g.points != null ? g.points : 0 }}积分
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue";

const props = defineProps(["res"]);

const title = computed(
  () => (props.res.list && props.res.list[0] && props.res.list[0].title) || "积分兑好礼"
);
const firstItem = computed(() => (props.res.list && props.res.list[0]) || {});
const layoutStyle = computed(() => props.res.layoutStyle || "1");
const displayData = computed(() => {
  const data = (firstItem.value && firstItem.value.data) || [];
  return layoutStyle.value === "1" ? data.slice(0, 4) : data.slice(0, 6);
});

// 面板保存过样式字段才启用新样式，老数据保持原样
const styled = computed(() => props.res && props.res.paddingTop !== undefined);
const px = (v) => `${(Number(v) || 0) / 2}px`;

const wrapperStyle = computed(() => {
  const res = props.res || {};
  if (!styled.value) {
    return {
      background: res.bgColor || "#FFFFFF",
      padding: `0 ${res.paddingX || 0}px`,
      marginBottom: `${res.pageGap !== undefined ? res.pageGap : 10}px`,
      borderRadius: `${res.borderRadius || 0}px`,
      overflow: "hidden",
    };
  }
  const bg =
    !res.bgColor2 || res.bgColor1 === res.bgColor2
      ? res.bgColor1
      : `linear-gradient(180deg, ${res.bgColor1}, ${res.bgColor2})`;
  return {
    background: bg,
    padding: `${px(res.paddingTop)} ${px(res.paddingX)} ${px(res.paddingBottom)}`,
    marginBottom: px(res.pageGap),
    borderRadius: px(res.borderRadius),
    overflow: Number(res.borderRadius) > 0 ? "hidden" : "visible",
  };
});

const headStyle = computed(() => {
  if (!styled.value) return {};
  const res = props.res;
  if (res.headBgType === "image" && res.headBgImage) {
    return {
      backgroundImage: `url(${res.headBgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  return {
    background:
      !res.headBg2 || res.headBg1 === res.headBg2
        ? res.headBg1
        : `linear-gradient(90deg, ${res.headBg1}, ${res.headBg2})`,
  };
});

const headTitleStyle = computed(() => {
  if (!styled.value) return {};
  const res = props.res;
  return {
    color: res.titleColor || "#FFFFFF",
    fontWeight: res.titleStyle === "bold" ? "bold" : "normal",
    fontStyle: res.titleStyle === "italic" ? "italic" : "normal",
  };
});

const moreStyle = computed(() =>
  styled.value ? { color: props.res.moreColor || "#999999" } : {}
);
const pointStyle = computed(() =>
  styled.value && props.res.pointColor ? { color: props.res.pointColor } : {}
);
const nameStyle = computed(() =>
  styled.value && props.res.nameColor ? { color: props.res.nameColor } : {}
);
const gapStyle = computed(() =>
  styled.value ? { gap: px(props.res.contentGap) } : {}
);
const imgRadiusStyle = computed(() =>
  styled.value ? { borderRadius: px(props.res.imgRadius), overflow: "hidden" } : {}
);
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.integral-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  min-height: 48px;
  padding: 0 12px;
  box-sizing: border-box;
  margin-bottom: 10px;
  border-radius: 6px;
}
.integral-head-img {
  width: 77px;
  height: 16px;
  object-fit: contain;
}
.integral-head-title {
  font-size: 16px;
  font-weight: bold;
}
.integral-head-space {
  flex: 1;
}
.integral-head-more {
  flex-shrink: 0;
  font-size: 12px;
  color: #999;
}
.join-box {
  display: flex;
}
.item-price {
  > span {
    font-size: 15px;
    font-weight: 500;
    color: #e1212b;
  }
}
.join-item {
  flex: 1;
  text-align: center;
}
.item-img-box {
  position: relative;
}
.item-line-through {
  > span {
    font-size: 10px;
    font-weight: 400;
    text-decoration: line-through;
    color: #999;
  }
}
.item-img {
  width: 75px;
  height: 75px;
  margin: 0 auto;
  display: block;
}

/* 积分商品卡片（参考 CRMEB 积分商城） */
.ig-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
.ig-grid2 {
  display: flex;
  flex-wrap: wrap;
}
.ig-g2-item {
  width: calc(50% - 5px);
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  padding-bottom: 8px;
  box-sizing: border-box;
}
.ig-g2-img-box {
  width: 100%;
  height: 150px;
  background: #f5f5f5;
}
.ig-g2-name {
  margin: 8px 8px 0;
  font-size: 13px;
  color: #282828;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ig-price-row {
  display: flex;
  align-items: baseline;
  margin: 5px 8px 0;
  min-width: 0;
}
.ig-price {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
  color: #f5483a;
  white-space: nowrap;
}
.ig-price-sm {
  font-size: 12px;
  margin-top: 5px;
}
.ig-coin {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffe29a, #f5a623);
  color: #fff;
  font-size: 9px;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 3px;
  flex-shrink: 0;
}
.ig-coin-sm {
  width: 12px;
  height: 12px;
  font-size: 8px;
}
.ig-original {
  font-size: 11px;
  color: #999;
  margin-left: 5px;
  white-space: nowrap;
}
.ig-grid3 {
  display: flex;
  flex-wrap: wrap;
}
.ig-g3-item {
  width: calc(33.33% - 7px);
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  padding-bottom: 8px;
  box-sizing: border-box;
}
.ig-g3-item .ig-price {
  margin: 5px 8px 0;
}
.ig-g3-img-box {
  width: 100%;
  height: 92px;
  background: #f5f5f5;
}
.ig-g3-name {
  margin: 4px 8px 0;
  font-size: 12px;
  color: #282828;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
