<template>
  <div class="order-detail-page">
    <div class="page-heading">
      <div>
        <h1>订单详情</h1>
        <p>查看订单信息、商品明细与履约进度</p>
      </div>
      <el-button class="back-btn" :icon="ArrowLeft" @click="goBack">返回列表</el-button>
    </div>
    <!-- 顶部一体化状态与履约进度卡片 -->
    <el-card shadow="never" class="top-overview-card">
      <!-- 第一层：返回导航 + 核心状态/单号 + 操作按钮组 -->
      <div class="overview-header">
        <div class="header-left">
          <el-tag
            :type="getOrderStatusTagType(orderInfo.order.orderStatus)"
            effect="light"
             class="main-status-tag"
          >
            {{ orderInfo.orderStatusValue || "加载中..." }}
          </el-tag>
          <div class="sn-title-group">
            <span class="sn-label">订单号：</span>
            <span class="sn-value font-mono">{{ orderInfo.order.sn || sn }}</span>
            <el-tooltip content="复制订单编号" placement="top">
              <el-button
                link
                type="primary"
                :icon="CopyDocument"
                class="copy-icon-btn"
                aria-label="复制订单编号"
                @click="copyText(orderInfo.order.sn || sn, '订单编号')"
              />
            </el-tooltip>
          </div>
          <div class="meta-tags">
            <el-tag v-if="orderInfo.order.clientType" size="small" type="info" effect="plain">
              {{ clientTypeWay(orderInfo.order.clientType) }}
            </el-tag>
            <el-tag v-if="orderInfo.paymentMethodValue" size="small" type="success" effect="plain">
              {{ orderInfo.paymentMethodValue }}
            </el-tag>
          </div>
        </div>

        <div class="header-actions">
          <el-button v-if="allowOperation.editPrice" size="default" @click="modifyPrice">调整价格</el-button>
          <el-button v-if="allowOperation.editConsignee" size="default" plain type="primary" @click="editAddress">
            修改收件信息
          </el-button>
          <el-button v-if="allowOperation.cancel" size="default" plain type="warning" @click="orderCancel">
            取消订单
          </el-button>
          <el-button
            v-if="isAppointmentOrder && canPlatformRefund"
            size="default"
            plain
            type="danger"
            @click="openPlatformRefund"
          >
            平台退款
          </el-button>
          <el-button
            v-if="isAppointmentOrder && canNoShowRefund"
            size="default"
            plain
            type="danger"
            @click="openNoShowRefund"
          >
            爽约退款
          </el-button>
          <el-button v-if="orderInfo.order.orderStatus === 'UNPAID'" size="default" type="primary" @click="confirmPrice">
            确认收款
          </el-button>
          <el-button size="default" plain :icon="Tickets" @click="orderLogDrawer = true">订单日志</el-button>
          <el-button
            v-if="!isNonPhysicalOrder"
            size="default"
            plain
            type="primary"
            :icon="Printer"
            @click="printOrder"
          >
            打印发货单
          </el-button>
          <el-button size="default" :icon="Refresh" @click="getDataList">刷新</el-button>
        </div>
      </div>

      <!-- 第二层：紧凑型横向履约步骤条 -->
      <div class="fulfillment-stepper">
        <div
          v-for="(step, sIdx) in orderSteps"
          :key="sIdx"
          class="step-item"
          :class="getStepStateClass(sIdx)"
        >
          <div class="step-node">
            <div class="step-circle">
              <el-icon v-if="isStepFinished(sIdx)"><Check /></el-icon>
              <span v-else>{{ sIdx + 1 }}</span>
            </div>
            <div class="step-text">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-desc">{{ step.desc }}</div>
            </div>
          </div>
          <div v-if="sIdx < orderSteps.length - 1" class="step-connector"></div>
        </div>
      </div>
    </el-card>

    <!-- 中部：三列等高核心信息面板 -->
    <el-row :gutter="16" class="info-grid-row">
      <!-- 1. 订单与买家信息 -->
      <el-col :xs="24" :sm="24" :md="8">
        <el-card shadow="never" class="section-card equal-card">
          <template #header>
            <div class="card-title">
              <el-icon><User /></el-icon>
              <span>订单与买家信息</span>
            </div>
          </template>

          <div class="kv-list">
            <div class="kv-row">
              <span class="kv-label">买家账号</span>
              <div class="kv-val">
                <el-tooltip
                  :content="orderInfo.order.memberName || '匿名买家'"
                  placement="top"
                  :disabled="!orderInfo.order.memberName || orderInfo.order.memberName.length < 20"
                >
                  <span class="member-name-text font-bold">{{ orderInfo.order.memberName || "匿名买家" }}</span>
                </el-tooltip>
              </div>
            </div>

            <div class="kv-row">
              <span class="kv-label">成交店铺</span>
              <div class="kv-val font-bold text-dark">{{ orderInfo.order.storeName || "-" }}</div>
            </div>

            <div class="kv-row">
              <span class="kv-label">下单时间</span>
              <div class="kv-val font-mono">{{ orderInfo.order.createTime || "-" }}</div>
            </div>

            <div class="kv-row">
              <span class="kv-label">支付状态</span>
              <div class="kv-val">
                <el-tag
                  size="small"
                  :type="orderInfo.order.payStatus === 'PAID' ? 'success' : 'warning'"
                  effect="light"
                >
                  {{ orderInfo.order.payStatus === "PAID" ? "已付款" : "待付款" }}
                </el-tag>
                <span v-if="orderInfo.paymentMethodValue" class="sub-pay-method">
                  （{{ orderInfo.paymentMethodValue }}）
                </span>
              </div>
            </div>

            <div class="kv-row">
              <span class="kv-label">应付总额</span>
              <div class="kv-val text-danger font-bold font-mono">
                ¥ {{ unitPrice(orderInfo.order.flowPrice) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 2. 收货与配送信息 -->
      <el-col :xs="24" :sm="24" :md="8">
        <el-card shadow="never" class="section-card equal-card">
          <template #header>
            <div class="card-title justify-between">
              <div class="flex-title">
                <el-icon><Location /></el-icon>
                <span>收货与配送信息</span>
              </div>
              <el-button
                v-if="allowOperation.editConsignee"
                link
                type="primary"
                size="small"
                :icon="Edit"
                @click="editAddress"
              >
                修改
              </el-button>
            </div>
          </template>

          <div class="kv-list">
            <template v-if="!isECouponOrder && orderInfo.order.deliveryMethod !== 'SELF_PICK_UP'">
              <div class="kv-row">
                <span class="kv-label">收货人</span>
                <div class="kv-val font-bold">{{ orderInfo.order.consigneeName || "-" }}</div>
              </div>

              <div class="kv-row">
                <span class="kv-label">联系电话</span>
                <div class="kv-val">
                  <span class="font-mono">{{ orderInfo.order.consigneeMobile || "-" }}</span>
                  <el-tooltip v-if="orderInfo.order.consigneeMobile" content="复制手机号" placement="top">
                    <el-button
                      link
                      type="primary"
                      :icon="CopyDocument"
                      aria-label="复制手机号"
                      @click="copyText(orderInfo.order.consigneeMobile, '手机号')"
                    />
                  </el-tooltip>
                </div>
              </div>

              <div class="kv-row">
                <span class="kv-label">收货地址</span>
                <div class="kv-val address-val">
                  {{ formatAddress(orderInfo.order.consigneeAddressPath, orderInfo.order.consigneeDetail) }}
                </div>
              </div>
            </template>

            <div v-else-if="orderInfo.order.deliveryMethod === 'SELF_PICK_UP'" class="kv-row">
              <span class="kv-label">履约方式</span>
              <div class="kv-val font-bold text-success">买家自提</div>
            </div>

            <div v-if="!isNonPhysicalOrder" class="kv-row">
              <span class="kv-label">配送方式</span>
              <div class="kv-val">{{ orderInfo.deliveryMethodValue || "-" }}</div>
            </div>

            <div class="kv-row">
              <span class="kv-label">买家留言</span>
              <div class="kv-val" :class="{ 'text-gray': !orderInfo.order.remark }">
                {{ orderInfo.order.remark || "暂无买家留言" }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 3. 发票与扩展信息 -->
      <el-col :xs="24" :sm="24" :md="8">
        <el-card shadow="never" class="section-card equal-card">
          <template #header>
            <div class="card-title">
              <el-icon><Document /></el-icon>
              <span>{{ isAppointmentOrder ? "发票与预约信息" : "发票与备注信息" }}</span>
            </div>
          </template>

          <div class="kv-list">
            <template v-if="orderInfo.order.needReceipt">
              <div class="kv-row">
                <span class="kv-label">开票状态</span>
                <div class="kv-val">
                  <el-tag size="small" :type="orderInfo.receipt?.receiptStatus === 1 ? 'success' : 'info'">
                    {{ orderInfo.receipt?.receiptStatus === 1 ? "已开票" : "未开票" }}
                  </el-tag>
                </div>
              </div>

              <div class="kv-row">
                <span class="kv-label">发票抬头</span>
                <div class="kv-val font-bold">{{ orderInfo.receipt?.receiptTitle || "-" }}</div>
              </div>

              <div v-if="orderInfo.receipt?.taxpayerId" class="kv-row">
                <span class="kv-label">纳税人识别号</span>
                <div class="kv-val font-mono">{{ orderInfo.receipt.taxpayerId }}</div>
              </div>

              <div class="kv-row">
                <span class="kv-label">发票内容</span>
                <div class="kv-val">{{ orderInfo.receipt?.receiptContent || "-" }}</div>
              </div>

              <div class="kv-row">
                <span class="kv-label">发票金额</span>
                <div class="kv-val text-danger font-bold font-mono">
                  ¥ {{ Number(orderInfo.receipt?.receiptPrice || 0).toFixed(2) }}
                </div>
              </div>
            </template>

            <template v-else>
              <div class="kv-row">
                <span class="kv-label">是否开票</span>
                <div class="kv-val">
                  <el-tag size="small" type="info" effect="plain">未申请开票</el-tag>
                </div>
              </div>
              <div class="kv-row">
                <span class="kv-label">发票抬头</span>
                <div class="kv-val text-gray">-</div>
              </div>
              <div class="kv-row">
                <span class="kv-label">发票内容</span>
                <div class="kv-val text-gray">-</div>
              </div>
            </template>

            <div class="kv-row">
              <span class="kv-label">商家备注</span>
              <div class="kv-val" :class="{ 'text-gray': !orderInfo.order.sellerRemark }">
                {{ orderInfo.order.sellerRemark || "暂无商家备注" }}
              </div>
            </div>

            <template v-if="isAppointmentOrder">
              <div v-if="appointmentSlotText" class="kv-row">
                <span class="kv-label">预约时段</span>
                <div class="kv-val font-bold text-primary">{{ appointmentSlotText }}</div>
              </div>
              <div
                v-for="(rows, gi) in appointmentFormGroups"
                :key="'form-' + gi"
                class="kv-row"
              >
                <span class="kv-label">{{ appointmentFormGroups.length > 1 ? `补充信息${gi + 1}` : "补充信息" }}</span>
                <div class="kv-val flex-col">
                  <div v-for="row in rows" :key="row.fieldKey" class="form-ans-line">
                    <span class="f-label">{{ row.fieldLabel }}：</span>
                    <span class="f-val">{{ row.value }}</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部：全宽商品清单与费用结算 -->
    <el-card shadow="never" class="section-card goods-section-card">
      <template #header>
        <div class="card-title justify-between">
          <div class="flex-title">
            <el-icon><Goods /></el-icon>
            <span>商品清单</span>
            <el-tag size="small" type="info" effect="plain" round class="count-badge">
              共 {{ data.length }} 种 / {{ totalGoodsNum }} 件
            </el-tag>
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="data"
        class="goods-table"
        style="width: 100%"
      >
        <el-table-column label="商品信息" min-width="320">
          <template #default="{ row }">
            <div v-if="row" class="goods-item-cell">
              <el-image
                :src="row.image"
                :preview-src-list="[row.image]"
                fit="cover"
                class="goods-thumb"
              />
              <div class="goods-info">
                <div class="goods-name">
                  <el-tag v-if="isGiftItem(row)" size="small" type="danger" effect="plain" class="mr_5">赠品</el-tag>
                  <span>{{ row.goodsName }}</span>
                </div>
                <div v-if="row.specs" class="goods-specs">
                  <span v-for="(val, key) in parseSpecs(row.specs)" :key="key" class="spec-tag">
                    {{ key }}: {{ val }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="优惠活动" min-width="140" align="center">
          <template #default="{ row }">
            <el-tag v-if="getPromotionText(row) !== '未参与'" size="small" type="warning">
              {{ getPromotionText(row) }}
            </el-tag>
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>

        <el-table-column label="单价" width="150" align="center">
          <template #default="{ row }">
            <template v-if="isGiftItem(row)">
              <div class="font-mono text-gray" style="text-decoration: line-through;">¥ {{ Number(row.unitPrice || 0).toFixed(2) }}</div>
              <div class="text-danger font-bold">赠品 ¥ 0.00</div>
            </template>
            <span v-else class="font-mono font-bold">¥ {{ Number(row.unitPrice || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="num" label="数量" width="110" align="center" />

        <el-table-column prop="returnGoodsNumber" label="已退款" width="110" align="center">
          <template #default="{ row }">
            <span :class="row.returnGoodsNumber > 0 ? 'text-danger font-bold' : 'text-gray'">
              {{ row.returnGoodsNumber || 0 }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="小计" width="160" align="right" header-align="center">
          <template #default="{ row }">
            <span class="text-danger font-bold font-mono pr_12">
              ¥ {{ Number(row.flowPrice || 0).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 电子卡券卡密列表 -->
      <div v-if="isECouponOrder" class="ecoupon-card-keys mt_16">
        <div class="sub-header-title">
          <el-icon><Tickets /></el-icon>
          <span>卡密发放明细</span>
        </div>
        <el-alert
          v-if="!ecouponCardKeyDelivered"
          type="info"
          show-icon
          :closable="false"
          title="卡密尚未发放"
          class="mb_10"
        />
        <el-table
          v-else-if="ecouponCardKeyRows.length"
          border
          size="small"
          :data="ecouponCardKeyRows"
          style="width: 100%"
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="cardNo" label="卡号" min-width="140" show-overflow-tooltip />
          <el-table-column prop="cardSecret" label="卡密" min-width="120" show-overflow-tooltip />
          <el-table-column prop="allocatedTime" label="发卡时间" width="170" align="center" />
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" type="success">{{ formatCardKeyStatus(row.status || 'ALLOCATED') }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="copyCardKey(row)">复制</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 商品清单底部金额汇总与核算 -->
      <div class="goods-summary-footer">
        <div class="summary-rows">
          <div class="summary-item">
            <span class="label">商品总额</span>
            <span class="value font-mono">¥ {{ unitPrice(orderPriceDetail.goodsPrice || orderInfo.order.goodsPrice || 0) }}</span>
          </div>

          <div v-if="!isECouponOrder" class="summary-item">
            <span class="label">运费</span>
            <span class="value font-mono">+ ¥ {{ unitPrice(orderInfo.order.freightPrice || 0) }}</span>
          </div>

          <div v-if="orderPriceDetail.discountPrice > 0" class="summary-item">
            <span class="label">活动优惠抵扣</span>
            <span class="value text-success font-mono">- ¥ {{ unitPrice(orderPriceDetail.discountPrice) }}</span>
          </div>

          <div v-if="orderPriceDetail.couponPrice > 0" class="summary-item">
            <span class="label">优惠券抵扣</span>
            <span class="value text-success font-mono">- ¥ {{ unitPrice(orderPriceDetail.couponPrice) }}</span>
          </div>

          <div v-if="orderPriceDetail.giftCardPrice > 0" class="summary-item">
            <span class="label">礼品卡抵扣</span>
            <span class="value text-success font-mono">- ¥ {{ unitPrice(orderPriceDetail.giftCardPrice) }}</span>
          </div>

          <div v-if="orderPriceDetail.updatePrice" class="summary-item">
            <span class="label">人工改价调整</span>
            <span class="value font-mono">¥ {{ unitPrice(orderPriceDetail.updatePrice) }}</span>
          </div>

          <div v-if="orderPriceDetail.payPoint > 0" class="summary-item">
            <span class="label">使用积分抵扣</span>
            <span class="value font-mono">{{ orderPriceDetail.payPoint }} 积分</span>
          </div>

          <div class="summary-divider"></div>

          <div class="summary-item final-total">
            <span class="label">订单应付总额</span>
            <span class="final-price text-danger font-mono">
              ¥ {{ unitPrice(orderPriceDetail.flowPrice || orderInfo.order.flowPrice || 0) }}
            </span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 弹窗：修改金额 -->
    <el-dialog v-model="modal" title="调整订单金额" width="480px" destroy-on-close>
      <el-form ref="modifyPriceFormRef" :model="modifyPriceForm" label-width="90px" :rules="modifyPriceValidate">
        <el-form-item label="调整后金额" prop="price">
          <el-input-number v-model="modifyPriceForm.price" :min="0" :max="999999" :precision="2" style="width: 180px" />
          <span class="ml_10">元</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modal = false">关闭</el-button>
        <el-button type="primary" @click="modifyPriceSubmit">确定调整</el-button>
      </template>
    </el-dialog>

    <!-- 弹窗：取消订单 -->
    <el-dialog v-model="orderCancelModal" title="取消订单" width="480px" destroy-on-close>
      <el-form ref="orderCancelFormRef" :model="orderCancelForm" label-width="90px" :rules="orderCancelValidate">
        <el-form-item label="取消原因" prop="reason">
          <el-input v-model="orderCancelForm.reason" type="textarea" :rows="3" resize="none" placeholder="请输入取消订单的具体原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="orderCancelModal = false">关闭</el-button>
        <el-button type="primary" @click="orderCancelSubmit">确认取消</el-button>
      </template>
    </el-dialog>

    <!-- 弹窗：修改收件信息 -->
    <el-dialog v-model="addressModal" title="修改收货信息" width="540px" destroy-on-close>
      <el-form ref="addressFormRef" :model="addressForm" label-width="100px" :rules="addressRule">
        <el-form-item label="收件人姓名" prop="consigneeName">
          <el-input v-model="addressForm.consigneeName" maxlength="20" />
        </el-form-item>
        <el-form-item label="手机号码" prop="consigneeMobile">
          <el-input v-model="addressForm.consigneeMobile" maxlength="11" />
        </el-form-item>
        <el-form-item label="所在地区" prop="consigneeAddressPath">
          <div class="addr-select-line">
            <span>{{ addr || "未选择地区" }}</span>
            <el-button size="small" type="primary" plain @click="$refs.map.open()">选择地区</el-button>
          </div>
        </el-form-item>
        <el-form-item label="详细地址" prop="consigneeDetail">
          <el-input v-model="addressForm.consigneeDetail" placeholder="街道、门牌号等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addressModal = false">关闭</el-button>
        <el-button type="primary" @click="editAddressSubmit">确认修改</el-button>
      </template>
    </el-dialog>

    <!-- 弹窗：打印发货单（标准出库发货单） -->
    <el-dialog
      v-model="printModal"
      :width="'min(900px, 94vw)'"
      top="4vh"
      destroy-on-close
      class="shipping-print-dialog"
    >
      <template #header>
        <div class="print-header-bar">
          <div class="print-title-group">
            <el-icon><Printer /></el-icon>
            <span class="dialog-title">发货单打印预览</span>
            <el-tag size="small" type="info" effect="plain">标准 A4 / 拣货出库联</el-tag>
          </div>
          <div class="print-header-actions">
            <el-button size="small" :type="printHiddenFlag ? 'warning' : 'default'" plain @click="printHiddenInfo">
              {{ printHiddenFlag ? "取消信息脱敏" : "敏感信息脱敏" }}
            </el-button>
          </div>
        </div>
      </template>

      <div class="print-preview-container">
        <!-- 拟真纸张区域（也是打印捕获区域） -->
        <div id="printInfo" class="shipping-invoice-paper">
          <div class="invoice-wrap">
            <!-- 1. 单据头部 -->
            <div class="inv-header">
              <div class="inv-title-box">
                <h2>{{ orderInfo.order.storeName || "官方商城" }} · 发货出库清单</h2>
                <div class="inv-sub-title">SHIPPING LIST & PACKING SLIP · 仓库出库拣货核验联</div>
              </div>
              <div class="inv-meta-right">
                <!-- 真实 SVG 矢量条形码（打印机100%渲染） -->
                <svg
                  class="barcode-svg"
                  :viewBox="`0 0 ${barcodeSvgBars.totalWidth} 34`"
                  width="180"
                  height="34"
                >
                  <rect
                    v-for="(b, idx) in barcodeSvgBars.bars"
                    :key="idx"
                    :x="b.x"
                    y="0"
                    :width="b.width"
                    height="34"
                    fill="#000000"
                  />
                </svg>
                <div class="barcode-text">{{ orderInfo.order.sn }}</div>
              </div>
            </div>

            <!-- 2. 单据元数据规整表格（4列对齐，订单号和时间绝不折行） -->
            <table class="inv-meta-table">
              <tbody>
                <tr>
                  <td class="m-k">订单编号</td>
                  <td class="m-v font-mono font-bold" style="width: 220px;">{{ orderInfo.order.sn }}</td>
                  <td class="m-k">下单时间</td>
                  <td class="m-v">{{ orderInfo.order.createTime }}</td>
                </tr>
                <tr>
                  <td class="m-k">配送方式</td>
                  <td class="m-v">{{ orderInfo.order.logisticsName || "普通快递" }}</td>
                  <td class="m-k">物流单号</td>
                  <td class="m-v font-mono">{{ orderInfo.order.logisticsNo || "待发货回传" }}</td>
                </tr>
                <tr>
                  <td class="m-k">收件人</td>
                  <td class="m-v font-bold">{{ orderInfo.order.consigneeName }}（{{ formattedPrintMobile }}）</td>
                  <td class="m-k">收货地址</td>
                  <td class="m-v">{{ orderInfo.order.consigneeAddressPath }}{{ orderInfo.order.consigneeDetail }}</td>
                </tr>
                <tr>
                  <td class="m-k">买家备注</td>
                  <td colspan="3" class="m-v font-bold">
                    {{ orderInfo.order.remark || "（无客户特殊留言）" }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- 3. 商品清单明细表格 -->
            <table class="inv-table">
              <thead>
                <tr>
                  <th style="width: 42px;">序号</th>
                  <th style="text-align: left; padding-left: 8px;">商品信息 / 规格</th>
                  <th style="width: 75px;">单价</th>
                  <th style="width: 50px;">订购数</th>
                  <th style="width: 50px;">实发数</th>
                  <th style="width: 45px;">核验</th>
                  <th style="width: 85px; text-align: right; padding-right: 8px;">金额小计</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in orderInfo.orderItems" :key="index">
                  <td style="text-align: center;">{{ index + 1 }}</td>
                  <td style="padding-left: 8px;">
                    <div class="goods-title">{{ item.goodsName }}</div>
                    <div v-if="item.specs" class="goods-specs">
                      <span v-for="(val, key) in parseSpecs(item.specs)" :key="key" style="margin-right: 8px;">
                        {{ key }}: {{ val }}
                      </span>
                    </div>
                  </td>
                  <td style="text-align: center;" class="font-mono">¥ {{ Number(item.unitPrice || 0).toFixed(2) }}</td>
                  <td style="text-align: center; font-weight: bold;">{{ item.num }}</td>
                  <td style="text-align: center; font-weight: bold;">{{ item.num }}</td>
                  <td style="text-align: center;">
                    <span class="check-box-square"></span>
                  </td>
                  <td style="text-align: right; font-weight: bold; padding-right: 8px;" class="font-mono">
                    ¥ {{ Number(item.flowPrice || 0).toFixed(2) }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- 4. 汇总行 -->
            <div class="inv-summary-bar">
              <div class="inv-summary-left">
                共计 {{ orderInfo.orderItems ? orderInfo.orderItems.length : 0 }} 种商品 / {{ totalGoodsNum }} 件
              </div>
              <div class="inv-summary-right font-mono">
                <div class="sum-item">
                  <span>商品金额:</span>
                  <span>¥ {{ unitPrice(orderPriceDetail.goodsPrice || orderInfo.order.goodsPrice || 0) }}</span>
                </div>
                <div class="sum-item">
                  <span>运费:</span>
                  <span>+ ¥ {{ unitPrice(orderInfo.order.freightPrice || 0) }}</span>
                </div>
                <div v-if="orderPriceDetail.discountPrice > 0" class="sum-item text-success">
                  <span>优惠:</span>
                  <span>- ¥ {{ unitPrice(orderPriceDetail.discountPrice) }}</span>
                </div>
                <div class="sum-item">
                  <span style="font-weight: 700; color: #000;">订单应付总额:</span>
                  <span class="sum-total">¥ {{ unitPrice(orderPriceDetail.flowPrice || orderInfo.order.flowPrice || 0) }}</span>
                </div>
              </div>
            </div>

            <!-- 5. 库房作业签字区 -->
            <div class="inv-sign-area">
              <div>拣货员: <span class="sign-line"></span></div>
              <div>复核员: <span class="sign-line"></span></div>
              <div>打包员: <span class="sign-line"></span></div>
              <div>签收人: <span class="sign-line"></span></div>
            </div>

            <!-- 6. 底部售后说明 -->
            <div class="inv-footer-note">
              * 感谢您的惠顾！请在签收时仔细核对商品及外包装完好无损，如遇少件、错发或破损，请于签收后联系客服处理。
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer-actions">
          <span class="print-tip-text">建议使用标准 A4 纸纵向打印</span>
          <div>
            <el-button @click="printModal = false">关闭</el-button>
            <el-button type="primary" :icon="Printer" @click="handlePrintInvoice">
              立即打印发货单
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <!-- 地图选择组件 -->
    <multipleMap ref="map" @callback="selectedRegion" />

    <!-- 预约订单退款弹窗 -->
    <el-dialog v-model="platformRefundModal" title="平台预约退款" width="500px">
      <el-form :model="platformRefundForm" label-width="95px">
        <el-form-item label="退款类型">
          <el-radio-group v-model="platformRefundForm.refundType">
            <el-radio label="UNSERVED">未服务退款</el-radio>
            <el-radio label="SERVED">已服务售后</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="退款金额">
          <el-input-number v-model="platformRefundForm.refundAmount" :min="0.01" :precision="2" />
        </el-form-item>
        <el-form-item label="退款原因">
          <el-input v-model="platformRefundForm.reason" type="textarea" :rows="3" placeholder="请输入退款原因说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="platformRefundModal = false">取消</el-button>
        <el-button type="primary" :loading="refundLoading" @click="submitPlatformRefund">确认退款</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="noShowRefundModal" title="上门爽约退款" width="500px">
      <el-form :model="noShowRefundForm" label-width="95px">
        <el-form-item label="退款金额">
          <el-input-number v-model="noShowRefundForm.refundAmount" :min="0.01" :precision="2" />
        </el-form-item>
        <el-form-item label="退款原因">
          <el-input v-model="noShowRefundForm.reason" type="textarea" :rows="3" placeholder="请输入爽约退款说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="noShowRefundModal = false">取消</el-button>
        <el-button type="primary" :loading="refundLoading" @click="submitNoShowRefund">确认退款</el-button>
      </template>
    </el-dialog>

    <!-- 右侧抽屉：订单流转日志 -->
    <el-drawer
      v-model="orderLogDrawer"
      title="订单流转日志"
      direction="rtl"
      size="540px"
      append-to-body
      destroy-on-close
      class="order-log-drawer"
    >
      <template #header>
        <div class="drawer-header-title">
          <el-icon><Tickets /></el-icon>
          <span>订单流转日志</span>
          <el-tag size="small" type="info" round class="ml_10">
            共 {{ (orderInfo.orderLogs || []).length }} 条记录
          </el-tag>
        </div>
      </template>

      <div class="drawer-log-body">
        <el-timeline v-if="orderInfo.orderLogs && orderInfo.orderLogs.length > 0">
          <el-timeline-item
            v-for="(log, idx) in orderInfo.orderLogs"
            :key="idx"
            :timestamp="log.createTime"
            placement="top"
            type="primary"
          >
            <div class="log-timeline-card">
              <div class="log-meta-line">
                <el-tag size="small" :type="getOperatorTagType(log.operatorType)">
                  {{ formatOperatorType(log.operatorType) }}
                </el-tag>
                <span class="operator-name font-mono">{{ log.operatorName || "系统" }}</span>
              </div>
              <div class="log-message-text">{{ log.message }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无订单流转日志" :image-size="80" />
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as API_Order from "@/api/order";
import { platformRefund, noShowRefund, getAppointmentOrderDetail } from "@/api/appointment";
import * as RegExp from "@/libs/RegExp.js";

import multipleMap from "@/components/map/multiple-map";
import { printElement } from "@/utils/print";
import { ElMessage, ElMessageBox } from "element-plus";
import { unitPrice, clientTypeWay } from "@/utils/filters";
import { formatCardKeyStatus } from "@/constants/cardKey";
import {
  Goods,
  Money,
  Location,
  Document,
  Clock,
  Tickets,
  Printer,
  CopyDocument,
  Refresh,
  ArrowLeft,
  TopRight,
  User,
  Edit,
  Check,
} from "@element-plus/icons-vue";

defineOptions({ name: "orderDetail" });

const route = useRoute();
const router = useRouter();

const modifyPriceFormRef = ref(null);
const orderCancelFormRef = ref(null);
const addressFormRef = ref(null);
const map = ref(null);

const printHiddenFlag = ref(false);
const loading = ref(false);
const addr = ref("");
let regionId = "";

const allowOperation = ref({});
const sn = ref("");
const orderInfo = ref({
  order: {
    priceDetailDTO: {},
  },
  orderLogs: [],
});
const appointmentExt = ref({});
const modal = ref(false);
const orderLogDrawer = ref(false);

const modifyPriceForm = reactive({ price: 0 });
const orderCancelForm = reactive({ reason: "" });
const orderCancelModal = ref(false);

const modifyPriceValidate = {
  price: [
    { required: true, message: "请输入合法的订单金额", trigger: "change" },
  ],
};

const orderCancelValidate = {
  reason: [{ required: true, message: "取消原因不能为空", trigger: "blur" }],
};

const addressModal = ref(false);
const printModal = ref(false);
const platformRefundModal = ref(false);
const noShowRefundModal = ref(false);
const refundLoading = ref(false);

const platformRefundForm = ref({
  refundType: "UNSERVED",
  refundAmount: 0,
  reason: "",
});
const noShowRefundForm = ref({
  refundAmount: 0,
  reason: "",
});

const addressForm = reactive({
  consigneeName: "",
  consigneeMobile: "",
  consigneeDetail: "",
  consigneeAddressPath: "",
  consigneeAddressIdPath: "",
});

const addressRule = {
  consigneeName: [{ required: true, message: "收货人姓名不能为空", trigger: "blur" }],
  consigneeMobile: [
    { required: true, message: "联系方式不能为空", trigger: "blur" },
    { pattern: RegExp.mobile, trigger: "blur", message: "请输入正确的手机号" },
  ],
  consigneeDetail: [{ required: true, message: "详细地址不能为空", trigger: "blur" }],
};

const data = ref([]);

const orderPriceDetail = computed(() => {
  const p = orderInfo.value?.order?.priceDetailDTO;
  if (!p) return {};
  if (typeof p === "string") {
    try {
      return JSON.parse(p);
    } catch (e) {
      return {};
    }
  }
  return p;
});

const formattedPrintMobile = computed(() => {
  const m = orderInfo.value?.order?.consigneeMobile;
  if (!m) return "-";
  if (printHiddenFlag.value) {
    return m.replace(/^(.{3})(?:\d+)(.{4})$/, "$1****$2");
  }
  return m;
});

const barcodeSvgBars = computed(() => {
  const bars = [];
  let currentX = 0;
  // 黑白交替条纹序列（确保打印机 100% 渲染真实矢量黑色条码）
  const widths = [2, 1, 3, 1, 2, 1, 1, 3, 2, 2, 1, 3, 1, 2, 1, 1, 2, 3, 1, 2, 3, 1, 1, 2, 2, 1, 3, 1, 2, 1, 3, 2, 1, 2, 1, 1, 3, 2, 1, 2, 3, 1, 2, 1, 3, 1];
  for (let i = 0; i < widths.length; i++) {
    const w = widths[i];
    if (i % 2 === 0) {
      bars.push({ x: currentX, width: w });
    }
    currentX += w;
  }
  return { bars, totalWidth: currentX };
});

const isECouponOrder = computed(() => {
  const t = orderInfo.value?.order?.orderType;
  return t === "E_COUPON" || route.query.orderType === "E_COUPON";
});
const isVirtualOrder = computed(() => {
  const t = orderInfo.value?.order?.orderType;
  return t === "VIRTUAL" || route.query.orderType === "VIRTUAL";
});
const isAppointmentOrder = computed(() => {
  const t = orderInfo.value?.order?.orderType;
  return t === "APPOINTMENT" || route.query.orderType === "APPOINTMENT";
});
const isNonPhysicalOrder = computed(() => {
  return isVirtualOrder.value || isECouponOrder.value || isAppointmentOrder.value;
});

const totalGoodsNum = computed(() => {
  if (!data.value || !data.value.length) return 0;
  return data.value.reduce((acc, cur) => acc + (cur.num || 0), 0);
});

// 订单履约步骤（带时间节点与状态）
const orderSteps = computed(() => {
  const order = orderInfo.value?.order || {};
  return [
    { title: "买家下单", desc: order.createTime || "已提交订单" },
    {
      title: "买家付款",
      desc: order.paymentTime || (order.payStatus === "PAID" ? "已付款" : "待买家支付"),
    },
    {
      title: "商家发货",
      desc: order.logisticsTime || (order.orderStatus === "DELIVERED" || order.orderStatus === "COMPLETED" ? "已发货" : "待发货"),
    },
    {
      title: "订单完成",
      desc: order.completeTime || (order.orderStatus === "COMPLETED" ? "交易完成" : "等待收货确认"),
    },
  ];
});

const currentStepIndex = computed(() => {
  const status = orderInfo.value?.order?.orderStatus;
  if (!status || status === "UNPAID") return 1;
  if (status === "PAID" || status === "UNDELIVERED") return 2;
  if (status === "DELIVERED") return 3;
  if (status === "COMPLETED") return 4;
  return 1;
});

const stepProcessStatus = computed(() => {
  const status = orderInfo.value?.order?.orderStatus;
  if (status === "CANCELLED") return "error";
  return "process";
});

const appointmentSlotText = computed(() => {
  const v = appointmentExt.value || {};
  if (!v.slotDate) return "";
  const date = String(v.slotDate).slice(0, 10);
  const slot = v.slotStartTime && v.slotEndTime ? `${v.slotStartTime}-${v.slotEndTime}` : "";
  return [date, slot].filter(Boolean).join(" ");
});

const appointmentFormGroups = computed(() => {
  return parseFormAnswerGroups(appointmentExt.value?.formAnswerJson);
});

const canPlatformRefund = computed(() => {
  const order = orderInfo.value?.order;
  return order && order.payStatus === "PAID" && order.orderStatus !== "CANCELLED";
});
const canNoShowRefund = computed(() => canPlatformRefund.value);

const ecouponCardKeyDelivered = computed(() => {
  return (data.value || []).some((item) => item.cardKeyDelivered);
});
const ecouponCardKeyRows = computed(() => {
  const rows = [];
  (data.value || []).forEach((item) => {
    (item.cardKeys || []).forEach((ck) => {
      rows.push({ ...ck });
    });
  });
  return rows;
});

function getOrderStatusTagType(status) {
  const map = {
    UNPAID: "warning",
    PAID: "primary",
    UNDELIVERED: "primary",
    DELIVERED: "success",
    COMPLETED: "success",
    CANCELLED: "info",
  };
  return map[status] || "info";
}

function isStepFinished(sIdx) {
  const status = orderInfo.value?.order?.orderStatus;
  if (status === "CANCELLED") return sIdx === 0;
  return sIdx < currentStepIndex.value;
}

function getStepStateClass(sIdx) {
  const status = orderInfo.value?.order?.orderStatus;
  if (status === "CANCELLED") {
    return sIdx === 0 ? "is-done" : "is-cancelled";
  }
  if (sIdx < currentStepIndex.value) return "is-done";
  if (sIdx === currentStepIndex.value) return "is-active";
  return "is-pending";
}

function formatAddress(path, detail) {
  const cleanPath = (path || "").replace(/,/g, " ").trim();
  const cleanDetail = (detail || "").trim();
  const full = [cleanPath, cleanDetail].filter(Boolean).join(" ");
  return full || "-";
}

function parseSpecs(specs) {
  if (!specs) return {};
  try {
    const obj = JSON.parse(specs);
    delete obj.images;
    return obj;
  } catch (e) {
    return {};
  }
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

function copyCardKey(row) {
  const text = `卡号：${row.cardNo || ""}\n卡密：${row.cardSecret || ""}`;
  copyText(text, "卡密信息");
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

function viewMember(memberId) {
  if (!memberId) return;
  const routeUrl = router.resolve({
    path: "/member-detail",
    query: { id: memberId },
  });
  if (routeUrl) {
    window.open(routeUrl.href, "_blank");
  }
}

function getOperatorTagType(type) {
  const map = {
    MEMBER: "success",
    STORE: "warning",
    MANAGER: "danger",
    SYSTEM: "info",
  };
  return map[type] || "primary";
}

function formatOperatorType(type) {
  const map = {
    MEMBER: "买家",
    STORE: "商家",
    MANAGER: "平台管理员",
    SYSTEM: "系统",
  };
  return map[type] || type || "系统";
}

function isGiftItem(row) {
  if (!row) return false;
  return row.promotionType === 'GIFT' || (Number(row.flowPrice) === 0 && row.promotionType === 'GIFT');
}

function getPromotionText(row) {
  let resultText = "";
  if (row && row.promotionType) {
    const type = row.promotionType.split(",");
    if (type.indexOf("GIFT") !== -1) resultText += "满赠赠品 ";
    if (type.indexOf("PINTUAN") !== -1) resultText += "拼团 ";
    if (type.indexOf("SECKILL") !== -1) resultText += "秒杀 ";
    if (type.indexOf("COUPON") !== -1) resultText += "优惠券 ";
    if (type.indexOf("FULL_DISCOUNT") !== -1) resultText += "满减 ";
    if (type.indexOf("POINTS_GOODS") !== -1) resultText += "积分商品 ";
  }
  return resultText === "" ? "未参与" : resultText.trim();
}

function confirmPrice() {
  ElMessageBox.confirm(
    "您确定要线下收款吗？该操作涉及库存变更，提交后请稍候刷新列表",
    "确认线下收款",
    { type: "warning" }
  ).then(() => {
    API_Order.orderPay(sn.value).then((res) => {
      if (res.success) {
        ElMessage.success("收款成功");
        getDataList();
      }
    });
  }).catch(() => {});
}

function getDataList() {
  loading.value = true;
  API_Order.orderDetail(sn.value).then((res) => {
    loading.value = false;
    if (res.success && res.result) {
      orderInfo.value = res.result;
      allowOperation.value = res.result.allowOperationVO || {};
      data.value = res.result.orderItems || [];
      if (isAppointmentOrder.value) {
        loadAppointmentExt();
      }
    }
  }).catch(() => {
    loading.value = false;
  });
}

function loadAppointmentExt() {
  getAppointmentOrderDetail(sn.value)
    .then((res) => {
      if (res.success) {
        appointmentExt.value = res.result || {};
      }
    })
    .catch(() => {
      appointmentExt.value = {};
    });
}

function parseFormAnswerGroups(formAnswerJson) {
  if (!formAnswerJson) return [];
  let d = formAnswerJson;
  if (typeof d === "string") {
    try {
      d = JSON.parse(d);
    } catch (e) {
      return [];
    }
  }
  const fields = Array.isArray(d?.fields) ? d.fields : [];
  const answers = Array.isArray(d?.answers) ? d.answers : [];
  return answers
    .map((group) => {
      const map = group && typeof group === "object" && !Array.isArray(group) ? group : {};
      const source = fields.length
        ? fields
        : Object.keys(map).map((key) => ({ fieldKey: key, fieldLabel: key }));
      return source
        .map((field) => ({
          fieldKey: field.fieldKey,
          fieldLabel: field.fieldLabel || field.fieldKey,
          value: map[field.fieldKey] ?? "",
        }))
        .filter((row) => row.value !== "" && row.value != null);
    })
    .filter((rows) => rows.length);
}

function modifyPrice() {
  modifyPriceForm.price = orderInfo.value.order.flowPrice || 0;
  modal.value = true;
}

function modifyPriceSubmit() {
  modifyPriceFormRef.value.validate((valid) => {
    if (valid) {
      API_Order.updateOrderPrice(sn.value, modifyPriceForm).then((res) => {
        if (res.success) {
          ElMessage.success("修改订单金额成功");
          modal.value = false;
          getDataList();
        }
      });
    }
  });
}

function selectedRegion(val) {
  if (val.type === "select") {
    addr.value = val.data.map((item) => item.name).join(",");
    regionId = val.data.map((item) => item.id).join(",");
  } else {
    addr.value = val.data.addr;
    regionId = val.data.addrId;
  }
}

function orderCancel() {
  orderCancelModal.value = true;
}

function orderCancelSubmit() {
  orderCancelFormRef.value.validate((valid) => {
    if (valid) {
      API_Order.orderCancel(sn.value, orderCancelForm).then((res) => {
        if (res.success) {
          ElMessage.success("取消成功");
          getDataList();
        }
        orderCancelModal.value = false;
      });
    }
  });
}

function openPlatformRefund() {
  platformRefundForm.value = {
    refundType: "UNSERVED",
    refundAmount: orderInfo.value?.order?.flowPrice || 0,
    reason: "",
  };
  platformRefundModal.value = true;
}

function submitPlatformRefund() {
  if (!platformRefundForm.value.reason) {
    ElMessage.warning("请填写退款原因");
    return;
  }
  refundLoading.value = true;
  platformRefund(sn.value, platformRefundForm.value)
    .then((res) => {
      if (res.success) {
        ElMessage.success("退款成功");
        platformRefundModal.value = false;
        getDataList();
      }
    })
    .finally(() => {
      refundLoading.value = false;
    });
}

function openNoShowRefund() {
  noShowRefundForm.value = {
    refundAmount: orderInfo.value?.order?.flowPrice || 0,
    reason: "",
  };
  noShowRefundModal.value = true;
}

function submitNoShowRefund() {
  if (!noShowRefundForm.value.reason) {
    ElMessage.warning("请填写退款原因");
    return;
  }
  refundLoading.value = true;
  noShowRefund(sn.value, noShowRefundForm.value)
    .then((res) => {
      if (res.success) {
        ElMessage.success("退款成功");
        noShowRefundModal.value = false;
        getDataList();
      }
    })
    .finally(() => {
      refundLoading.value = false;
    });
}

function printOrder() {
  printModal.value = true;
}

function printHiddenInfo() {
  printHiddenFlag.value = !printHiddenFlag.value;
}

function handlePrintInvoice() {
  printElement("printInfo", "发货单");
}

function editAddress() {
  addressModal.value = true;
  addr.value = orderInfo.value.order.consigneeAddressPath;
  regionId = orderInfo.value.order.consigneeAddressIdPath;
  addressForm.consigneeName = orderInfo.value.order.consigneeName;
  addressForm.consigneeMobile = orderInfo.value.order.consigneeMobile;
  addressForm.consigneeDetail = orderInfo.value.order.consigneeDetail;
  addressForm.consigneeAddressPath = orderInfo.value.order.consigneeAddressPath;
  addressForm.consigneeAddressIdPath = orderInfo.value.order.consigneeAddressIdPath;
}

function editAddressSubmit() {
  if (!regionId) {
    ElMessage.error("请选择地区");
    return;
  }
  addressForm.consigneeAddressPath = addr.value;
  addressForm.consigneeAddressIdPath = regionId;
  addressFormRef.value.validate((valid) => {
    if (valid) {
      API_Order.editOrderConsignee(sn.value, addressForm).then((res) => {
        if (res.success) {
          ElMessage.success("收货地址修改成功");
          addressModal.value = false;
          getDataList();
        }
      });
    }
  });
}

watch(
  () => route.query,
  () => {
    sn.value = route.query.sn;
    getDataList();
  }
);

onMounted(() => {
  sn.value = route.query.sn;
  getDataList();
});
</script>

<style lang="scss" scoped>
.order-detail-page {
  --detail-ink: #1e293b;
  --detail-muted: #748196;
  --detail-line: #e8edf4;
  width: 100%;
  max-width: 1680px;
  margin: 0 auto;
  padding: 8px 12px 32px;
  box-sizing: border-box;
  color: var(--detail-ink);

  .page-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 22px;
    h1 { margin: 0; font-size: 24px; font-weight: 650; line-height: 34px; letter-spacing: .5px; }
    p { margin: 5px 0 0; color: var(--detail-muted); font-size: 13px; line-height: 22px; }
    .back-btn { border-radius: 8px; color: #526078; }
  }

  .top-overview-card, .section-card {
    border: 1px solid var(--detail-line);
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 3px 12px rgba(31, 51, 82, .025);
  }

  .top-overview-card {
    margin-bottom: 20px;
    background: linear-gradient(115deg, #f5f9ff 0, #fff 58%);
    :deep(.el-card__body) { padding: 24px 26px; }
  }
  .overview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
  }
  .header-left {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    min-width: 0;
    .main-status-tag { height: 34px; padding: 0 14px; border-radius: 7px; font-size: 15px; font-weight: 600; }
    .sn-title-group { display: flex; align-items: center; min-width: 0; font-size: 13px; }
    .sn-label { color: var(--detail-muted); white-space: nowrap; }
    .sn-value { color: #22324b; font-size: 16px; font-weight: 650; overflow-wrap: anywhere; }
    .copy-icon-btn { margin-left: 4px; }
    .meta-tags { display: flex; gap: 6px; }
    .meta-tags .el-tag { background: #fff; border-color: #e1e8f0; color: #748196; border-radius: 4px; }
  }
  .header-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    .el-button { margin: 0; border-radius: 7px; font-size: 13px; }
  }

  .fulfillment-stepper {
    display: flex;
    align-items: center;
    margin-top: 24px;
    padding: 24px 8px 2px;
    border-top: 1px solid #e5edf8;
    gap: 12px;
    .step-item { display: flex; align-items: center; flex: 1; min-width: 0; }
    .step-item:last-child { flex: 0 0 auto; }
    .step-node { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
    .step-circle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      box-sizing: border-box;
      flex-shrink: 0;
      border-radius: 50%;
      border: 1px solid #dce3ed;
      background: #f7f9fc;
      color: #8b98ab;
      font-size: 14px;
      font-weight: 600;
    }
    .step-title { color: #8290a4; font-size: 14px; font-weight: 600; line-height: 22px; }
    .step-desc { margin-top: 4px; color: #8b98ab; font-size: 12px; line-height: 18px; font-variant-numeric: tabular-nums; }
    .step-connector { flex: 1; height: 2px; min-width: 16px; margin: 0 24px; background: #e8edf4; }
    .is-done {
      .step-circle { color: #20a684; background: #eaf8f2; border-color: #c7eadd; }
      .step-title { color: #45566b; }
      .step-connector { background: #b9e3d5; }
    }
    .is-active {
      .step-circle { background: #3875ed; border-color: #3875ed; color: #fff; box-shadow: 0 0 0 5px #eaf1ff; }
      .step-title, .step-desc { color: #326bdb; }
    }
    .is-cancelled .step-circle { color: #a3adbb; background: #f1f4f8; }
  }

  .info-grid-row {
    display: flex;
    flex-wrap: wrap;
    row-gap: 16px;
    margin-bottom: 20px;
    :deep(.el-col) { display: flex; }
  }
  .section-card {
    width: 100%;
    &.equal-card { display: flex; flex-direction: column; height: 100%; }
    &.equal-card :deep(.el-card__body) { flex: 1; }
    :deep(.el-card__header) { padding: 18px 22px; background: #fff; border-bottom: 1px solid var(--detail-line); }
    :deep(.el-card__body) { padding: 20px 22px; }
    .card-title, .flex-title { display: flex; align-items: center; gap: 10px; }
    .card-title { min-height: 24px; color: #25354b; font-size: 15px; font-weight: 600; }
    .card-title > .el-icon, .flex-title > .el-icon {
      box-sizing: content-box;
      padding: 6px;
      font-size: 16px;
      color: #4c7bdd;
      background: #eff4ff;
      border-radius: 7px;
    }
    .justify-between { justify-content: space-between; }
    .count-badge { margin-left: 4px; font-size: 12px; font-weight: 400; color: #748196; border: 0; background: #f3f5f9; }
  }
  .kv-list {
    display: flex;
    flex-direction: column;
    gap: 17px;
    .kv-row { display: flex; align-items: flex-start; gap: 12px; font-size: 13px; line-height: 22px; }
    .kv-label { width: 76px; flex-shrink: 0; color: var(--detail-muted); }
    .kv-val { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; flex: 1; min-width: 0; overflow-wrap: anywhere; }
    .address-val { line-height: 23px; }
    .flex-col { flex-direction: column; align-items: flex-start; gap: 4px; }
    .member-name-text { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .sub-pay-method, .f-label { font-size: 12px; color: var(--detail-muted); }
    .form-ans-line { font-size: 13px; line-height: 22px; }
  }
  .goods-table {
    --el-table-border-color: #edf1f6;
    --el-table-header-bg-color: #f7f9fc;
    --el-table-row-hover-bg-color: #f8faff;
    color: #43516a;
    :deep(th.el-table__cell) { height: 46px; background: #f7f9fc; color: #6b788d; font-size: 12px; font-weight: 500; }
    :deep(td.el-table__cell) { padding: 18px 0; }
    :deep(.cell) { padding-left: 16px; padding-right: 16px; }
  }
  .goods-item-cell {
    display: flex;
    align-items: center;
    gap: 16px;
    .goods-thumb { width: 68px; height: 68px; border-radius: 8px; border: 1px solid #e8edf4; flex-shrink: 0; }
    .goods-info { flex: 1; min-width: 0; }
    .goods-name { color: #26364d; font-size: 14px; font-weight: 600; line-height: 22px; overflow-wrap: anywhere; }
    .goods-specs { margin-top: 8px; display: flex; flex-wrap: wrap; gap: 6px; }
    .spec-tag { font-size: 12px; color: #7b8799; background: #f4f6f9; padding: 2px 8px; border-radius: 4px; }
  }
  .sub-header-title { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; font-weight: 600; }
  .sub-header-title .el-icon { color: #4c7bdd; }
  .goods-summary-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 24px;
    .summary-rows { width: 360px; max-width: 100%; padding: 20px 24px; box-sizing: border-box; background: #f7f9fc; border: 1px solid #edf1f7; border-radius: 10px; display: flex; flex-direction: column; gap: 12px; }
    .summary-item { display: flex; align-items: center; justify-content: space-between; gap: 16px; font-size: 13px; }
    .label { color: var(--detail-muted); }
    .value { font-weight: 500; }
    .summary-divider { height: 1px; background: #e1e7f0; margin: 4px 0; }
    .final-total { align-items: baseline; }
    .final-total .label { color: #334155; font-size: 14px; font-weight: 600; }
    .final-price { font-size: 26px; font-weight: 650; white-space: nowrap; letter-spacing: -.5px; }
  }
  .addr-select-line { display: flex; align-items: center; gap: 10px; }
  .text-danger { color: #e45454; }
  .text-success { color: #20a684; }
  .text-warning { color: #d9972b; }
  .text-primary { color: #3875ed; }
  .text-gray { color: #8b98ab; }
  .text-dark { color: #1e293b; }
  .font-bold { font-weight: 600; }
  .font-mono { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace; font-variant-numeric: tabular-nums; }
  .mt_16 { margin-top: 16px; }
  .mb_10 { margin-bottom: 10px; }
  .pr_12 { padding-right: 12px; }

  @media (max-width: 1440px) {
    padding: 6px 4px 28px;
    .overview-header { align-items: flex-start; }
    .header-actions { width: 100%; padding-top: 16px; border-top: 1px solid #e5edf8; }
    .fulfillment-stepper { margin-top: 20px; }
    .section-card :deep(.el-card__header), .section-card :deep(.el-card__body) { padding-left: 18px; padding-right: 18px; }
    .kv-list .kv-row { gap: 8px; }
    .kv-list .kv-label { width: 70px; }
    .fulfillment-stepper .step-connector { margin: 0 16px; }
  }
  @media (max-width: 1100px) {
    .info-grid-row :deep(.el-col) { width: 100%; max-width: 100%; flex: 0 0 100%; }
    .fulfillment-stepper .step-node { flex-direction: column; align-items: flex-start; gap: 10px; }
    .fulfillment-stepper .step-item { align-items: flex-start; }
    .fulfillment-stepper .step-connector { margin-top: 17px; }
    .fulfillment-stepper .step-desc { max-width: 120px; }
  }
  @media (max-width: 600px) {
    padding: 4px 0 20px;
    .page-heading { margin-bottom: 16px; }
    .page-heading h1 { font-size: 21px; }
    .page-heading p { max-width: 190px; }
    .top-overview-card :deep(.el-card__body) { padding: 18px 16px; }
    .header-left { gap: 10px; }
    .header-left .sn-title-group { width: 100%; }
    .header-left .sn-value { font-size: 13px; }
    .fulfillment-stepper { align-items: stretch; flex-direction: column; gap: 20px; padding: 20px 4px 0; }
    .fulfillment-stepper .step-item { flex: auto; }
    .fulfillment-stepper .step-node { flex-direction: row; align-items: center; }
    .fulfillment-stepper .step-desc { max-width: none; }
    .fulfillment-stepper .step-connector { display: none; }
    .goods-summary-footer .summary-rows { width: 100%; padding: 18px; }
    .goods-summary-footer .final-price { font-size: 23px; }
    .section-card .flex-title { flex-wrap: wrap; }
  }
}
</style>

<style lang="scss">
/* append-to-body 抽屉与弹窗需非 scoped 样式 */
.shipping-print-dialog {
  .el-dialog__header {
    margin-right: 0 !important;
    padding: 14px 20px !important;
    border-bottom: 1px solid #e2e8f0;
  }
  .el-dialog__body {
    padding: 16px !important;
    background: #f1f5f9 !important;
  }
  .el-dialog__footer {
    padding: 12px 20px !important;
    border-top: 1px solid #e2e8f0;
    background: #ffffff;
  }

  .print-header-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    .print-title-group {
      display: flex;
      align-items: center;
      gap: 10px;

      .el-icon {
        color: #ff6a00;
        font-size: 18px;
      }

      .dialog-title {
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
      }
    }
  }

  .print-preview-container {
    max-height: 72vh;
    overflow-y: auto;
    overflow-x: auto;
    display: flex;
    justify-content: center;
    padding: 12px 16px;

    .shipping-invoice-paper {
      width: 100%;
      max-width: 820px;
      min-width: 700px;
      box-sizing: border-box !important;
      background: #ffffff;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      border-radius: 4px;

      * {
        box-sizing: border-box !important;
      }

      .invoice-wrap {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif;
        color: #000;
        padding: 20px 20px;
        background: #fff;
        line-height: 1.4;
        font-size: 12px;
        width: 100% !important;
        box-sizing: border-box !important;

        .inv-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding-bottom: 12px;
          border-bottom: 2px solid #000;
          margin-bottom: 12px;

          .inv-title-box h2 {
            margin: 0 0 4px;
            font-size: 20px;
            font-weight: 700;
            color: #000;
            letter-spacing: 1px;
          }
          .inv-sub-title {
            font-size: 11px;
            color: #555;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .inv-meta-right {
            text-align: right;

            .barcode-svg {
              display: inline-block;
            }
            .barcode-text {
              font-family: monospace;
              font-size: 13px;
              font-weight: 700;
              margin-top: 2px;
              letter-spacing: 1px;
              color: #000;
            }
          }
        }

        .inv-meta-table {
          width: 100% !important;
          table-layout: fixed !important;
          border-collapse: collapse;
          border: 1px solid #000;
          margin-bottom: 12px;
          box-sizing: border-box !important;

          td {
            border: 1px solid #000;
            padding: 6px 8px;
            font-size: 12px;
            line-height: 18px;
            word-break: break-all;
            overflow-wrap: break-word;
          }
          .m-k {
            width: 72px;
            background: #f3f4f6;
            font-weight: 600;
            color: #111;
            text-align: center;
            white-space: nowrap;
          }
          .m-v {
            color: #000;
          }
        }

        .inv-table {
          width: 100% !important;
          table-layout: fixed !important;
          border-collapse: collapse;
          border: 1px solid #000;
          margin-bottom: 0 !important;
          box-sizing: border-box !important;

          th {
            background: #f3f4f6;
            color: #000;
            font-weight: 700;
            text-align: center;
            padding: 7px 4px;
            border: 1px solid #000;
          }
          td {
            padding: 6px 4px;
            border: 1px solid #000;
            color: #000;
            vertical-align: middle;
            word-break: break-all;
            overflow-wrap: break-word;
          }
          .goods-title {
            font-weight: 600;
            line-height: 1.35;
          }
          .goods-specs {
            font-size: 11px;
            color: #444;
            margin-top: 2px;
          }
          .check-box-square {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 1.5px solid #000;
            border-radius: 2px;
          }
        }

        .inv-summary-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #f9fafb;
          border: 1px solid #000;
          border-top: none;
          margin-top: -1px;
          margin-bottom: 16px;
          font-size: 12px;
          box-sizing: border-box !important;

          .inv-summary-left {
            color: #222;
            font-weight: 600;
          }
          .inv-summary-right {
            display: flex;
            gap: 16px;
            align-items: baseline;

            .sum-item {
              display: flex;
              align-items: baseline;
              gap: 4px;
            }
            .sum-total {
              font-size: 15px;
              font-weight: 700;
              color: #000;
            }
          }
        }

        .inv-sign-area {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          padding: 12px 6px 8px;
          border-top: 1px dashed #666;
          font-size: 12px;
          color: #222;
          margin-bottom: 8px;

          .sign-line {
            border-bottom: 1px solid #000;
            display: inline-block;
            width: 85px;
            height: 16px;
            vertical-align: middle;
            margin-left: 4px;
          }
        }

        .inv-footer-note {
          text-align: center;
          font-size: 11px;
          color: #666;
          padding-top: 6px;
          border-top: 1px solid #e5e7eb;
        }
      }
    }
  }

  .dialog-footer-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .print-tip-text {
      font-size: 13px;
      color: #64748b;
    }
  }
}

.order-log-drawer {
  .el-drawer__header {
    margin-bottom: 0 !important;
    padding: 16px 20px !important;
    border-bottom: 1px solid #e8eaec !important;

    .drawer-header-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;

      .el-icon {
        color: #ff6a00;
        font-size: 18px;
      }
    }
  }

  .el-drawer__body {
    padding: 20px 24px 30px !important;
    overflow-y: auto !important;
    background: #f8fafc !important;
  }

  .drawer-log-body {
    padding: 4px 6px;

    .el-timeline-item {
      padding-bottom: 18px;
    }

    .el-timeline-item__timestamp {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 8px;
      font-family: monospace;
    }

    .log-timeline-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      transition: all 0.2s ease;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        border-color: #cbd5e1;
      }

      .log-meta-line {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;

        .operator-name {
          font-size: 13px;
          color: #475569;
          font-weight: 600;
        }
      }

      .log-message-text {
        font-size: 13px;
        color: #1e293b;
        line-height: 1.6;
        word-break: break-all;
      }
    }
  }
}
</style>
