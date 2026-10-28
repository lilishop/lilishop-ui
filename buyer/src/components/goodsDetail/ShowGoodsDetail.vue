<template>
  <div class="goods-detail-extra">
    <div class="goods-detail-extra__main">
    <div class="detail-layout">
    <div class="detail-main">
    <div class="detail-anchor" ref="tabNav" :class="{ 'is-stuck': anchorStuck }">
      <button
        v-for="tab in detailTabs"
        :key="tab.name"
        type="button"
        class="detail-anchor__item"
        :class="{ 'is-active': activeDetailTab === tab.name }"
        @click="scrollToSection(tab.name)"
      >{{ tab.label }}</button>
    </div>

    <div class="detail-panel">
      <section class="detail-section" ref="intro">
        <h3 class="detail-section__title">商品介绍</h3>
        <div class="item-intro-img" v-if="skuDetail.intro">
          <div class="item-intro" v-html="skuDetail.intro"></div>
        </div>
        <div class="detail-empty" v-else>暂无商品介绍</div>
      </section>

      <section class="detail-section" ref="comment">
        <h3 class="detail-section__title">商品评价</h3>
        <div class="remarks-container">
          <div class="remarks-summary">
            <div class="remarks-score">
              <div class="remarks-score-value">{{ skuDetail.grade || 0 }}<em>%</em></div>
              <div class="remarks-score-label">好评率</div>
            </div>
            <div class="remarks-bar">
              <span @click="viewByGrade('')" :class="{ selectedBar: commentParams.grade === '' }">全部({{ commentTypeNum.all || 0 }})</span>
              <span @click="viewByGrade('GOOD')" :class="{ selectedBar: commentParams.grade === 'GOOD' }">好评({{ commentTypeNum.good || 0 }})</span>
              <span @click="viewByGrade('MODERATE')" :class="{ selectedBar: commentParams.grade === 'MODERATE' }">中评({{ commentTypeNum.moderate || 0 }})</span>
              <span @click="viewByGrade('WORSE')" :class="{ selectedBar: commentParams.grade === 'WORSE' }">差评({{ commentTypeNum.worse || 0 }})</span>
            </div>
          </div>

          <div class="detail-empty" v-if="commentList.length === 0">暂无评价数据</div>
          <template v-else>
          <div class="remarks-box" v-for="(item, index) in commentList" :key="index">
            <div class="remarks-user">
              <el-avatar :src="item.memberProfile" :size="40" />
              <span class="remarks-user-name">{{ $filters.secrecyMobile(item.memberName) }}</span>
            </div>
            <div class="remarks-content-box">
              <el-rate
                disabled
                :model-value="Number(item.descriptionScore) || 0"
                allow-half
                class="remarks-star"
                :colors="['var(--theme-color)', 'var(--theme-color)', 'var(--theme-color)']"
              ></el-rate>
              <p class="remarks-content">{{ item.content }}</p>
              <div class="comment-img" v-if="item.images">
                <div
                  v-for="(img, imgIndex) in item.images.split(',')"
                  @click="previewImg(img, item)"
                  :class="{ borderColor: img === item.previewImg }"
                  :key="imgIndex"
                >
                  <img :src="img" loading="lazy" decoding="async" alt="">
                </div>
              </div>

              <div class="preview-img" v-if="item.previewImg" @click.prevent="hidePreviewImg(item)">
                <div>
                  <span @click.stop="rotatePreviewImg(0, item)"><el-icon><Refresh /></el-icon>左转</span>
                  <span @click.stop="rotatePreviewImg(1, item)"><el-icon><Refresh /></el-icon>右转</span>
                </div>
                <img :src="item.previewImg" loading="lazy" decoding="async" :style="{ transform: `rotate(${item.deg || 0}deg)` }" width="198" alt="">
              </div>
              <p class="remarks-sub">
                <span class="remarks-item">{{ item.goodsName }}</span>
                <span class="remarks-time">{{ item.createTime }}</span>
              </p>

              <div class="reply" v-if="item.reply">
                <p>商家回复</p>
                <p class="remarks-content">{{ item.reply }}</p>
                <div class="comment-img" v-if="item.replyImage">
                  <div
                    v-for="(img, imgIndex) in item.replyImage.split(',')"
                    :key="imgIndex"
                    :class="{ borderColor: img === item.previewImg }"
                    @click="previewImg(img, item)"
                  >
                    <img :src="img" loading="lazy" decoding="async" alt="">
                  </div>
                </div>
              </div>
            </div>
          </div>
          </template>
          <div class="remarks-page" v-if="commentTotal > commentParams.pageSize">
            <el-pagination
              v-model:current-page="commentParams.pageNumber"
              v-model:page-size="commentParams.pageSize"
              :total="commentTotal"
              size="small"
              @current-change="changePageNum"
              @size-change="changePageSize"
              layout="prev, pager, next"
            ></el-pagination>
          </div>
        </div>
      </section>

      <section class="detail-section" ref="params">
        <h3 class="detail-section__title">商品参数</h3>
        <div class="item-param-grid" v-if="goodsParamsList.length">
          <div class="item-param-cell" v-for="param in goodsParamsList" :key="param.paramId || param.paramName">
            <span class="item-param-title">{{ param.paramName }}</span>
            <span class="item-param-content">{{ param.paramValue || '-' }}</span>
          </div>
        </div>
        <div class="detail-empty" v-else>暂无商品参数</div>
      </section>
    </div>
    </div>
    <StoreSide
      :store-id="skuDetail.storeId"
      :goods-id="skuDetail.goodsId"
      :sku-id="skuDetail.id"
      :store-name-fallback="skuDetail.storeName"
    />
    </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, reactive, ref } from 'vue';
import { Refresh } from '@element-plus/icons-vue';
import { goodsComment, goodsCommentNum } from '@/api/member.js';
import storage from '@/plugins/storage.js';
import StoreSide from './StoreSide.vue';

defineOptions({ name: 'ShowGoodsDetail' });

const props = defineProps({
  detail: {
    type: Object,
    default: null
  }
});

const tabNav = ref(null);
const intro = ref(null);
const comment = ref(null);
const params = ref(null);
const sectionRefs = { intro, comment, params };

const detailTabs = ref([
  { name: 'intro', label: '商品介绍' },
  { name: 'comment', label: '商品评价' },
  { name: 'params', label: '商品参数' }
]);
const activeDetailTab = ref('intro');
const anchorStuck = ref(false);
const lockScrollSpy = ref(false);
let scrollTimer = null;
const commentList = ref([]);
const commentParams = reactive({
  pageNumber: 1,
  pageSize: 10,
  grade: '',
  goodsId: ''
});
const commentTypeNum = ref({});
const commentTotal = ref(0);

const skuDetail = computed(() => {
  return props.detail.data;
});
const goodsParamsList = computed(() => {
  const list = props.detail && Array.isArray(props.detail.goodsParamsDTOList) ? props.detail.goodsParamsDTOList : [];
  const flat = [];

  list.forEach((item) => {
    if (!item) return;
    if (Array.isArray(item.goodsParamsItemDTOList)) {
      flat.push(...item.goodsParamsItemDTOList);
    } else {
      flat.push(item);
    }
  });

  const cleaned = flat.filter((p) => p && (p.paramName || p.paramId));
  const hasSort = cleaned.some((p) => p && p.sort !== undefined && p.sort !== null);
  if (!hasSort) return cleaned;

  return cleaned.slice().sort((a, b) => {
    const sa = Number(a && a.sort) || 0;
    const sb = Number(b && b.sort) || 0;
    return sa - sb;
  });
});

function getNavOffset () {
  const nav = tabNav.value;
  return (nav ? nav.offsetHeight : 52) + 8;
}
function scrollToSection (name) {
  const el = sectionRefs[name] && sectionRefs[name].value;
  if (!el) return;
  activeDetailTab.value = name;
  lockScrollSpy.value = true;
  const top = el.getBoundingClientRect().top + window.pageYOffset - getNavOffset();
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  const unlock = () => {
    lockScrollSpy.value = false;
    window.removeEventListener('scrollend', unlock);
  };
  window.addEventListener('scrollend', unlock);
  window.clearTimeout(scrollTimer);
  scrollTimer = window.setTimeout(unlock, 900);
}
function handleScroll () {
  const nav = tabNav.value;
  if (nav) {
    anchorStuck.value = nav.getBoundingClientRect().top <= 1;
  }
  if (lockScrollSpy.value) return;
  const offset = getNavOffset() + 16;
  let current = '';
  detailTabs.value.forEach((tab) => {
    const el = sectionRefs[tab.name] && sectionRefs[tab.name].value;
    if (el && el.getBoundingClientRect().top <= offset) {
      current = tab.name;
    }
  });
  if (current) {
    activeDetailTab.value = current;
  }
}
function changePageNum (val) {
  commentParams.pageNumber = val;
  getList();
}
function changePageSize (val) {
  commentParams.pageNumber = 1;
  commentParams.pageSize = val;
  getList();
}
function getList () {
  // 评价接口需要登录，未登录时不发起请求
  if (!storage.getItem('accessToken') || !storage.getItem('userInfo')) return;
  commentParams.goodsId = skuDetail.value.goodsId;
  goodsComment(commentParams).then(res => {
    if (res.success) {
      commentList.value = res.result.records;
      commentTotal.value = res.result.total;
    }
  }).catch(() => {
    // 评价为可选数据，加载失败时静默
  });
  goodsCommentNum(skuDetail.value.goodsId).then(res => {
    if (res.success) {
      commentTypeNum.value = res.result;
    }
  }).catch(() => {
    // 评价统计为可选数据，加载失败时静默
  });
}
function viewByGrade (grade) {
  commentParams.grade = grade;
  commentParams.pageNumber = 1;
  getList();
}
function previewImg (img, item) {
  item.previewImg = img;
  item.deg = item.deg || 0;
}
function hidePreviewImg (item) {
  item.previewImg = '';
}
function rotatePreviewImg (type, item) {
  const current = item.deg || 0;
  item.deg = type ? current + 90 : current - 90;
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  getList();
  if (skuDetail.value.grade === null || skuDetail.value.grade === undefined) {
    skuDetail.value.grade = 100;
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
  window.clearTimeout(scrollTimer);
});
</script>

<style scoped lang="scss">
.goods-detail-extra {
  width: 100%;
  background: #fff;
}

.goods-detail-extra__main {
  width: 1200px;
  margin: 0 auto;
  padding-bottom: 16px;
}

.detail-layout {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.detail-main {
  flex: 1;
  min-width: 0;
}

.detail-anchor {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: stretch;
  height: 52px;
  padding: 0 8px;
  background: #fff;
  border-radius: 4px 4px 0 0;
  border-bottom: 1px solid #f0f0f0;

  &.is-stuck {
    border-radius: 0;
    box-shadow: 0 2px 8px rgba(23, 26, 38, 0.06);
  }
}

.detail-anchor__item {
  position: relative;
  margin: 0;
  padding: 0 24px;
  border: 0;
  background: transparent;
  color: #666;
  font-size: 15px;
  line-height: 52px;
  cursor: pointer;

  &:hover {
    color: #171A26;
  }

  &.is-active {
    color: #171A26;
    font-weight: 600;

    &::after {
      content: "";
      position: absolute;
      left: 24px;
      right: 24px;
      bottom: 0;
      height: 2px;
      border-radius: 1px;
      background: $theme_color;
    }
  }
}

.detail-panel {
  background: #fff;
  border-radius: 0 0 4px 4px;
  padding-bottom: 32px;
}

.detail-section + .detail-section {
  border-top: 1px solid #f0f0f0;
}

.detail-section__title {
  margin: 0;
  padding: 20px 24px 0;
  color: #171A26;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.detail-empty {
  padding: 36px 24px 40px;
  color: #999;
  font-size: 14px;
  line-height: 22px;
  text-align: center;
}

.item-intro-img {
  box-sizing: border-box;
  padding: 16px 24px 28px;
  color: #171A26;
  font-size: 14px;
  line-height: 22px;
}

.item-intro {
  :deep(img) {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 0 auto;
  }

  :deep(p) {
    margin: 0 0 12px;
  }
}

.item-param-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin: 16px 24px 0;
  border-top: 1px solid #f0f0f0;
  border-left: 1px solid #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.item-param-cell {
  display: grid;
  grid-template-columns: 140px 1fr;
  min-height: 44px;
  border-right: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child:nth-child(odd) {
    grid-column: 1 / -1;
  }
}

.item-param-title,
.item-param-content {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  font-size: 14px;
  line-height: 22px;
  word-break: break-all;
}

.item-param-title {
  color: #666;
  background: #fafafa;
}

.item-param-content {
  color: #171A26;
}

.remarks-container {
  box-sizing: border-box;
  padding: 8px 24px 8px;
}

.remarks-summary {
  display: flex;
  align-items: center;
  gap: 28px;
  padding: 12px 0 16px;
}

.remarks-score {
  flex-shrink: 0;
  min-width: 88px;
}

.remarks-score-value {
  color: $theme_color;
  font-size: 28px;
  font-weight: 600;
  line-height: 1;

  em {
    margin-left: 2px;
    font-style: normal;
    font-size: 14px;
    font-weight: 500;
  }
}

.remarks-score-label {
  margin-top: 6px;
  color: #999;
  font-size: 13px;
  line-height: 18px;
}

.remarks-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  color: #666;

  .selectedBar {
    color: $theme_color;
    background: #fff5f4;
    border-color: $theme_color;
  }

  span {
    height: 32px;
    padding: 0 14px;
    border: 1px solid #e5e5e5;
    border-radius: 4px;
    line-height: 30px;
    font-size: 14px;
    cursor: pointer;

    &:hover {
      color: $theme_color;
    }
  }
}

.remarks-box {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
}

.remarks-user {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 168px;
  flex-shrink: 0;
  padding-top: 2px;
}

.remarks-user-name {
  color: #171A26;
  font-size: 14px;
  line-height: 22px;
  word-break: break-all;
}

.remarks-content-box {
  flex: 1;
  min-width: 0;

  .comment-img {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;

    .borderColor {
      border-color: $theme_color;
    }

    div {
      width: 64px;
      height: 64px;
      overflow: hidden;
      border: 1px solid #eee;
      border-radius: 4px;
      cursor: pointer;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  .preview-img {
    position: relative;
    width: 200px;
    margin: 10px 0;
    border: 1px solid #eee;
    border-radius: 4px;

    div {
      position: absolute;
      top: 8px;
      left: 8px;
      z-index: 3;

      span {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        margin-right: 6px;
        padding: 3px 6px;
        color: #fff;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 4px;
        cursor: pointer;
      }

      span:nth-child(1) .el-icon {
        transform: rotateY(180deg);
      }
    }
  }
}

.remarks-content {
  margin: 6px 0 0;
  color: #171A26;
  font-size: 14px;
  line-height: 22px;
}

.remarks-sub {
  margin: 8px 0 0;
  color: #999;
  font-size: 13px;
  line-height: 20px;
}

.remarks-time {
  margin-left: 12px;
}

.remarks-page {
  display: flex;
  justify-content: flex-end;
  padding: 8px 0 16px;
}

.reply {
  margin-top: 12px;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 4px;

  > p:first-child {
    margin: 0;
    color: #666;
    font-size: 13px;
    line-height: 20px;
  }
}

:deep(.remarks-star.el-rate) {
  height: 20px;
  --el-rate-fill-color: #{$theme_color};
  --el-rate-disabled-fill-color: #{$theme_color};
}

:deep(.remarks-star .el-rate__icon.is-active) {
  color: $theme_color !important;
}
</style>
