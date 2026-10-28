<template>
  <div class="seckill-goods">
    <el-card>
      <h4>活动详情</h4>
      <el-descriptions v-if="data.length" border :column="3" class="activity-desc">
        <el-descriptions-item label="活动名称">{{ data[0].promotionName }}</el-descriptions-item>
        <el-descriptions-item label="活动开始时间">{{ data[0].startTime }}</el-descriptions-item>
        <el-descriptions-item label="报名截止时间">{{ unixDate(data[0].applyEndTime) }}</el-descriptions-item>
        <el-descriptions-item label="时间场次" :span="2">
          <el-tag v-for="item in unixHours(data[0].hours)" :key="item" class="hour-tag">{{ item }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="活动状态">
          <el-tag :type="seckillStatusTagType(data[0].promotionStatus)">
            {{ seckillStatusText(data[0].promotionStatus) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <h4>活动商品</h4>

      <template v-if="!readonly">
        <div class="operation">
          <el-button type="primary" @click="openSkuList">选择商品</el-button>
          <span v-if="goodsList.length" class="current-slot-tip">
            当前场次：{{ goodsList[tabIndex]?.hour }}（选择商品将添加到该场次）
          </span>
        </div>
        <el-tabs v-model="tabCurrent" type="card" class="operation">
          <el-tab-pane
            v-for="(tab, tabIndex) in goodsList"
            :key="tabIndex"
            :name="String(tabIndex)"
          >
            <template #label>
              {{ tab.hour }}
              <span v-if="tab.list.length" class="tab-count">{{ tab.list.length }}</span>
            </template>
            <el-table
              v-loading="loading"
              border
              :data="tab.list"
              style="width: 100%"
            >
              <el-table-column label="商品名称" min-width="220">
                <template #default="{ row }">
                  <div v-if="row" class="goods-cell">
                    <img v-if="row.thumbnail" :src="row.thumbnail" class="goods-thumb" alt="" />
                    <span class="goods-name">{{ row.goodsName }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="SKU编码" min-width="140" show-overflow-tooltip>
                <template #default="{ row }">
                  {{ row?.sn || "-" }}
                </template>
              </el-table-column>
              <el-table-column label="规格" min-width="120" show-overflow-tooltip>
                <template #default="{ row }">
                  {{ row?.simpleSpecs || "-" }}
                </template>
              </el-table-column>
              <el-table-column label="商品价格" width="110" align="right">
                <template #default="{ row }">
                  <span v-if="row" :style="{ color: $mainColor }">
                    {{ $filters.unitPrice(row.originalPrice, "￥") }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="库存" width="130">
                <template #default="{ row, $index }">
                  <el-input-number
                    v-if="row"
                    v-model="row.quantity"
                    :min="1"
                    :disabled="row.promotionApplyStatus === 'PASS'"
                    :controls="false"
                    size="small"
                    style="width: 100%"
                    @change="(val) => updateGoodsField(tabIndex, $index, 'quantity', val)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="活动价格" width="140">
                <template #default="{ row, $index }">
                  <el-input-number
                    v-if="row"
                    v-model="row.price"
                    :min="promotionPriceMin(row.goodsType)"
                    :precision="2"
                    :disabled="row.promotionApplyStatus === 'PASS'"
                    :controls="false"
                    size="small"
                    style="width: 100%"
                    @change="(val) => updateGoodsField(tabIndex, $index, 'price', val)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="90" align="right">
                <template #default="{ row, $index }">
                  <a v-if="row" class="link-text" @click="delGoods(tabIndex, $index, row)">删除</a>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </template>

      <template v-else>
        <el-table
          ref="table"
          v-loading="loading"
          border
          class="operation"
          :data="readonlyGoodsList"
          style="width: 100%"
        >
          <el-table-column label="商品名称" min-width="220">
            <template #default="{ row }">
              <div v-if="row" class="goods-cell">
                <img v-if="row.thumbnail" :src="row.thumbnail" class="goods-thumb" alt="" />
                <span class="goods-name">{{ row.goodsName }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="SKU编码" min-width="140" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row?.sn || "-" }}
            </template>
          </el-table-column>
          <el-table-column label="规格" min-width="120" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row?.simpleSpecs || "-" }}
            </template>
          </el-table-column>
          <el-table-column label="商品价格" width="110" align="right">
            <template #default="{ row }">
              <span v-if="row" :style="{ color: $mainColor }">
                {{ $filters.unitPrice(row.originalPrice, "￥") }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="库存" width="90" align="right">
            <template #default="{ row }">
              <span v-if="row">{{ row.quantity }}</span>
            </template>
          </el-table-column>
          <el-table-column label="活动价格" width="100" align="right">
            <template #default="{ row }">
              <span v-if="row" :style="{ color: $mainColor }">
                {{ $filters.unitPrice(row.price, "￥") }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="活动场次" width="100">
            <template #default="{ row }">
              <el-tag v-if="row">{{ row.timeLine }}:00</el-tag>
            </template>
          </el-table-column>
        </el-table>

        <div class="mt_10" style="display: flex; justify-content: flex-end">
          <el-pagination
            v-model:current-page="searchForm.pageNumber"
            v-model:page-size="searchForm.pageSize"
            :page-sizes="[20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            size="small"
            @current-change="changePage"
            @size-change="changePageSize"
          />
        </div>
      </template>

      <div class="foot-btn">
        <el-button @click="closeCurrentPage">返回</el-button>
        <el-button
          v-if="!readonly"
          type="primary"
          :loading="submitLoading"
          @click="save"
        >
          提交
        </el-button>
      </div>
    </el-card>

    <liliDialog ref="liliDialogRef" @selectedGoodsData="selectedGoodsData" />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  seckillGoodsList,
  seckillDetail,
  setSeckillGoods,
  delSeckillGoods,
} from "@/api/promotion.js";
import liliDialog from "@/views/lili-dialog";
import { promotionPriceMin } from "@/constants/goodsType";
import { Message, Modal } from "@/utils/message";
import { unixToDate } from "@/utils/filters";
import { useAppStore } from "@/stores/app";

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

const tabCurrent = ref("0");
const promotionStatus = ref("");
const loading = ref(false);
const submitLoading = ref(false);
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
});
const total = ref(0);
const data = ref([]);
const goodsList = ref([]);
const readonlyGoodsList = ref([]);

// liliDialogRef：模板 ref 改名避免与 import 的组件同名互相覆盖
const liliDialogRef = ref(null);

const readonly = computed(() => {
  return route.query.mode === "view" || promotionStatus.value !== "NEW";
});
const tabIndex = computed(() => {
  return Number(tabCurrent.value) || 0;
});

onMounted(() => {
  init();
});

function seckillStatusText(status) {
  const map = {
    NEW: "未开始",
    START: "已开始",
    END: "已结束",
    CLOSE: "已关闭",
  };
  return map[status] || status || "-";
}
function seckillStatusTagType(status) {
  const map = {
    NEW: "info",
    START: "success",
    END: "danger",
    CLOSE: "danger",
  };
  return map[status] || "danger";
}
function applyStatusText(status) {
  const map = {
    APPLY: "申请中",
    PASS: "已通过",
    REFUSE: "已拒绝",
  };
  return map[status] || "未申请";
}
function applyStatusTagType(status) {
  const map = {
    APPLY: "warning",
    PASS: "success",
    REFUSE: "danger",
  };
  return map[status] || "info";
}
function closeCurrentPage() {
  router.back();
}
function init() {
  getSeckillMsg();
}
function changePage() {
  getReadonlyGoodsList();
}
function changePageSize() {
  searchForm.pageNumber = 1;
  getReadonlyGoodsList();
}
function getSeckillMsg() {
  seckillDetail(route.query.id).then((res) => {
    if (res.success && res.result) {
      data.value = [res.result];
      promotionStatus.value = res.result.promotionStatus;
      const tag = appStore.storeOpenedList.find((item) => item.name === "seckill-goods");
      if (tag && res.result.promotionName) {
        tag.title = `${res.result.promotionName}商品`;
        localStorage.storeOpenedList = JSON.stringify(appStore.storeOpenedList);
      }
      if (readonly.value) {
        getReadonlyGoodsList();
      } else {
        getManageGoodsList();
      }
    }
  });
}
function getManageGoodsList() {
  if (!data.value[0]?.hours) {
    return;
  }
  loading.value = true;
  const hourValues = data.value[0].hours.split(",");
  const hourLabels = unixHours(data.value[0].hours);
  goodsList.value = hourLabels.map((hour, index) => ({
    hour,
    timeLine: hourValues[index],
    list: [],
  }));

  seckillGoodsList({
    seckillId: route.query.id,
    pageNumber: 1,
    pageSize: 1000,
  }).then((res) => {
    loading.value = false;
    if (res.success && res.result?.records?.length) {
      res.result.records.forEach((item) => {
        const slot = goodsList.value.find(
          (g) => String(g.timeLine) === String(item.timeLine)
        );
        if (slot) {
          slot.list.push(item);
        }
      });
    }
  });
}
function getReadonlyGoodsList() {
  loading.value = true;
  searchForm.seckillId = route.query.id;
  seckillGoodsList(searchForm).then((res) => {
    loading.value = false;
    if (res.success && res.result) {
      readonlyGoodsList.value = res.result.records || [];
      total.value = res.result.total || 0;
    }
  });
}
function openSkuList() {
  const existing = goodsList.value[tabIndex.value]?.list || [];
  liliDialogRef.value.goodsData = existing.map((item) => ({
    ...item,
    id: item.skuId || item.id,
  }));
  liliDialogRef.value.open("goods");
}
function selectedGoodsData(selected) {
  const timeLine = goodsList.value[tabIndex.value]?.timeLine;
  if (timeLine === undefined) {
    return;
  }
  const existingMap = new Map(
    (goodsList.value[tabIndex.value].list || []).map((item) => [item.skuId, item])
  );
  const list = selected.map((item) => {
    const existed = existingMap.get(item.id);
    if (existed) {
      return existed;
    }
    return {
      goodsName: item.goodsName,
      sn: item.sn,
      simpleSpecs: item.simpleSpecs,
      thumbnail: item.thumbnail,
      price: item.price,
      originalPrice: item.price,
      promotionApplyStatus: item.promotionApplyStatus || "",
      quantity: item.quantity,
      seckillId: route.query.id,
      storeId: item.storeId,
      storeName: item.storeName,
      skuId: item.id,
      timeLine,
      goodsType: item.goodsType,
    };
  });
  goodsList.value[tabIndex.value].list = list;
}
function updateGoodsField(tabIndex, index, field, value) {
  if (goodsList.value[tabIndex]?.list?.[index]) {
    goodsList.value[tabIndex].list[index][field] = value;
  }
}
function delGoods(tabIndex, index, row) {
  if (row.promotionApplyStatus === "PASS") {
    Modal.confirm({
      title: "确认删除",
      content: "您确认要删除该商品吗？删除后不可恢复",
      onOk: () => {
        delSeckillGoods({
          seckillId: row.seckillId,
          id: row.id,
        }).then((res) => {
          if (res.success) {
            goodsList.value[tabIndex].list.splice(index, 1);
            Message.success("删除成功");
          }
        });
      },
    });
    return;
  }
  goodsList.value[tabIndex].list.splice(index, 1);
  Message.success("删除成功");
}
function save() {
  const applyVos = [];
  goodsList.value.forEach((slot) => {
    slot.list.forEach((item) => {
      applyVos.push(item);
    });
  });
  if (!applyVos.length) {
    Message.warning("请先选择活动商品");
    return;
  }
  submitLoading.value = true;
  setSeckillGoods({
    seckillId: route.query.id,
    applyVos,
  })
    .then((res) => {
      if (res?.success) {
        Message.success("提交活动商品成功");
        closeCurrentPage();
      }
    })
    .catch(() => {})
    .finally(() => {
      submitLoading.value = false;
    });
}
function showReason(reason) {
  Modal.info({
    title: "拒绝原因",
    content: reason,
  });
}
function unixDate(time) {
  return unixToDate(new Date(time) / 1000);
}
function unixHours(item) {
  if (!item) {
    return [];
  }
  return item.split(",").map((hour) => `${hour}:00`);
}
</script>

<style lang="scss" scoped>
h4 {
  margin: 20px 0;
  padding: 0 10px;
  font-weight: bold;
  color: #333;
  font-size: 14px;
  text-align: left;
  border-left: 3px solid red;
}

.activity-desc {
  margin: 10px 0;
}

.goods-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.goods-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.goods-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.operation {
  margin: 16px 0 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.current-slot-tip {
  color: #909399;
  font-size: 12px;
}

.tab-count {
  display: inline-block;
  min-width: 18px;
  padding: 0 5px;
  margin-left: 4px;
  line-height: 18px;
  border-radius: 9px;
  background: #f0f2f5;
  color: #606266;
  font-size: 12px;
  text-align: center;
}

.hour-tag {
  margin-right: 4px;
  margin-bottom: 4px;
}

.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}

.reason {
  display: block;
  margin-top: 4px;
  font-size: 12px;
}

.foot-btn {
  margin-top: 16px;
  display: flex;
  gap: 10px;
}

.mt_10 {
  margin-top: 10px;
}
</style>
