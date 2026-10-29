<template>
  <div class="order-complaint-detail-page" v-loading="loading">
    <!-- 顶部导航栏 -->
    <div class="page-top-nav">
      <el-page-header :icon="ArrowLeft" title="返回列表" @back="returnDataList">
        <template #content>
          <div class="nav-content">
            <span class="page-title">交易投诉详情</span>
            <span class="page-subtitle font-mono">投诉单号：{{ id || "-" }}</span>
          </div>
        </template>
        <template #extra>
          <div class="nav-actions">
            <el-button :icon="Refresh" @click="getDetail">刷新数据</el-button>
            <el-button
              v-if="complaintInfo.complainStatus === 'NEW'"
              type="warning"
              plain
              :loading="submitLoading"
              @click="handleStoreComplaint"
            >
              交由商家申诉
            </el-button>
            <el-button
              v-if="complaintInfo.complainStatus && complaintInfo.complainStatus !== 'COMPLETE' && complaintInfo.complainStatus !== 'CANCEL'"
              type="primary"
              @click="openArbitrationDialog"
            >
              仲裁结案
            </el-button>
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
              :type="getStatusTagType(complaintInfo.complainStatus)"
              effect="dark"
              size="large"
              class="status-tag"
            >
              {{ complainStatusText(complaintInfo.complainStatus) }}
            </el-tag>
            <span class="status-desc-text">{{ getStatusDescription(complaintInfo.complainStatus) }}</span>
          </div>

          <div class="sn-info-wrap">
            <span class="sn-label">投诉单号：</span>
            <span class="sn-text font-mono">{{ id || "-" }}</span>
            <el-tooltip content="复制投诉单号" placement="top">
              <el-button
                link
                type="primary"
                :icon="CopyDocument"
                class="copy-btn"
                @click="copyText(id, '投诉单号')"
              />
            </el-tooltip>
          </div>

          <div v-if="complaintInfo.createTime" class="create-time-text">
            <el-icon><Clock /></el-icon>
            <span>投诉申请时间：{{ complaintInfo.createTime }}</span>
          </div>
        </div>

        <div class="status-metrics-right">
          <div class="metric-block">
            <span class="metric-label">订单总金额</span>
            <span class="metric-val text-danger">
              {{ unitPrice(complaintInfo.orderPrice, "￥") }}
            </span>
          </div>
          <div class="metric-divider"></div>
          <div class="metric-block">
            <span class="metric-label">涉及商品数量</span>
            <span class="metric-val text-dark">
              {{ complaintInfo.num || 1 }} <small>件</small>
            </span>
          </div>
          <div class="metric-divider"></div>
          <div class="metric-block">
            <span class="metric-label">被投诉店铺</span>
            <span class="metric-val text-primary store-name-text">
              {{ complaintInfo.storeName || "自营/未知" }}
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
      <!-- 左侧：主要信息区与处理流 -->
      <el-col :xs="24" :sm="24" :md="15" :lg="15" :xl="16">
        <!-- 1. 投诉商品信息 -->
        <el-card shadow="never" class="section-card">
          <template #header>
            <div class="card-title">
              <el-icon><Goods /></el-icon>
              <span>投诉商品信息</span>
            </div>
          </template>

          <div class="goods-info-box">
            <div class="goods-image-wrap">
              <el-image
                :src="complaintInfo.goodsImage"
                :preview-src-list="complaintInfo.goodsImage ? [complaintInfo.goodsImage] : []"
                preview-teleported
                fit="cover"
                class="goods-img"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><PictureFilled /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="goods-detail">
              <div class="goods-title" @click="goToGoods(complaintInfo.goodsId)">
                <span>{{ complaintInfo.goodsName || "未获取到商品名称" }}</span>
                <el-icon class="link-icon"><TopRight /></el-icon>
              </div>
              <div class="goods-sub">
                <span class="goods-num">购买数量：<b>{{ complaintInfo.num || 1 }}</b> 件</span>
                <span v-if="complaintInfo.goodsPrice" class="goods-price-label">
                  商品单价：<b>{{ unitPrice(complaintInfo.goodsPrice, "￥") }}</b>
                </span>
              </div>
              <div class="goods-meta-tags">
                <el-tag size="small" type="info" class="meta-tag">
                  关联订单：{{ complaintInfo.orderSn }}
                </el-tag>
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="goToOrderDetail(complaintInfo.orderSn)"
                >
                  查看订单详情
                </el-button>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 2. 买家投诉诉求与凭证 -->
        <el-card shadow="never" class="section-card">
          <template #header>
            <div class="card-title-between">
              <div class="title-left">
                <el-icon><WarningFilled /></el-icon>
                <span>买家投诉诉求与凭证</span>
              </div>
              <el-tag type="danger" effect="light" size="small">
                主题：{{ complaintInfo.complainTopic || "一般纠纷" }}
              </el-tag>
            </div>
          </template>

          <div class="complain-statement-box">
            <div class="statement-row">
              <span class="statement-label">投诉主题：</span>
              <span class="statement-val topic-text">{{ complaintInfo.complainTopic || "-" }}</span>
            </div>
            <div class="statement-row">
              <span class="statement-label">申请时间：</span>
              <span class="statement-val">{{ complaintInfo.createTime || "-" }}</span>
            </div>
            <div class="statement-row content-row-item">
              <span class="statement-label">投诉诉求描述：</span>
              <div class="statement-content-block">
                {{ complaintInfo.content || "买家未填写详细说明" }}
              </div>
            </div>
            <div class="statement-row proof-row">
              <span class="statement-label">买家上传凭证：</span>
              <div class="proof-images-list" v-if="images.length">
                <div class="proof-img-item" v-for="(img, idx) in images" :key="idx">
                  <el-image
                    :src="img"
                    :preview-src-list="images"
                    :initial-index="idx"
                    preview-teleported
                    fit="cover"
                    class="proof-img"
                  >
                    <template #error>
                      <div class="image-slot">
                        <el-icon><PictureFilled /></el-icon>
                      </div>
                    </template>
                  </el-image>
                </div>
              </div>
              <span v-else class="text-muted">买家未上传任何凭证图片</span>
            </div>
          </div>
        </el-card>

        <!-- 3. 商家申诉说明 -->
        <el-card shadow="never" class="section-card">
          <template #header>
            <div class="card-title-between">
              <div class="title-left">
                <el-icon><Shop /></el-icon>
                <span>商家申诉说明</span>
              </div>
              <el-tag
                :type="complaintInfo.appealContent ? 'success' : 'info'"
                size="small"
                effect="plain"
              >
                {{ complaintInfo.appealContent ? "商家已申诉" : "待商家答复" }}
              </el-tag>
            </div>
          </template>

          <div v-if="complaintInfo.appealContent" class="complain-statement-box">
            <div class="statement-row">
              <span class="statement-label">申诉时间：</span>
              <span class="statement-val">{{ complaintInfo.appealTime || "-" }}</span>
            </div>
            <div class="statement-row content-row-item">
              <span class="statement-label">商家申诉内容：</span>
              <div class="statement-content-block store-appeal-block">
                {{ complaintInfo.appealContent }}
              </div>
            </div>
            <div class="statement-row proof-row">
              <span class="statement-label">商家申诉凭证：</span>
              <div class="proof-images-list" v-if="appealImages.length">
                <div class="proof-img-item" v-for="(img, idx) in appealImages" :key="idx">
                  <el-image
                    :src="img"
                    :preview-src-list="appealImages"
                    :initial-index="idx"
                    preview-teleported
                    fit="cover"
                    class="proof-img"
                  >
                    <template #error>
                      <div class="image-slot">
                        <el-icon><PictureFilled /></el-icon>
                      </div>
                    </template>
                  </el-image>
                </div>
              </div>
              <span v-else class="text-muted">商家未提供图片凭证</span>
            </div>
          </div>

          <div v-else class="empty-appeal-box">
            <el-empty
              description="商家尚未提交申诉说明与答复材料"
              :image-size="64"
            >
              <template #extra>
                <el-button
                  v-if="complaintInfo.complainStatus === 'NEW'"
                  type="primary"
                  :loading="submitLoading"
                  @click="handleStoreComplaint"
                >
                  立即交由商家申诉
                </el-button>
              </template>
            </el-empty>
          </div>
        </el-card>

        <!-- 4. 协商对话沟通流 -->
        <el-card shadow="never" class="section-card communication-card">
          <template #header>
            <div class="card-title-between">
              <div class="title-left">
                <el-icon><ChatDotRound /></el-icon>
                <span>三方协商沟通记录</span>
              </div>
              <span class="chat-counter-text">
                共 {{ (complaintInfo.orderComplaintCommunications || []).length }} 条记录
              </span>
            </div>
          </template>

          <!-- 消息对话流 -->
          <div class="communication-stream">
            <div
              v-if="!complaintInfo.orderComplaintCommunications || !complaintInfo.orderComplaintCommunications.length"
              class="empty-chat-wrap"
            >
              <el-empty description="暂无协商对话记录" :image-size="60" />
            </div>

            <div
              v-for="(item, index) in complaintInfo.orderComplaintCommunications || []"
              :key="index"
              class="chat-bubble-row"
              :class="'sender-' + (item.owner || '').toLowerCase()"
            >
              <div class="chat-avatar-wrap">
                <el-avatar :size="36" :class="'avatar-' + (item.owner || '').toLowerCase()">
                  <el-icon v-if="item.owner === 'PLATFORM'"><Management /></el-icon>
                  <el-icon v-else-if="item.owner === 'STORE'"><Shop /></el-icon>
                  <el-icon v-else><User /></el-icon>
                </el-avatar>
              </div>

              <div class="chat-message-main">
                <div class="chat-meta">
                  <el-tag
                    size="small"
                    :type="getOwnerTagType(item.owner)"
                    class="owner-tag"
                  >
                    {{ getOwnerLabel(item.owner) }}
                  </el-tag>
                  <span class="chat-time">{{ item.createTime }}</span>
                </div>
                <div class="chat-bubble-body">
                  {{ item.content }}
                </div>
              </div>
            </div>
          </div>

          <!-- 平台快速回复栏 -->
          <div
            v-if="complaintInfo.complainStatus && complaintInfo.complainStatus !== 'COMPLETE' && complaintInfo.complainStatus !== 'CANCEL'"
            class="reply-box-wrap"
          >
            <div class="quick-phrase-bar">
              <span class="phrase-label">快捷快捷用语：</span>
              <el-tag
                v-for="(phrase, pIdx) in quickPhrases"
                :key="pIdx"
                class="phrase-tag"
                size="small"
                effect="plain"
                @click="applyQuickPhrase(phrase)"
              >
                {{ phrase }}
              </el-tag>
            </div>
            <div class="reply-input-bar">
              <el-input
                v-model="params.content"
                type="textarea"
                :rows="3"
                maxlength="200"
                show-word-limit
                clearable
                placeholder="请输入平台调解意见或回复内容，此内容将同步展示给买卖双方..."
              />
              <div class="reply-action-row">
                <span class="reply-tip-text">支持输入最多 200 字平台调解答复</span>
                <el-button
                  type="primary"
                  :icon="Position"
                  :loading="submitLoading"
                  @click="handleSubmit"
                >
                  发送平台回复
                </el-button>
              </div>
            </div>
          </div>
          <div v-else class="chat-closed-notice">
            <el-alert
              type="info"
              show-icon
              :closable="false"
              title="当前投诉流程已结束，协商对话通道已关闭。"
            />
          </div>
        </el-card>

        <!-- 5. 平台仲裁结果卡片 -->
        <el-card
          v-if="complaintInfo.complainStatus === 'COMPLETE'"
          shadow="never"
          class="section-card arbitration-result-card"
        >
          <template #header>
            <div class="card-title">
              <el-icon><CircleCheckFilled /></el-icon>
              <span>平台最终仲裁结果</span>
            </div>
          </template>
          <div class="arbitration-success-box">
            <div class="result-badge">
              <el-tag type="success" size="large" effect="dark">已结案</el-tag>
            </div>
            <div class="result-content-wrap">
              <div class="result-title">裁决与仲裁意见：</div>
              <div class="result-text">{{ complaintInfo.arbitrationResult || "已达成调解完成" }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：关联信息与处理面板 -->
      <el-col :xs="24" :sm="24" :md="9" :lg="9" :xl="8">
        <!-- 1. 关联订单概览 -->
        <el-card shadow="never" class="section-card">
          <template #header>
            <div class="card-title">
              <el-icon><Document /></el-icon>
              <span>关联订单信息</span>
            </div>
          </template>

          <el-descriptions :column="1" border size="small" class="custom-side-descriptions">
            <el-descriptions-item label="订单编号">
              <div class="flex-align-center">
                <span class="font-mono text-dark">{{ complaintInfo.orderSn }}</span>
                <el-tooltip content="复制订单号" placement="top">
                  <el-button
                    link
                    type="primary"
                    :icon="CopyDocument"
                    style="margin-left: 6px"
                    @click="copyText(complaintInfo.orderSn, '订单编号')"
                  />
                </el-tooltip>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="下单时间">
              <span>{{ complaintInfo.orderTime || complaintInfo.createTime || "-" }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="订单总金额">
              <span class="price-highlight">{{ unitPrice(complaintInfo.orderPrice, "￥") }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="运费">
              <span>{{ unitPrice(complaintInfo.freightPrice || 0, "￥") }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="物流单号">
              <span>{{ complaintInfo.logisticsNo || "暂无物流编号" }}</span>
            </el-descriptions-item>
          </el-descriptions>

          <div class="side-btn-wrap">
            <el-button
              type="primary"
              plain
              style="width: 100%"
              :icon="TopRight"
              @click="goToOrderDetail(complaintInfo.orderSn)"
            >
              进入完整订单详情
            </el-button>
          </div>
        </el-card>

        <!-- 2. 纠纷当事双方信息 -->
        <el-card shadow="never" class="section-card">
          <template #header>
            <div class="card-title">
              <el-icon><User /></el-icon>
              <span>纠纷当事双方</span>
            </div>
          </template>

          <div class="parties-container">
            <!-- 买方 -->
            <div class="party-block">
              <div class="party-header">
                <el-tag size="small" type="primary">买方 (投诉人)</el-tag>
              </div>
              <div class="party-item">
                <span class="party-label">会员账号：</span>
                <span class="party-val font-semibold">{{ complaintInfo.memberName || "-" }}</span>
              </div>
              <div class="party-item">
                <span class="party-label">会员 ID：</span>
                <span class="party-val font-mono text-muted">{{ complaintInfo.memberId || "-" }}</span>
              </div>
            </div>

            <el-divider style="margin: 12px 0" />

            <!-- 卖方 -->
            <div class="party-block">
              <div class="party-header">
                <el-tag size="small" type="warning">卖方 (被投诉人)</el-tag>
              </div>
              <div class="party-item">
                <span class="party-label">店铺名称：</span>
                <span class="party-val font-semibold">{{ complaintInfo.storeName || "-" }}</span>
              </div>
              <div class="party-item">
                <span class="party-label">店铺 ID：</span>
                <span class="party-val font-mono text-muted">{{ complaintInfo.storeId || "-" }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 3. 收件人及地址 -->
        <el-card shadow="never" class="section-card">
          <template #header>
            <div class="card-title">
              <el-icon><Location /></el-icon>
              <span>收件人与收货地址</span>
            </div>
          </template>

          <div class="consignee-info-wrap">
            <div class="consignee-item">
              <span class="label">收件人姓名：</span>
              <span class="value font-semibold">{{ complaintInfo.consigneeName || "-" }}</span>
            </div>
            <div class="consignee-item">
              <span class="label">联系电话：</span>
              <span class="value font-mono">{{ complaintInfo.consigneeMobile || "-" }}</span>
            </div>
            <div class="consignee-item">
              <span class="label">配送地址：</span>
              <span class="value address-val">{{ complaintInfo.consigneeAddressPath || "-" }}</span>
            </div>
          </div>
        </el-card>

        <!-- 4. 平台快速操作面板 -->
        <el-card shadow="never" class="section-card quick-action-card">
          <template #header>
            <div class="card-title">
              <el-icon><Management /></el-icon>
              <span>平台仲裁处理</span>
            </div>
          </template>

          <div class="action-body">
            <div v-if="complaintInfo.complainStatus === 'COMPLETE'" class="complete-tip">
              <el-icon class="icon-success"><CircleCheckFilled /></el-icon>
              <div class="tip-text">投诉流程已全流程归档完成。</div>
            </div>

            <div v-else-if="complaintInfo.complainStatus === 'CANCEL'" class="complete-tip">
              <el-icon class="icon-muted"><WarningFilled /></el-icon>
              <div class="tip-text">买家已撤销投诉申请，流程已终止。</div>
            </div>

            <div v-else class="action-btn-list">
              <p class="action-hint">
                平台管理员可根据沟通情况介入调解，若双方无法达成一致，可直接出具仲裁意见结束投诉。
              </p>

              <el-button
                v-if="complaintInfo.complainStatus === 'NEW'"
                type="warning"
                style="width: 100%; margin-bottom: 10px"
                :loading="submitLoading"
                @click="handleStoreComplaint"
              >
                交由商家申诉答复
              </el-button>

              <el-button
                type="danger"
                style="width: 100%; margin-left: 0; margin-bottom: 10px"
                @click="openArbitrationDialog"
              >
                出具仲裁意见并结案
              </el-button>

              <el-button
                style="width: 100%; margin-left: 0"
                @click="returnDataList"
              >
                返回投诉列表
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 平台仲裁处理弹窗 -->
    <el-dialog
      v-model="arbitrationDialogVisible"
      title="平台仲裁裁决处理"
      width="560px"
      append-to-body
      destroy-on-close
    >
      <div class="arbitration-dialog-body">
        <el-alert
          title="提示：提交仲裁意见后将正式结束本次交易纠纷投诉流程，请确认已了解买卖双方沟通凭证与诉求。"
          type="warning"
          show-icon
          :closable="false"
          style="margin-bottom: 16px"
        />

        <el-form label-position="top">
          <el-form-item label="裁决意见 / 仲裁结果说明" required>
            <el-input
              v-model="arbitrationParams.arbitrationResult"
              type="textarea"
              :rows="5"
              maxlength="200"
              show-word-limit
              clearable
              placeholder="请输入清晰的仲裁处理意见（如：经平台核实，商品质量存在缺陷，已为买家办理退款/请商家重新补发商品）..."
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="arbitrationDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="submitLoading"
            @click="arbitrationHandleSubmit"
          >
            确认提交并结案
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as API_Order from "@/api/order";
import { ElMessage, ElMessageBox } from "element-plus";
import { unitPrice } from "@/utils/filters";
import {
  ArrowLeft,
  Refresh,
  CopyDocument,
  TopRight,
  Goods,
  Document,
  ChatDotRound,
  User,
  Shop,
  Location,
  CircleCheckFilled,
  WarningFilled,
  Clock,
  Position,
  Management,
  PictureFilled,
} from "@element-plus/icons-vue";

defineOptions({ name: "orderComplaintDetail" });

const route = useRoute();
const router = useRouter();

const emptyComplaint = () => ({
  id: "",
  orderSn: "",
  orderPrice: 0,
  freightPrice: 0,
  goodsName: "",
  goodsImage: "",
  goodsPrice: 0,
  num: 1,
  complainStatus: "",
  complainTopic: "",
  content: "",
  images: "",
  appealContent: "",
  appealTime: "",
  appealImages: "",
  arbitrationResult: "",
  storeId: "",
  storeName: "",
  memberId: "",
  memberName: "",
  consigneeName: "",
  consigneeMobile: "",
  consigneeAddressPath: "",
  orderComplaintCommunications: [],
});

const loading = ref(false);
const id = ref("");
const complaintInfo = ref(emptyComplaint());
const images = ref([]);
const appealImages = ref([]);
const submitLoading = ref(false);

// 对话回复参数
const params = reactive({
  content: "",
  complainId: "",
});

// 仲裁弹窗与参数
const arbitrationDialogVisible = ref(false);
const arbitrationParams = reactive({
  arbitrationResult: "",
});

// 快捷短语
const quickPhrases = [
  "平台已通知商家跟进核实，请耐心等待回复。",
  "请买卖双方上传清晰的有效物流或实物凭证材料。",
  "平台仲裁人员已介入调解，正在核实相关交易明细。",
  "经核对物流轨迹，快件已正常派送签收，请买家核实。",
];

function applyQuickPhrase(phrase) {
  if (params.content) {
    params.content += ` ${phrase}`;
  } else {
    params.content = phrase;
  }
}

// 复制文字工具
function copyText(text, label = "单号") {
  if (!text) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(String(text))
      .then(() => ElMessage.success(`已复制${label}到剪贴板`))
      .catch(() => ElMessage.info(String(text)));
  } else {
    ElMessage.info(String(text));
  }
}

// 状态文字对应
function complainStatusText(v) {
  const map = {
    NEW: "新投诉",
    CANCEL: "已撤销",
    WAIT_APPEAL: "待商家申诉",
    COMMUNICATION: "对话协商中",
    WAIT_ARBITRATION: "等待平台仲裁",
    COMPLETE: "处理已完成",
  };
  return map[v] || v || "-";
}

// 状态标签色彩
function getStatusTagType(v) {
  const map = {
    NEW: "primary",
    CANCEL: "info",
    WAIT_APPEAL: "warning",
    COMMUNICATION: "warning",
    WAIT_ARBITRATION: "danger",
    COMPLETE: "success",
  };
  return map[v] || "info";
}

// 状态简要说明
function getStatusDescription(v) {
  const map = {
    NEW: "买家已发起交易纠纷投诉，请通知或交由商家进行申诉响应。",
    CANCEL: "买家已主动撤销本次交易投诉申请。",
    WAIT_APPEAL: "已指派商家进行申诉响应，等待商家提交答复凭证。",
    COMMUNICATION: "买卖双方正在进行协商沟通，平台可介入调解与指导。",
    WAIT_ARBITRATION: "买卖双方已结束初步协商，等待平台出具最终仲裁裁决。",
    COMPLETE: "平台已出具仲裁决定或双方达成一致，投诉已归档结案。",
  };
  return map[v] || "交易投诉处理中";
}

// 角色展示标签
function getOwnerLabel(owner) {
  const map = {
    BUYER: "买家",
    STORE: "商家",
    PLATFORM: "平台调解员",
  };
  return map[owner] || owner || "用户";
}

function getOwnerTagType(owner) {
  const map = {
    BUYER: "info",
    STORE: "warning",
    PLATFORM: "primary",
  };
  return map[owner] || "info";
}

// 是否撤销
const isCancelled = computed(() => complaintInfo.value.complainStatus === "CANCEL");

// 流程步骤条
const dynamicSteps = computed(() => {
  if (isCancelled.value) {
    return [
      { title: "买家投诉", desc: complaintInfo.value.createTime || "发起投诉" },
      { title: "投诉已撤销", desc: "买家主动撤销" },
    ];
  }
  return [
    {
      title: "买家发起投诉",
      desc: complaintInfo.value.createTime || "发起投诉申请",
    },
    {
      title: "商家申诉",
      desc: complaintInfo.value.appealTime
        ? `已申诉：${complaintInfo.value.appealTime}`
        : complaintInfo.value.complainStatus === "NEW"
        ? "待商家申诉"
        : "等待商家申诉",
    },
    {
      title: "协商对话",
      desc:
        complaintInfo.value.orderComplaintCommunications &&
        complaintInfo.value.orderComplaintCommunications.length > 0
          ? `共 ${complaintInfo.value.orderComplaintCommunications.length} 条沟通记录`
          : "三方协商沟通",
    },
    {
      title: "平台仲裁结案",
      desc:
        complaintInfo.value.complainStatus === "COMPLETE"
          ? "已完成裁决归档"
          : "等待平台最终裁决",
    },
  ];
});

const currentStepIndex = computed(() => {
  const status = complaintInfo.value.complainStatus;
  if (status === "CANCEL") return 1;
  if (status === "NEW") return 1;
  if (status === "WAIT_APPEAL") return 1;
  if (status === "COMMUNICATION") return 2;
  if (status === "WAIT_ARBITRATION") return 3;
  if (status === "COMPLETE") return 4;
  return 1;
});

const stepProcessStatus = computed(() => {
  if (isCancelled.value) return "error";
  if (complaintInfo.value.complainStatus === "COMPLETE") return "success";
  return "process";
});

// 获取详情
function getDetail() {
  if (!id.value) return;
  loading.value = true;
  API_Order.getOrderComplainDetail(id.value)
    .then((res) => {
      loading.value = false;
      if (res.success && res.result) {
        complaintInfo.value = res.result;
        images.value = (res.result.images || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        appealImages.value = (res.result.appealImages || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else {
        complaintInfo.value = emptyComplaint();
      }
    })
    .catch(() => {
      loading.value = false;
    });
}

// 指派商家申诉
function handleStoreComplaint() {
  ElMessageBox.confirm(
    "确认将该投诉交由商家进行申诉响应吗？商家将收到通知并可提交申诉凭证与答复。",
    "交由商家申诉",
    {
      confirmButtonText: "确认指派",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).then(() => {
    submitLoading.value = true;
    API_Order.storeComplain({
      complainStatus: "WAIT_APPEAL",
      complainId: complaintInfo.value.id,
    })
      .then((res) => {
        submitLoading.value = false;
        if (res.success) {
          ElMessage.success("已成功转交商家申诉");
          getDetail();
        }
      })
      .catch(() => {
        submitLoading.value = false;
      });
  });
}

// 打开仲裁弹窗
function openArbitrationDialog() {
  arbitrationParams.arbitrationResult = complaintInfo.value.arbitrationResult || "";
  arbitrationDialogVisible.value = true;
}

// 提交仲裁
function arbitrationHandleSubmit() {
  if (!arbitrationParams.arbitrationResult || !arbitrationParams.arbitrationResult.trim()) {
    ElMessage.warning("请填写清晰的仲裁处理意见");
    return;
  }
  ElMessageBox.confirm(
    "提交仲裁结果后将正式结案本次交易投诉流程，是否确认继续？",
    "确认平台仲裁结果",
    {
      confirmButtonText: "确认结案",
      cancelButtonText: "取消",
      type: "warning",
    }
  ).then(() => {
    submitLoading.value = true;
    API_Order.orderComplete(id.value, {
      arbitrationResult: arbitrationParams.arbitrationResult.trim(),
    })
      .then((res) => {
        submitLoading.value = false;
        if (res.success) {
          ElMessage.success("平台仲裁处理成功，投诉流程已结案");
          arbitrationDialogVisible.value = false;
          getDetail();
        }
      })
      .catch(() => {
        submitLoading.value = false;
      });
  });
}

// 发送沟通对话
function handleSubmit() {
  if (!params.content || !params.content.trim()) {
    ElMessage.warning("请填写回复内容");
    return;
  }
  submitLoading.value = true;
  params.complainId = id.value;
  API_Order.addOrderCommunication({
    content: params.content.trim(),
    complainId: id.value,
  })
    .then((res) => {
      submitLoading.value = false;
      if (res.success) {
        ElMessage.success("已成功发送平台回复");
        params.content = "";
        getDetail();
      }
    })
    .catch(() => {
      submitLoading.value = false;
    });
}

// 页面跳转
function returnDataList() {
  router.push({ name: "orderComplaint" });
}

function goToOrderDetail(orderSn) {
  if (!orderSn) return;
  router.push({
    name: "order-detail",
    query: { sn: orderSn },
  });
}

function goToGoods(goodsId) {
  if (!goodsId) return;
  router.push({
    name: "goods-detail",
    query: { id: goodsId },
  });
}

onMounted(() => {
  id.value = route.query.id;
  getDetail();
});

watch(
  () => route.query.id,
  (val) => {
    id.value = val;
    getDetail();
  }
);
</script>

<style lang="scss" scoped>
.order-complaint-detail-page {
  padding: 16px 20px;
  background-color: #f6f8fa;
  min-height: calc(100vh - 110px);
}

.font-mono {
  font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.font-semibold {
  font-weight: 600;
}

/* 顶部导航 */
.page-top-nav {
  margin-bottom: 14px;

  :deep(.el-page-header__left) {
    margin-right: 20px;
  }

  .nav-content {
    display: flex;
    align-items: baseline;
    gap: 12px;

    .page-title {
      font-size: 18px;
      font-weight: 700;
      color: #1f2d3d;
    }

    .page-subtitle {
      font-size: 13px;
      color: #909399;
    }
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

/* 顶部状态看板 */
.status-header-card {
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid #ebeef5;

  .header-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 20px;
    border-bottom: 1px dashed #e4e7ed;

    @media (max-width: 992px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  }

  .status-summary-left {
    .status-badge-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;

      .status-tag {
        font-size: 14px;
        padding: 6px 14px;
        font-weight: 600;
      }

      .status-desc-text {
        font-size: 13px;
        color: #606266;
      }
    }

    .sn-info-wrap {
      display: flex;
      align-items: center;
      margin-bottom: 6px;

      .sn-label {
        font-size: 13px;
        color: #909399;
      }

      .sn-text {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }

      .copy-btn {
        margin-left: 6px;
        padding: 0 4px;
      }
    }

    .create-time-text {
      font-size: 12px;
      color: #909399;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }

  .status-metrics-right {
    display: flex;
    align-items: center;
    gap: 24px;
    background: #fbfbfc;
    padding: 12px 20px;
    border-radius: 6px;
    border: 1px solid #f2f3f5;

    .metric-block {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      min-width: 80px;

      .metric-label {
        font-size: 12px;
        color: #909399;
        margin-bottom: 4px;
      }

      .metric-val {
        font-size: 18px;
        font-weight: 700;

        small {
          font-size: 12px;
          font-weight: normal;
          color: #909399;
        }

        &.text-danger {
          color: #f56c6c;
        }

        &.text-dark {
          color: #303133;
        }

        &.text-primary {
          color: #409eff;
        }
      }

      .store-name-text {
        max-width: 130px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 15px;
      }
    }

    .metric-divider {
      width: 1px;
      height: 32px;
      background-color: #ebeef5;
    }
  }

  .lifecycle-steps-wrap {
    padding-top: 24px;
  }
}

/* 统一卡片样式 */
.section-card {
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid #ebeef5;

  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: #303133;

    .el-icon {
      color: #409eff;
      font-size: 16px;
    }
  }

  .card-title-between {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title-left {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 600;
      color: #303133;

      .el-icon {
        color: #409eff;
        font-size: 16px;
      }
    }
  }
}

/* 投诉商品信息 */
.goods-info-box {
  display: flex;
  align-items: flex-start;
  gap: 16px;

  .goods-image-wrap {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #ebeef5;
    background-color: #fafafa;

    .goods-img {
      width: 100%;
      height: 100%;
      cursor: pointer;
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.05);
      }
    }

    .image-slot {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      color: #c0c4cc;
      font-size: 24px;
    }
  }

  .goods-detail {
    flex: 1;

    .goods-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      line-height: 1.5;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 8px;

      &:hover {
        color: #409eff;
      }

      .link-icon {
        font-size: 14px;
        opacity: 0.7;
      }
    }

    .goods-sub {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: #606266;
      margin-bottom: 10px;

      b {
        color: #303133;
      }
    }

    .goods-meta-tags {
      display: flex;
      align-items: center;
      gap: 8px;

      .meta-tag {
        font-family: SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      }
    }
  }
}

/* 诉求与申诉通用样式 */
.complain-statement-box {
  .statement-row {
    display: flex;
    align-items: baseline;
    margin-bottom: 12px;

    .statement-label {
      width: 100px;
      flex-shrink: 0;
      font-size: 13px;
      color: #909399;
      text-align: right;
      padding-right: 12px;
    }

    .statement-val {
      font-size: 13px;
      color: #303133;

      &.topic-text {
        font-weight: 600;
        color: #f56c6c;
      }
    }

    &.content-row-item {
      align-items: flex-start;
    }

    .statement-content-block {
      flex: 1;
      background: #f8fafc;
      border: 1px solid #eef2f7;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 13px;
      color: #303133;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-all;

      &.store-appeal-block {
        background: #fdfaf5;
        border-color: #faecd8;
      }
    }

    &.proof-row {
      align-items: flex-start;
    }

    .proof-images-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      .proof-img-item {
        width: 88px;
        height: 88px;
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid #e4e7ed;
        background-color: #fff;
        cursor: pointer;

        .proof-img {
          width: 100%;
          height: 100%;
          transition: transform 0.2s;

          &:hover {
            transform: scale(1.06);
          }
        }
      }
    }

    .text-muted {
      color: #909399;
      font-size: 13px;
    }
  }
}

.empty-appeal-box {
  padding: 10px 0;
}

/* 对话记录 */
.communication-card {
  .chat-counter-text {
    font-size: 12px;
    color: #909399;
  }

  .communication-stream {
    max-height: 380px;
    overflow-y: auto;
    padding: 8px 4px 16px;
    margin-bottom: 16px;

    .empty-chat-wrap {
      padding: 20px 0;
    }

    .chat-bubble-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 16px;

      .chat-avatar-wrap {
        flex-shrink: 0;

        .avatar-platform {
          background-color: #409eff;
          color: #fff;
        }

        .avatar-store {
          background-color: #e6a23c;
          color: #fff;
        }

        .avatar-buyer {
          background-color: #909399;
          color: #fff;
        }
      }

      .chat-message-main {
        flex: 1;
        max-width: 85%;

        .chat-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;

          .chat-time {
            font-size: 12px;
            color: #909399;
          }
        }

        .chat-bubble-body {
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          line-height: 1.5;
          word-break: break-all;
          white-space: pre-wrap;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }
      }

      &.sender-platform {
        .chat-bubble-body {
          background-color: #ecf5ff;
          border: 1px solid #d9ecff;
          color: #1f2d3d;
        }
      }

      &.sender-store {
        .chat-bubble-body {
          background-color: #fdf6ec;
          border: 1px solid #faecd8;
          color: #303133;
        }
      }

      &.sender-buyer {
        .chat-bubble-body {
          background-color: #f4f4f5;
          border: 1px solid #e9e9eb;
          color: #303133;
        }
      }
    }
  }

  .reply-box-wrap {
    background-color: #fafbfe;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    padding: 12px;

    .quick-phrase-bar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 10px;

      .phrase-label {
        font-size: 12px;
        color: #909399;
      }

      .phrase-tag {
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          color: #409eff;
          border-color: #409eff;
          background-color: #ecf5ff;
        }
      }
    }

    .reply-action-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;

      .reply-tip-text {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .chat-closed-notice {
    padding-top: 8px;
  }
}

/* 仲裁结果 */
.arbitration-result-card {
  background: linear-gradient(180deg, #f0f9eb 0%, #ffffff 100%);
  border-color: #c2e7b0;

  .arbitration-success-box {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 6px 0;

    .result-badge {
      flex-shrink: 0;
    }

    .result-content-wrap {
      flex: 1;

      .result-title {
        font-size: 14px;
        font-weight: 600;
        color: #274917;
        margin-bottom: 6px;
      }

      .result-text {
        font-size: 14px;
        color: #303133;
        line-height: 1.6;
        background: #ffffff;
        padding: 12px 16px;
        border-radius: 6px;
        border: 1px solid #d1edc4;
      }
    }
  }
}

/* 右侧栏 */
.custom-side-descriptions {
  :deep(.el-descriptions__label) {
    width: 100px;
    background-color: #fafafa;
    color: #606266;
    font-size: 13px;
  }

  :deep(.el-descriptions__content) {
    font-size: 13px;
    color: #303133;
  }

  .flex-align-center {
    display: flex;
    align-items: center;
  }

  .price-highlight {
    font-size: 15px;
    font-weight: 700;
    color: #f56c6c;
  }
}

.side-btn-wrap {
  margin-top: 12px;
}

/* 当事双方 */
.parties-container {
  .party-block {
    .party-header {
      margin-bottom: 8px;
    }

    .party-item {
      display: flex;
      align-items: baseline;
      font-size: 13px;
      line-height: 24px;

      .party-label {
        color: #909399;
        width: 80px;
      }

      .party-val {
        color: #303133;
      }
    }
  }
}

/* 收件人信息 */
.consignee-info-wrap {
  .consignee-item {
    display: flex;
    align-items: baseline;
    font-size: 13px;
    line-height: 26px;

    .label {
      width: 90px;
      flex-shrink: 0;
      color: #909399;
    }

    .value {
      color: #303133;
    }

    .address-val {
      word-break: break-all;
      line-height: 1.4;
    }
  }
}

/* 快捷处理栏 */
.quick-action-card {
  .action-body {
    .complete-tip {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      background: #fdfdfd;
      border-radius: 6px;
      border: 1px solid #ebeef5;

      .icon-success {
        color: #67c23a;
        font-size: 20px;
      }

      .icon-muted {
        color: #909399;
        font-size: 20px;
      }

      .tip-text {
        font-size: 13px;
        color: #606266;
      }
    }

    .action-btn-list {
      .action-hint {
        font-size: 12px;
        color: #909399;
        line-height: 1.5;
        margin-bottom: 12px;
      }
    }
  }
}

.arbitration-dialog-body {
  padding-top: 6px;
}
</style>
