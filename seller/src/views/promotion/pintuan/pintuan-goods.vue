<template>
  <div class="pintuan-goods">
    <el-card>
      <h4>活动详情</h4>
      <el-descriptions v-if="data.length" border :column="3" class="activity-desc">
        <el-descriptions-item label="活动名称">{{ data[0].promotionName }}</el-descriptions-item>
        <el-descriptions-item label="活动时间" :span="2">
          {{ data[0].startTime }} ~ {{ data[0].endTime }}
        </el-descriptions-item>
        <el-descriptions-item label="成团人数">{{ data[0].requiredNum }} 人</el-descriptions-item>
        <el-descriptions-item label="限购数量">
          {{ data[0].limitNum ? `${data[0].limitNum} 件/人` : "不限购" }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="promotionStatusTagType(data[0].promotionStatus)">
            {{ promotionStatusText(data[0].promotionStatus) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <h4>活动商品</h4>
      <template v-if="!readonly">
        <div class="operation">
          <el-button type="primary" @click="openSkuList">选择商品</el-button>
          <el-button @click="delAll">批量删除</el-button>
          <el-button @click="getDataList">刷新</el-button>
        </div>
        <el-alert v-if="selectCount > 0" type="info" show-icon :closable="false" class="select-alert">
          已选择 <span>{{ selectCount }}</span> 项
          <a class="select-clear" @click="clearSelectAll">清空</a>
        </el-alert>
        <el-table
          ref="table"
          v-loading="loading"
          border
          :data="goodsData"
          style="width: 100%"
          @selection-change="changeSelect"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column prop="goodsName" label="商品名称" min-width="140" show-overflow-tooltip />
          <el-table-column prop="quantity" label="库存" width="90" />
          <el-table-column label="拼团价格" width="160">
            <template #default="{ row, $index }">
              <el-input-number
                v-if="row"
                v-model="row.price"
                :min="promotionPriceMin(row.goodsType)"
                :precision="2"
                controls-position="right"
                size="small"
                @change="(val) => updateGoodsPrice($index, val)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90" align="right">
            <template #default="{ $index }">
              <a class="link-text" @click="delGoods($index)">删除</a>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template v-else>
        <el-table
          ref="table"
          v-loading="loading"
          border
          :data="goodsData"
          style="width: 100%"
        >
          <el-table-column label="商品名称" min-width="220">
            <template #default="{ row }">
              <div v-if="row" class="goods-cell">
                <img v-if="row.thumbnail" :src="row.thumbnail" class="goods-thumb" alt="" />
                <div class="goods-info">
                  <a class="link-text mr_10" @click="linkTo(row.goodsId, row.skuId)">{{ row.goodsName }}</a>
                  <el-popover trigger="hover" title="扫码在手机中查看" placement="top" width="180">
                    <template #reference>
                      <img
                        src="../../../assets/qrcode.svg"
                        class="hover-pointer qrcode-icon"
                        width="20"
                        height="20"
                        alt="qrcode"
                      />
                    </template>
                    <vue-qr
                      :text="wapLinkTo(row.goodsId, row.skuId)"
                      :margin="0"
                      color-dark="#000"
                      color-light="#fff"
                      :size="150"
                    />
                  </el-popover>
                </div>
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
          <el-table-column label="原价" width="110" align="right">
            <template #default="{ row }">
              <span v-if="row">{{ $filters.unitPrice(row.originalPrice, "￥") }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="quantity" label="库存" width="90" align="right" />
          <el-table-column label="拼团价格" width="120" align="right">
            <template #default="{ row }">
              <span v-if="row" :style="{ color: $mainColor }">
                {{ $filters.unitPrice(row.price, "￥") }}
              </span>
            </template>
          </el-table-column>
        </el-table>

        <div class="mt_10" style="display: flex; justify-content: flex-end">
          <el-pagination
            v-model:current-page="searchForm.pageNumber"
            v-model:page-size="searchForm.pageSize"
            :page-sizes="[10, 20, 50]"
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
        <el-button v-if="!readonly" type="primary" :loading="submitLoading" @click="save">
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
import { getPintuanGoodsList, getPintuanDetail, editPintuan } from "@/api/promotion.js";
import liliDialog from "@/views/lili-dialog";
import vueQr from "vue-qr";
import { promotionPriceMin } from "@/constants/goodsType";
import { Message, Modal } from "@/utils/message";

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const submitLoading = ref(false);
const promotionStatus = ref("");
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
});
const data = ref([]);
const total = ref(0);
const goodsData = ref([]);
const selectList = ref([]);
const selectCount = ref(0);

// liliDialogRef：模板 ref 改名避免与 import 的组件同名互相覆盖
const liliDialogRef = ref(null);
const table = ref(null);

const readonly = computed(() => {
  return route.query.status === "view" || promotionStatus.value !== "NEW";
});

onMounted(() => {
  init();
});

function promotionStatusText(status) {
  const map = {
    NEW: "未开始",
    START: "已开始",
    END: "已结束",
    CLOSE: "已关闭",
  };
  return map[status] || "未知";
}

function promotionStatusTagType(status) {
  const map = {
    NEW: "info",
    START: "success",
    END: "danger",
    CLOSE: "danger",
  };
  return map[status] || "danger";
}

function closeCurrentPage() {
  router.back();
}

function init() {
  getPintuanMsg();
}

function changePage() {
  getDataList();
}

function changePageSize() {
  searchForm.pageNumber = 1;
  getDataList();
}

function getPintuanMsg() {
  getPintuanDetail(route.query.id).then((res) => {
    if (res.success && res.result) {
      data.value = [res.result];
      promotionStatus.value = res.result.promotionStatus;
      getDataList();
    }
  });
}

function getDataList() {
  loading.value = true;
  const params = {
    pintuanId: route.query.id,
    pageNumber: readonly.value ? searchForm.pageNumber : 1,
    pageSize: readonly.value ? searchForm.pageSize : 1000,
  };
  getPintuanGoodsList(params).then((res) => {
    loading.value = false;
    if (res.success && res.result) {
      const serverRecords = res.result.records || [];
      goodsData.value = readonly.value
        ? serverRecords
        : mergeGoodsData(serverRecords);
      total.value = res.result.total || 0;
    }
  });
}

function mergeGoodsData(serverRecords) {
  const localMap = new Map(goodsData.value.map((item) => [item.skuId, item]));
  const serverSkuIds = new Set(serverRecords.map((item) => item.skuId));

  const merged = serverRecords.map((serverItem) => {
    const local = localMap.get(serverItem.skuId);
    return local ? { ...serverItem, price: local.price } : serverItem;
  });

  const unsavedItems = goodsData.value.filter(
    (item) => item.skuId && !serverSkuIds.has(item.skuId)
  );
  return [...merged, ...unsavedItems];
}

function openSkuList() {
  const data = JSON.parse(JSON.stringify(goodsData.value));
  data.forEach((e) => {
    e.id = e.skuId;
  });
  liliDialogRef.value.goodsData = data;
  liliDialogRef.value.open("goods");
}

function selectedGoodsData(selected) {
  const existingMap = new Map(goodsData.value.map((item) => [item.skuId, item]));
  goodsData.value = selected.map((item) => {
    const existed = existingMap.get(item.id);
    if (existed) {
      return existed;
    }
    return {
      goodsName: item.goodsName,
      price: item.price,
      originalPrice: item.price,
      quantity: item.quantity,
      storeId: item.storeId,
      sellerName: item.sellerName,
      thumbnail: item.thumbnail,
      skuId: item.id,
      categoryPath: item.categoryPath,
      goodsId: item.goodsId,
      goodsType: item.goodsType,
    };
  });
  clearSelectAll();
}

function updateGoodsPrice(index, value) {
  if (goodsData.value[index]) {
    goodsData.value[index].price = value;
  }
}

function changeSelect(selection) {
  selectList.value = selection;
  selectCount.value = selection.length;
}

function clearSelectAll() {
  table.value?.clearSelection();
  selectList.value = [];
  selectCount.value = 0;
}

function delGoods(index) {
  goodsData.value.splice(index, 1);
  selectCount.value = 0;
}

function delAll() {
  if (selectCount.value <= 0) {
    Message.warning("您还未选择要删除的数据");
    return;
  }
  Modal.confirm({
    title: "确认删除",
    content: `您确认要删除所选 ${selectCount.value} 项数据?`,
    onOk: () => {
      const ids = selectList.value.map((e) => e.skuId);
      goodsData.value = goodsData.value.filter((item) => !ids.includes(item.skuId));
      clearSelectAll();
    },
  });
}

function save() {
  if (!goodsData.value.length) {
    Message.warning("请选择活动商品");
    return;
  }
  for (const item of goodsData.value) {
    if (item.price === "" || item.price === null || item.price === undefined) {
      Message.warning(`请填写【${item.goodsName}】的价格`);
      return;
    }
  }
  const params = JSON.parse(JSON.stringify(data.value[0]));
  params.promotionGoodsList = goodsData.value.map((item) => ({
    ...item,
    promotionId: params.id,
    startTime: params.startTime,
    endTime: params.endTime,
  }));
  submitLoading.value = true;
  editPintuan(params).then((res) => {
    submitLoading.value = false;
    if (res.success) {
      Message.success("修改拼团商品成功");
      closeCurrentPage();
    }
  });
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

.operation {
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
}

.select-alert {
  margin-bottom: 10px;

  .select-clear {
    margin-left: 12px;
    color: #409eff;
    cursor: pointer;
  }
}

.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
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

.goods-info {
  min-width: 0;
  overflow: hidden;
}

.mr_10 {
  margin-right: 10px;
}

.hover-pointer {
  cursor: pointer;
}

.qrcode-icon {
  vertical-align: middle;
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
