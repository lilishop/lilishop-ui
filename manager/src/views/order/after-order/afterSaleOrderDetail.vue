<template>
  <div class="after-sale-detail-page">
    <!-- 顶部导航栏 -->
    <div class="page-top-nav">
      <el-page-header :icon="ArrowLeft" title="返回列表" @back="goBack">
        <template #content>
          <div class="nav-content">
            <span class="page-title">售后单详情</span>
            <span class="page-subtitle font-mono">{{ sn }}</span>
          </div>
        </template>
        <template #extra>
          <div class="nav-actions">
            <el-button :icon="Refresh" @click="getDetail">刷新数据</el-button>
          </div>
        </template>
      </el-page-header>
    </div>

    <!-- 顶部状态看板 + 步骤流程条 -->
    <el-card shadow="never" class="status-header-card">
      <div class="header-main">
        <div class="status-summary-left">
          <div class="status-badge-wrap">
            <el-tag
              :type="getStatusTagType(afterSaleInfo.serviceStatus)"
              effect="dark"
              size="large"
              class="status-tag"
            >
              {{ afterSaleInfo.serviceName || "加载中..." }}
            </el-tag>
            <el-tag type="info" size="large" class="type-tag">
              {{ getServiceTypeName(afterSaleInfo.serviceType) }}
            </el-tag>
          </div>

          <div class="sn-info-wrap">
            <span class="sn-label">售后单号：</span>
            <span class="sn-text">{{ sn }}</span>
            <el-tooltip content="复制售后单号" placement="top">
              <el-button
                link
                type="primary"
                :icon="CopyDocument"
                class="copy-btn"
                @click="copyText(sn, '售后单号')"
              />
            </el-tooltip>
          </div>

          <div v-if="afterSaleInfo.createTime" class="create-time-text">
            申请时间：{{ afterSaleInfo.createTime }}
          </div>
        </div>

        <div class="status-metrics-right">
          <div class="metric-block">
            <span class="metric-label">申请退款金额</span>
            <span class="metric-val text-danger">
              ¥ {{ (afterSaleInfo.applyRefundPrice || 0).toFixed(2) }}
            </span>
          </div>
          <div class="metric-divider"></div>
          <div class="metric-block">
            <span class="metric-label">实际退款金额</span>
            <span class="metric-val" :class="afterSaleInfo.actualRefundPrice ? 'text-success' : 'text-gray'">
              {{ afterSaleInfo.actualRefundPrice ? `¥ ${Number(afterSaleInfo.actualRefundPrice).toFixed(2)}` : '待确认' }}
            </span>
          </div>
          <div class="metric-divider"></div>
          <div class="metric-block">
            <span class="metric-label">退货数量</span>
            <span class="metric-val text-dark">
              {{ afterSaleInfo.num || 1 }} <small>件</small>
            </span>
          </div>
        </div>
      </div>

      <!-- 可视化流程步骤条 -->
      <div class="lifecycle-steps-wrap">
        <el-steps
          :active="currentStepIndex"
          :status="stepProcessStatus"
          finish-status="success"
          align-center
        >
          <el-step
            v-for="(step, sIdx) in dynamicSteps"
            :key="sIdx"
            :title="step.title"
            :description="step.desc"
          />
        </el-steps>
      </div>
    </el-card>

    <!-- 主体两栏布局 -->
    <el-row :gutter="18" class="content-row">
      <!-- 左侧：核心业务信息与处理区 -->
      <el-col :xs="24" :sm="24" :md="15" :lg="15" :xl="16">
        <!-- 1. 售后商品卡片 -->
        <el-card shadow="never" class="section-card">
          <template #header>
            <div class="card-title">
              <el-icon><Goods /></el-icon>
              <span>退货商品信息</span>
            </div>
          </template>

          <div class="goods-info-box">
            <div class="goods-image-wrap">
              <el-image
                :src="afterSaleInfo.goodsImage"
                :preview-src-list="[afterSaleInfo.goodsImage]"
                fit="cover"
                class="goods-img"
              />
            </div>
            <div class="goods-detail">
              <div class="goods-title" @click="linkTo(afterSaleInfo.goodsId, afterSaleInfo.skuId)">
                <span>{{ afterSaleInfo.goodsName }}</span>
                <el-icon class="link-icon"><TopRight /></el-icon>
              </div>
              <div class="goods-sub">
                <span v-if="afterSaleInfo.specs" class="goods-spec">{{ afterSaleInfo.specs }}</span>
                <span class="goods-num">退货件数：<b>{{ afterSaleInfo.num || 1 }}</b> 件</span>
              </div>
            </div>
            <div class="goods-price-box">
              <div class="price-item">
                <span class="label">申请退款：</span>
                <span class="value refund-price">
                  ¥ {{ (afterSaleInfo.applyRefundPrice || 0).toFixed(2) }}
                </span>
              </div>
              <div v-if="afterSaleInfo.actualRefundPrice" class="price-item">
                <span class="label">实际退款：</span>
                <span class="value actual-price">
                  ¥ {{ Number(afterSaleInfo.actualRefundPrice).toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 2. 售后申请详情 -->
        <el-card shadow="never" class="section-card">
          <template #header>
            <div class="card-title">
              <el-icon><Document /></el-icon>
              <span>售后申请详情</span>
            </div>
          </template>

          <el-descriptions :column="2" border class="custom-descriptions">
            <el-descriptions-item label="售后状态">
              <el-tag size="small" :type="getStatusTagType(afterSaleInfo.serviceStatus)">
                {{ afterSaleInfo.serviceName }}
              </el-tag>
            </el-descriptions-item>

            <el-descriptions-item label="退货退款原因">
              <span class="font-bold">{{ afterSaleInfo.reason || "-" }}</span>
            </el-descriptions-item>

            <el-descriptions-item label="申请退款金额">
              <span class="text-danger font-bold">
                ¥ {{ (afterSaleInfo.applyRefundPrice || 0).toFixed(2) }}
              </span>
            </el-descriptions-item>

            <el-descriptions-item label="实际退款金额">
              <span v-if="afterSaleInfo.actualRefundPrice" class="text-success font-bold">
                ¥ {{ Number(afterSaleInfo.actualRefundPrice).toFixed(2) }}
              </span>
              <span v-else class="text-gray">待审核结算</span>
            </el-descriptions-item>

            <el-descriptions-item v-if="afterSaleInfo.refundPoint" label="退还积分">
              {{ afterSaleInfo.refundPoint }} 积分
            </el-descriptions-item>

            <el-descriptions-item label="退货数量">
              {{ afterSaleInfo.num || 0 }} 件
            </el-descriptions-item>

            <el-descriptions-item label="问题描述" :span="2">
              <div class="problem-desc-box">
                {{ afterSaleInfo.problemDesc || "买家未填写详细说明" }}
              </div>
            </el-descriptions-item>

            <el-descriptions-item label="凭证图片" :span="2">
              <div v-if="afterSaleImage.length > 0 && afterSaleImage[0]" class="proof-images-list">
                <el-image
                  v-for="(img, idx) in afterSaleImage"
                  :key="idx"
                  :src="img"
                  :preview-src-list="afterSaleImage"
                  :initial-index="idx"
                  fit="cover"
                  class="proof-img"
                />
              </div>
              <span v-else class="text-gray">买家未上传申诉凭证图片</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 3. 商家处理意见 -->
        <el-card shadow="never" class="section-card">
          <template #header>
            <div class="card-title">
              <el-icon><Stamp /></el-icon>
              <span>商家审核处理</span>
            </div>
          </template>

          <!-- 待审核阶段：可编辑审核 -->
          <div v-if="afterSaleInfo.serviceStatus === 'APPLY'" class="review-form-wrap">
            <el-form label-width="110px">
              <el-form-item label="所属商家">
                <span class="store-name-text">{{ afterSaleInfo.storeName || "-" }}</span>
              </el-form-item>

              <el-form-item label="审核处理" required>
                <el-radio-group v-model="params.serviceStatus">
                  <el-radio-button value="PASS">同意售后申请</el-radio-button>
                  <el-radio-button value="REFUSE">拒绝申请</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="申请金额">
                <span class="text-danger font-bold">
                  ¥ {{ (afterSaleInfo.applyRefundPrice || 0).toFixed(2) }}
                </span>
              </el-form-item>

              <el-form-item label="实际退款金额" required>
                <el-input-number
                  v-model="params.actualRefundPrice"
                  :min="0"
                  :max="afterSaleInfo.applyRefundPrice || 999999"
                  :precision="2"
                  style="width: 200px"
                />
              </el-form-item>

              <el-form-item label="审核备注" required>
                <el-input
                  v-model="params.remark"
                  type="textarea"
                  :rows="3"
                  maxlength="200"
                  show-word-limit
                  placeholder="请输入审核处理备注信息"
                  style="max-width: 480px"
                />
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  :loading="submitLoading"
                  @click="handleSubmit"
                >
                  确认审核结果
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 已审核阶段：只读信息 -->
          <el-descriptions v-else :column="1" border class="custom-descriptions">
            <el-descriptions-item label="所属商家">
              {{ afterSaleInfo.storeName || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="审核备注">
              <div class="remark-content">
                {{ afterSaleInfo.auditRemark || "暂无备注信息" }}
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 4. 平台退款操作卡片 -->
        <el-card
          v-if="afterSaleInfo.afterSaleAllowOperationVO && afterSaleInfo.afterSaleAllowOperationVO.refund"
          shadow="never"
          class="section-card refund-action-card"
        >
          <template #header>
            <div class="card-title text-danger">
              <el-icon><Money /></el-icon>
              <span>平台退款操作</span>
            </div>
          </template>

          <el-alert
            type="warning"
            show-icon
            :closable="false"
            title="请核对以下收款账户信息后进行退款确认"
            style="margin-bottom: 16px"
          />

          <el-descriptions :column="2" border class="custom-descriptions" style="margin-bottom: 16px">
            <el-descriptions-item label="开户行">
              {{ afterSaleInfo.bankDepositName || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="开户名">
              {{ afterSaleInfo.bankAccountName || "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="银行卡号" :span="2">
              <span class="font-bold font-mono">{{ formatBankCard(afterSaleInfo.bankAccountNumber) }}</span>
              <el-tooltip content="复制卡号" placement="top">
                <el-button
                  link
                  type="primary"
                  :icon="CopyDocument"
                  style="margin-left: 8px"
                  @click="copyText(afterSaleInfo.bankAccountNumber, '银行卡号')"
                />
              </el-tooltip>
            </el-descriptions-item>
          </el-descriptions>

          <el-form label-width="95px">
            <el-form-item label="退款备注" required>
              <el-input
                v-model="refundPriceForm.remark"
                type="textarea"
                :rows="3"
                maxlength="200"
                show-word-limit
                placeholder="请输入平台退款备注信息"
                style="max-width: 480px"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="danger"
                :loading="submitLoading"
                @click="refundPriceSubmit"
              >
                确认退款到用户
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 右侧：关联订单与物流信息区 -->
      <el-col :xs="24" :sm="24" :md="9" :lg="9" :xl="8">
        <!-- 关联订单卡片 -->
        <el-card shadow="never" class="section-card side-card">
          <template #header>
            <div class="card-title">
              <el-icon><Tickets /></el-icon>
              <span>关联订单信息</span>
            </div>
          </template>

          <div class="side-info-list">
            <div class="side-info-item">
              <span class="item-label">关联订单编号</span>
              <div class="item-value">
                <span class="font-mono">{{ afterSaleInfo.orderSn || "-" }}</span>
                <el-tooltip v-if="afterSaleInfo.orderSn" content="复制订单号" placement="top">
                  <el-button
                    link
                    type="primary"
                    :icon="CopyDocument"
                    @click="copyText(afterSaleInfo.orderSn, '订单号')"
                  />
                </el-tooltip>
                <el-tooltip v-if="afterSaleInfo.orderSn" content="查看原订单详情" placement="top">
                  <el-button
                    link
                    type="primary"
                    :icon="TopRight"
                    @click="viewOrder(afterSaleInfo.orderSn)"
                  >
                    查看订单
                  </el-button>
                </el-tooltip>
              </div>
            </div>

            <div v-if="afterSaleInfo.bankDepositName" class="side-info-item">
              <span class="item-label">银行开户行</span>
              <div class="item-value">{{ afterSaleInfo.bankDepositName }}</div>
            </div>

            <div v-if="afterSaleInfo.bankAccountName" class="side-info-item">
              <span class="item-label">银行开户名</span>
              <div class="item-value">{{ afterSaleInfo.bankAccountName }}</div>
            </div>

            <div v-if="afterSaleInfo.bankAccountNumber" class="side-info-item">
              <span class="item-label">银行卡号</span>
              <div class="item-value">
                <span class="font-mono">{{ formatBankCard(afterSaleInfo.bankAccountNumber) }}</span>
                <el-tooltip content="复制卡号" placement="top">
                  <el-button
                    link
                    type="primary"
                    :icon="CopyDocument"
                    @click="copyText(afterSaleInfo.bankAccountNumber, '银行卡号')"
                  />
                </el-tooltip>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 退货物流信息卡片 -->
        <el-card
          v-if="afterSaleInfo.showDelivery && afterSaleInfo.serviceType === 'RETURN_GOODS'"
          shadow="never"
          class="section-card side-card"
        >
          <template #header>
            <div class="card-title">
              <el-icon><Van /></el-icon>
              <span>退货物流信息</span>
            </div>
          </template>

          <div class="side-info-list">
            <div class="side-info-item">
              <span class="item-label">收货商家</span>
              <div class="item-value font-bold">{{ afterSaleInfo.storeName || "-" }}</div>
            </div>

            <div class="side-info-item">
              <span class="item-label">商家联系电话</span>
              <div class="item-value">{{ storeMsg.salesConsigneeMobile || "-" }}</div>
            </div>

            <div class="side-info-item">
              <span class="item-label">商家收货地址</span>
              <div class="item-value address-text">
                {{ storeMsg.salesConsigneeAddressPath || "" }} {{ storeMsg.salesConsigneeDetail || "" }}
              </div>
            </div>

            <div class="side-divider"></div>

            <div class="side-info-item">
              <span class="item-label">退货物流公司</span>
              <div class="item-value font-bold">{{ afterSaleInfo.mlogisticsName || "-" }}</div>
            </div>

            <div class="side-info-item">
              <span class="item-label">退货物流单号</span>
              <div class="item-value">
                <span class="font-mono font-bold">{{ afterSaleInfo.mlogisticsNo || "-" }}</span>
                <el-tooltip v-if="afterSaleInfo.mlogisticsNo" content="复制物流单号" placement="top">
                  <el-button
                    link
                    type="primary"
                    :icon="CopyDocument"
                    @click="copyText(afterSaleInfo.mlogisticsNo, '物流单号')"
                  />
                </el-tooltip>
              </div>
            </div>

            <div class="delivery-action-wrap">
              <el-button
                type="primary"
                plain
                :icon="Search"
                :loading="submitLoading"
                style="width: 100%"
                @click="logisticsSeller"
              >
                查询完整物流轨迹
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 弹窗：物流轨迹详情（使用现代化 el-timeline） -->
    <el-dialog
      v-model="logisticsModal"
      title="物流轨迹追踪"
      width="640px"
      append-to-body
      class="logistics-dialog"
    >
      <el-descriptions :column="2" border size="small" style="margin-bottom: 20px">
        <el-descriptions-item label="售后单号">{{ sn }}</el-descriptions-item>
        <el-descriptions-item label="物流公司">{{ afterSaleInfo.mlogisticsName || "-" }}</el-descriptions-item>
        <el-descriptions-item label="物流单号" :span="2">
          <span class="font-mono font-bold">{{ afterSaleInfo.mlogisticsNo || "-" }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <div class="timeline-container">
        <el-timeline v-if="logisticsInfo.traces && logisticsInfo.traces.length > 0">
          <el-timeline-item
            v-for="(item, index) in logisticsInfo.traces"
            :key="index"
            :timestamp="item.AcceptTime"
            :type="index === 0 ? 'primary' : 'info'"
            :hollow="index !== 0"
            size="large"
          >
            <div class="trace-desc">{{ item.AcceptStation }}</div>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无该包裹的物流轨迹数据" :image-size="80" />
      </div>

      <template #footer>
        <el-button @click="logisticsModal = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as API_Order from "@/api/order";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Goods,
  Document,
  Stamp,
  Money,
  Tickets,
  Van,
  CopyDocument,
  Refresh,
  Search,
  ArrowLeft,
  TopRight,
} from "@element-plus/icons-vue";

defineOptions({ name: "afterSaleOrderDetail" });

const route = useRoute();
const router = useRouter();

const sn = ref("");
const logisticsModal = ref(false);
const logisticsInfo = ref({});
const afterSaleInfo = ref({});
const afterSaleImage = ref([]);
const submitLoading = ref(false);
const storeMsg = ref({});

const params = reactive({
  serviceStatus: "PASS",
  actualRefundPrice: 0,
  remark: "",
});

const refundPriceForm = reactive({
  remark: "",
});

const afterSaleStatusList = ref([
  { name: "申请中", status: "APPLY" },
  { name: "通过售后", status: "PASS" },
  { name: "拒绝售后", status: "REFUSE" },
  { name: "买家退货，待卖家收货", status: "BUYER_RETURN" },
  { name: "卖家确认收货", status: "SELLER_CONFIRM" },
  { name: "卖家终止售后", status: "SELLER_TERMINATION" },
  { name: "买家取消售后", status: "BUYER_CANCEL" },
  { name: "完成售后", status: "COMPLETE" },
  { name: "待平台退款", status: "WAIT_REFUND" },
]);

// 动态流程步骤定义
const dynamicSteps = computed(() => {
  if (afterSaleInfo.value.serviceType === "RETURN_MONEY") {
    return [
      { title: "买家申请", desc: "提交仅退款" },
      { title: "商家审核", desc: "审核处理" },
      { title: "平台退款", desc: "退款到账户" },
    ];
  }
  return [
    { title: "买家申请", desc: "提交退货退款" },
    { title: "商家审核", desc: "审核处理" },
    { title: "买家寄件", desc: "填写物流单号" },
    { title: "卖家收货", desc: "确认收到包裹" },
    { title: "退款完成", desc: "款项已结算" },
  ];
});

// 计算当前步骤索引
const currentStepIndex = computed(() => {
  const status = afterSaleInfo.value.serviceStatus;
  const isReturnMoney = afterSaleInfo.value.serviceType === "RETURN_MONEY";

  if (isReturnMoney) {
    if (status === "APPLY") return 1;
    if (status === "PASS" || status === "WAIT_REFUND") return 2;
    if (status === "COMPLETE") return 3;
    return 1;
  }

  // 退货退款模式 (5 步)
  if (status === "APPLY") return 1;
  if (status === "PASS") return 2;
  if (status === "BUYER_RETURN") return 3;
  if (status === "SELLER_CONFIRM" || status === "WAIT_REFUND") return 4;
  if (status === "COMPLETE") return 5;
  return 1;
});

// 步骤状态（成功或异常终止）
const stepProcessStatus = computed(() => {
  const status = afterSaleInfo.value.serviceStatus;
  if (status === "REFUSE" || status === "BUYER_CANCEL" || status === "SELLER_TERMINATION") {
    return "error";
  }
  return "process";
});

function getStatusTagType(status) {
  const map = {
    APPLY: "warning",
    PASS: "success",
    REFUSE: "danger",
    BUYER_RETURN: "primary",
    SELLER_CONFIRM: "primary",
    SELLER_TERMINATION: "info",
    BUYER_CANCEL: "info",
    COMPLETE: "success",
    WAIT_REFUND: "danger",
  };
  return map[status] || "info";
}

function getServiceTypeName(type) {
  const map = {
    RETURN_GOODS: "退货退款",
    EXCHANGE_GOODS: "换货",
    RETURN_MONEY: "仅退款",
  };
  return map[type] || "售后申请";
}

function formatBankCard(card) {
  if (!card) return "-";
  return card.replace(/\s/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");
}

function copyText(text, label = "内容") {
  if (!text) return;
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      ElMessage.success(`${label}已复制到剪贴板`);
    });
  } else {
    const input = document.createElement("input");
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    ElMessage.success(`${label}已复制到剪贴板`);
  }
}

function goBack() {
  router.back();
}

function linkTo(goodsId, skuId) {
  if (!goodsId) return;
  const routeUrl = router.resolve({
    path: "/goods/goods-info/goodsDetail",
    query: { id: goodsId, skuId },
  });
  if (routeUrl) {
    window.open(routeUrl.href, "_blank");
  }
}

function viewOrder(orderSn) {
  if (!orderSn) return;
  const routeUrl = router.resolve({
    path: "/order-detail",
    query: { sn: orderSn },
  });
  if (routeUrl) {
    window.open(routeUrl.href, "_blank");
  }
}

function getDetail() {
  if (!sn.value) return;
  API_Order.getAfterSaleOrderDetail(sn.value).then((res) => {
    if (res.success && res.result) {
      afterSaleInfo.value = res.result;
      afterSaleInfo.value.showDelivery = showDelivery(res.result.serviceStatus);
      afterSaleInfo.value.serviceName = filterOrderStatus(res.result.serviceStatus);

      afterSaleImage.value = (res.result.afterSaleImage || "")
        .split(",")
        .filter(Boolean);

      if (afterSaleInfo.value.mconsigneeAddressPath) {
        afterSaleInfo.value.mconsigneeAddressPath = afterSaleInfo.value.mconsigneeAddressPath.replaceAll(
          ",",
          " "
        );
      }

      params.actualRefundPrice = afterSaleInfo.value.applyRefundPrice || 0;

      if (afterSaleInfo.value.showDelivery) {
        API_Order.storeAddress(sn.value).then((resu) => {
          if (resu.success && resu.result) {
            const obj = resu.result;
            if (obj.salesConsigneeAddressPath) {
              obj.salesConsigneeAddressPath = obj.salesConsigneeAddressPath.replaceAll(",", " ");
            }
            storeMsg.value = obj;
          }
        });
      }
    }
  });
}

function refundPriceSubmit() {
  if (!refundPriceForm.remark.trim()) {
    ElMessage.error("请输入退款备注信息");
    return;
  }
  ElMessageBox.confirm("请确认执行平台退款操作？", "确认退款", {
    type: "warning",
    confirmButtonText: "确定退款",
    cancelButtonText: "取消",
  })
    .then(() => {
      submitLoading.value = true;
      API_Order.refundPrice(sn.value, refundPriceForm)
        .then((res) => {
          submitLoading.value = false;
          if (res.success) {
            ElMessage.success("退款成功");
            getDetail();
          }
        })
        .catch(() => {
          submitLoading.value = false;
        });
    })
    .catch(() => {});
}

function logisticsSeller() {
  submitLoading.value = true;
  API_Order.getAfterSaleTraces(sn.value)
    .then((res) => {
      submitLoading.value = false;
      if (res.success && res.result != null) {
        logisticsInfo.value = res.result;
        logisticsModal.value = true;
      } else {
        ElMessage.info("暂未获取到物流轨迹");
      }
    })
    .catch(() => {
      submitLoading.value = false;
    });
}

function handleSubmit() {
  if (!params.remark.trim()) {
    ElMessage.error("请输入审核备注信息");
    return;
  }
  if (params.actualRefundPrice == null || params.actualRefundPrice === "") {
    ElMessage.error("请输入实际退款金额");
    return;
  }
  submitLoading.value = true;
  API_Order.afterSaleSellerReview(sn.value, params)
    .then((res) => {
      submitLoading.value = false;
      if (res.success) {
        ElMessage.success("审核结果提交成功");
        params.remark = "";
        getDetail();
      }
    })
    .catch(() => {
      submitLoading.value = false;
    });
}

function filterOrderStatus(status) {
  const ob = afterSaleStatusList.value.filter((e) => e.status === status);
  return ob.length > 0 ? ob[0].name : status;
}

function showDelivery(status) {
  let flag = false;
  afterSaleStatusList.value.forEach((e, index) => {
    if (e.status === status && index >= 3 && index !== 6) {
      flag = true;
    }
  });
  return flag;
}

onMounted(() => {
  sn.value = route.query.sn;
  getDetail();
});
</script>

<style lang="scss" scoped>
.after-sale-detail-page {
  width: 100%;
  padding-bottom: 30px;

  .page-top-nav {
    margin-bottom: 14px;

    :deep(.el-page-header__left) {
      margin-right: 16px;
    }

    .nav-content {
      display: flex;
      align-items: baseline;
      gap: 12px;

      .page-title {
        font-size: 17px;
        font-weight: 700;
        color: #1e293b;
      }

      .page-subtitle {
        font-size: 13px;
        color: #94a3b8;
      }
    }
  }

  .status-header-card {
    border-radius: 10px;
    border: 1px solid #ebeef5;
    background: #fff;
    margin-bottom: 18px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

    :deep(.el-card__body) {
      padding: 20px 24px;
    }

    .header-main {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 20px;
      padding-bottom: 20px;
      border-bottom: 1px dashed #f1f5f9;
    }

    .status-summary-left {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .status-badge-wrap {
        display: flex;
        align-items: center;
        gap: 10px;

        .status-tag {
          font-size: 14px;
          padding: 6px 14px;
          height: auto;
          font-weight: 600;
        }

        .type-tag {
          font-size: 13px;
        }
      }

      .sn-info-wrap {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: #475569;

        .sn-label {
          color: #94a3b8;
        }

        .sn-text {
          font-weight: 600;
          color: #1e293b;
          font-family: monospace;
          font-size: 15px;
        }

        .copy-btn {
          margin-left: 6px;
          font-size: 15px;
        }
      }

      .create-time-text {
        font-size: 12px;
        color: #94a3b8;
      }
    }

    .status-metrics-right {
      display: flex;
      align-items: center;
      gap: 24px;
      background: #f8fafc;
      padding: 12px 20px;
      border-radius: 8px;
      border: 1px solid #edf2f7;

      .metric-block {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .metric-label {
          font-size: 12px;
          color: #64748b;
        }

        .metric-val {
          font-size: 18px;
          font-weight: 700;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

          small {
            font-size: 12px;
            font-weight: normal;
          }
        }
      }

      .metric-divider {
        width: 1px;
        height: 28px;
        background: #e2e8f0;
      }
    }

    .lifecycle-steps-wrap {
      padding-top: 22px;

      :deep(.el-step__title) {
        font-size: 14px;
        font-weight: 600;
      }

      :deep(.el-step__description) {
        font-size: 12px;
      }
    }
  }

  .content-row {
    margin-top: 0;
  }

  .section-card {
    border-radius: 10px;
    border: 1px solid #ebeef5;
    background: #fff;
    margin-bottom: 18px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

    :deep(.el-card__header) {
      padding: 14px 20px;
      border-bottom: 1px solid #f1f5f9;
      background: #fafafa;
    }

    :deep(.el-card__body) {
      padding: 18px 20px;
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 600;
      color: #1e293b;

      .el-icon {
        font-size: 17px;
        color: #ff6a00;
      }

      &.text-danger .el-icon {
        color: #ef4444;
      }
    }
  }

  // 商品展示盒
  .goods-info-box {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px;
    background: #f8fafc;
    border: 1px solid #edf2f7;
    border-radius: 8px;

    .goods-image-wrap {
      width: 74px;
      height: 74px;
      flex-shrink: 0;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #e2e8f0;

      .goods-img {
        width: 100%;
        height: 100%;
      }
    }

    .goods-detail {
      flex: 1;
      min-width: 0;

      .goods-title {
        font-size: 14px;
        font-weight: 600;
        color: #1e293b;
        line-height: 20px;
        cursor: pointer;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        transition: color 0.15s ease;

        .link-icon {
          font-size: 12px;
          margin-left: 4px;
          opacity: 0.6;
        }

        &:hover {
          color: #ff6a00;
        }
      }

      .goods-sub {
        margin-top: 8px;
        display: flex;
        align-items: center;
        gap: 14px;
        font-size: 12px;
        color: #64748b;

        .goods-spec {
          background: #e2e8f0;
          padding: 2px 6px;
          border-radius: 3px;
        }

        .goods-num b {
          color: #ff6a00;
        }
      }
    }

    .goods-price-box {
      text-align: right;
      padding-left: 16px;
      border-left: 1px dashed #e2e8f0;

      .price-item {
        font-size: 13px;
        margin-bottom: 4px;

        .label {
          color: #64748b;
        }

        .refund-price {
          color: #ef4444;
          font-weight: 700;
          font-size: 16px;
        }

        .actual-price {
          color: #10b981;
          font-weight: 700;
        }
      }
    }
  }

  // 描述列表优化
  .custom-descriptions {
    :deep(.el-descriptions__label) {
      width: 120px;
      background: #f8fafc;
      color: #64748b;
      font-weight: 500;
    }

    :deep(.el-descriptions__content) {
      color: #1e293b;
    }
  }

  .problem-desc-box {
    background: #f8fafc;
    padding: 10px 14px;
    border-radius: 6px;
    color: #334155;
    line-height: 20px;
    border: 1px solid #edf2f7;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .proof-images-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    .proof-img {
      width: 80px;
      height: 80px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      cursor: pointer;
      transition: transform 0.2s ease;

      &:hover {
        transform: scale(1.05);
      }
    }
  }

  .store-name-text {
    font-weight: 600;
    color: #1e293b;
  }

  .remark-content {
    color: #475569;
    line-height: 20px;
  }

  // 侧边卡片
  .side-card {
    .side-info-list {
      display: flex;
      flex-direction: column;
      gap: 14px;

      .side-info-item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .item-label {
          font-size: 12px;
          color: #94a3b8;
        }

        .item-value {
          font-size: 14px;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 6px;

          &.address-text {
            line-height: 20px;
            color: #334155;
          }
        }
      }

      .side-divider {
        height: 1px;
        background: #f1f5f9;
        margin: 4px 0;
      }

      .delivery-action-wrap {
        margin-top: 10px;
      }
    }
  }

  .text-danger {
    color: #ef4444;
  }

  .text-success {
    color: #10b981;
  }

  .text-gray {
    color: #94a3b8;
  }

  .text-dark {
    color: #0f172a;
  }

  .font-bold {
    font-weight: 600;
  }

  .font-mono {
    font-family: monospace;
  }
}

// 物流时间轴弹窗
.logistics-dialog {
  .timeline-container {
    max-height: 400px;
    overflow-y: auto;
    padding: 10px 10px 0;

    .trace-desc {
      line-height: 20px;
      color: #334155;
      font-size: 13px;
    }
  }
}
</style>
