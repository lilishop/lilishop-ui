<template>
  <div class="live-goods">
    <div v-if="!readonly" class="toolbar">
      <el-button type="primary" @click="openChooseGoods">添加商品</el-button>
      <el-button type="danger" :disabled="!selectedIds.length" @click="handleBatchRemove">
        批量移除
      </el-button>
    </div>

    <el-table
      ref="table"
      v-loading="loading"
      border
      :data="goodsList"
      row-key="id"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column v-if="!readonly" type="selection" width="52" align="center" />
      <el-table-column label="商品" min-width="260">
        <template #default="{ row, $index }">
          <div class="flex-goods">
            <span v-if="$index === 0 || $index === 1" class="cover-dot" />
            <el-image
              :src="row.thumbnail || row.goodsImage"
              style="width: 50px; height: 50px"
              fit="cover"
            />
            <span class="goods-name">{{ row.goodsName || row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="价格" width="120">
        <template #default="{ row }">
          <span class="price">{{ formatPrice(row.price) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="库存" width="90">
        <template #default="{ row }">{{ row.stock ?? row.quantity ?? "-" }}</template>
      </el-table-column>
      <el-table-column label="推荐" width="90">
        <template #default="{ row }">
          <el-tag :type="row.recommend ? 'success' : 'info'">
            {{ row.recommend ? "是" : "否" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="售罄" width="90">
        <template #default="{ row }">
          <el-tag :type="isSellOut(row) ? 'danger' : 'info'">
            {{ isSellOut(row) ? "是" : "否" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="热度" width="100">
        <template #default="{ row }">{{ row.popularity ?? "-" }}</template>
      </el-table-column>
      <el-table-column v-if="!readonly" label="操作" width="280" fixed="right" align="center">
        <template #default="{ row }">
          <a v-if="!row.recommend" class="link-text" @click="handleRecommend(row)">推荐</a>
          <a v-else class="link-text" @click="handleCancelRecommend(row)">取消推荐</a>
          <span class="op-split">|</span>
          <a class="link-text" @click="handleToggleSoldOut(row)">
            {{ isSellOut(row) ? "取消售罄" : "设为售罄" }}
          </a>
          <span class="op-split">|</span>
          <a class="link-text" @click="openPopularityModal(row)">设置热度</a>
          <span class="op-split">|</span>
          <a class="link-text" @click="handleRemove(row)">移除</a>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="goodsList.length" class="tips">
      前两个商品将自动被选为封面，伴随直播间在直播列表中显示
    </div>
    <el-empty v-if="!loading && !goodsList.length" description="暂无直播商品" />

    <sku-select ref="skuSelectRef" @selectedGoodsData="selectedGoodsData" />

    <el-dialog v-model="popularityVisible" title="设置商品热度" width="400px">
      <el-form label-width="80px">
        <el-form-item label="热度值">
          <el-input-number v-model="popularityForm.popularity" :min="0" style="width: 200px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="popularityVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePopularity">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import {
  cancelRecommendLiveGoods,
  getLiveGoodsList,
  getLiveGoodsPopularity,
  removeBatchLiveGoods,
  saveBatchLiveGoods,
  setLiveGoodsPopularity,
  setLiveGoodsSoldOut,
  setRecommendLiveGoods,
} from "@/api/live";
import skuSelect from "@/components/lili-dialog";
import { Message, Modal } from "@/utils/message";
import { unitPrice } from "@/utils/filters";

defineOptions({ name: "LiveGoods" });

const props = defineProps({
  liveId: {
    type: String,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
});

const loading = ref(false);
const goodsList = ref([]);
const selectedIds = ref([]);
const popularityVisible = ref(false);
const currentGoods = ref(null);
const popularityForm = reactive({
  popularity: 0,
});

// 模板 ref：原 ref="skuSelect" 与 import 的组件同名，改名避免互相覆盖
const skuSelectRef = ref(null);

watch(
  () => props.liveId,
  () => {
    loadGoods();
  }
);

function formatPrice(price) {
  return unitPrice(price, "￥");
}

function isSellOut(row) {
  return !!row.soldOutFlag;
}

function buildLiveGoodsPayload(item) {
  const price = Number(item.price ?? 0);
  const originPrice = Number(
    item.originPrice ?? item.cost ?? item.originalPrice ?? price
  );
  return {
    liveRoomId: props.liveId,
    goodsId: item.goodsId,
    skuId: item.id || item.skuId,
    goodsName: item.goodsName || "",
    stock: String(item.quantity ?? item.stock ?? ""),
    price,
    thumbnail: item.thumbnail || "",
    salesCount: Number(item.salesCount ?? item.buyCount ?? 0),
    storeId: item.storeId || "",
    storeName: item.storeName || "",
    originPrice,
    sellPoint: item.sellPoint || item.sellingPoint || "",
    popularity: 0,
    hideFlag: false,
    canBuyFlag: true,
    soldOutFlag: false,
    recommend: false,
  };
}

function loadGoods() {
  if (!props.liveId) return;
  loading.value = true;
  getLiveGoodsList(props.liveId)
    .then((res) => {
      loading.value = false;
      if (res.success) {
        goodsList.value = res.result || [];
      }
    })
    .catch(() => {
      loading.value = false;
    });
}

function openChooseGoods() {
  skuSelectRef.value.open("goods");
  const data = JSON.parse(JSON.stringify(goodsList.value));
  data.forEach((e) => {
    if (e.skuId) e.id = e.skuId;
  });
  skuSelectRef.value.goodsData = data;
}

function selectedGoodsData(selected) {
  if (!selected?.length) return;
  const existingSkuIds = new Set(goodsList.value.map((g) => String(g.skuId)));
  const payload = selected
    .filter((item) => !existingSkuIds.has(String(item.id || item.skuId)))
    .map((item) => buildLiveGoodsPayload(item));
  if (!payload.length) {
    Message.warning("所选商品均已添加");
    return;
  }
  saveBatchLiveGoods(payload).then((res) => {
    if (res.success) {
      Message.success("添加成功");
      loadGoods();
    }
  });
}

function handleSelectionChange(rows) {
  selectedIds.value = (rows || []).map((r) => r.id);
}

function handleRemove(record) {
  Modal.confirm({
    title: "确认移除",
    content: "确定要移除该商品吗？",
    onOk: () => {
      return removeBatchLiveGoods([record.id]).then((res) => {
        if (res.success) {
          Message.success("移除成功");
          loadGoods();
        }
      });
    },
  });
}

function handleBatchRemove() {
  Modal.confirm({
    title: "确认批量移除",
    content: `确定要移除选中的 ${selectedIds.value.length} 个商品吗？`,
    onOk: () => {
      return removeBatchLiveGoods(selectedIds.value).then((res) => {
        if (res.success) {
          Message.success("移除成功");
          selectedIds.value = [];
          loadGoods();
        }
      });
    },
  });
}

function handleRecommend(record) {
  setRecommendLiveGoods(record.id).then((res) => {
    if (res.success) {
      Message.success("已设为推荐");
      loadGoods();
    }
  });
}

function handleCancelRecommend(record) {
  cancelRecommendLiveGoods(record.id).then((res) => {
    if (res.success) {
      Message.success("已取消推荐");
      loadGoods();
    }
  });
}

function handleToggleSoldOut(record) {
  const soldOutFlag = !isSellOut(record);
  setLiveGoodsSoldOut(record.id, soldOutFlag).then((res) => {
    if (res.success) {
      Message.success(soldOutFlag ? "已设为售罄" : "已取消售罄");
      loadGoods();
    }
  });
}

function openPopularityModal(record) {
  currentGoods.value = record;
  getLiveGoodsPopularity(record.id, props.liveId).then((res) => {
    popularityForm.popularity = res.success
      ? res.result?.popularity ?? record.popularity ?? 0
      : record.popularity ?? 0;
    popularityVisible.value = true;
  });
}

function handleSavePopularity() {
  if (!currentGoods.value) return;
  setLiveGoodsPopularity(
    currentGoods.value.id,
    props.liveId,
    popularityForm.popularity
  ).then((res) => {
    if (res.success) {
      Message.success("热度设置成功");
      popularityVisible.value = false;
      loadGoods();
    }
  });
}

onMounted(() => {
  loadGoods();
});
</script>

<style lang="scss" scoped>
.toolbar {
  margin-bottom: 12px;
}
.flex-goods {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cover-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #409eff;
  flex-shrink: 0;
}
.goods-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.price {
  color: #ff5c58;
  font-weight: bold;
}
.tips {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
</style>
