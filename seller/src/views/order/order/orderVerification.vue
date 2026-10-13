<template>
  <div class="search">
    <el-card>
      <el-tabs v-model="activeTab" @tab-change="onTabChange">
        <el-tab-pane label="订单核销" name="verify">
          <el-form class="verify-form" @submit.prevent>
            <el-form-item label="核销码">
              <el-input
                v-model="code"
                placeholder="请输入核销码"
                clearable
                maxlength="32"
                style="width: 280px"
                @keyup.enter="confirmVerify"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="lookingUp" @click="confirmVerify">确定</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="核销记录" name="records">
          <el-form class="record-search" @submit.prevent @keyup.enter="searchRecords">
            <el-form-item label="商品名称">
              <el-input
                v-model="recordQuery.goodsName"
                placeholder="请输入商品名称"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="核销员">
              <el-input
                v-model="recordQuery.verifierName"
                placeholder="请输入核销员"
                clearable
                style="width: 160px"
              />
            </el-form-item>
            <el-form-item label="核销时间">
              <el-date-picker
                v-model="verifiedRange"
                type="datetimerange"
                value-format="YYYY-MM-DD HH:mm:ss"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                clearable
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="searchRecords">搜索</el-button>
            </el-form-item>
          </el-form>
          <el-table v-loading="loading" :data="records" border style="width: 100%">
            <el-table-column prop="code" label="核销码" min-width="120" />
            <el-table-column prop="orderSn" label="订单编号" min-width="200" show-overflow-tooltip />
            <el-table-column prop="orderItemSn" label="订单货物编号" min-width="200" show-overflow-tooltip />
            <el-table-column label="商品信息" min-width="260">
              <template #default="{ row }">
                <div v-if="row" class="goods-cell">
                  <img v-if="row.image" :src="row.image" class="goods-image" alt="" />
                  <div>
                    <div>{{ row.goodsName || "—" }}</div>
                    <div v-if="specText(row.specs)" class="goods-spec">{{ specText(row.specs) }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="verifiedTime" label="核销时间" width="170" />
            <el-table-column prop="verifierName" label="核销员" min-width="120" show-overflow-tooltip />
          </el-table>
          <div class="pager">
            <el-pagination
              v-model:current-page="pageNumber"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              size="small"
              @current-change="loadRecords"
              @size-change="onSizeChange"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="confirmVisible" title="确认核销" width="720px" :close-on-click-modal="false">
      <div class="preview-meta">
        <span>核销码：{{ preview.code || "—" }}</span>
        <span>订单编号：{{ preview.orderSn || "—" }}</span>
      </div>
      <el-table :data="preview.goods || []" border>
        <el-table-column prop="orderItemSn" label="订单货物编号" min-width="180" show-overflow-tooltip />
        <el-table-column label="商品信息" min-width="260">
          <template #default="{ row }">
            <div v-if="row" class="goods-cell">
              <img v-if="row.image" :src="row.image" class="goods-image" alt="" />
              <div>
                <div>{{ row.goodsName || "—" }}</div>
                <div v-if="specText(row.specs)" class="goods-spec">{{ specText(row.specs) }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="num" label="数量" width="80" />
      </el-table>
      <template #footer>
        <el-button @click="confirmVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitVerify">确认核销</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { confirmVerification, getVerificationRecords, previewVerification } from "@/api/order";
import { Message } from "@/utils/message";

defineOptions({ name: "orderVerification" });

const activeTab = ref("verify");
const code = ref("");
const lookingUp = ref(false);
const submitting = ref(false);
const confirmVisible = ref(false);
const preview = ref({
  code: "",
  orderSn: "",
  goods: [],
});
const loading = ref(false);
const records = ref([]);
const total = ref(0);
const pageNumber = ref(1);
const pageSize = ref(20);
const verifiedRange = ref(null);
const recordQuery = reactive({
  goodsName: "",
  verifierName: "",
});

function specText(specs) {
  if (!specs) return "";
  try {
    const obj = typeof specs === "string" ? JSON.parse(specs) : specs;
    if (!obj || typeof obj !== "object") return "";
    return Object.keys(obj)
      .filter((key) => key !== "images")
      .map((key) => `${key}：${obj[key]}`)
      .join(" ");
  } catch (e) {
    return "";
  }
}
function confirmVerify() {
  const inputCode = (code.value || "").trim();
  if (!inputCode) {
    Message.warning("请输入核销码");
    return;
  }
  lookingUp.value = true;
  previewVerification(inputCode)
    .then((res) => {
      lookingUp.value = false;
      if (res.success && res.result) {
        preview.value = {
          code: res.result.code || inputCode,
          orderSn: res.result.orderSn || "",
          goods: res.result.goods || [],
        };
        confirmVisible.value = true;
      }
    })
    .catch(() => {
      lookingUp.value = false;
    });
}
function submitVerify() {
  const submitCode = (preview.value.code || "").trim();
  if (!submitCode) {
    Message.warning("请输入核销码");
    return;
  }
  submitting.value = true;
  confirmVerification(submitCode)
    .then((res) => {
      submitting.value = false;
      if (res.success) {
        Message.success(res.result || "核销成功");
        confirmVisible.value = false;
        code.value = "";
        preview.value = { code: "", orderSn: "", goods: [] };
        pageNumber.value = 1;
        loadRecords();
      }
    })
    .catch(() => {
      submitting.value = false;
    });
}
function onTabChange(name) {
  if (name === "records") {
    loadRecords();
  }
}
function onSizeChange() {
  pageNumber.value = 1;
  loadRecords();
}
function searchRecords() {
  pageNumber.value = 1;
  loadRecords();
}
function loadRecords() {
  loading.value = true;
  const range = verifiedRange.value;
  const params = {
    pageNumber: pageNumber.value,
    pageSize: pageSize.value,
    goodsName: (recordQuery.goodsName || "").trim(),
    verifierName: (recordQuery.verifierName || "").trim(),
  };
  if (range && range.length === 2) {
    params.startTime = range[0];
    params.endTime = range[1];
  }
  getVerificationRecords(params)
    .then((res) => {
      loading.value = false;
      if (res.success) {
        records.value = res.result.records || [];
        total.value = res.result.total || 0;
      }
    })
    .catch(() => {
      loading.value = false;
    });
}
</script>

<style lang="scss" scoped>
.verify-form {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0 4px;
}
.record-search {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  margin-bottom: 12px;
}
.record-search :deep(.el-form-item) {
  margin-bottom: 0;
}
.preview-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  color: #303133;
}
.goods-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.goods-image {
  width: 48px;
  height: 48px;
  object-fit: cover;
  flex-shrink: 0;
}
.goods-spec {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}
.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
