<template>
  <div class="layout" :style="wrapperStyle">
    <!-- 拼团：红橙渐变头部 + 左图右文商品行（参考 CRMEB） -->
    <div v-if="isPintuan" class="pt-card">
      <div class="pt-head" :style="ptHeadStyle">
        <img
          v-if="headTitleImage"
          class="pt-title-img"
          :src="headTitleImage"
          alt=""
        />
        <span v-else class="pt-title">{{ firstItem.title || "超值拼团" }}</span>
        <template v-if="firstItem.groupSuccess">
          <span class="pt-divider"></span>
          <span class="pt-avatars">
            <i v-for="n in 3" :key="n" class="pt-avatar">
              <svg viewBox="0 0 24 24" width="12" height="12">
                <circle cx="12" cy="8" r="4.5" fill="#fff" />
                <path d="M3.5 20.5c0-4.6 3.9-7 8.5-7s8.5 2.4 8.5 7" fill="#fff" />
              </svg>
            </i>
          </span>
          <span class="pt-success">{{ firstItem.groupSuccess }}</span>
        </template>
        <span class="pt-space"></span>
        <span class="pt-more" :style="moreStyle">更多 ></span>
      </div>
      <div class="pt-body">
        <!-- 样式一：纵向商品行 -->
        <template v-if="layoutStyle === '1'">
          <div class="pt-row" v-for="(g, i) in displayData" :key="i">
            <div class="pt-img-box" :style="imgRadiusStyle">
              <img class="pt-img" :src="g.thumbnail ? g.thumbnail : g.goodsImage" alt />
            </div>
            <div class="pt-info">
              <div
                v-if="res.showGoodsName !== false"
                class="pt-name"
                :style="nameStyle"
              >
                {{ g.goodsName ? g.goodsName : g.name }}
              </div>
              <div
                v-if="res.showGroupTag !== false && (g.groupNum || g.joined != null)"
                class="pt-tags"
              >
                <span class="pt-tag-group">{{ g.groupNum || 2 }}人团</span>
                <span class="pt-tag-joined">已拼{{ g.joined != null ? g.joined : 0 }}份</span>
              </div>
              <div class="pt-bottom">
                <div class="pt-prices" v-if="res.showGoodsPrice !== false">
                  <div class="pt-price-line">
                    <span class="pt-price-label">拼团价</span>
                    <span class="pt-price"><em>¥</em>{{ g.price ? g.price : g.originalPrice }}</span>
                  </div>
                  <div
                    class="pt-original"
                    v-if="res.showOriginalPrice !== false && g.originalPrice"
                  >
                    单买价 <s>¥{{ g.originalPrice }}</s>
                  </div>
                </div>
                <div class="pt-btn" v-if="res.showGroupBtn !== false">去拼团</div>
              </div>
            </div>
          </div>
        </template>
        <!-- 样式二：两列网格卡片 -->
        <div v-else-if="layoutStyle === '2'" class="pt-grid2">
          <div class="pt-g2-item" v-for="(g, i) in displayData" :key="i">
            <div class="pt-g2-img-box" :style="imgRadiusStyle">
              <img class="pt-img" :src="g.thumbnail ? g.thumbnail : g.goodsImage" alt />
            </div>
            <div class="pt-g2-name-row">
              <span
                v-if="res.showGroupTag !== false && (g.groupNum || g.joined != null)"
                class="pt-tag-soft"
              >{{ g.groupNum || 2 }}人团</span>
              <span
                v-if="res.showGoodsName !== false"
                class="pt-g2-name"
                :style="nameStyle"
              >{{ g.goodsName ? g.goodsName : g.name }}</span>
            </div>
            <div class="pt-g2-bottom">
              <div class="pt-g2-prices" v-if="res.showGoodsPrice !== false">
                <span class="pt-price-sm"><em>¥</em>{{ g.price ? g.price : g.originalPrice }}</span>
                <s
                  class="pt-original-sm"
                  v-if="res.showOriginalPrice !== false && g.originalPrice"
                >¥{{ g.originalPrice }}</s>
              </div>
              <div class="pt-btn pt-btn-sm" v-if="res.showGroupBtn !== false">去拼团</div>
            </div>
          </div>
        </div>
        <!-- 样式三：三列网格 -->
        <div v-else-if="layoutStyle === '3'" class="pt-grid3">
          <div class="pt-g3-item" v-for="(g, i) in displayData" :key="i">
            <div class="pt-g3-img-box" :style="imgRadiusStyle">
              <img class="pt-img" :src="g.thumbnail ? g.thumbnail : g.goodsImage" alt />
              <span
                v-if="res.showGroupTag !== false && (g.groupNum || g.joined != null)"
                class="pt-corner-tag"
              >{{ g.groupNum || 2 }}人团</span>
            </div>
            <div
              v-if="res.showGoodsName !== false"
              class="pt-g3-name"
              :style="nameStyle"
            >{{ g.goodsName ? g.goodsName : g.name }}</div>
            <div class="pt-g3-prices" v-if="res.showGoodsPrice !== false">
              <span class="pt-price-sm"><em>¥</em>{{ g.price ? g.price : g.originalPrice }}</span>
              <s
                class="pt-original-sm"
                v-if="res.showOriginalPrice !== false && g.originalPrice"
              >¥{{ g.originalPrice }}</s>
            </div>
          </div>
        </div>
        <!-- 样式四：横向滑动 -->
        <div v-else class="pt-scroll">
          <div class="pt-s-item" v-for="(g, i) in displayData" :key="i">
            <div class="pt-g3-img-box" :style="imgRadiusStyle">
              <img class="pt-img" :src="g.thumbnail ? g.thumbnail : g.goodsImage" alt />
              <span
                v-if="res.showGroupTag !== false && (g.groupNum || g.joined != null)"
                class="pt-corner-tag"
              >{{ g.groupNum || 2 }}人团</span>
            </div>
            <div
              v-if="res.showGoodsName !== false"
              class="pt-g3-name"
              :style="nameStyle"
            >{{ g.goodsName ? g.goodsName : g.name }}</div>
            <div class="pt-g3-prices" v-if="res.showGoodsPrice !== false">
              <span class="pt-price-sm"><em>¥</em>{{ g.price ? g.price : g.originalPrice }}</span>
              <s
                class="pt-original-sm"
                v-if="res.showOriginalPrice !== false && g.originalPrice"
              >¥{{ g.originalPrice }}</s>
            </div>
          </div>
        </div>
        <div v-if="!displayData.length" class="pt-empty">
          暂无拼团商品
        </div>
      </div>
    </div>
    <!-- 直播：参考 CRMEB 小程序直播（单行/多行/双排） -->
    <div v-else-if="isLive" class="lv-card">
      <div class="lv-head">
        <img v-if="res.icon" class="lv-head-icon" :src="res.icon" alt="" />
        <span v-else class="lv-head-title">{{ firstItem.title || "精彩直播" }}</span>
        <span class="lv-head-sub" :style="titleStyle">{{ firstItem.title1 || "精彩抢先看" }}</span>
        <span class="lv-space"></span>
        <span class="lv-more" :style="moreStyle">更多 ></span>
      </div>
      <div class="lv-head-en">Exciting live streaming</div>
      <!-- 单行：横向滑动卡片 -->
      <div v-if="layoutStyle === '1'" class="lv-scroll">
        <div class="lv-s-item" v-for="(item, i) in liveData" :key="i">
          <div class="lv-s-img-box" :style="imgRadiusStyle">
            <img class="lv-img" :src="item.cover" alt />
            <span class="lv-tag" :class="item.tagClass">{{ item.tagText }}</span>
          </div>
        </div>
      </div>
      <!-- 多行：纵向列表 -->
      <div v-else-if="layoutStyle === '2'" class="lv-rows">
        <div class="lv-row" v-for="(item, i) in liveData" :key="i">
          <div class="lv-r-img-box" :style="imgRadiusStyle">
            <img class="lv-img" :src="item.cover" alt />
            <span class="lv-tag" :class="item.tagClass">{{ item.tagText }}</span>
          </div>
          <div class="lv-r-info">
            <div class="lv-title" :style="nameStyle">{{ item.title }}</div>
            <div class="lv-anchor">{{ item.anchorName }}</div>
            <div class="lv-nogoods">暂无商品</div>
          </div>
        </div>
      </div>
      <!-- 双排：两列网格 -->
      <div v-else class="lv-grid2">
        <div class="lv-g-item" v-for="(item, i) in liveData" :key="i">
          <div class="lv-g-img-box" :style="imgRadiusStyle">
            <img class="lv-img" :src="item.cover" alt />
            <span class="lv-tag" :class="item.tagClass">{{ item.tagText }}</span>
            <span v-if="item.startTime" class="lv-time">{{ item.startTime }}</span>
          </div>
          <div class="lv-title" :style="nameStyle">{{ item.title }}</div>
          <div class="lv-anchor">{{ item.anchorName }}</div>
        </div>
      </div>
    </div>
    <!-- 秒杀：参考 CRMEB 秒杀（红渐变头部 + 横滑/列表） -->
    <div v-else-if="isSeckill" class="sk-card" :style="seckillCardStyle">
      <div class="sk-head">
        <img v-if="res.icon" class="sk-head-icon" :src="res.icon" alt="" />
        <span v-else class="sk-head-title" :style="titleStyle">{{ firstItem.title || "限时秒杀" }}</span>
        <span class="sk-divider"></span>
        <span class="sk-head-sub" :style="titleStyle">{{ firstItem.title1 || "邀请你的好友来参与" }}</span>
        <span class="sk-space"></span>
        <span class="sk-go">GO ></span>
      </div>
      <!-- 样式一：横向滑动 -->
      <div v-if="layoutStyle === '1'" class="sk-scroll" :style="gapStyle">
        <div class="sk-s-item" v-for="(g, i) in seckillData" :key="i" :style="imgRadiusStyle">
          <div class="sk-s-img-box" :style="imgRadiusStyle">
            <img class="lv-img" :src="g.thumbnail ? g.thumbnail : g.goodsImage" alt />
          </div>
          <div
            v-if="res.showGoodsName !== false"
            class="sk-name"
            :style="nameStyle"
          >{{ g.goodsName ? g.goodsName : g.name }}</div>
          <div v-if="res.showGoodsPrice !== false" class="sk-price">
            <em>¥</em>{{ g.price ? g.price : g.originalPrice }}
          </div>
        </div>
      </div>
      <!-- 样式二：纵向列表 -->
      <div v-else class="sk-rows" :style="gapStyle">
        <div class="sk-row" v-for="(g, i) in seckillData" :key="i" :style="imgRadiusStyle">
          <div class="sk-r-img-box" :style="imgRadiusStyle">
            <img class="lv-img" :src="g.thumbnail ? g.thumbnail : g.goodsImage" alt />
          </div>
          <div class="sk-r-info">
            <div
              v-if="res.showGoodsName !== false"
              class="sk-name"
              :style="nameStyle"
            >{{ g.goodsName ? g.goodsName : g.name }}</div>
            <div v-if="res.showGoodsPrice !== false" class="sk-price sk-price-lg">
              <em>¥</em>{{ g.price ? g.price : g.originalPrice }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 砍价：沿用秒杀风格（红渐变头部 + 横滑/列表），价格显示最低砍价 -->
    <div v-else-if="isKanjia" class="sk-card" :style="seckillCardStyle">
      <div class="sk-head">
        <img v-if="res.icon" class="sk-head-icon" :src="res.icon" alt="" />
        <span v-else class="sk-head-title" :style="titleStyle">{{ firstItem.title || "砍价免费拿" }}</span>
        <span class="sk-divider"></span>
        <span class="sk-head-sub" :style="titleStyle">{{ firstItem.title1 || "邀请好友来砍价" }}</span>
        <span class="sk-space"></span>
        <span class="sk-go">GO ></span>
      </div>
      <!-- 样式一：横向滑动 -->
      <div v-if="layoutStyle === '1'" class="sk-scroll" :style="gapStyle">
        <div class="sk-s-item" v-for="(g, i) in seckillData" :key="i" :style="imgRadiusStyle">
          <div class="sk-s-img-box" :style="imgRadiusStyle">
            <img class="lv-img" :src="g.thumbnail ? g.thumbnail : g.goodsImage" alt />
          </div>
          <div
            v-if="res.showGoodsName !== false"
            class="sk-name"
            :style="nameStyle"
          >{{ g.goodsName ? g.goodsName : g.name }}</div>
          <div v-if="res.showGoodsPrice !== false" class="sk-price">
            <span class="sk-price-min">最低</span><em>¥</em>{{ g.purchasePrice != null ? g.purchasePrice : (g.price ? g.price : g.originalPrice) }}
          </div>
        </div>
      </div>
      <!-- 样式二：纵向列表 -->
      <div v-else class="sk-rows" :style="gapStyle">
        <div class="sk-row" v-for="(g, i) in seckillData" :key="i" :style="imgRadiusStyle">
          <div class="sk-r-img-box" :style="imgRadiusStyle">
            <img class="lv-img" :src="g.thumbnail ? g.thumbnail : g.goodsImage" alt />
          </div>
          <div class="sk-r-info">
            <div
              v-if="res.showGoodsName !== false"
              class="sk-name"
              :style="nameStyle"
            >{{ g.goodsName ? g.goodsName : g.name }}</div>
            <div v-if="res.showGoodsPrice !== false" class="sk-price sk-price-lg">
              <span class="sk-price-min">最低</span><em>¥</em>{{ g.purchasePrice != null ? g.purchasePrice : (g.price ? g.price : g.originalPrice) }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <template v-else>
      <div v-if="styled && (res.icon || res.moreUrl)" class="promo-head">
        <img v-if="res.icon" class="promo-head-icon" :src="res.icon" alt="" />
        <div class="promo-head-space"></div>
        <div v-if="res.moreUrl" class="promo-more" :style="moreStyle">更多 ></div>
      </div>
      <div class="join-list" :style="gapStyle">
        <div
          v-for="(item, index) in res.list"
          :key="index"
          class="join-list-item"
        >
          <div>
            <div class="join-title">
              <div>{{ item.title }}</div>
              <div
                class="sub"
                :style="{
                  backgroundColor: item.bk_color,
                  color: item.color1,
                  borderColor: item.bk_color,
                }"
              >
                {{ item.title1 }}
              </div>
            </div>
            <div class="join-box">
              <div
                class="join-item"
                v-for="(i, _index) in item.data"
                :key="_index"
              >
                <div class="item-img-box" :style="imgRadiusStyle">
                  <img
                    class="item-img"
                    :src="i.thumbnail ? i.thumbnail : i.goodsImage"
                    alt
                  />
                </div>
                <div
                  v-if="res.showGoodsName !== false"
                  class="ellipsis"
                  :class="{ 'max-width': res.list.length <= 1 }"
                  :style="nameStyle"
                >
                  {{ i.goodsName ? i.goodsName : i.name }}
                </div>
                <div class="item-price" v-if="res.showGoodsPrice !== false">
                  <span>￥{{ i.price ? i.price : i.originalPrice }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script setup>
import { computed } from "vue";
const SECKILL_DEMO = [
  {
    goodsName: "iPhone 16 Pro 256GB 黑色钛金属",
    price: 6999,
    originalPrice: 8999,
    thumbnail: "/demo/apple-phone.png",
  },
  {
    goodsName: "Xiaomi 15 Pro 16GB+512GB 沉墨色",
    price: 4699,
    originalPrice: 5299,
    thumbnail: "/demo/xiaomi-phone.png",
  },
  {
    goodsName: "vivo X200 Pro 16GB+512GB 钛色",
    price: 4899,
    originalPrice: 5499,
    thumbnail: "/demo/vivo-phone.png",
  },
  {
    goodsName: "Apple Watch Series 10 46mm GPS款",
    price: 2699,
    originalPrice: 3199,
    thumbnail: "/demo/apple-phone.png",
  },
  {
    goodsName: "AirPods Pro (第二代) 配USB-C充电盒",
    price: 1399,
    originalPrice: 1899,
    thumbnail: "/demo/apple-phone.png",
  },
  {
    goodsName: "Xiaomi 平板 6S Pro 12.4英寸",
    price: 2799,
    originalPrice: 3299,
    thumbnail: "/demo/xiaomi-phone.png",
  },
];

const PINTUAN_DEMO = [
  {
    goodsName: "iPhone 16 Pro 5G智能手机 256GB 白色钛金属",
    price: 7999,
    originalPrice: 8999,
    thumbnail: "/demo/apple-phone.png",
    groupNum: 2,
    joined: 128,
  },
  {
    goodsName: "Xiaomi 15 5G智能手机 12GB+256GB 白色",
    price: 3699,
    originalPrice: 4299,
    thumbnail: "/demo/xiaomi-phone.png",
    groupNum: 2,
    joined: 256,
  },
  {
    goodsName: "vivo X200 5G智能手机 12GB+256GB 宝石蓝",
    price: 3999,
    originalPrice: 4599,
    thumbnail: "/demo/vivo-phone.png",
    groupNum: 3,
    joined: 89,
  },
  {
    goodsName: "Apple AirPods 4 主动降噪无线耳机",
    price: 1099,
    originalPrice: 1399,
    thumbnail: "/demo/apple-phone.png",
    groupNum: 2,
    joined: 412,
  },
  {
    goodsName: "小米手环 9 Pro 晨曦金 金属机身",
    price: 349,
    originalPrice: 399,
    thumbnail: "/demo/xiaomi-phone.png",
    groupNum: 2,
    joined: 680,
  },
  {
    goodsName: "vivo Pad3 Pro 13英寸 3.1K 超清大屏",
    price: 2999,
    originalPrice: 3399,
    thumbnail: "/demo/vivo-phone.png",
    groupNum: 2,
    joined: 195,
  },
];

const KANJIA_DEMO = [
  {
    goodsName: "米家智能空气炸锅 6.5L 嫩烤大容量",
    purchasePrice: 0,
    price: 0,
    originalPrice: 299,
    thumbnail: "/demo/xiaomi-phone.png",
  },
  {
    goodsName: "电动声波牙刷 T300 高频震动洁齿",
    purchasePrice: 0,
    price: 0,
    originalPrice: 129,
    thumbnail: "/demo/vivo-phone.png",
  },
  {
    goodsName: "小米随身手持小风扇 大风力轻便便携",
    purchasePrice: 0,
    price: 0,
    originalPrice: 59,
    thumbnail: "/demo/xiaomi-phone.png",
  },
  {
    goodsName: "智能温湿度计 电子墨水屏高精度",
    purchasePrice: 0,
    price: 0,
    originalPrice: 69,
    thumbnail: "/demo/apple-phone.png",
  },
];

const LIVE_DEMO = [
  {
    cover: "/demo/apple-phone.png",
    title: "双11新品首发专场 抢先看",
    anchorName: "官方品牌主播",
    status: "LIVE",
    tagText: "直播中",
    tagClass: "lv-tag-live",
  },
  {
    cover: "/demo/xiaomi-phone.png",
    title: "米粉狂欢日 爆款好物直降",
    anchorName: "好物推荐官",
    status: "PREVIEW",
    startTime: "10/22 19:00",
    tagText: "预告",
    tagClass: "lv-tag-preview",
  },
  {
    cover: "/demo/vivo-phone.png",
    title: "旗舰影像新机实测现场",
    anchorName: "数码达人",
    status: "REPLAY",
    tagText: "回放",
    tagClass: "lv-tag-replay",
  },
];


const props = defineProps(["res"]);

// 面板保存过样式字段才启用新样式，老数据保持原样
const styled = computed(() => props.res && props.res.paddingTop !== undefined);
const firstItem = computed(() => (props.res.list && props.res.list[0]) || {});
const isPintuan = computed(() => firstItem.value.type === "PINTUAN");
const isLive = computed(() => firstItem.value.type === "LIVE");
const isSeckill = computed(() => firstItem.value.type === "SECKILL");
const isKanjia = computed(() => firstItem.value.type === "KANJIA");
const seckillData = computed(() => {
  const raw = (firstItem.value && firstItem.value.data) || [];
  const data = raw.length ? raw : (isKanjia.value ? KANJIA_DEMO : SECKILL_DEMO);
  return layoutStyle.value === "2" ? data.slice(0, 4) : data.slice(0, 6);
});
// 老数据未保存过样式时，给个红→白渐变兜底背景
const seckillCardStyle = computed(() =>
  styled.value
    ? {}
    : { background: "linear-gradient(180deg, #FF2200 0%, #FFFFFF 45%)" }
);
const layoutStyle = computed(() => (props.res && props.res.layoutStyle) || "1");
const liveTagOf = (status) => {
  const s = String(status == null ? "" : status).toUpperCase();
  if (["LIVE", "LIVING", "1", "101"].includes(s)) {
    return { text: "直播中", cls: "lv-tag-live" };
  }
  if (["REPLAY", "PLAYBACK", "OVER", "3", "103"].includes(s)) {
    return { text: "回放", cls: "lv-tag-replay" };
  }
  return { text: "预告", cls: "lv-tag-preview" };
};
const fmtLiveTime = (t) => {
  if (!t) return "";
  const s = String(t);
  const m = s.match(/^\d{4}-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (m) return `${Number(m[1])}/${Number(m[2])} ${m[3]}:${m[4]}`;
  return s;
};
const liveData = computed(() => {
  const raw = (firstItem.value && firstItem.value.data) || [];
  if (!raw.length) {
    return LIVE_DEMO;
  }
  const limit = layoutStyle.value === "2" ? 3 : 6;
  return raw.slice(0, limit).map((item) => {
    const tag = liveTagOf(item.status != null ? item.status : item.liveStatus);
    return {
      cover: item.cover || item.roomImg || item.shareImg || item.thumbnail || "",
      title: item.title || item.roomName || item.goodsName || item.name || "",
      anchorName:
        item.anchorName || item.anchorNickname || item.nickName || "",
      startTime: fmtLiveTime(item.startTime || item.liveTime),
      tagText: tag.text,
      tagClass: tag.cls,
    };
  });
});
const displayData = computed(() => {
  const raw = (firstItem.value && firstItem.value.data) || [];
  const data = raw.length ? raw : PINTUAN_DEMO;
  if (layoutStyle.value === "3" || layoutStyle.value === "4") {
    return data.slice(0, 6);
  }
  return data.slice(0, 4);
});
const headTitleImage = computed(() =>
  props.res.headTitleType === "image" ? props.res.headTitleImage : ""
);
const ptHeadStyle = computed(() => {
  const res = props.res || {};
  if (res.headBgType === "image" && res.headBgImage) {
    return {
      backgroundImage: `url(${res.headBgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  if (res.headBgColor1) {
    const bg =
      !res.headBgColor2 || res.headBgColor1 === res.headBgColor2
        ? res.headBgColor1
        : `linear-gradient(90deg, ${res.headBgColor1}, ${res.headBgColor2})`;
    return { background: bg };
  }
  return {};
});
const px = (v) => `${(Number(v) || 0) / 2}px`;
const wrapperStyle = computed(() => {
  const res = props.res || {};
  if (!styled.value) return {};
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
const gapStyle = computed(() =>
  styled.value ? { gap: px(props.res.contentGap) } : {}
);
const moreStyle = computed(() =>
  styled.value && props.res.moreColor ? { color: props.res.moreColor } : {}
);
const titleStyle = computed(() =>
  styled.value && props.res.titleColor ? { color: props.res.titleColor } : {}
);
const nameStyle = computed(() =>
  styled.value && props.res.nameColor ? { color: props.res.nameColor } : {}
);
const imgRadiusStyle = computed(() =>
  styled.value ? { borderRadius: px(props.res.imgRadius), overflow: "hidden" } : {}
);
</script>
<style lang="scss" scoped>
@import "./tpl.scss";
.promo-head {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 8px;
}
.promo-head-icon {
  width: 62px;
  height: 16px;
  object-fit: contain;
  flex-shrink: 0;
}
.promo-head-space {
  flex: 1;
}
.promo-more {
  flex-shrink: 0;
  font-size: 12px;
  color: #999;
}
.join-box {
  display: flex;
}
.join-list {
  width: 100%;
  display: flex;
  overflow: hidden;
}
.join-list-item {
  flex: 1;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 54px; // 大于1个活动
  font-size: 11px;
}
.max-width {
  width: 158px !important;
}
.item-price {
  > span {
    font-size: 14px;
    font-weight: 500;
    color: #e1212b;
  }
}
.join-item {
  flex: 1;
}
.item-img {
  width: 75px;
  height: 75px;
  margin: 0 auto;
  display: block;
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
.item-position-tips {
  position: absolute;
  right: 0;
  color: #fff;
  font-size: 12px;
  bottom: 0;
}
.join-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  height: 50px;
  > div:nth-of-type(1) {
    font-size: 15px;
    font-weight: bold;
  }
  > div:nth-of-type(2) {
    font-size: 10px;
    color: #fff;
    border: 2px solid;
    border-radius: 8px;
    text-align: center;
    width: 30%;
  }
  .sub {
    background-color: #e1212b;
    margin-right: 40px;
  }
}

/* 拼团卡片（参考 CRMEB 样式一） */
.pt-card {
  width: 100%;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
}
.pt-head {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 12px;
  background: linear-gradient(90deg, #f5483a, #ff7e3d);
  color: #fff;
}
.pt-title {
  font-size: 16px;
  font-weight: bold;
}
.pt-title-img {
  height: 20px;
  object-fit: contain;
}
.pt-divider {
  width: 1px;
  height: 14px;
  background: rgba(255, 255, 255, 0.6);
  margin: 0 8px;
}
.pt-avatars {
  display: inline-flex;
  margin-right: 6px;
}
.pt-avatar {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid #fff;
  background: #f0b429;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;
  & + .pt-avatar {
    margin-left: -6px;
  }
  &:nth-of-type(2) {
    background: #7bc47f;
  }
  &:nth-of-type(3) {
    background: #64a8f5;
  }
}
.pt-success {
  font-size: 11px;
}
.pt-space {
  flex: 1;
}
.pt-more {
  font-size: 12px;
  color: #fff;
}
.pt-body {
  padding: 4px 12px 12px;
}
.pt-row {
  display: flex;
  padding-top: 12px;
  & + .pt-row {
    margin-top: 12px;
    border-top: 1px solid #f5f5f5;
  }
}
.pt-img-box {
  width: 96px;
  height: 96px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  margin-right: 10px;
}
.pt-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
.pt-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.pt-name {
  font-size: 13px;
  color: #333;
  line-height: 18px;
  height: 36px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.pt-tags {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.pt-tag-group {
  background: linear-gradient(90deg, #f5483a, #ff6a3d);
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
}
.pt-tag-joined {
  background: #fdeae7;
  color: #f5483a;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
}
.pt-bottom {
  margin-top: auto;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
.pt-price-line {
  display: flex;
  align-items: baseline;
}
.pt-price-label {
  font-size: 11px;
  color: #f5483a;
  margin-right: 2px;
}
.pt-price {
  font-size: 18px;
  font-weight: bold;
  color: #f5483a;
  em {
    font-style: normal;
    font-size: 12px;
  }
}
.pt-original {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}
.pt-btn {
  background: linear-gradient(90deg, #f5483a, #ff6a3d);
  color: #fff;
  font-size: 12px;
  padding: 6px 14px;
  border-radius: 15px;
  flex-shrink: 0;
}
.pt-empty {
  text-align: center;
  color: #999;
  font-size: 12px;
  padding: 24px 0;
}

/* 样式二：两列网格卡片 */
.pt-grid2 {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 12px;
}
.pt-g2-item {
  width: calc(50% - 5px);
  background: #fff;
}
.pt-g2-img-box {
  width: 100%;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
}
.pt-g2-name-row {
  display: flex;
  align-items: center;
  margin-top: 8px;
  min-width: 0;
}
.pt-tag-soft {
  background: #fdeae7;
  color: #f5483a;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 3px;
  margin-right: 5px;
  flex-shrink: 0;
}
.pt-g2-name {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pt-g2-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}
.pt-g2-prices {
  display: flex;
  align-items: baseline;
  min-width: 0;
  overflow: hidden;
}
.pt-price-sm {
  font-size: 15px;
  font-weight: bold;
  color: #f5483a;
  flex-shrink: 0;
  em {
    font-style: normal;
    font-size: 11px;
  }
}
.pt-original-sm {
  font-size: 11px;
  color: #999;
  margin-left: 4px;
  white-space: nowrap;
}
.pt-btn-sm {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 12px;
}

/* 样式三：三列网格 */
.pt-grid3 {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 12px;
}
.pt-g3-item {
  width: calc(33.33% - 6px);
  min-width: 0;
}
.pt-g3-img-box {
  position: relative;
  width: 100%;
  height: 92px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
}
.pt-corner-tag {
  position: absolute;
  top: 0;
  left: 0;
  background: #fdeae7;
  color: #f5483a;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 8px 0 8px 0;
}
.pt-g3-name {
  margin-top: 6px;
  font-size: 12px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pt-g3-prices {
  display: flex;
  align-items: baseline;
  margin-top: 4px;
  min-width: 0;
  overflow: hidden;
}

/* 样式四：横向滑动 */
.pt-scroll {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  overflow: hidden;
}
.pt-s-item {
  width: 32%;
  flex-shrink: 0;
  min-width: 0;
}

/* 直播（参考 CRMEB 小程序直播） */
.lv-card {
  width: 100%;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  padding: 0 10px 10px;
  box-sizing: border-box;
}
.lv-head {
  display: flex;
  align-items: baseline;
  padding-top: 10px;
}
.lv-head-title {
  font-size: 15px;
  font-weight: bold;
  color: #282828;
  line-height: 20px;
}
.lv-head-icon {
  width: 62px;
  height: 16px;
  object-fit: contain;
  flex-shrink: 0;
  align-self: center;
}
.lv-head-sub {
  font-size: 11px;
  color: #999;
  margin-left: 6px;
}
.lv-space {
  flex: 1;
}
.lv-more {
  flex-shrink: 0;
  font-size: 11px;
  color: #282828;
}
.lv-head-en {
  font-size: 9px;
  color: #c0c4cc;
  letter-spacing: 0.5px;
  margin-top: 1px;
}
.lv-img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}
.lv-tag {
  position: absolute;
  top: 0;
  left: 0;
  color: #fff;
  font-size: 9px;
  line-height: 1;
  padding: 3px 5px;
  border-radius: 0 0 6px 0;
}
.lv-tag-live {
  background: #f5483a;
}
.lv-tag-replay {
  background: #909399;
}
.lv-tag-preview {
  background: #409eff;
}
.lv-time {
  position: absolute;
  top: 0;
  left: 40px;
  color: #fff;
  font-size: 9px;
  line-height: 1;
  padding: 3px 5px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 0 0 6px 0;
}
.lv-scroll {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  overflow: hidden;
}
.lv-s-item {
  width: 42%;
  flex-shrink: 0;
  min-width: 0;
}
.lv-s-img-box {
  position: relative;
  width: 100%;
  height: 96px;
  border-radius: 6px;
  overflow: hidden;
  background: #f5f5f5;
}
.lv-rows {
  margin-top: 8px;
}
.lv-row {
  display: flex;
  & + .lv-row {
    margin-top: 10px;
  }
}
.lv-r-img-box {
  position: relative;
  width: 88px;
  height: 88px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  background: #f5f5f5;
  margin-right: 8px;
}
.lv-r-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.lv-title {
  font-size: 12px;
  color: #333;
  line-height: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.lv-anchor {
  font-size: 11px;
  color: #999;
  margin-top: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lv-nogoods {
  margin-top: auto;
  background: #f5f5f5;
  color: #999;
  font-size: 10px;
  padding: 5px 8px;
  border-radius: 4px;
}
.lv-grid2 {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.lv-g-item {
  width: calc(50% - 4px);
  min-width: 0;
}
.lv-g-img-box {
  position: relative;
  width: 100%;
  height: 82px;
  border-radius: 6px;
  overflow: hidden;
  background: #f5f5f5;
}
.lv-g-item .lv-title {
  margin-top: 6px;
}

/* 秒杀（参考 CRMEB 秒杀） */
.sk-card {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  padding: 0 10px 10px;
  box-sizing: border-box;
}
.sk-head {
  display: flex;
  align-items: center;
  padding: 10px 0 2px;
}
.sk-head-title {
  font-size: 15px;
  font-weight: bold;
  color: #fff;
  line-height: 20px;
}
.sk-head-icon {
  width: 62px;
  height: 16px;
  object-fit: contain;
  flex-shrink: 0;
}
.sk-divider {
  width: 1px;
  height: 12px;
  background: rgba(255, 255, 255, 0.6);
  margin: 0 6px;
  flex-shrink: 0;
}
.sk-head-sub {
  font-size: 11px;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sk-space {
  flex: 1;
}
.sk-go {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: bold;
  color: #a65f00;
  background: linear-gradient(90deg, #fff3d6, #ffd665);
  padding: 3px 8px;
  border-radius: 10px;
}
.sk-scroll {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  overflow: hidden;
}
.sk-s-item {
  width: 30%;
  flex-shrink: 0;
  min-width: 0;
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
  padding: 5px 5px 8px;
  box-sizing: border-box;
}
.sk-s-img-box {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 5px;
  overflow: hidden;
  background: #f5f5f5;
}
.sk-name {
  margin-top: 5px;
  font-size: 11px;
  color: #282828;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sk-price {
  margin-top: 3px;
  font-size: 13px;
  font-weight: bold;
  color: #f5483a;
  em {
    font-style: normal;
    font-size: 10px;
  }
}
.sk-rows {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.sk-row {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
  padding: 8px;
  box-sizing: border-box;
}
.sk-r-img-box {
  width: 76px;
  height: 76px;
  flex-shrink: 0;
  border-radius: 5px;
  overflow: hidden;
  background: #f5f5f5;
  margin-right: 8px;
}
.sk-r-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-self: stretch;
  padding: 2px 0;
}
.sk-r-info .sk-name {
  margin-top: 0;
  font-size: 12px;
}
.sk-price-lg {
  font-size: 16px;
  em {
    font-size: 11px;
  }
}
.sk-price-min {
  font-size: 10px;
  font-weight: normal;
  margin-right: 2px;
}
</style>