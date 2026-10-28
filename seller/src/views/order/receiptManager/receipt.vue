<template>
  <div class="search">
    <el-card>
      <el-form ref="searchFormRef" :model="searchForm" inline label-width="70px" class="search-form">
        <el-form-item label="订单编号" prop="orderSn">
          <el-input v-model="searchForm.orderSn" clearable placeholder="请输入订单编号" style="width: 240px" />
        </el-form-item>
        <el-form-item label="会员名称" prop="memberName">
          <el-input v-model="searchForm.memberName" clearable placeholder="请输入会员名称" style="width: 240px" />
        </el-form-item>
        <el-form-item label="发票抬头" prop="receiptTitle">
          <el-input v-model="searchForm.receiptTitle" clearable placeholder="请输入发票抬头" style="width: 240px" />
        </el-form-item>
        <el-form-item label="状态" prop="receiptStatus">
          <el-select v-model="searchForm.receiptStatus" placeholder="请选择" clearable style="width: 240px">
            <el-option label="未开票" :value="0" />
            <el-option label="已开票" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
          <el-button class="search-btn" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <div class="receipt-tip">订单状态为已发货/已完成可开票</div>
      <el-table ref="tableRef" v-loading="loading" border :data="data" class="mt_10" style="width: 100%">
        <el-table-column label="订单号" min-width="120">
          <template #default="{ row }">
            <a class="link-text" @click="$router.push({ name: 'order-detail', query: { sn: row.orderSn } })">
              {{ row.orderSn }}
            </a>
          </template>
        </el-table-column>
        <el-table-column prop="memberName" label="会员名称" min-width="90" show-overflow-tooltip />
        <el-table-column label="发票抬头" min-width="90" show-overflow-tooltip>
          <template #default="{ row }">{{ row.receiptTitle || "暂未填写" }}</template>
        </el-table-column>
        <el-table-column label="纳税人识别号" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">{{ row.taxpayerId || "暂未填写" }}</template>
        </el-table-column>
        <el-table-column label="发票内容" min-width="90" show-overflow-tooltip>
          <template #default="{ row }">{{ row.receiptContent || "暂未填写" }}</template>
        </el-table-column>
        <el-table-column label="发票金额" width="150">
          <template #default="{ row }">
            <priceColorScheme :value="row.receiptPrice" :color="$mainColor" />
          </template>
        </el-table-column>
        <el-table-column label="发票状态" width="100">
          <template #default="{ row }">
            <el-tag :type="Number(row.receiptStatus) === 0 ? 'warning' : 'success'">
              {{ Number(row.receiptStatus) === 0 ? "未开票" : "已开票" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="orderStatusTagType(row.orderStatus)">{{ orderStatusText(row.orderStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="right" fixed="right">
          <template #default="{ row }">
            <a class="link-text" style="margin-right: 12px" @click="openReceiptModal(row, 'detail')">详情</a>
            <a
              class="link-text"
              :class="{ disabled: !canInvoicing(row) }"
              @click="canInvoicing(row) && openReceiptModal(row, 'invoicing')"
            >
              开票
            </a>
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
    </el-card>

    <el-dialog v-model="receiptModalVisible" title="发票信息" :close-on-click-modal="false" width="680px">
      <div v-loading="receiptDetailLoading" class="receipt-modal-content">
        <div v-if="hasValue(currentReceipt.orderSn)" class="receipt-item">
          <span class="receipt-label">订单号：</span>
          <span class="receipt-value">{{ currentReceipt.orderSn }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.memberName)" class="receipt-item">
          <span class="receipt-label">会员名称：</span>
          <span class="receipt-value">{{ currentReceipt.memberName }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.receiptType) || hasValue(currentReceipt.invoiceKind)" class="receipt-item">
          <span class="receipt-label">发票类型：</span>
          <span class="receipt-value">{{ formatReceiptType(currentReceipt) }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.receiptTitle)" class="receipt-item">
          <span class="receipt-label">发票抬头：</span>
          <span class="receipt-value">{{ currentReceipt.receiptTitle }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.companyName)" class="receipt-item">
          <span class="receipt-label">单位名称：</span>
          <span class="receipt-value">{{ currentReceipt.companyName }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.personalName)" class="receipt-item">
          <span class="receipt-label">个人名称：</span>
          <span class="receipt-value">{{ currentReceipt.personalName }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.taxpayerId)" class="receipt-item">
          <span class="receipt-label">纳税人识别号：</span>
          <span class="receipt-value">{{ currentReceipt.taxpayerId }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.companyAddress)" class="receipt-item">
          <span class="receipt-label">单位地址：</span>
          <span class="receipt-value">{{ currentReceipt.companyAddress }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.companyPhone)" class="receipt-item">
          <span class="receipt-label">单位电话：</span>
          <span class="receipt-value">{{ currentReceipt.companyPhone }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.bankName)" class="receipt-item">
          <span class="receipt-label">开户银行：</span>
          <span class="receipt-value">{{ currentReceipt.bankName }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.bankAccount)" class="receipt-item">
          <span class="receipt-label">银行账号：</span>
          <span class="receipt-value">{{ currentReceipt.bankAccount }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.receiptContent)" class="receipt-item">
          <span class="receipt-label">发票内容：</span>
          <span class="receipt-value">{{ currentReceipt.receiptContent }}</span>
        </div>
        <div v-if="hasPrice(currentReceipt.receiptPrice)" class="receipt-item">
          <span class="receipt-label">发票金额：</span>
          <span class="receipt-value">{{ formatPrice(currentReceipt.receiptPrice) }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.receiptPhone)" class="receipt-item">
          <span class="receipt-label">收票人手机：</span>
          <span class="receipt-value">{{ currentReceipt.receiptPhone }}</span>
        </div>
        <div v-if="hasValue(currentReceipt.receiptEmail)" class="receipt-item">
          <span class="receipt-label">收票人邮箱：</span>
          <span class="receipt-value">{{ currentReceipt.receiptEmail }}</span>
        </div>
        <div v-if="hasValue(getInvoiceAddress(currentReceipt))" class="receipt-item">
          <span class="receipt-label">发票附件：</span>
          <span class="receipt-value">
            <a class="link-text" @click="viewInvoiceFile(getInvoiceAddress(currentReceipt))">查看附件</a>
          </span>
        </div>
      </div>
      <template #footer>
        <template v-if="receiptModalMode === 'invoicing'">
          <el-upload
            :action="uploadFileUrl"
            :data="receiptUploadData"
            :headers="{ ...accessToken }"
            :accept="'.jpg,.jpeg,.png,.pdf'"
            :show-file-list="false"
            :on-success="handleInvoiceUploadSuccess"
            :on-error="handleInvoiceUploadError"
            :before-upload="beforeInvoiceUpload"
            style="display: inline-block; margin-right: 8px"
          >
            <el-button :disabled="receiptDetailLoading">上传发票</el-button>
          </el-upload>
          <el-button @click="receiptModalVisible = false">取消</el-button>
          <el-button type="primary" :loading="invoiceSubmitting" @click="submitInvoicing">确认开票</el-button>
        </template>
        <el-button v-else @click="receiptModalVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import * as API_Order from "@/api/order";
import { uploadFile } from "@/libs/axios";
import { getStore } from "@/libs/storage";
import { Message } from "@/utils/message";

defineOptions({ name: "receipt" });

const loading = ref(true);
const receiptModalVisible = ref(false);
const receiptDetailLoading = ref(false);
const invoiceSubmitting = ref(false);
const receiptModalMode = ref("detail");
const uploadFileUrl = ref(uploadFile);
const accessToken = ref({});
const receiptUploadData = ref({ directoryPath: "default" }); // OSS 上传目录（与后端存储配置一致）
const currentReceipt = ref({});
const selectedReceiptRow = ref(null);
const searchForm = ref({
  pageNumber: 1,
  pageSize: 10,
  sort: "createTime",
  order: "desc",
  receiptStatus: "",
});
const data = ref([]);
const total = ref(0);

// searchFormRef / tableRef：模板 ref 改名避免与顶层变量互相覆盖
const searchFormRef = ref(null);
const tableRef = ref(null);

function orderStatusText(status) {
  const map = {
    UNPAID: "未付款",
    PAID: "已付款",
    UNDELIVERED: "待发货",
    DELIVERED: "已发货",
    COMPLETED: "已完成",
    TAKE: "待核验",
    CANCELLED: "已取消",
  };
  return map[status] || status;
}
function orderStatusTagType(status) {
  const map = {
    UNPAID: "danger",
    PAID: "primary",
    UNDELIVERED: "info",
    DELIVERED: "info",
    COMPLETED: "success",
    TAKE: "warning",
    CANCELLED: "danger",
  };
  return map[status] || "info";
}
function canInvoicing(row) {
  if (!row) return false;
  return (
    (row.orderStatus === "COMPLETED" || row.orderStatus === "DELIVERED") &&
    Number(row.receiptStatus) === 0
  );
}
function initUploadAccessToken() {
  accessToken.value = { accessToken: getStore("accessToken") };
}
function hasValue(value) {
  if (value === null || value === undefined) return false;
  return String(value).trim() !== "";
}
function hasPrice(value) {
  return value !== null && value !== undefined && value !== "";
}
function formatPrice(value) {
  if (value === null || value === undefined || value === "") return "暂无";
  return `￥${value}`;
}
function isVatSpecialReceipt(receipt) {
  if (!receipt) return false;
  const receiptType = receipt.receiptType != null ? String(receipt.receiptType).trim() : "";
  return receiptType === "2" || receiptType === "增值税专用发票" || receipt.invoiceKind === "VAT_SPECIAL";
}
function formatReceiptType(receipt) {
  if (!receipt || (!receipt.receiptType && !receipt.invoiceKind)) return "电子普通发票";
  const receiptType = receipt.receiptType != null ? String(receipt.receiptType).trim() : "";
  if (receiptType === "电子普通发票" || receiptType === "增值税专用发票") return receiptType;
  return isVatSpecialReceipt(receipt) ? "增值税专用发票" : "电子普通发票";
}
function getInvoiceAddress(receipt) {
  if (!receipt) return "";
  return receipt.invoiceAddress || receipt.invoiceFileUrl || "";
}
function buildInvoicingPayload() {
  const invoiceAddress = getInvoiceAddress(currentReceipt.value);
  return invoiceAddress ? { invoiceAddress } : {};
}
function beforeInvoiceUpload(file) {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
  const okType = allowed.includes(file.type) || /\.(jpg|jpeg|png|pdf)$/i.test(file.name);
  if (!okType) {
    Message.warning("请上传 jpg、jpeg、png 或 pdf 格式文件");
    return false;
  }
  if (file.size / 1024 / 1024 > 10) {
    Message.warning("发票附件不能超过 10MB");
    return false;
  }
  return true;
}
function handleInvoiceUploadSuccess(res) {
  if (res && res.success && res.result) {
    currentReceipt.value.invoiceAddress = res.result;
    if (selectedReceiptRow.value) {
      selectedReceiptRow.value.invoiceAddress = res.result;
    }
    Message.success("发票上传成功");
  } else {
    Message.error((res && res.message) || "发票上传失败");
  }
}
function handleInvoiceUploadError() {
  Message.error("发票上传失败");
}
function viewInvoiceFile(url) {
  if (!url) return;
  window.open(url, "_blank");
}
function init() {
  getData();
}
function changePage(v) {
  searchForm.value.pageNumber = v;
  getData();
}
function changePageSize(v) {
  searchForm.value.pageSize = v;
  getData();
}
function handleSearch() {
  searchForm.value.pageNumber = 1;
  getData();
}
function handleReset() {
  searchForm.value = {
    pageNumber: 1,
    pageSize: 10,
    sort: "createTime",
    order: "desc",
    receiptStatus: "",
  };
  getData();
}
function getData() {
  loading.value = true;
  API_Order.getReceiptPage(searchForm.value).then((res) => {
    loading.value = false;
    if (res.success) {
      data.value = res.result.records;
      total.value = res.result.total;
    }
  });
}
async function openReceiptModal(row, mode = "detail") {
  if (!row) return;
  receiptModalMode.value = mode;
  selectedReceiptRow.value = row;
  currentReceipt.value = { ...row };
  receiptModalVisible.value = true;
  receiptDetailLoading.value = true;
  try {
    const res = await API_Order.getReceiptDetail(row.id);
    if (res.success && res.result) {
      currentReceipt.value = { ...row, ...res.result };
    } else {
      Message.warning("发票详情获取失败，已展示列表中的发票信息");
    }
  } catch (e) {
    Message.error("发票详情获取失败");
  } finally {
    receiptDetailLoading.value = false;
  }
}
async function submitInvoicing() {
  if (!selectedReceiptRow.value) return;
  if (!canInvoicing(selectedReceiptRow.value)) {
    Message.warning("当前订单状态不支持开票");
    return;
  }
  const params = buildInvoicingPayload();
  if (!params.invoiceAddress) {
    Message.warning("请先上传发票");
    return;
  }
  invoiceSubmitting.value = true;
  try {
    const res = await API_Order.invoicing(selectedReceiptRow.value.id, params);
    if (res.success) {
      Message.success("开票成功");
      receiptModalVisible.value = false;
      getData();
    }
  } catch (e) {
    Message.error("开票失败");
  } finally {
    invoiceSubmitting.value = false;
  }
}

onMounted(() => {
  initUploadAccessToken();
  init();
});
</script>
<style lang="scss">
@import "@/styles/table-common.scss";

.receipt-modal-content {
  max-height: 460px;
  overflow-y: auto;
}

.receipt-item {
  display: flex;
  margin-bottom: 12px;
  line-height: 22px;
}

.receipt-tip {
  margin-bottom: 16px;
  padding: 8px 12px;
  color: #ff9900;
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 4px;
}

.receipt-label {
  width: 110px;
  color: #515a6e;
  flex-shrink: 0;
  text-align: right;
}

.receipt-value {
  flex: 1;
  color: #17233d;
  word-break: break-all;
}

.link-text {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}
.link-text.disabled {
  color: #c5c8ce;
  cursor: not-allowed;
}
</style>
