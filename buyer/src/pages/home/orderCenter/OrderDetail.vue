<template>
  <div class="order-detail" v-if="order.order">
    <UserCenterLayout title="订单详情" :tabs="['订单详情']">
    <el-card
      class="mb_10"
      shadow="never"
      v-if="
        order.allowOperationVO.pay ||
        order.allowOperationVO.rog ||
        order.allowOperationVO.cancel
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
    </el-card>
    <p class="verificationCode" v-if="order.order.verificationCode && !isECouponOrder">
      核验码：<span>{{ order.order.verificationCode }}</span>
    </p>
    <div class="order-card">
      <p class="global_color fontsize_18">{{ order.orderStatusValue }}</p>
      <p>订单号：{{ order.order.sn }}</p>
      <div style="color: #999" class="operation-time">
        操作时间：{{ order.order.updateTime || order.order.createTime }}
      </div>
      <el-steps
        class="progress"
        :current="progressList.length"
        direction="vertical"
      >
        <el-step           :title="progress.message"
          :content="progress.createTime"
          v-for="(progress, index) in progressList"
          :key="index"
        ></el-step>
      </el-steps>
    </div>
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
      <p>配送方式：{{ order.deliveryMethodValue }}</p>
      <p v-if="order.order.deliveryMethod === 'LOGISTICS'">配送状态：{{ order.deliverStatusValue }}</p>
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
    <!-- 卡密信息（E_COUPON 主单或满赠子单，以 cardKeyFulfillStatus 为准） -->
    <div class="order-card ecoupon-card-keys" v-if="hasCardKeySection">
      <h3>卡密信息</h3>
      <div
        v-for="line in cardKeyFulfillLines"
        :key="line.key"
        class="ecoupon-fulfill-block"
      >
        <div v-if="cardKeyFulfillLines.length > 1" class="ecoupon-fulfill-title">
          {{ line.goodsName || (line.isGift ? "满赠电子卡券" : "电子卡券") }}
        </div>
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
              <el-table-column
                v-if="cardKeyFulfillLines.length > 1"
                prop="goodsName"
                label="商品"
                min-width="120"
                show-overflow-tooltip
              />
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
            <th width="30%">商品</th>
            <th width="15%">货号</th>
            <th width="10%">单价</th>
            <th width="5%">数量</th>
            <th width="10%" v-if="!isECouponOrder">退款状态</th>
            <th width="10%" v-if="!isECouponOrder">实际退款金额</th>
            <th width="10%">小计</th>
            <th width="10%">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(goods, goodsIndex) in order.orderItems" :key="goodsIndex">
            <td>
              <img
                @click="goodsDetail(goods.skuId, goods.goodsId)"
                :src="goods.image"
                alt=""
              />
              <div>
                <p
                  @click="goodsDetail(goods.skuId, goods.goodsId)"
                  class="hover-color"
                >
                  {{ goods.goodsName }}
                </p>
              </div>
            </td>
            <td>{{ goods.id }}</td>
            <td>{{ $filters.unitPrice(goods.goodsPrice, "￥") }}</td>
            <td>{{ goods.num }}</td>
            <td v-if="!isECouponOrder">{{refundPriceList(goods.isRefund)}}</td>
            <td v-if="!isECouponOrder">{{ $filters.unitPrice(goods.refundPrice, "￥") }}</td>
            <td>{{ $filters.unitPrice((goods.goodsPrice * goods.num), "￥") }}</td>
            <td class="order-item-actions">
              <el-button
                v-if="goods.commentStatus == 'UNFINISHED'"
                @click="comment(order.order.sn, goodsIndex)"
                size="small"
                type="success"
                class="order-item-action-btn fontsize_12 mb_5"
                >评价</el-button
              >
              <el-button
                v-if="goods.complainStatus == 'NO_APPLY'"
                @click="complain(order.order.sn, goodsIndex)"
                type="danger"
                class="order-item-action-btn fontsize_12 mb_5"
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
          <dl><dt>物流公司：</dt>
            <dd><div class="text-box">{{ packageItem.logisticsName }}</div></dd>
          </dl>
          <dl><dt>快递单号：</dt>
            <dd><div nctype="ordersSn" class="text-box">{{ packageItem.logisticsNo }}</div></dd>
          </dl>
          <div class="div-express-log">
            <ul class="express-log express-log-name">
              <li v-for="(item, index) in packageItem.orderPackageItemList" :key="index">
                <span class="time" style="width: 50%;"><span>商品名称：</span><span>{{ item.goodsName }}</span></span>
                <span class="time" style="width: 30%;"><span>发货时间：</span><span>{{ item.logisticsTime }}</span></span>
                <span class="time" style="width: 20%;"><span>发货数量：</span><span>{{ item.deliverNumber }}</span></span>
              </li>
            </ul>
            <div class="div-express-log" style="overflow: hidden;">
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
<script>
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

/**
 * 订单详情：E_COUPON 展示 orderItems[].cardKeys，屏蔽售后/物流（FR-B-03 / FR-B-04）。
 * 移动端已完成订单用 Dialog 查看卡密（原型 P-09 / D-01）。
 */
export default {
  name: "order-detail",
  data() {
    return {
      order: {}, // 订单详情数据
      progressList: [], // 订单流程
      logistics: "", // 物流数据
      cardKeyDialogVisible: false,
      cancelParams: {
        // 取消售后参数
        orderSn: "",
        reason: "",
      },
      cancelAvail: false, // 取消订单modal控制
      cancelReason: [], // 取消订单原因
      orderPackage: [],
      packageTraceList: [],
      logisticsModal: false,
    };
  },
  computed: {
    /** 电子卡券订单：无物流/核验码，卡密数据来自 API-B-01 orderItems[].cardKeys */
    isECouponOrder() {
      return checkECouponOrder(this.order?.order?.orderType);
    },
    isVirtualOrder() {
      return this.order?.order?.orderType === "VIRTUAL";
    },
    isNonPhysicalOrder() {
      return this.isVirtualOrder || this.isECouponOrder;
    },
    /** 是否展示卡密区块（含满赠 E_COUPON 子单 giftECouponOrders） */
    hasCardKeySection() {
      return orderHasCardKeySection({
        orderItems: this.order.orderItems,
        giftSummaries: this.order.giftECouponOrders,
        isECouponOrder: this.isECouponOrder,
      });
    },
    cardKeyFulfillLines() {
      return collectCardKeyFulfillLines(
        this.order.orderItems,
        this.order.giftECouponOrders
      );
    },
    ecouponCardKeyRows() {
      return flattenOrderCardKeys(
        this.order.orderItems,
        false,
        this.order.giftECouponOrders
      );
    },
  },
  methods: {
    cardKeyFulfillAlertType,
    resolveCardKeyFulfillMessage,
    lineCardKeyRows(line) {
      return (line.cardKeys || []).map((ck) => ({
        ...ck,
        goodsName: line.goodsName,
      }));
    },
    copyCardKey(row) {
      const text = `卡号：${row.cardNo || ""}\n卡密：${row.cardSecret || ""}`;
      this.copyText(text);
    },
    copyAllCardKeys() {
      const text = this.ecouponCardKeyRows
        .map((row, i) => `${i + 1}. 卡号：${row.cardNo || ""}  卡密：${row.cardSecret || ""}`)
        .join("\n");
      this.copyText(text || "");
    },
    copyText(text) {
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
    },
    isVatSpecialReceipt (receipt) {
      if (!receipt) return false;
      const rt = receipt.receiptType != null ? String(receipt.receiptType).trim() : "";
      if (rt === "2" || rt === "增值税专用发票" || receipt.invoiceKind === "VAT_SPECIAL") {
        return true;
      }
      return false;
    },
    isPersonalReceipt (receipt) {
      return !this.isVatSpecialReceipt(receipt);
    },
    formatReceiptType (receipt) {
      if (!receipt) return "";
      const rt = receipt.receiptType != null ? String(receipt.receiptType).trim() : "";
      if (rt === "电子普通发票" || rt === "增值税专用发票") return rt;
      return this.isVatSpecialReceipt(receipt) ? "增值税专用发票" : "电子普通发票";
    },
    formatReceiptHeaderType (receipt) {
      if (!receipt) return "";
      if (this.isVatSpecialReceipt(receipt)) return "单位";
      if (receipt.taxpayerId) return "单位";
      return "个人";
    },
    hasValidReceipt () {
      const receipt = this.order && this.order.receipt;
      if (!receipt) return false;
      const content = receipt.receiptContent ? String(receipt.receiptContent).trim() : '';
      const title = receipt.receiptTitle ? String(receipt.receiptTitle).trim() : '';
      const taxpayerId = receipt.taxpayerId ? String(receipt.taxpayerId).trim() : '';
      // 后端有时会返回占位 receipt（如 receiptContent=不开发票），这里过滤掉
      if (content === '不开发票') return false;
      return Boolean(content || title || taxpayerId);
    },
    getInvoiceAddress (receipt) {
      if (!receipt) return "";
      return receipt.invoiceAddress || receipt.invoiceFileUrl || "";
    },
    viewReceiptInvoice (receipt) {
      const invoiceAddress = this.getInvoiceAddress(receipt);
      if (!invoiceAddress) {
        Message.warning("暂无发票附件");
        return;
      }
      window.open(invoiceAddress, "_blank");
    },
    // 退款状态枚举
    refundPriceList(status) {
      switch (status) {
      case 'ALL_REFUND':
        return "全部退款";
      case 'PART_REFUND':
        return "部分退款";
      case 'NO_REFUND':
        return "未退款";
      case 'REFUNDING':
        return "退款中";
      default:
          return "未退款";
      }
    },
    goodsDetail(skuId, goodsId) {
      // 跳转商品详情
      let routeUrl = this.$router.resolve({
        path: "/goodsDetail",
        query: { skuId, goodsId },
      });
      window.open(routeUrl.href, "_blank");
    },
    // 跳转店铺首页
    shopPage(id) {
      let routeUrl = this.$router.resolve({
        path: "/merchant",
        query: { id: id },
      });
      window.open(routeUrl.href, "_blank");
    },
    async getDetail() {
      // 获取订单详情
      orderDetail(this.$route.query.sn).then(async (res) => {
        if (res.success) {
          this.order = res.result;
          const receiptId =
            (res.result.order && res.result.order.receiptId) ||
            res.result.receiptId ||
            (res.result.receipt && res.result.receipt.id);
          if (receiptId) {
            const receiptRes = await receiptDetail(receiptId);
            if (receiptRes && receiptRes.success && receiptRes.result) {
              this.order["receipt"] = receiptRes.result;
            }
          }
          this.progressList = res.result.orderLogs;
          if (this.order.order.deliveryMethod === 'LOGISTICS') {
            this.getOrderPackage(this.order.order.sn);
            this.traces();
          }
        }
      });
    },
    getOrderPackage(sn) {
      getPackage(sn).then(res => {
        if (res.success) {
          this.orderPackage = res.result
        }
      })
    },
    traces() {
      // 物流信息
      getTraces(this.$route.query.sn).then((res) => {
        if (res.success) {
          this.logistics = res.result;
        }
      });
    },
    logisticsList() {
      this.logisticsModal = true;
      this.packageTraceList = this.orderPackage;
      // getTracesList(this.order.order.sn).then((res) => {
      //   if (res.success && res.result != null) {
      //     this.packageTraceList = res.result;
      //   }
      // });
    },
    received(sn) {
      // 确认收货
      sureReceived(sn).then((res) => {
        if (res.success) {
          Message.success("确认收货成功");
          this.getDetail();
        }
      });
    },
    goPay(sn) {
      // 去支付
      this.$router.push({
        path: "/payment",
        query: { orderType: "ORDER", sn },
      });
    },
    applyAfterSale(sn) {
      // 申请售后
      this.$router.push({ name: "ApplyAfterSale", query: { sn: sn } });
    },
    comment(sn, goodsIndex) {
      // 评价
      this.$router.push({
        path: "/home/addEval",
        query: { sn, index: goodsIndex },
      });
    },
    complain(sn, goodsIndex) {
      // 投诉
      this.$router.push({ name: "Complain", query: { sn, index: goodsIndex } });
    },
    handleCancelOrder(sn) {
      // 取消订单
      this.cancelParams.orderSn = sn;
      afterSaleReason("CANCEL").then((res) => {
        if (res.success) {
          this.cancelReason = res.result;
          this.cancelAvail = true;
          this.cancelParams.reason = this.cancelReason[0].reason;
        }
      });
    },
    sureCancel() {
      // 确定取消
      cancelOrder(this.cancelParams).then((res) => {
        if (res.success) {
          Message.success("取消订单成功");
          this.getDetail();
          this.cancelAvail = false;
        }
      });
    },
  },
  mounted() {
    this.getDetail();
  },
};
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
.order-card {
  padding: 10px;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #e8eaec;
  position: relative;
  .global_color {
    color: $theme_color;
  }
  p {
    color: #999;
    margin: 3px;
    margin-left: 5px;
  }
  h3 {
    font-weight: normal;
    font-size: 16px;
  }
  .operation-time {
    position: absolute;
    right: 20px;
    top: 20px;
  }
}
/** 店铺名称 */
.shop-name {
  margin: 15px 0;
  span {
    color: #438cde;
    cursor: pointer;
    &:hover {
      color: $theme_color;
    }
  }
  .el-icon {
    color: #ff8f23;
    cursor: pointer;
    &:hover {
      color: $theme_color;
    }
  }
}
/** 商品列表 */
table {
  border: 1px solid #ddd;
  color: #999;
  border-collapse: collapse;
  width: 100%;
  tr {
    border-top: 1px solid #ddd;
  }
  thead > tr {
    height: 40px;
    background: #eee;
  }
  th {
    font-size: 12px;
    font-weight: normal;
  }
  td {
    padding: 5px;
    text-align: center;
    &:first-child {
      text-align: left;
      display: flex;
      img {
        width: 70px;
        height: 70px;
        margin-right: 10px;
        margin-left: 10px;
        cursor: pointer;
      }
    }
    &:last-child {
      color: $theme_color;
    }
  }
}

.order-item-actions {
  vertical-align: middle;

  .order-item-action-btn {
    display: block;
    margin: 0 auto 5px;
    min-width: 88px;
  }
}
/** 订单价格 */
.order-price {
  text-align: right;
  margin-top: 30px;
  font-size: 16px;
  color: #999;
  > div > span:nth-child(2) {
    width: 130px;
    text-align: right;
    display: inline-block;
    margin-top: 10px;
  }
  .actrual-price {
    color: $theme_color;
    font-weight: bold;
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

.ecoupon-fulfill-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
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
/** 订单进度条 */
.progress {
  margin: 15px 0;
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
