<template>
  <div class="search after-sale-detail">
    <!-- 顶部摘要条 -->
    <el-card class="as-summary" shadow="never">
      <div class="as-summary-main">
        <span class="as-status" :class="statusClass">{{
          afterSaleInfo.serviceName
        }}</span>
        <div class="as-sn">
          <span class="as-sn-label">{{
            isRefundOnly ? "退款编号" : "退货退款编号"
          }}</span>
          <span class="as-sn-value">{{ afterSaleInfo.sn }}</span>
          <span class="as-copy" @click="copySn">复制</span>
        </div>
        <div class="as-type">{{ sectionTitle }}</div>
      </div>
      <div class="as-amounts">
        <div class="as-amount">
          <span class="as-amount-label">申请退款金额</span>
          <span class="as-amount-value"
            >¥{{ fmtPrice(afterSaleInfo.applyRefundPrice) }}</span
          >
        </div>
        <div class="as-amount" v-if="afterSaleInfo.actualRefundPrice">
          <span class="as-amount-label">实际退款金额</span>
          <span class="as-amount-value strong"
            >¥{{ fmtPrice(afterSaleInfo.actualRefundPrice) }}</span
          >
        </div>
      </div>
    </el-card>

    <div class="as-body">
      <!-- 左侧主区 -->
      <div class="as-main">
        <el-card shadow="never">
          <div class="as-sec-title">申请信息</div>
          <div class="as-goods">
            <img
              alt="商品图片"
              class="as-goods-img"
              :src="afterSaleInfo.goodsImage"
            />
            <div class="as-goods-info">
              <a
                class="as-goods-name"
                @click="linkTo(afterSaleInfo.goodsId, afterSaleInfo.skuId)"
                >{{ afterSaleInfo.goodsName }}</a
              >
              <div class="as-goods-num">
                {{ isRefundOnly ? "退款数量" : "退货数量" }}：{{
                  afterSaleInfo.num
                }}
              </div>
            </div>
          </div>
          <div class="as-rows">
            <div class="as-row">
              <span class="as-row-label">售后类型</span>
              <span class="as-row-value">{{
                isRefundOnly ? "仅退款" : "退货退款"
              }}</span>
            </div>
            <div class="as-row">
              <span class="as-row-label">买家</span>
              <span class="as-row-value">{{ afterSaleInfo.memberName }}</span>
            </div>
            <div class="as-row" v-if="specsText">
              <span class="as-row-label">商品规格</span>
              <span class="as-row-value">{{ specsText }}</span>
            </div>
            <div class="as-row" v-if="afterSaleInfo.flowPrice">
              <span class="as-row-label">成交金额</span>
              <span class="as-row-value"
                >¥{{ fmtPrice(afterSaleInfo.flowPrice) }}</span
              >
            </div>
            <div class="as-row">
              <span class="as-row-label">申请时间</span>
              <span class="as-row-value">{{ afterSaleInfo.createTime }}</span>
            </div>
            <div class="as-row">
              <span class="as-row-label">{{
                isRefundOnly ? "退款原因" : "退货退款原因"
              }}</span>
              <span class="as-row-value">{{ afterSaleInfo.reason }}</span>
            </div>
            <div class="as-row">
              <span class="as-row-label">问题描述</span>
              <span class="as-row-value">{{
                afterSaleInfo.problemDesc || "暂无"
              }}</span>
            </div>
            <div class="as-row">
              <span class="as-row-label">凭证</span>
              <span class="as-row-value" v-if="afterSaleImage == ''"
                >暂无凭证</span
              >
              <span class="as-row-value as-voucher" v-else>
                <img
                  v-for="(item, index) in afterSaleImage"
                  :key="index"
                  alt="售后凭证"
                  class="as-voucher-img"
                  :src="item"
                />
              </span>
            </div>
          </div>
        </el-card>

        <!-- 退款信息 -->
        <el-card shadow="never">
          <div class="as-sec-title">退款信息</div>
          <div class="as-rows">
            <div class="as-row">
              <span class="as-row-label">退款方式</span>
              <span class="as-row-value">{{ refundWayText }}</span>
            </div>
            <div class="as-row" v-if="accountTypeText">
              <span class="as-row-label">退回账户</span>
              <span class="as-row-value">{{ accountTypeText }}</span>
            </div>
            <div class="as-row" v-if="afterSaleInfo.refundPoint">
              <span class="as-row-label">退还积分</span>
              <span class="as-row-value">{{ afterSaleInfo.refundPoint }}</span>
            </div>
            <div class="as-row" v-if="afterSaleInfo.refundTime">
              <span class="as-row-label">退款时间</span>
              <span class="as-row-value">{{ afterSaleInfo.refundTime }}</span>
            </div>
          </div>
        </el-card>

        <!-- 待审核：处理意见表单 -->
        <el-card
          shadow="never"
          class="as-handle-card"
          v-if="afterSaleInfo.serviceStatus == 'APPLY'"
        >
          <div class="as-sec-title">处理意见</div>
          <div class="as-rows">
            <div class="as-row">
              <span class="as-row-label">商家</span>
              <span class="as-row-value">{{ afterSaleInfo.storeName }}</span>
            </div>
            <div class="as-row">
              <span class="as-row-label">是否同意</span>
              <span class="as-row-value">
                <el-radio-group v-model="params.serviceStatus">
                  <el-radio-button value="PASS">同意</el-radio-button>
                  <el-radio-button value="REFUSE">拒绝</el-radio-button>
                </el-radio-group>
              </span>
            </div>
            <div class="as-row">
              <span class="as-row-label">申请退款金额</span>
              <span class="as-row-value as-money"
                >¥{{ fmtPrice(afterSaleInfo.applyRefundPrice) }}</span
              >
            </div>
            <div class="as-row" v-if="params.serviceStatus === 'PASS'">
              <span class="as-row-label">实际退款金额</span>
              <span class="as-row-value">
                <el-input-number
                  :min="0"
                  v-model="params.actualRefundPrice"
                  style="width: 260px"
                />
              </span>
            </div>
            <div class="as-row">
              <span class="as-row-label">备注信息</span>
              <span class="as-row-value">
                <el-input
                  v-model="params.remark"
                  type="textarea"
                  maxlength="200"
                  :rows="4"
                  clearable
                  style="width: 320px"
                />
              </span>
            </div>
            <div class="as-row">
              <span class="as-row-label"></span>
              <span class="as-row-value">
                <el-button
                  type="primary"
                  :loading="submitLoading"
                  @click="handleSubmit"
                >
                  确定
                </el-button>
              </span>
            </div>
          </div>
        </el-card>

        <!-- 已处理：商家处理结果 -->
        <el-card shadow="never" v-if="afterSaleInfo.serviceStatus != 'APPLY'">
          <div class="as-sec-title">商家处理</div>
          <div class="as-rows">
            <div class="as-row">
              <span class="as-row-label">商家</span>
              <span class="as-row-value">{{ afterSaleInfo.storeName }}</span>
            </div>
            <div class="as-row">
              <span class="as-row-label">备注信息</span>
              <span class="as-row-value">{{
                afterSaleInfo.auditRemark || "暂无备注信息"
              }}</span>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧辅栏 -->
      <div class="as-side">
        <el-card shadow="never">
          <div class="as-sec-title">售后进度</div>
          <ul class="as-timeline">
            <li
              v-for="(step, index) in timelineSteps"
              :key="index"
              :class="step.state"
            >
              <span class="as-tl-dot"></span>
              <div class="as-tl-content">
                <div class="as-tl-name">{{ step.name }}</div>
                <div class="as-tl-time" v-if="step.time">{{ step.time }}</div>
              </div>
            </li>
          </ul>
        </el-card>

        <el-card shadow="never">
          <div class="as-sec-title">订单相关信息</div>
          <div class="as-rows">
            <div class="as-row">
              <span class="as-row-label">订单编号</span>
              <span class="as-row-value">
                <a class="as-link" @click="goOrderDetail">{{
                  afterSaleInfo.orderSn
                }}</a>
              </span>
            </div>
            <div class="as-row" v-if="afterSaleInfo.tradeSn">
              <span class="as-row-label">交易编号</span>
              <span class="as-row-value">{{ afterSaleInfo.tradeSn }}</span>
            </div>
            <div class="as-row" v-if="afterSaleInfo.bankDepositName">
              <span class="as-row-label">银行开户行</span>
              <span class="as-row-value">{{
                afterSaleInfo.bankDepositName
              }}</span>
            </div>
            <div class="as-row" v-if="afterSaleInfo.bankAccountName">
              <span class="as-row-label">银行开户名</span>
              <span class="as-row-value">{{
                afterSaleInfo.bankAccountName
              }}</span>
            </div>
            <div class="as-row" v-if="afterSaleInfo.bankAccountNumber">
              <span class="as-row-label">银行卡号</span>
              <span class="as-row-value">{{
                afterSaleInfo.bankAccountNumber
              }}</span>
            </div>
          </div>
        </el-card>

        <el-card
          shadow="never"
          v-if="
            afterSaleInfo.afterSaleAllowOperationVO &&
            afterSaleInfo.afterSaleAllowOperationVO.refund
          "
        >
          <div class="as-sec-title">平台退款</div>
          <div class="as-rows">
            <div class="as-row">
              <span class="as-row-label">银行开户行</span>
              <span class="as-row-value">{{
                afterSaleInfo.bankDepositName
              }}</span>
            </div>
            <div class="as-row">
              <span class="as-row-label">银行开户名</span>
              <span class="as-row-value">{{
                afterSaleInfo.bankAccountName
              }}</span>
            </div>
            <div class="as-row">
              <span class="as-row-label">银行卡号</span>
              <span class="as-row-value">{{
                afterSaleInfo.bankAccountNumber
              }}</span>
            </div>
            <div class="as-row">
              <span class="as-row-label">备注信息</span>
              <span class="as-row-value">
                <el-input
                  v-model="refundPriceForm.remark"
                  type="textarea"
                  maxlength="200"
                  :rows="3"
                  clearable
                  style="width: 260px"
                />
              </span>
            </div>
            <div class="as-row">
              <span class="as-row-label"></span>
              <span class="as-row-value">
                <el-button
                  type="primary"
                  :loading="submitLoading"
                  @click="refundPriceSubmit"
                >
                  退款
                </el-button>
              </span>
            </div>
          </div>
        </el-card>

        <el-card
          shadow="never"
          v-if="
            afterSaleInfo.showDelivery &&
            afterSaleInfo.serviceType === 'RETURN_GOODS'
          "
        >
          <div class="as-sec-title">物流信息</div>
          <div class="as-rows">
            <div class="as-row">
              <span class="as-row-label">收货商家</span>
              <span class="as-row-value">{{ afterSaleInfo.storeName }}</span>
            </div>
            <div class="as-row">
              <span class="as-row-label">商家手机</span>
              <span class="as-row-value">{{
                storeMsg.salesConsigneeMobile
              }}</span>
            </div>
            <div class="as-row">
              <span class="as-row-label">收货地址</span>
              <span class="as-row-value">
                {{ storeMsg.salesConsigneeAddressPath }}
                {{ storeMsg.salesConsigneeDetail }}
              </span>
            </div>
            <div class="as-row">
              <span class="as-row-label">物流公司</span>
              <span class="as-row-value">{{ buyerLogisticsName }}</span>
            </div>
            <div class="as-row">
              <span class="as-row-label">物流单号</span>
              <span class="as-row-value">{{ buyerLogisticsNo }}</span>
            </div>
            <div class="as-row">
              <span class="as-row-label"></span>
              <span class="as-row-value">
                <el-button
                  v-if="canConfirmReceipt"
                  type="primary"
                  :loading="confirmLoading"
                  @click="sellerConfirmSubmit('PASS')"
                >
                  确认收货
                </el-button>
                <el-button
                  v-if="canConfirmReceipt"
                  type="danger"
                  :loading="confirmLoading"
                  @click="sellerConfirmSubmit('REFUSE')"
                >
                  拒收
                </el-button>
                <el-button :loading="submitLoading" @click="logisticsSeller()">
                  查询物流
                </el-button>
              </span>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 查询物流 -->
    <el-dialog v-model="logisticsModal" title="查询物流" width="640px" append-to-body>
      <div class="layui-layer-wrap">
        <dl>
          <dt>售后单号：</dt>
          <dd>
            <div class="text-box">{{ sn }}</div>
          </dd>
        </dl>
        <dl>
          <dt>物流公司：</dt>
          <dd>
            <div class="text-box">{{ buyerLogisticsName }}</div>
          </dd>
        </dl>
        <dl>
          <dt>物流单号：</dt>
          <dd>
            <div class="text-box">{{ buyerLogisticsNo }}</div>
          </dd>
        </dl>
        <div class="div-express-log">
          <ul class="express-log">
            <template v-if="Object.keys(logisticsInfo).length">
              <li v-for="(item, index) in logisticsInfo.traces" :key="index">
                <span class="time">{{ item.AcceptTime }}</span>
                <span class="detail">{{ item.AcceptStation }}</span>
              </li>
            </template>
            <template v-else>
              <li style="text-align: center">暂无物流信息</li>
            </template>
          </ul>
        </div>
      </div>
      <template #footer>
        <el-button @click="logisticsClose">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as API_Order from "@/api/order";
import { Message, Modal } from "@/utils/message";

defineOptions({ name: "returnGoodsOrderDetail" });

const route = useRoute();
const router = useRouter();

const sn = ref(""); // 订单号
const logisticsModal = ref(false); //查询物流模态框

const logisticsInfo = ref({}); //物流信息
const afterSaleInfo = ref({}); // 售后信息
const afterSaleImage = ref([]); //会员申诉图片
const submitLoading = ref(false); // 添加或编辑提交状态
const confirmLoading = ref(false); // 确认收货提交状态
const storeMsg = ref({}); // 商家地址信息
//商家处理意见
const params = reactive({
  serviceStatus: "PASS",
  remark: "",
});
//平台退款
const refundPriceForm = reactive({
  remark: "",
});
const afterSaleRefundStatusList = ref([
  {
    name: "退款申请",
    status: "APPLY",
  },
  {
    name: "通过售后",
    status: "PASS",
  },
  {
    name: "拒绝售后",
    status: "REFUSE",
  },
  {
    name: "卖家终止售后",
    status: "SELLER_TERMINATION",
  },
  {
    name: "买家取消售后",
    status: "BUYER_CANCEL",
  },
  {
    name: "完成售后",
    status: "COMPLETE",
  },
  {
    name: "待平台退款",
    status: "WAIT_REFUND",
  },
]);
const afterSaleStatusList = ref([
  // 售后状态列表
  {
    name: "申请中",
    status: "APPLY",
  },
  {
    name: "通过售后",
    status: "PASS",
  },
  {
    name: "拒绝售后",
    status: "REFUSE",
  },
  {
    name: "买家退货，待卖家收货",
    status: "BUYER_RETURN",
  },
  {
    name: "卖家确认收货",
    status: "SELLER_CONFIRM",
  },
  {
    name: "卖家终止售后",
    status: "SELLER_TERMINATION",
  },
  {
    name: "买家取消售后",
    status: "BUYER_CANCEL",
  },
  {
    name: "完成售后",
    status: "COMPLETE",
  },
  {
    name: "待平台退款",
    status: "WAIT_REFUND",
  },
]);

const isRefundOnly = computed(() => {
  return afterSaleInfo.value.serviceType === "RETURN_MONEY";
});
const sectionTitle = computed(() => {
  return isRefundOnly.value ? "退款申请" : "退货申请";
});
const buyerLogisticsName = computed(() => {
  const info = afterSaleInfo.value;
  return (
    info.mLogisticsName ||
    info.mlogisticsName ||
    logisticsInfo.value.shipper ||
    "-"
  );
});
const buyerLogisticsNo = computed(() => {
  const info = afterSaleInfo.value;
  return (
    info.mLogisticsNo ||
    info.mlogisticsNo ||
    logisticsInfo.value.logisticCode ||
    "-"
  );
});
const canConfirmReceipt = computed(() => {
  const vo = afterSaleInfo.value.afterSaleAllowOperationVO;
  if (vo && vo.rog) return true;
  return afterSaleInfo.value.serviceStatus === "BUYER_RETURN";
});

// 摘要条状态颜色
const statusClass = computed(() => {
  const s = afterSaleInfo.value.serviceStatus;
  if (s === "COMPLETE") return "is-success";
  if (["REFUSE", "SELLER_TERMINATION", "BUYER_CANCEL"].includes(s))
    return "is-danger";
  if (s === "APPLY") return "is-warning";
  return "is-primary";
});

// 售后进度时间线（仅有 createTime / mDeliverTime / refundTime 三个时间戳可用，
// 其余节点只展示状态，不展示时间）
const timelineSteps = computed(() => {
  const info = afterSaleInfo.value;
  if (!info.serviceStatus) return [];
  const abnormalNames = {
    REFUSE: "商家拒绝",
    BUYER_CANCEL: "买家取消售后",
    SELLER_TERMINATION: "商家终止售后",
  };
  const s = info.serviceStatus;
  if (abnormalNames[s]) {
    return [
      { name: "提交申请", state: "done", time: info.createTime },
      { name: abnormalNames[s], state: "abnormal" },
    ];
  }
  const steps = isRefundOnly.value
    ? [
        { name: "提交申请", time: info.createTime },
        { name: "商家审核" },
        { name: "退款完成", time: info.refundTime },
      ]
    : [
        { name: "提交申请", time: info.createTime },
        { name: "商家审核" },
        { name: "买家退货", time: info.mDeliverTime },
        { name: "商家收货" },
        { name: "退款完成", time: info.refundTime },
      ];
  const activeIdx = isRefundOnly.value
    ? { APPLY: 0, PASS: 1, WAIT_REFUND: 1, COMPLETE: 2 }[s]
    : {
        APPLY: 0,
        PASS: 1,
        BUYER_RETURN: 2,
        SELLER_CONFIRM: 3,
        WAIT_REFUND: 3,
        COMPLETE: 4,
      }[s];
  if (activeIdx === undefined) return [];
  const lastIdx = steps.length - 1;
  return steps.map((step, i) => ({
    ...step,
    state:
      i < activeIdx || activeIdx === lastIdx && s === "COMPLETE"
        ? "done"
        : i === activeIdx
        ? "active"
        : "todo",
  }));
});

function fmtPrice(v) {
  return v === null || v === undefined || v === "" ? "0.00" : Number(v).toFixed(2);
}

// 商品规格（后端存的是 JSON 字符串，兼容解析失败时原样展示）
const specsText = computed(() => {
  const s = afterSaleInfo.value.specs;
  if (!s) return "";
  try {
    const arr = JSON.parse(s);
    if (Array.isArray(arr)) {
      const text = arr
        .filter((it) => (it.name || it.key) && it.value)
        .map((it) => `${it.name || it.key}: ${it.value}`)
        .join("，");
      return text || "";
    }
    return "";
  } catch (e) {
    // 非 JSON 时原样展示
    return s;
  }
});

const refundWayText = computed(() => {
  const map = { ORIGINAL: "原路退回", OFFLINE: "线下退款" };
  return map[afterSaleInfo.value.refundWay] || afterSaleInfo.value.refundWay || "-";
});

const accountTypeText = computed(() => {
  const map = {
    ALIPAY: "支付宝",
    WECHATPAY: "微信支付",
    MEMBERWALLET: "余额",
    BANKTRANSFER: "银行卡",
  };
  return map[afterSaleInfo.value.accountType] || "";
});

function goOrderDetail() {
  router.push({ path: "/order-detail", query: { sn: afterSaleInfo.value.orderSn } });
}

async function copySn() {
  try {
    await navigator.clipboard.writeText(afterSaleInfo.value.sn || "");
    Message.success("已复制");
  } catch (e) {
    Message.error("复制失败");
  }
}

// 获取售后详情
function getDetail() {
  API_Order.getAfterSaleOrderDetail(sn.value).then((res) => {
    if (res.success) {
      afterSaleInfo.value = res.result;
      afterSaleInfo.value.showDelivery = showDelivery(
        afterSaleInfo.value.serviceStatus
      );
      afterSaleInfo.value.serviceName = filterOrderStatus(
        afterSaleInfo.value.serviceStatus
      );
      afterSaleImage.value = (res.result.afterSaleImage || "").split(",");
      //退货地址去掉逗号
      if (afterSaleInfo.value.mconsigneeAddressPath)
        afterSaleInfo.value.mconsigneeAddressPath = afterSaleInfo.value.mconsigneeAddressPath.replaceAll(
          ",",
          " "
        );

      params.actualRefundPrice = afterSaleInfo.value.applyRefundPrice;
      // 如果显示物流信息，展示商家地址
      if (afterSaleInfo.value.showDelivery) {
        API_Order.storeAddress(sn.value).then((resu) => {
          if (resu.success) {
            const obj = resu.result;
            obj.salesConsigneeAddressPath = obj.salesConsigneeAddressPath.replaceAll(
              ",",
              ""
            );
            storeMsg.value = obj;
          }
        });
      }
    }
  });
}
//平台退款
function refundPriceSubmit() {
  if (refundPriceForm.remark == "") {
    Message.error("请输入退款备注");
    return;
  }
  Modal.confirm({
    title: "确认退款",
    content: "请确认退款？",
    loading: true,
    onOk: () => {
      API_Order.refundPrice(sn.value, refundPriceForm).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("收款成功");
          getDetail();
        }
      });
    },
  });
}
//查询物流
function logisticsSeller() {
  logisticsModal.value = true;
  logisticsInfo.value = {};
  API_Order.getAfterSaleTraces(sn.value).then((res) => {
    if (res.success && res.result != null) {
      logisticsInfo.value = res.result;
    }
  });
}
// 商家确认收货 / 拒收
function sellerConfirmSubmit(type) {
  const isPass = type === "PASS";
  Modal.confirm({
    title: isPass ? "确认收货" : "确认拒收",
    content: isPass ? "请确认已经收到退货货物？" : "确认拒收此货物？",
    loading: true,
    onOk: () => {
      confirmLoading.value = true;
      API_Order.afterSaleSellerConfirm(sn.value, {
        serviceStatus: type,
        remark: params.remark || "",
      }).then((res) => {
        Modal.remove();
        confirmLoading.value = false;
        if (res.success) {
          Message.success(isPass ? "收货成功" : "拒收成功");
          getDetail();
        }
      }).catch(() => {
        Modal.remove();
        confirmLoading.value = false;
      });
    },
  });
}
//关闭物流弹出框
function logisticsClose() {
  logisticsModal.value = false;
}
//回复
function handleSubmit() {
  if (params.remark == "") {
    Message.error("请输入备注信息");
    return;
  }
  if (params.serviceStatus === "PASS" && params.actualRefundPrice === "") {
    Message.error("请输入退款金额");
    return;
  }
  API_Order.afterSaleSellerReview(sn.value, params).then((res) => {
    submitLoading.value = false;
    if (res.success) {
      Message.success("审核成功");
      params.remark = "";
      getDetail();
    }
  });
}
function filterOrderStatus(status) {
  const list =
    afterSaleInfo.value.serviceType === "RETURN_MONEY"
      ? afterSaleRefundStatusList.value
      : afterSaleStatusList.value;
  const ob = list.filter((e) => e.status === status);
  return ob.length > 0 ? ob[0].name : status;
}
// 根据订单状态判断是否显示物流信息
function showDelivery(status) {
  let flag = false;
  afterSaleStatusList.value.forEach((e, index) => {
    // 订单为买家退货，待卖家收货之后的状态，并且不是买家取消售后，展示物流信息
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
<style lang="scss">
.after-sale-detail {
  .el-card {
    border: none;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }

  // 顶部摘要条
  .as-summary {
    margin-bottom: 12px;
  }

  .as-summary .el-card__body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }

  .as-summary-main {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .as-status {
    font-size: 18px;
    font-weight: 700;

    &.is-success {
      color: #529b2e;
    }

    &.is-danger {
      color: #f56c6c;
    }

    &.is-warning {
      color: #d48806;
    }

    &.is-primary {
      color: var(--el-color-primary);
    }
  }

  .as-sn {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: 13px;

    .as-sn-label {
      color: #909399;
    }

    .as-sn-value {
      color: #303133;
      font-weight: 500;
    }

    .as-copy {
      color: var(--el-color-primary);
      font-size: 12px;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .as-type {
    font-size: 12px;
    color: #909399;
  }

  .as-amounts {
    display: flex;
    gap: 32px;
  }

  .as-amount {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    .as-amount-label {
      font-size: 12px;
      color: #909399;
    }

    .as-amount-value {
      font-size: 16px;
      font-weight: 600;
      color: #f56c6c;

      &.strong {
        font-size: 20px;
        font-weight: 700;
      }
    }
  }

  // 左右分栏
  .as-body {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .as-main {
    flex: 1;
    min-width: 0;

    .el-card + .el-card {
      margin-top: 12px;
    }
  }

  .as-side {
    flex: 0 0 320px;

    .el-card + .el-card {
      margin-top: 12px;
    }
  }

  // 分组标题
  .as-sec-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    &::before {
      content: "";
      display: inline-block;
      width: 3px;
      height: 13px;
      border-radius: 2px;
      background: var(--el-color-primary);
      margin-right: 6px;
    }
  }

  // 商品
  .as-goods {
    display: flex;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 4px;

    .as-goods-img {
      width: 56px;
      height: 56px;
      border-radius: 6px;
      border: 1px solid #f0f0f0;
      margin-right: 12px;
      object-fit: cover;
    }

    .as-goods-name {
      color: var(--el-color-primary);
      cursor: pointer;
      font-size: 13px;
      line-height: 1.5;
    }

    .as-goods-num {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }
  }

  // 通用行
  .as-row {
    display: flex;
    padding: 8px 0;
    font-size: 13px;
    line-height: 1.6;

    .as-row-label {
      flex: 0 0 84px;
      text-align: right;
      color: #909399;
      margin-right: 12px;
    }

    .as-row-value {
      flex: 1;
      color: #303133;
      word-break: break-all;
    }

    .as-money {
      color: #f56c6c;
      font-weight: 600;
    }

    .as-link {
      color: var(--el-color-primary);
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .as-voucher {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .as-voucher-img {
      width: 80px;
      height: 80px;
      border-radius: 6px;
      border: 1px solid #f0f0f0;
      object-fit: cover;
    }
  }

  // 待审核表单卡片淡底色
  .as-handle-card {
    background: #fbfcff;
  }

  // 售后进度时间线
  .as-timeline {
    list-style: none;
    margin: 0;
    padding: 0;

    li {
      position: relative;
      padding: 0 0 18px 20px;

      &::before {
        content: "";
        position: absolute;
        left: 4px;
        top: 14px;
        bottom: -2px;
        width: 1px;
        background: #e4e7ed;
      }

      &:last-child::before {
        display: none;
      }

      .as-tl-dot {
        position: absolute;
        left: 0;
        top: 4px;
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: #c0c4cc;
      }

      .as-tl-name {
        font-size: 13px;
        color: #909399;
      }

      .as-tl-time {
        font-size: 12px;
        color: #c0c4cc;
        margin-top: 2px;
      }

      &.done {
        .as-tl-dot {
          background: #67c23a;
        }

        .as-tl-name {
          color: #303133;
        }
      }

      &.active {
        .as-tl-dot {
          background: var(--el-color-primary);
          box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.18);
        }

        .as-tl-name {
          color: var(--el-color-primary);
          font-weight: 600;
        }
      }

      &.abnormal {
        .as-tl-dot {
          background: #f56c6c;
        }

        .as-tl-name {
          color: #f56c6c;
          font-weight: 600;
        }
      }
    }
  }
}

// 查询物流弹窗样式
.div-express-log {
  max-height: 300px;
  border: solid 1px #e7e7e7;
  background: #fafafa;
  overflow-y: auto;
  overflow-x: auto;
}

.express-log {
  margin: 5px;
  padding: 10px;
  list-style-type: none;

  .time {
    width: 30%;
    display: inline-block;
    float: left;
  }

  .detail {
    width: 60%;
    margin-left: 30px;
    display: inline-block;
  }

  li {
    line-height: 30px;
  }
}

.layui-layer-wrap {
  dl {
    border-top: solid 1px #f5f5f5;
    margin-top: -1px;
    overflow: hidden;
    display: flex;

    dt {
      font-size: 14px;
      line-height: 28px;
      padding: 8px 1% 8px 0;
      color: #999;
      width: 100px;
      text-align: right;
    }

    dd {
      font-size: 14px;
      line-height: 28px;
      padding: 8px 0 8px 8px;
      border-left: solid 1px #f5f5f5;
      margin: 0;
      flex: 1;

      .text-box {
        line-height: 40px;
        color: #333;
        word-break: break-all;
      }
    }
  }
}
</style>
