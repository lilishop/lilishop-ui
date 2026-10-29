<template>
  <div class="store-card">
    <div class="base">
      <img :src="storeInfo.storeLogo" :onerror="onError" class="image" alt="" />
      <div class="store-detail">
        <div class="store-name">
          <span class="name-text" :title="storeInfo.storeName">{{ storeInfo.storeName }}</span>
          <el-tag type="danger" v-if="storeInfo.selfOperated" size="small">自营</el-tag>
        </div>
        <div class="store-actions">
          <el-button @click="linkToStore(storeInfo.id)" size="small" plain>进入店铺</el-button>
        </div>
      </div>
    </div>
    <div class="info-list">
      <div class="info-row" v-for="row in infoRows" :key="row.label">
        <span class="label">{{ row.label }}</span>
        <span class="value" :title="row.value">{{ row.value || '—' }}</span>
      </div>
    </div>
    <div class="wrapper">
      <div class="rate-row" v-for="row in rates" :key="row.label">
        <span class="rate-label">{{ row.label }}</span>
        <el-rate :model-value="row.score" disabled show-score text-color="#ff9900" score-template="{value}" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { defaultAvatar } from "@/assets/images";

const props = defineProps({
  storeInfo: {
    type: Object,
    default: () => ({}),
  },
});

const onError = "this.src='" + defaultAvatar + "'";

const infoRows = computed(() => [
  { label: "店铺地址", value: props.storeInfo.storeAddressPath },
  { label: "详细地址", value: props.storeInfo.storeAddressDetail },
  { label: "店铺简介", value: props.storeInfo.storeDesc },
]);

// 与买家端字段口径一致：店铺评分=描述相符 descriptionScore，服务评分=serviceScore
const rates = computed(() => [
  { label: "店铺评分", score: Number(props.storeInfo.descriptionScore) || 0 },
  { label: "服务评分", score: Number(props.storeInfo.serviceScore) || 0 },
  { label: "物流评分", score: Number(props.storeInfo.deliveryScore) || 0 },
]);
</script>

<style scoped lang="less">
.store-card {
  width: 100%;
  box-sizing: border-box;
}

.base {
  padding: 16px;
  display: flex;

  .image {
    height: 72px;
    width: 72px;
    flex-shrink: 0;
    border-radius: 6px;
    object-fit: cover;
    background: #fafafa;
  }
}

.store-detail {
  flex: 1;
  min-width: 0;
  margin-left: 13px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.store-name {
  display: flex;
  align-items: center;
  gap: 8px;

  .name-text {
    font-size: 14px;
    font-weight: 600;
    color: #343036;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.store-actions {
  display: flex;
}

.info-list {
  padding: 0 16px 12px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  margin-top: 8px;

  .label {
    width: 60px;
    flex-shrink: 0;
    font-size: 12px;
    color: #999;
    line-height: 20px;
  }

  .value {
    flex: 1;
    min-width: 0;
    font-size: 12px;
    color: #343036;
    line-height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.wrapper {
  padding: 12px 16px 16px;
  border-top: 1px solid #f5f5f5;
}

.rate-row {
  display: flex;
  align-items: center;
  margin-top: 8px;

  &:first-child {
    margin-top: 0;
  }

  .rate-label {
    width: 60px;
    flex-shrink: 0;
    font-size: 12px;
    color: #a1a6af;
  }
}
</style>
