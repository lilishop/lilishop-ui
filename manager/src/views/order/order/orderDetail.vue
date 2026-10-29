<template>
  <div class="order-detail-page">
    <!-- 顶部导航与快捷操作栏 -->
    <div class="page-top-nav">
      <el-page-header :icon="ArrowLeft" title="返回订单列表" @back="goBack">
        <template #content>
          <div class="nav-content">
            <span class="page-title">订单详情</span>
            <span class="page-sn font-mono">{{ sn }}</span>
          </div>
        </template>
        <template #extra>
          <div class="nav-actions">
            <el-button v-if="allowOperation.editPrice" @click="modifyPrice">调整价格</el-button>
            <el-button v-if="allowOperation.editConsignee" plain type="primary" @click="editAddress">修改收件信息</el-button>
            <el-button v-if="allowOperation.cancel" plain type="warning" @click="orderCancel">取消订单</el-button>
            <el-button v-if="isAppointmentOrder && canPlatformRefund" plain type="danger" @click="openPlatformRefund">平台退款</el-button>
            <el-button v-if="isAppointmentOrder && canNoShowRefund" plain type="danger" @click="openNoShowRefund">爽约退款</el-button>
            <el-button v-if="orderInfo.order.orderStatus === 'UNPAID'" type="primary" @click="confirmPrice">确认收款</el-button>
            <el-button plain :icon="Tickets" @click="orderLogDrawer = true">订单日志</el-button>
            <el-button v-if="!isNonPhysicalOrder" plain type="primary" :icon="Printer" @click="printOrder">打印发货单</el-button>
            <el-button :icon="Refresh" @click="getDataList">刷新</el-button>
          </div>
        </template>
      </el-page-header>
    </div>

    <!-- 顶部状态看板 + 履约生命周期步骤条 -->
    <el-card shadow="never" class="status-header-card">
      <div class="header-main">
        <div class="status-summary-left">
          <div class="status-badge-wrap">
            <el-tag
              :type="getOrderStatusTagType(orderInfo.order.orderStatus)"
              effect="dark"
              size="large"
              class="status-tag"
            >
              {{ orderInfo.orderStatusValue || "加载中..." }}
            </el-tag>
            <el-tag type="info" size="large" class="type-tag">
              {{ clientTypeWay(orderInfo.order.clientType) }}
            </el-tag>
            <el-tag v-if="orderInfo.paymentMethodValue" type="success" size="large" class="type-tag">
              {{ orderInfo.paymentMethodValue }}
            </el-tag>
          </div>

          <div class="sn-info-wrap">
            <span class="sn-label">订单编号：</span>
            <span class="sn-text font-mono">{{ orderInfo.order.sn }}</span>
            <el-tooltip content="复制订单编号" placement="top">
              <el-button
                link
                type="primary"
                :icon="CopyDocument"
                class="copy-btn"
                @click="copyText(orderInfo.order.sn, '订单编号')"
              />
            </el-tooltip>
          </div>

          <div v-if="orderInfo.order.createTime" class="create-time-text">
            下单时间：{{ orderInfo.order.createTime }}
          </div>
        </div>

        <div class="status-metrics-right">
          <div class="metric-block">
            <span class="metric-label">订单应付总额</span>
            <span class="metric-val text-danger">
              ¥ {{ unitPrice(orderInfo.order.flowPrice) }}
            </span>
          </div>
          <div class="metric-divider"></div>
          <div class="metric-block">
            <span class="metric-label">支付状态</span>
            <span class="metric-val" :class="orderInfo.order.payStatus === 'PAID' ? 'text-success' : 'text-warning'">
              {{ orderInfo.order.payStatus === 'PAID' ? '已付款' : '待付款' }}
            </span>
          </div>
          <div class="metric-divider"></div>
          <div class="metric-block">
            <span class="metric-label">商品总件数</span>
            <span class="metric-val text-dark">
              {{ totalGoodsNum }} <small>件</small>
            </span>
          </div>
        </div>
      </div>

      <!-- 订单履约生命周期步骤条（带时间戳） -->
      <div class="lifecycle-steps-wrap">
        <el-steps
          :active="currentStepIndex"
          :status="stepProcessStatus"
          finish-status="success"
          align-center
        >
          <el-step
            v-for="(step, sIdx) in orderSteps"
            :key="sIdx"
            :title="step.title"
            :description="step.desc"
          />
        </el-steps>
      </div>
    </el-card>

    <!-- 主体两栏布局 -->
    <el-row :gutter="18" class="content-row">
      <!-- 左侧：商品明细、费用结算、以及内嵌流转日志 -->
      <el-col :xs="24" :sm="24" :md="15" :lg="15" :xl="16">
        <!-- 1. 商品表格卡片 -->
        <el-card shadow="never" class="section-card">
          <template #header>
            <div class="card-title">
              <el-icon><Goods /></el-icon>
              <span>商品清单 ({{ data.length }} 项)</span>
            </div>
          </template>

          <el-table
            v-loading="loading"
            border
            :data="data"
            class="goods-table"
            style="width: 100%"
          >
            <el-table-column label="商品信息" min-width="260">
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

            <el-table-column label="优惠活动" min-width="110" align="center">
              <template #default="{ row }">
                <el-tag v-if="getPromotionText(row) !== '未参与'" size="small" type="warning">
                  {{ getPromotionText(row) }}
                </el-tag>
                <span v-else class="text-gray">-</span>
              </template>
            </el-table-column>

            <el-table-column label="单价" width="115" align="center">
              <template #default="{ row }">
                <span class="font-bold">¥ {{ Number(row.unitPrice || 0).toFixed(2) }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="num" label="数量" width="80" align="center" />

            <el-table-column prop="returnGoodsNumber" label="已退款" width="85" align="center">
              <template #default="{ row }">
                <span :class="row.returnGoodsNumber > 0 ? 'text-danger font-bold' : 'text-gray'">
                  {{ row.returnGoodsNumber || 0 }}
                </span>
              </template>
            </el-table-column>

            <el-table-column label="小计" width="120" align="center">
              <template #default="{ row }">
                <span class="text-danger font-bold">¥ {{ Number(row.flowPrice || 0).toFixed(2) }}</span>
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
      </el-col>

      <!-- 右侧：买家画像、收件信息、发票与预约 -->
      <el-col :xs="24" :sm="24" :md="9" :lg="9" :xl="8">
        <!-- 1. 买家画像卡片 -->
        <el-card shadow="never" class="section-card side-card">
          <template #header>
            <div class="card-title">
              <el-icon><User /></el-icon>
              <span>买家信息</span>
            </div>
          </template>

          <div class="side-info-list">
            <div class="side-info-item">
              <span class="item-label">买家账号</span>
              <div class="item-value font-bold">
                <span>{{ orderInfo.order.memberName || "匿名买家" }}</span>
              </div>
            </div>

            <div v-if="orderInfo.order.storeName" class="side-info-item">
              <span class="item-label">成交店铺</span>
              <div class="item-value font-bold text-dark">{{ orderInfo.order.storeName }}</div>
            </div>
          </div>
        </el-card>

        <!-- 2. 收货与配送信息卡片 -->
        <el-card shadow="never" class="section-card side-card">
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

          <div class="side-info-list">
            <template v-if="!isECouponOrder && orderInfo.order.deliveryMethod != 'SELF_PICK_UP'">
              <div class="side-info-item">
                <span class="item-label">收货人</span>
                <div class="item-value font-bold">{{ orderInfo.order.consigneeName || "-" }}</div>
              </div>

              <div class="side-info-item">
                <span class="item-label">联系电话</span>
                <div class="item-value">
                  <span class="font-mono">{{ orderInfo.order.consigneeMobile || "-" }}</span>
                  <el-tooltip v-if="orderInfo.order.consigneeMobile" content="复制手机号" placement="top">
                    <el-button
                      link
                      type="primary"
                      :icon="CopyDocument"
                      @click="copyText(orderInfo.order.consigneeMobile, '手机号')"
                    />
                  </el-tooltip>
                </div>
              </div>

              <div class="side-info-item">
                <span class="item-label">收货详细地址</span>
                <div class="item-value address-text">
                  {{ orderInfo.order.consigneeAddressPath || "" }} {{ orderInfo.order.consigneeDetail || "" }}
                </div>
              </div>
            </template>

            <div v-else-if="orderInfo.order.deliveryMethod === 'SELF_PICK_UP'" class="side-info-item">
              <span class="item-label">履约方式</span>
              <div class="item-value font-bold text-success">买家自提</div>
            </div>

            <div v-if="!isNonPhysicalOrder" class="side-info-item">
              <span class="item-label">配送方式</span>
              <div class="item-value">{{ orderInfo.deliveryMethodValue || "-" }}</div>
            </div>

            <div class="side-divider"></div>

            <div class="side-info-item">
              <span class="item-label">买家留言</span>
              <div class="item-value remark-text">
                {{ orderInfo.order.remark || "暂无买家留言" }}
              </div>
            </div>
          </div>
        </el-card>

        <!-- 3. 发票信息卡片 -->
        <el-card shadow="never" class="section-card side-card">
          <template #header>
            <div class="card-title">
              <el-icon><Document /></el-icon>
              <span>发票信息</span>
            </div>
          </template>

          <div v-if="orderInfo.order.needReceipt" class="side-info-list">
            <div class="side-info-item">
              <span class="item-label">发票抬头</span>
              <div class="item-value font-bold">{{ orderInfo.receipt?.receiptTitle || "-" }}</div>
            </div>

            <div v-if="orderInfo.receipt?.taxpayerId" class="side-info-item">
              <span class="item-label">纳税人识别号</span>
              <div class="item-value font-mono">{{ orderInfo.receipt.taxpayerId }}</div>
            </div>

            <div class="side-info-item">
              <span class="item-label">发票内容</span>
              <div class="item-value">{{ orderInfo.receipt?.receiptContent || "-" }}</div>
            </div>

            <div class="side-info-item">
              <span class="item-label">发票金额</span>
              <div class="item-value text-danger font-bold font-mono">
                ¥ {{ Number(orderInfo.receipt?.receiptPrice || 0).toFixed(2) }}
              </div>
            </div>

            <div class="side-info-item">
              <span class="item-label">开票状态</span>
              <div class="item-value">
                <el-tag size="small" :type="orderInfo.receipt?.receiptStatus === 1 ? 'success' : 'info'">
                  {{ orderInfo.receipt?.receiptStatus === 1 ? "已开票" : "未开票" }}
                </el-tag>
              </div>
            </div>
          </div>
          <div v-else class="empty-receipt-box">
            <span class="text-gray">本订单买家未申请发票</span>
          </div>
        </el-card>

        <!-- 4. 预约订单信息（若是预约服务） -->
        <el-card v-if="isAppointmentOrder" shadow="never" class="section-card side-card">
          <template #header>
            <div class="card-title">
              <el-icon><Clock /></el-icon>
              <span>预约服务信息</span>
            </div>
          </template>

          <div class="side-info-list">
            <div v-if="appointmentSlotText" class="side-info-item">
              <span class="item-label">预约服务时段</span>
              <div class="item-value font-bold text-primary">{{ appointmentSlotText }}</div>
            </div>

            <template v-for="(rows, gi) in appointmentFormGroups" :key="'form-' + gi">
              <div class="side-info-item">
                <span class="item-label">{{ appointmentFormGroups.length > 1 ? `补充信息 ${gi + 1}` : '预约补充信息' }}</span>
                <div class="item-value flex-col">
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
          <el-input v-model="orderCancelForm.reason" type="textarea" :rows="3" placeholder="请输入取消订单的具体原因" />
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

function getPromotionText(row) {
  let resultText = "";
  if (row && row.promotionType) {
    const type = row.promotionType.split(",");
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

      .page-sn {
        font-size: 13px;
        color: #94a3b8;
      }
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
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

      &.justify-between {
        justify-content: space-between;
        width: 100%;
      }

      .flex-title {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }

  // 商品列表单元格
  .goods-item-cell {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 0;

    .goods-thumb {
      width: 60px;
      height: 60px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      flex-shrink: 0;
    }

    .goods-info {
      flex: 1;
      min-width: 0;

      .goods-name {
        font-size: 13px;
        font-weight: 600;
        color: #1e293b;
        line-height: 18px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .goods-specs {
        margin-top: 6px;
        display: flex;
        flex-wrap: wrap;
        gap: 6px;

        .spec-tag {
          font-size: 11px;
          color: #64748b;
          background: #f1f5f9;
          padding: 1px 6px;
          border-radius: 3px;
        }
      }
    }
  }

  .sub-header-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 10px;

    .el-icon {
      color: #ff6a00;
    }
  }

  // 商品清单底部金额汇总排版
  .goods-summary-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px solid #f1f5f9;

    .summary-rows {
      width: 330px;
      display: flex;
      flex-direction: column;
      gap: 10px;

      .summary-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 13px;

        .label {
          color: #64748b;
        }

        .value {
          color: #1e293b;
          font-weight: 500;
        }

        &.final-total {
          padding-top: 6px;
          align-items: baseline;

          .label {
            font-size: 14px;
            font-weight: 600;
            color: #1e293b;
          }

          .final-price {
            font-size: 22px;
            font-weight: 700;
          }
        }
      }

      .summary-divider {
        height: 1px;
        background: #e2e8f0;
        margin: 4px 0;
      }
    }
  }

  // 侧边栏卡片
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

          &.address-text,
          &.remark-text {
            line-height: 20px;
            color: #334155;
          }

          &.flex-col {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        .form-ans-line {
          font-size: 13px;
          color: #334155;
          line-height: 20px;

          .f-label {
            color: #64748b;
          }
        }
      }

      .side-divider {
        height: 1px;
        background: #f1f5f9;
        margin: 4px 0;
      }
    }

    .empty-receipt-box {
      padding: 10px 0;
    }
  }

  .addr-select-line {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .text-danger { color: #ef4444; }
  .text-success { color: #10b981; }
  .text-warning { color: #f59e0b; }
  .text-primary { color: #2563eb; }
  .text-gray { color: #94a3b8; }
  .text-dark { color: #0f172a; }
  .font-bold { font-weight: 600; }
  .font-mono { font-family: monospace; }
  .mt_16 { margin-top: 16px; }
  .mb_10 { margin-bottom: 10px; }
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
