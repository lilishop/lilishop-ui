<template>
  <div class="order-detail" v-if="order.order">
    <UserCenterLayout>
    <div class="order-card status-card">
      <div class="status-head">
        <div class="status-main">
          <p class="status-text">{{ order.orderStatusValue }}</p>
          <p class="status-sn">订单号：{{ order.order.sn }}</p>
        </div>
        <div class="status-side">
          <div class="operation-time">
            操作时间：{{ order.order.updateTime || order.order.createTime }}
          </div>
          <div
            class="status-actions"
            v-if="
              order.allowOperationVO.pay ||
              order.allowOperationVO.rog ||
              order.allowOperationVO.cancel ||
              order.allowOperationVO.showLogistics ||
              orderPackage.length > 0 ||
              logistics
            "
          >
            <el-button
              type="success"
              @click="goPay(order.order.sn)"
              size="small"
              v-if="order.allowOperationVO.pay"
              >去支付</el-button>
            <el-button
              type="primary"
              @click="received(order.order.sn)"
              size="small"
              v-if="order.allowOperationVO.rog"
              >确认收货</el-button>
            <el-button
              type="danger"
              @click="handleCancelOrder(order.order.sn)"
              v-if="order.allowOperationVO.cancel"
              size="small"
              >取消订单</el-button>
            <el-button v-if="order.allowOperationVO.showLogistics || orderPackage.length > 0 || logistics" type="info" @click="logisticsList()" size="small">查看物流</el-button>
          </div>
        </div>
      </div>
      <el-steps
        v-if="progressList.length"
        class="progress"
        :active="progressList.length - 1"
        direction="vertical"
      >
        <el-step
          :title="progress.message"
          :description="progress.createTime"
          v-for="(progress, index) in progressList"
          :key="index"
        ></el-step>
      </el-steps>
    </div>
    <p class="verificationCode" v-if="order.order.verificationCode && !isECouponOrder">
      核验码：<span>{{ order.order.verificationCode }}</span>
    </p>
    <div class="order-card" v-if="order.order.deliveryMethod === 'LOGISTICS' && !isNonPhysicalOrder">
      <h3>收货人信息</h3>
      <p>收货人：{{ order.order.consigneeName }}</p>
      <p>手机号码：{{ $filters.secrecyMobile( order.order.consigneeMobile ) }}</p>
      <p>
        收货地址：{{ $filters.unitAddress(order.order.consigneeAddressPath) }}
        {{ order.order.consigneeDetail }}
      </p>
    </div>
    <div class="order-card" v-if="order.order.deliveryMethod === 'SELF_PICK_UP'">
      <h3>自提点信息</h3>
      <p>自提点名称：{{ order.order.storeAddressPath }}</p>
      <p>联系方式：{{ order.order.storeAddressMobile }}</p>
    </div>
    <div class="order-card">
      <h3>付款信息</h3>
      <p>支付方式：{{ order.paymentMethodValue }}</p>
      <p>付款状态：{{ order.payStatusValue }}</p>
    </div>
    <div class="order-card" v-if="!order.order.verificationCode && !isNonPhysicalOrder">
      <h3>配送信息</h3>
      <p>配送方式：{{ displayDeliveryMethodValue }}</p>
      <p v-if="order.order.deliveryMethod === 'LOGISTICS' && !isNoDeliveryOrder">配送状态：{{ order.deliverStatusValue }}</p>
      <template v-if="isNoDeliveryOrder">
        <p v-if="noDeliveryShipTime">发货时间：{{ noDeliveryShipTime }}</p>
        <p v-if="noDeliveryRemark">配送说明：{{ noDeliveryRemark }}</p>
      </template>
      <template v-else>
        <p v-if="logistics">
          物流信息：{{ logistics.shipper || "暂无物流信息" }}
        </p>
        <p v-if="logistics">
          物流单号：{{ logistics.logisticCode || "暂无物流单号" }}
        </p>
        <div class="div-express-log" v-if="logistics">
          <div class="express-log">
            <p>订单日志：</p>
            <div v-for="(item, index) in logistics.traces" :key="index">
              <span class="time">{{ item.AcceptTime }}</span>
              <span class="detail">{{ item.AcceptStation }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
    <div class="order-card" v-if="order.order.payStatus === 'PAID'">
      <h3>发票信息</h3>
      <!-- 以 li_receipt 为准：needReceipt 可能为 null/false 导致有 receipt 仍显示「未开发票」 -->
      <template v-if="hasValidReceipt()">
        <p>发票类型：{{ formatReceiptType(order.receipt) }}</p>
        <p>发票抬头：{{ formatReceiptHeaderType(order.receipt) }}</p>
        <p v-if="isPersonalReceipt(order.receipt) && order.receipt.personalName">
          个人名称：{{ order.receipt.personalName }}
        </p>
        <p v-if="order.receipt.companyName">
          单位名称：{{ order.receipt.companyName }}
        </p>
        <p v-if="order.receipt.taxpayerId">
          纳税人识别号：{{ order.receipt.taxpayerId }}
        </p>
        <p v-if="order.receipt.companyAddress">
          单位地址：{{ order.receipt.companyAddress }}
        </p>
        <p v-if="order.receipt.companyPhone">
          单位电话：{{ order.receipt.companyPhone }}
        </p>
        <p v-if="order.receipt.bankName">
          开户银行：{{ order.receipt.bankName }}
        </p>
        <p v-if="order.receipt.bankAccount">
          银行账号：{{ order.receipt.bankAccount }}
        </p>
        <p>发票内容：{{ order.receipt.receiptContent }}</p>
        <p v-if="order.receipt.receiptPhone">
          收票人手机：{{ order.receipt.receiptPhone }}
        </p>
        <p v-if="order.receipt.receiptEmail">
          收票人邮箱：{{ order.receipt.receiptEmail }}
        </p>
        <div v-if="Number(order.receipt.receiptStatus) === 1" class="receipt-action">
          <el-button size="small" type="primary" ghost @click="viewReceiptInvoice(order.receipt)">
            查看发票
          </el-button>
        </div>
      </template>
      <div v-else style="color: #999; margin-left: 5px">未开发票</div>
    </div>
    <!-- 卡密信息（当前订单 orderItems；满赠赠品卡密在赠品子单详情查看） -->
    <div class="order-card ecoupon-card-keys" v-if="hasCardKeySection">
      <h3>卡密信息</h3>
      <div
        v-for="line in cardKeyFulfillLines"
        :key="line.key"
        class="ecoupon-fulfill-block"
      >
        <el-alert
          v-if="line.status !== 'DELIVERED'"
          :type="cardKeyFulfillAlertType(line.status)"
          show-icon
          :closable="false"
          :title="resolveCardKeyFulfillMessage(line)"
          class="mb_10"
        />
        <template v-else-if="line.cardKeys.length">
          <div class="ecoupon-card-keys-mobile">
            <el-button type="primary" @click="cardKeyDialogVisible = true">查看卡密</el-button>
          </div>
          <div class="ecoupon-card-keys-pc">
            <el-table border :data="lineCardKeyRows(line)" style="width: 100%">
              <el-table-column type="index" label="序号" width="60" align="center" />
              <el-table-column prop="cardNo" label="卡号" min-width="140" show-overflow-tooltip />
              <el-table-column prop="cardSecret" label="卡密" min-width="120" show-overflow-tooltip />
              <el-table-column prop="allocatedTime" label="发卡时间" width="170" />
              <el-table-column label="操作" width="120" align="center">
                <template #default="{ row }">
                  <el-button v-if="row" link type="primary" @click="copyCardKey(row)">复制</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </div>
      <el-button
        v-if="ecouponCardKeyRows.length"
        class="mt_10 ecoupon-card-keys-pc"
        size="small"
        @click="copyAllCardKeys"
      >
        复制全部卡密
      </el-button>
    </div>

    <!-- 订单商品 -->
    <div class="goods">
      <div class="shop-name">
        <span @click="shopPage(order.order.storeId)">{{order.order.storeName}}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th width="28%">商品</th>
            <th width="16%">货号</th>
            <th width="10%">单价</th>
            <th width="8%">数量</th>
            <th width="10%">小计</th>
            <th width="8%">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(goods, goodsIndex) in order.orderItems" :key="goodsIndex">
            <td>
              <div class="goods-cell">
                <img
                  @click="goodsDetail(goods.skuId, goods.goodsId)"
                  :src="goods.image"
                  loading="lazy"
                  decoding="async"
                  alt=""
                />
                <p
                  @click="goodsDetail(goods.skuId, goods.goodsId)"
                  class="hover-color goods-name"
                >
                  {{ goods.goodsName }}
                </p>
              </div>
            </td>
            <td>{{ goods.id }}</td>
            <td>{{ $filters.unitPrice(goods.goodsPrice, "￥") }}</td>
            <td>{{ goods.num }}</td>
            <td>{{ $filters.unitPrice((goods.goodsPrice * goods.num), "￥") }}</td>
            <td class="order-item-actions">
              <button
                v-if="goods.commentStatus == 'UNFINISHED'"
                type="button"
                class="comment-text"
                @click="comment(order.order.sn, goodsIndex)"
              >评价</button>
              <el-button
                v-if="goods.complainStatus == 'NO_APPLY'"
                @click="complain(order.order.sn, goodsIndex)"
                type="danger"
                class="order-item-action-btn mb_5"
                size="small"
                >投诉</el-button
              >
              <el-button
                v-if="
                  !isECouponOrder &&
                  (goods.afterSaleStatus.includes('NOT_APPLIED') ||
                    goods.afterSaleStatus.includes('PART_AFTER_SALE'))
                "
                @click="applyAfterSale(goods.sn)"
                type="default"
                size="small"
                class="order-item-action-btn mb_5"
                >申请售后</el-button
              >
            </td>
          </tr>
        </tbody>
      </table>
      <!-- 订单价格 -->
      <div class="order-price">
        <div>
          <span>商品件数：</span><span>{{ order.order.goodsNum }}件</span>
        </div>
        <div>
          <span>商品总价：</span><span>{{ $filters.unitPrice(order.order.goodsPrice, "￥") }}</span><br />
        </div>
        <div v-if="!isECouponOrder">
          <span>运费：</span><span>+{{ $filters.unitPrice(order.order.freightPrice, "￥") }}</span><br />
        </div>
        <div v-if="order.order.priceDetailDTO.couponPrice">
          <span>优惠券：</span><span
            >-{{ $filters.unitPrice(order.order.priceDetailDTO.couponPrice || 0, "￥") }}</span>
        </div>
        <div v-if="order.order.priceDetailDTO.giftCardPrice">
          <span>礼品卡抵扣：</span><span
            >-{{ $filters.unitPrice(order.order.priceDetailDTO.giftCardPrice || 0, "￥") }}</span>
        </div>
        <div v-if="order.order.discountPrice">
          <span>活动优惠：</span><span>-{{ $filters.unitPrice(order.order.discountPrice, "￥") }}</span>
        </div>
        <div v-if="order.order.priceDetailDTO.updatePrice">
          <span>修改价格：</span><span>{{ $filters.unitPrice(order.order.priceDetailDTO.updatePrice, "￥") }}</span>
        </div>
        <div>
          <span>应付金额：</span>
          <span class="actrual-price">{{ $filters.unitPrice(order.order.flowPrice, "￥") }}</span>
        </div>
      </div>
    </div>
    <el-dialog
      v-model="cancelAvail"
      title="请选择取消订单原因"
    >
      <el-radio-group
        v-model="cancelParams.reason"
      >
        <el-radio :label="item.reason" v-for="item in cancelReason" :key="item.id">
          {{ item.reason }}
        </el-radio>
      </el-radio-group>
      <template #footer>
        <div style="text-align: right">
          <el-button @click="cancelAvail = false">取消</el-button>
          <el-button type="primary" @click="sureCancel">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!--查询物流-->
    <el-dialog v-model="logisticsModal" width="40%">
      <template #header><p><span>查询物流</span></p></template>
      <div class="layui-layer-wrap">
        <dl>
          <dt>订单号：</dt>
          <dd><div class="text-box">{{ order.order.sn }}</div></dd>
        </dl>
      </div>
      <template v-if="orderPackage.length > 0">
      <div v-for="(packageItem, packageIndex) in orderPackage" :key="packageIndex">
        <div class="layui-layer-wrap">
          <dl><dt>发货方式：</dt>
            <dd><div class="text-box">{{ getFulfillmentModeLabel(packageItem.fulfillmentMode) }}</div></dd>
          </dl>
          <template v-if="isNoDeliveryPackage(packageItem)">
            <dl><dt>配送方式：</dt>
              <dd><div class="text-box">无需配送</div></dd>
            </dl>
            <dl v-if="packageItem.logisticsTime"><dt>发货时间：</dt>
              <dd><div class="text-box">{{ packageItem.logisticsTime }}</div></dd>
            </dl>
            <dl v-if="packageItem.deliveryRemark"><dt>配送说明：</dt>
              <dd><div class="text-box">{{ packageItem.deliveryRemark }}</div></dd>
            </dl>
          </template>
          <template v-else>
          <dl><dt>物流公司：</dt>
            <dd><div class="text-box">{{ packageItem.logisticsName }}</div></dd>
          </dl>
          <dl><dt>快递单号：</dt>
            <dd><div nctype="ordersSn" class="text-box">{{ packageItem.logisticsNo }}</div></dd>
          </dl>
          </template>
          <div class="div-express-log">
            <ul class="express-log express-log-name">
              <li v-for="(item, index) in packageItem.orderPackageItemList" :key="index">
                <span class="time" style="width: 50%;"><span>商品名称：</span><span>{{ item.goodsName }}</span></span>
                <span class="time" style="width: 30%;"><span>发货时间：</span><span>{{ item.logisticsTime }}</span></span>
                <span class="time" style="width: 20%;"><span>发货数量：</span><span>{{ item.deliverNumber }}</span></span>
              </li>
            </ul>
            <div v-if="!isNoDeliveryPackage(packageItem)" class="div-express-log" style="overflow: hidden;">
              <ul class="express-log" v-if="packageItem.traces && packageItem.traces.traces">
                <li v-for="(item, index) in packageItem.traces.traces" :key="index">
                  <span class="time">{{ item.AcceptTime || item.acceptTime }}</span>
                  <span class="detail">{{ item.AcceptStation || item.remark }}</span>
                </li>
              </ul>
              <ul class="express-log" v-else><li>暂无物流信息</li></ul>
            </div>
          </div>
        </div>
      </div>
      </template>
      <div v-if = "orderPackage.length == 0 && logistics">
        <div class="layui-layer-wrap">
          <dl>
            <dt>物流公司：</dt>
            <dd><div class="text-box">{{ logistics.shipper }}</div></dd>
          </dl>
          <dl>
            <dt>快递单号：</dt>
            <dd><div nctype="ordersSn" class="text-box">{{ logistics.logisticCode }}</div></dd>
          </dl>
          <div class="div-express-log">
            <ul class="express-log" v-if="logistics && logistics.traces">
              <li v-for="(item, index) in logistics.traces" :key="index">
                <span class="time">{{ item.AcceptTime }}</span>
                <span class="detail">{{ item.AcceptStation }}</span>
              </li>
            </ul>
            <ul class="express-log" v-else><li>暂无物流信息</li></ul>
          </div>
        </div>
      </div>
      <template #footer><div style="text-align: right">
        <el-button @click="logisticsModal = false">取消</el-button>
      </div></template>
    </el-dialog>

    <!-- 移动端查看卡密 -->
    <el-dialog v-model="cardKeyDialogVisible" title="卡密信息" width="92%" class="card-key-mobile-dialog">
      <div v-for="(row, idx) in ecouponCardKeyRows" :key="idx" class="card-key-mobile-item">
        <p><strong>卡号：</strong>{{ row.cardNo }}</p>
        <p><strong>卡密：</strong>{{ row.cardSecret }}</p>
        <el-button size="small" link type="primary" @click="copyCardKey(row)">复制</el-button>
      </div>
      <template #footer>
        <el-button @click="copyAllCardKeys">复制全部</el-button>
        <el-button type="primary" @click="cardKeyDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    </UserCenterLayout>

  </div>
</template>
<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Message } from "@/utils/message";
import {
  orderDetail,
  getTraces,
  sureReceived,
  cancelOrder,
  getPackage
} from "@/api/order.js";
import { afterSaleReason, receiptDetail } from "@/api/member";
import {
  isECouponOrder as checkECouponOrder,
  collectCardKeyFulfillLines,
  orderHasCardKeySection,
  flattenOrderCardKeys,
  cardKeyFulfillAlertType,
  resolveCardKeyFulfillMessage,
} from "@/constants/goodsType";
import {
  isNoDeliveryPackage,
  isNoDeliveryOrder as checkNoDeliveryOrder,
  getFulfillmentModeLabel,
} from "@/utils/orderFulfill";

/**
 * 订单详情：E_COUPON 展示 orderItems[].cardKeys，屏蔽售后/物流（FR-B-03 / FR-B-04）。
 * 移动端已完成订单用 Dialog 查看卡密（原型 P-09 / D-01）。
 */
defineOptions({ name: "order-detail" });

const route = useRoute();
const router = useRouter();

const order = ref({}); // 订单详情数据
const progressList = ref([]); // 订单流程
const logistics = ref(""); // 物流数据
const cardKeyDialogVisible = ref(false);
const cancelParams = reactive({
  // 取消售后参数
  orderSn: "",
  reason: "",
});
const cancelAvail = ref(false); // 取消订单modal控制
const cancelReason = ref([]); // 取消订单原因
const orderPackage = ref([]);
const packageTraceList = ref([]);
const logisticsModal = ref(false);

/** 电子卡券订单：无物流/核验码，卡密数据来自 API-B-01 orderItems[].cardKeys */
const isECouponOrder = computed(() => checkECouponOrder(order.value?.order?.orderType));
const isVirtualOrder = computed(() => order.value?.order?.orderType === "VIRTUAL");
const isNonPhysicalOrder = computed(() => isVirtualOrder.value || isECouponOrder.value);
/** 是否展示卡密区块（仅当前订单 orderItems） */
const hasCardKeySection = computed(() =>
  orderHasCardKeySection({
    orderItems: order.value.orderItems,
    isECouponOrder: isECouponOrder.value,
  })
);
const cardKeyFulfillLines = computed(() => collectCardKeyFulfillLines(order.value.orderItems));
const ecouponCardKeyRows = computed(() => flattenOrderCardKeys(order.value.orderItems, false));
/** 商家以无需配送方式发货（包裹 fulfillmentMode=NO_DELIVERY） */
const isNoDeliveryOrder = computed(() => checkNoDeliveryOrder(orderPackage.value));
const displayDeliveryMethodValue = computed(() => {
  if (isNoDeliveryOrder.value) return "无需配送";
  return order.value?.deliveryMethodValue || "-";
});
const noDeliveryPackages = computed(() => (orderPackage.value || []).filter(isNoDeliveryPackage));
const noDeliveryRemark = computed(() => {
  const pkg = noDeliveryPackages.value.find((p) => p.deliveryRemark);
  return pkg?.deliveryRemark || "";
});
const noDeliveryShipTime = computed(() => {
  const pkg = noDeliveryPackages.value[0];
  return pkg?.logisticsTime || "";
});

function lineCardKeyRows(line) {
  return line.cardKeys || [];
}

function copyCardKey(row) {
  const text = `卡号：${row.cardNo || ""}\n卡密：${row.cardSecret || ""}`;
  copyText(text);
}

function copyAllCardKeys() {
  const text = ecouponCardKeyRows.value
    .map((row, i) => `${i + 1}. 卡号：${row.cardNo || ""}  卡密：${row.cardSecret || ""}`)
    .join("\n");
  copyText(text || "");
}

function copyText(text) {
  if (!text) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      Message.success("已复制到剪贴板");
    });
  } else {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    Message.success("已复制到剪贴板");
  }
}

function isVatSpecialReceipt(receipt) {
  if (!receipt) return false;
  const rt = receipt.receiptType != null ? String(receipt.receiptType).trim() : "";
  if (rt === "2" || rt === "增值税专用发票" || receipt.invoiceKind === "VAT_SPECIAL") {
    return true;
  }
  return false;
}

function isPersonalReceipt(receipt) {
  return !isVatSpecialReceipt(receipt);
}

function formatReceiptType(receipt) {
  if (!receipt) return "";
  const rt = receipt.receiptType != null ? String(receipt.receiptType).trim() : "";
  if (rt === "电子普通发票" || rt === "增值税专用发票") return rt;
  return isVatSpecialReceipt(receipt) ? "增值税专用发票" : "电子普通发票";
}

function formatReceiptHeaderType(receipt) {
  if (!receipt) return "";
  if (isVatSpecialReceipt(receipt)) return "单位";
  if (receipt.taxpayerId) return "单位";
  return "个人";
}

function hasValidReceipt() {
  const receipt = order.value && order.value.receipt;
  if (!receipt) return false;
  const content = receipt.receiptContent ? String(receipt.receiptContent).trim() : '';
  const title = receipt.receiptTitle ? String(receipt.receiptTitle).trim() : '';
  const taxpayerId = receipt.taxpayerId ? String(receipt.taxpayerId).trim() : '';
  // 后端有时会返回占位 receipt（如 receiptContent=不开发票），这里过滤掉
  if (content === '不开发票') return false;
  return Boolean(content || title || taxpayerId);
}

function getInvoiceAddress(receipt) {
  if (!receipt) return "";
  return receipt.invoiceAddress || receipt.invoiceFileUrl || "";
}

function viewReceiptInvoice(receipt) {
  const invoiceAddress = getInvoiceAddress(receipt);
  if (!invoiceAddress) {
    Message.warning("暂无发票附件");
    return;
  }
  window.open(invoiceAddress, "_blank");
}

function goodsDetail(skuId, goodsId) {
  // 跳转商品详情
  let routeUrl = router.resolve({
    path: "/goodsDetail",
    query: { skuId, goodsId },
  });
  window.open(routeUrl.href, "_blank");
}

// 跳转店铺首页
function shopPage(id) {
  router.push({
    path: "/merchant",
    query: { id: id },
  });
}

async function getDetail() {
  // 获取订单详情
  orderDetail(route.query.sn).then(async (res) => {
    if (res.success) {
      order.value = res.result;
      const receiptId =
        (res.result.order && res.result.order.receiptId) ||
        res.result.receiptId ||
        (res.result.receipt && res.result.receipt.id);
      if (receiptId) {
        const receiptRes = await receiptDetail(receiptId);
        if (receiptRes && receiptRes.success && receiptRes.result) {
          order.value["receipt"] = receiptRes.result;
        }
      }
      progressList.value = (res.result.orderLogs || []).slice().sort((a, b) => {
        return new Date(a.createTime).getTime() - new Date(b.createTime).getTime();
      });
      if (order.value.order.deliveryMethod === 'LOGISTICS') {
        getOrderPackage(order.value.order.sn);
      }
    }
  });
}

function getOrderPackage(sn) {
  getPackage(sn).then(res => {
    if (res.success) {
      orderPackage.value = Array.isArray(res.result) ? res.result : [];
      if (!orderPackage.value.length) {
        traces();
      }
    } else {
      traces();
    }
  }).catch(() => {
    traces();
  });
}

function traces() {
  // 物流信息
  getTraces(route.query.sn).then((res) => {
    if (res.success) {
      logistics.value = res.result;
    }
  });
}

function logisticsList() {
  logisticsModal.value = true;
  packageTraceList.value = orderPackage.value;
  // getTracesList(this.order.order.sn).then((res) => {
  //   if (res.success && res.result != null) {
  //     this.packageTraceList = res.result;
  //   }
  // });
}

function received(sn) {
  // 确认收货
  sureReceived(sn).then((res) => {
    if (res.success) {
      Message.success("确认收货成功");
      getDetail();
    }
  });
}

function goPay(sn) {
  // 去支付
  router.push({
    path: "/payment",
    query: { orderType: "ORDER", sn },
  });
}

function applyAfterSale(sn) {
  // 申请售后
  router.push({ name: "ApplyAfterSale", query: { sn: sn } });
}

function comment(sn, goodsIndex) {
  // 评价
  router.push({
    path: "/home/addEval",
    query: { sn, index: goodsIndex },
  });
}

function complain(sn, goodsIndex) {
  // 投诉
  router.push({ name: "Complain", query: { sn, index: goodsIndex } });
}

function handleCancelOrder(sn) {
  // 取消订单
  cancelParams.orderSn = sn;
  afterSaleReason("CANCEL").then((res) => {
    if (res.success) {
      cancelReason.value = res.result;
      cancelAvail.value = true;
      cancelParams.reason = cancelReason.value[0].reason;
    }
  });
}

function sureCancel() {
  // 确定取消
  cancelOrder(cancelParams).then((res) => {
    if (res.success) {
      Message.success("取消订单成功");
      getDetail();
      cancelAvail.value = false;
    }
  });
}

onMounted(() => {
  getDetail();
});
</script>
<style lang="scss" scoped>
.mb_10 {
  Button:nth-of-type(2) {
    margin-left: 10px;
  }
}

.mb_5 {
  margin-bottom: 5px;
}
.order-detail {
  color: #333;
}

.order-card {
  padding: 4px 0 16px;
  margin-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;

  h3 {
    margin: 0 0 12px;
    font-size: 15px;
    font-weight: 600;
    color: #333;
    line-height: 1.4;
  }

  p {
    margin: 0;
    padding: 4px 0;
    color: #666;
    line-height: 22px;
  }
}

.status-card {
  padding-top: 8px;
}

.status-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.status-text {
  color: $theme_color;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

.status-sn {
  margin-top: 6px;
  color: #666;
}

.status-side {
  flex-shrink: 0;
  text-align: right;
}

.operation-time {
  color: #999;
  font-size: 13px;
  line-height: 22px;
}

.status-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;

  .el-button {
    margin: 0;
  }
}

.progress {
  max-width: 640px;
  margin: 20px 0 0;

  :deep(.el-step.is-vertical) {
    padding-bottom: 20px;
  }

  :deep(.el-step.is-vertical:last-child) {
    padding-bottom: 0;
  }

  :deep(.el-step__head.is-finish) {
    color: #c0c4cc;
    border-color: #c0c4cc;
  }

  :deep(.el-step__title.is-finish),
  :deep(.el-step__description.is-finish) {
    color: #909399;
    font-weight: 400;
  }

  :deep(.el-step__head.is-process) {
    color: $theme_color;
    border-color: $theme_color;
  }

  :deep(.el-step__title.is-process),
  :deep(.el-step__description.is-process) {
    color: $theme_color;
  }
}

.goods {
  padding-top: 8px;
}

.shop-name {
  margin: 8px 0 12px;
  font-size: 14px;
  font-weight: 600;

  span {
    color: #438cde;
    cursor: pointer;

    &:hover {
      color: $theme_color;
    }
  }
}

table {
  border: 1px solid #eee;
  color: #666;
  border-collapse: collapse;
  width: 100%;

  tr {
    border-top: 1px solid #eee;
  }

  thead > tr {
    height: 40px;
    background: #fafafa;
  }

  th {
    padding: 0 8px;
    font-size: 13px;
    font-weight: 500;
    color: #666;
  }

  td {
    padding: 12px 8px;
    text-align: center;
    vertical-align: middle;

    &:first-child {
      text-align: left;
    }
  }
}

.goods-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;

  img {
    width: 64px;
    height: 64px;
    border-radius: 6px;
    object-fit: cover;
    flex-shrink: 0;
    background: #f5f5f5;
    cursor: pointer;
  }
}

.goods-name {
  min-width: 0;
  color: #333;
  line-height: 20px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-break: break-word;
  cursor: pointer;
}

.order-item-actions {
  vertical-align: middle;

  .comment-text {
    display: block;
    margin: 0 auto 6px;
    padding: 0;
    border: 0;
    background: transparent;
    color: $theme_color;
    font-size: 14px;
    line-height: 22px;
    cursor: pointer;
  }

  .order-item-action-btn {
    display: block;
    margin: 0 auto 6px;
    min-width: 88px;
  }
}

.order-price {
  margin-top: 16px;
  padding-top: 8px;
  font-size: 14px;
  color: #666;

  > div {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    line-height: 28px;
  }

  > div > span:nth-child(2) {
    width: 140px;
    margin-top: 0;
    text-align: right;
    color: #333;
  }

  .actrual-price {
    color: $theme_color;
    font-weight: 600;
    font-size: 20px;
  }
}
.verificationCode {
  font-size: 20px;
  margin-bottom: 20px;
  color: rgb(65, 63, 63);
  font-weight: bold;
  text-align: center;
  span {
    color: $theme_color;
  }
}

.ecoupon-card-keys-mobile {
  display: none;
}

.ecoupon-fulfill-block + .ecoupon-fulfill-block {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #eee;
}

.ecoupon-card-keys-pc {
  display: block;
}

.card-key-mobile-item {
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  p {
    margin: 4px 0;
    word-break: break-all;
  }
}

@media (max-width: 768px) {
  .ecoupon-card-keys-mobile {
    display: block;
  }
  .ecoupon-card-keys-pc {
    display: none;
  }
}
.layui-layer-wrap {
  dl {
    border-top: solid 1px #f5f5f5;
    margin-top: -1px;
    overflow: hidden;

    dt {
      font-size: 14px;
      line-height: 28px;
      display: inline-block;
      padding: 8px 1% 8px 0;
      color: #999;
    }

    dd {
      font-size: 14px;
      line-height: 28px;
      display: inline-block;
      padding: 8px 0 8px 8px;
      border-left: solid 1px #f5f5f5;

      .text-box {
        line-height: 40px;
        color: #333;
        word-break: break-all;
      }
    }
  }
}

.layui-layer-wrap > .div-express-log {
  max-height: 300px;
}
:deep(.layui-layer-wrap > .div-express-log::-webkit-scrollbar){
  width: 1px;
  height: 5px;
}
:deep(.layui-layer-wrap > .div-express-log::-webkit-scrollbar-thumb){
  border-radius: 1em;
  background-color: rgba(50,50,50,.3);
}
:deep(.layui-layer-wrap > .div-express-log::-webkit-scrollbar-track){
  border-radius: 1em;
  background-color: rgba(50,50,50,.1);
}


.div-express-log {
  border: solid 1px #e7e7e7;
  background: #fafafa;
  overflow-y: auto;
  overflow-x: auto;
}

.receipt-action {
  margin-top: 12px;
}

.express-log {
  /*margin: 5px -10px 5px 5px;*/
  padding: 10px;
  list-style-type: none;

  .time {
    width: 30%;
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

.express-log-name {
  li {
    display: flex;
    span  {
      display: flex;
    }
  }
}

.layui-layer-wrap {
  dl {
    border-top: solid 1px #f5f5f5;
    margin-top: -1px;
    overflow: hidden;

    dt {
      font-size: 14px;
      line-height: 28px;
      display: inline-block;
      padding: 8px 1% 8px 0;
      color: #999;
    }

    dd {
      font-size: 14px;
      line-height: 28px;
      display: inline-block;
      padding: 8px 0 8px 8px;
      border-left: solid 1px #f5f5f5;

      .text-box {
        line-height: 40px;
        color: #333;
        word-break: break-all;
      }
    }
  }
}
</style>
