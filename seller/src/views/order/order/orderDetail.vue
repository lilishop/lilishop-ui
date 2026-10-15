<template>
  <div class="search">
    <div>
      <el-card style="height: 60px">
        <div>
          <el-button v-if="allowOperation.editPrice" type="primary" @click="modifyPrice">调整价格</el-button>
          <el-button v-if="showDelivery && allowOperation.editConsignee" type="primary" @click="editAddress">修改收货地址</el-button>
          <el-button
            v-if="showDelivery && (allowOperation.showLogistics || orderPackages.length > 0)"
            type="primary"
            @click="checkLogistics"
          >查看物流</el-button>
          <el-button type="primary" @click="orderLog">订单日志</el-button>
          <el-button v-if="canOrderTake" type="primary" @click="orderTake">
            {{ isAppointmentOrder ? "预约核销" : "订单核销" }}
          </el-button>
          <el-button v-if="showDelivery && canShip" type="primary" @click="openFulfill()">发货</el-button>
          <el-button type="primary" @click="modifyRemark">添加备注</el-button>
          <el-button
            v-if="showDelivery && allowOperation.showLogistics && logisticsType === 'SHUNFENG'"
            type="primary"
            plain
            @click="sfPrint"
          >下载面单</el-button>
          <el-button
            v-if="showDelivery && canShip && logisticsType !== 'SHUNFENG'"
            type="primary"
            plain
            @click="toPrint"
          >打印电子面单</el-button>
          <el-button
            v-if="showDelivery"
            type="primary"
            plain
            style="float: right"
            @click="printOrder"
          >打印发货单</el-button>
        </div>
      </el-card>
      <el-card class="mt_10">
        <div class="order-info-grid">
        <div class="order-info-col">
          <div class="div-item">
            <div class="div-item-left">订单号：</div>
            <div class="div-item-right">{{ orderInfo.order.sn }}</div>
          </div>
          <div class="div-item">
            <div class="div-item-left">订单来源：</div>
            <div class="div-item-right">
              {{ $filters.clientTypeWay(orderInfo.order.clientType) }}
            </div>
          </div>
          <div class="div-item">
            <div class="div-item-left">订单备注：</div>
            <div class="div-item-right">{{ orderInfo.order.sellerRemark || "暂无" }}</div>
          </div>

          <div class="div-item">
            <div class="div-item-left">订单状态：</div>
            <div class="div-item-right">
              {{ orderInfo.orderStatusValue }}
            </div>
          </div>

          <div class="div-item">
            <div class="div-item-left">下单时间：</div>
            <div class="div-item-right">
              {{ orderInfo.order.createTime }}
            </div>
          </div>
          <div class="div-item" v-if="orderInfo.order.verificationCode && !isAppointmentOrder && !isECouponOrder">
            <div class="div-item-left">核验码：</div>
            <div class="div-item-right">{{ orderInfo.order.verificationCode }}</div>
          </div>
          <div class="div-item" v-if="isAppointmentOrder && appointmentVerification.totalCount">
            <div class="div-item-left">核销进度：</div>
            <div class="div-item-right">
              {{ appointmentVerification.verifiedCount || 0 }}/{{ appointmentVerification.totalCount }}
              <span v-if="appointmentVerification.workOrderStatus" style="margin-left: 8px; color: #909399">
                工单：{{ appointmentWorkOrderStatusText }}
              </span>
            </div>
          </div>
          <div class="div-item" v-if="isAppointmentOrder && appointmentSlotText">
            <div class="div-item-left">预约时段：</div>
            <div class="div-item-right">{{ appointmentSlotText }}</div>
          </div>
          <div
            class="div-item"
            v-for="(rows, gi) in appointmentFormGroups"
            :key="'form-' + gi"
          >
            <div class="div-item-left">{{ appointmentFormGroups.length > 1 ? `补充信息${gi + 1}：` : '补充信息：' }}</div>
            <div class="div-item-right">
              <div v-for="row in rows" :key="row.fieldKey">{{ row.fieldLabel }}：{{ row.value }}</div>
            </div>
          </div>
        </div>
        <div class="order-info-col" v-if="showInvoice">
          <div class="div-item" v-if="orderInfo.order.needReceipt == false">
            <div class="div-item-left">发票信息：</div>
            <div class="div-item-right">暂无发票信息</div>
          </div>

          <div class="div-item" v-if="orderInfo.order.needReceipt == true">
            <div class="div-item-left">发票抬头：</div>
            <div class="div-item-right">
              {{
                orderInfo.receipt && orderInfo.receipt.receiptTitle ? orderInfo.receipt.receiptTitle : "暂无"
              }}
            </div>
          </div>

          <div class="div-item"
            v-if="orderInfo.order.needReceipt == true && orderInfo.receipt && orderInfo.receipt.taxpayerId">
            <div class="div-item-left">发票税号：</div>
            <div class="div-item-right">
              {{ orderInfo.receipt && orderInfo.receipt.taxpayerId ? orderInfo.receipt.taxpayerId : "暂无" }}
            </div>
          </div>

          <div class="div-item" v-if="orderInfo.order.needReceipt == true">
            <div class="div-item-left">发票内容：</div>
            <div class="div-item-right">
              {{
                orderInfo.receipt && orderInfo.receipt.receiptContent
                ? orderInfo.receipt.receiptContent
                : "暂无"
              }}
            </div>
          </div>

          <div class="div-item" v-if="orderInfo.order.needReceipt == true">
            <div class="div-item-left">发票金额：</div>
            <div class="div-item-right">

              <priceColorScheme  v-if="orderInfo.receipt && orderInfo.receipt.receiptPrice" :value="orderInfo.receipt.receiptPrice" :color="$mainColor"></priceColorScheme>
              <span v-else>暂无</span>

            </div>
          </div>

          <div class="div-item" v-if="orderInfo.order.needReceipt == true">
            <div class="div-item-left">是否开票：</div>
            <div class="div-item-right">
              {{ orderInfo.receipt ? (orderInfo.receipt.receiptStatus == 0 ? "未开" : "已开") : "空" }}
            </div>
          </div>
        </div>
        <div class="order-info-col">
          <div class="div-item" v-if="showDelivery && orderInfo.order.deliveryMethod != 'SELF_PICK_UP'">
            <div class="div-item-left">收货信息：</div>
            <div class="div-item-right">
              {{ orderInfo.order.consigneeName }}
              {{ orderInfo.order.consigneeMobile }}
              {{ orderInfo.order.consigneeAddressPath }}
              {{ orderInfo.order.consigneeDetail }}
            </div>
          </div>
          <div class="div-item" v-if="showDelivery && orderInfo.order.deliveryMethod == 'SELF_PICK_UP'">
            <div class="div-item-left">自提信息：</div>
            <div class="div-item-right">
              {{ orderInfo.order.storeAddressPath }}
              {{ orderInfo.order.storeAddressMobile }}
            </div>
          </div>
          <div class="div-item">
            <div class="div-item-left">支付方式：</div>
            <div class="div-item-right">
              {{ orderInfo.paymentMethodValue }}
            </div>
          </div>

          <div class="div-item">
            <div class="div-item-left">买家留言：</div>
            <div class="div-item-right">{{ orderInfo.order.remark }}</div>
          </div>

          <div class="div-item" v-if="showDelivery">
            <div class="div-item-left">配送方式：</div>
            <div class="div-item-right">
              {{ orderInfo.deliveryMethodValue }}
            </div>
          </div>
        </div>
        </div>
      </el-card>
      <el-card v-if="showDelivery && orderPackages.length" class="mt_10 order-goods-card">
        <el-divider content-position="left">发货记录</el-divider>
        <el-table :data="orderPackages" border style="width: 100%">
          <el-table-column label="发货方式" width="120">
            <template #default="{ row }">{{ getFulfillmentModeLabel(row.fulfillmentMode) }}</template>
          </el-table-column>
          <el-table-column label="物流信息" min-width="220">
            <template #default="{ row }">
              <template v-if="isNoDeliveryPackage(row)">
                <span>无需配送</span>
                <span v-if="row.deliveryRemark" class="delivery-remark-text">（{{ row.deliveryRemark }}）</span>
              </template>
              <template v-else>
                {{ row.logisticsName || "-" }} / {{ row.logisticsNo || "-" }}
              </template>
            </template>
          </el-table-column>
          <el-table-column prop="logisticsTime" label="发货时间" width="170" />
          <el-table-column label="商品明细" min-width="260">
            <template #default="{ row }">
              <div v-for="(item, idx) in row.orderPackageItemList || []" :key="idx" class="package-item-line">
                {{ item.goodsName }} × {{ item.deliverNumber }}
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <el-card class="mt_10 order-goods-card">
        <div v-loading="loading" class="order-fit-wrap">
          <table class="order-fit-table">
            <colgroup>
              <col style="width: 40%" />
              <col style="width: 18%" />
              <col style="width: 12%" />
              <col style="width: 8%" />
              <col style="width: 12%" />
              <col style="width: 10%" />
            </colgroup>
            <thead>
              <tr>
                <th>商品</th>
                <th>优惠</th>
                <th>单价</th>
                <th>数量</th>
                <th>退款数量</th>
                <th>小计</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in data" :key="row.sn || row.id">
                <td>
                  <div class="order-goods-cell">
                    <img :src="row.image" class="order-goods-img" />
                    <div class="order-goods-meta">
                      <div class="div-zoom">
                        <a class="link-text" @click="linkTo(row.goodsId, row.skuId)">{{ row.goodsName }}</a>
                      </div>
                      <span v-for="(item, key) in parseOrderItemSpecs(row.specs)" :key="key">
                        <span v-show="key != 'images'" class="order-goods-spec">{{ key }} : {{ item }}</span>
                      </span>
                      <el-popover trigger="hover" title="扫码在手机中查看" width="180">
                        <template #reference>
                          <img src="../../../assets/qrcode.svg" class="hover-pointer" width="20" height="20" alt="" />
                        </template>
                        <vue-qr :text="wapLinkTo(row.goodsId, row.skuId)" :margin="0" colorDark="#000" colorLight="#fff" :size="150" />
                      </el-popover>
                    </div>
                  </div>
                </td>
                <td>{{ getPromotionText(row) }}</td>
                <td>{{ $filters.unitPrice(row.unitPrice || 0, "￥") }}</td>
                <td>{{ row.num }}</td>
                <td>{{ row.returnGoodsNumber }}</td>
                <td>{{ $filters.unitPrice(row.flowPrice, "￥") }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 卡密信息（当前订单 orderItems；满赠赠品卡密在赠品子单详情查看） -->
        <div v-if="hasCardKeySection" class="ecoupon-card-keys mt_10">
          <h4>卡密信息</h4>
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
            <div v-else-if="line.cardKeys.length" class="order-fit-wrap mb_10">
              <table class="order-fit-table">
                <colgroup>
                  <col style="width: 8%" />
                  <col style="width: 16%" />
                  <col style="width: 36%" />
                  <col style="width: 20%" />
                  <col style="width: 10%" />
                  <col style="width: 10%" />
                </colgroup>
                <thead>
                  <tr>
                    <th>序号</th>
                    <th>卡号</th>
                    <th>卡密</th>
                    <th>发卡时间</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in lineCardKeyRows(line)" :key="row.id || row.cardNo || index">
                    <td>{{ index + 1 }}</td>
                    <td>{{ row.cardNo }}</td>
                    <td class="card-secret-cell">{{ row.cardSecret }}</td>
                    <td>{{ row.allocatedTime }}</td>
                    <td>{{ formatCardKeyStatus(row.status || 'ALLOCATED') }}</td>
                    <td>
                      <el-button link type="primary" class="card-key-copy" @click="copyCardKey(row)">复制</el-button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="goods-total">
          <ul>
            <li>
              <span class="label">商品总额：</span>
              <span class="txt">{{
                $filters.unitPrice(orderInfo.order.priceDetailDTO.goodsPrice, "￥")
              }}</span>
            </li>
            <li v-if="
              orderInfo.order.priceDetailDTO.discountPrice &&
              orderInfo.order.priceDetailDTO.discountPrice > 0
            ">
              <span class="label">优惠金额：</span>
              <span class="txt">
                {{ $filters.unitPrice(orderInfo.order.priceDetailDTO.discountPrice, "￥") }}</span>
            </li>

            <li v-if="
              orderInfo.order.priceDetailDTO.couponPrice &&
              orderInfo.order.priceDetailDTO.couponPrice > 0
            ">
              <span class="label">优惠券金额：</span>
              <span class="txt">
                <priceColorScheme :value="orderInfo.order.priceDetailDTO.couponPrice" :color="$mainColor"></priceColorScheme>
              </span>
            </li>
            <li
              v-if="orderInfo.order.priceDetailDTO.discountPriceDetail != undefined && orderInfo.order.priceDetailDTO.discountPriceDetail && orderInfo.order.priceDetailDTO.discountPriceDetail != null && orderInfo.order.priceDetailDTO.discountPriceDetail != ''">
              <div class="label">
                <el-popover v-if="typeList.length > 0" trigger="hover" placement="left" width="220">
                  <template #reference>
                    <span class="hover-pointer" style="color: #cc0000" @click="getOrderPrice">ⓘ</span>
                  </template>
                  <div class="api" style="text-align:left;">
                    <table>
                      <thead>
                        <tr>
                          <th>优惠详情：</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(item, index) in typeList" :key="index">
                          <td>{{ item.promotionName }}：</td>
                          <td>¥{{ $filters.unitPrice(item.discountPrice) }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </el-popover>
                <span>优惠详情：</span>
              </div>
            </li>
            <!-- <li v-if="showPrices">
                <span class="label" style="color: #cc0000;font-size: 14px;" v-if="typeList.length > 0" >优惠详情：</span>
              </li> -->
            <!-- <li v-if="showPrices"  v-for="(item,index) in typeList" :key="index">
                <span class="label" v-if="index == 1 && typeList.length > 1" style="font-size:10px !important;"><a  @click="gotoHomes" style="display: inline-block;border-bottom: 1px dashed;color:black;width:80px;">{{item.promotionName}}：</a><span class="op-split">|</span>
                <span class="txt" style="border-bottom: 1px dashed;font-size:10px !important;" v-if="index == 1 &&  typeList.length > 1">¥{{ $filters.unitPrice(item.discountPrice) }}</span>
                <span class="label" v-if="index == 0 &&  typeList.length > 1" style="font-size:10px !important;"><a  @click="gotoHomes" style="display: inline-block;border-top: 1px dashed;color:black;width:80px;">{{item.promotionName}}：</a><span class="op-split">|</span>
                <span class="txt" style="border-top: 1px dashed;font-size:10px !important;" v-if="index == 0 && typeList.length > 1">¥{{ $filters.unitPrice(item.discountPrice) }}</span>
                <span class="label" v-if="typeList.length == 1 && index == 0" style="font-size:10px !important;"><a  @click="gotoHomes" style="display: inline-block;border-top: 1px dashed;border-bottom: 1px dashed;color:black;width:80px;">{{item.promotionName}}：</a><span class="op-split">|</span>
                <span class="txt"  v-if="typeList.length == 1 && index == 0" style="border-top: 1px dashed;border-bottom: 1px dashed;font-size:10px !important;">¥{{ $filters.unitPrice(item.discountPrice) }}</span>
              </li> -->
            <li v-if="showDelivery">
              <span class="label">运费：</span>
              <span class="txt">{{
                $filters.unitPrice(orderInfo.order.freightPrice, "￥")
              }}</span>
            </li>
            <li v-if="orderInfo.order.priceDetailDTO.updatePrice">
              <span class="label">修改金额：</span>
              <span class="txt theme_color">¥{{ $filters.unitPrice(orderInfo.order.priceDetailDTO.updatePrice) }}</span>
            </li>
            <li v-if="orderInfo.order.priceDetailDTO.payPoint != 0">
              <span class="label">使用积分：</span>
              <span class="txt flowPrice">{{
                orderInfo.order.priceDetailDTO.payPoint
              }}</span>
            </li>
            <li>
              <span class="label">应付金额：</span>
              <span class="txt flowPrice">¥{{ $filters.unitPrice(orderInfo.order.flowPrice) }}</span>
            </li>
          </ul>
        </div>
      </el-card>
    </div>

    <el-dialog v-model="modal" title="修改金额" width="530px">
      <el-form ref="modifyPriceFormRef" :model="modifyPriceForm" label-width="100px" :rules="modifyPriceValidate" @submit.prevent>
        <el-form-item label="订单金额" prop="orderPrice">
          <el-input-number v-model="modifyPriceForm.orderPrice" :min="0.01" :max="99999" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modal = false">关闭</el-button>
        <el-button type="primary" @click="modifyPriceSubmit">调整</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="sellerRemarkModal" title="编辑备注" width="530px">
      <el-form ref="modifyRemarkFormRef" :model="modifyRemarkForm" label-width="100px">
        <el-form-item label="订单备注" prop="sellerRemark">
          <el-input v-model="modifyRemarkForm.sellerRemark" maxlength="20" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sellerRemarkModal = false">关闭</el-button>
        <el-button type="primary" @click="modifyRemarkSubmit">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="addressModal" title="修改收件信息" width="530px">
      <el-form ref="addressFormRef" :model="addressForm" label-width="100px" :rules="addressRule">
        <el-form-item label="收件人" prop="consigneeName">
          <el-input v-model="addressForm.consigneeName" maxlength="20" />
        </el-form-item>
        <el-form-item label="联系方式" prop="consigneeMobile">
          <el-input v-model="addressForm.consigneeMobile" maxlength="11" />
        </el-form-item>
        <el-form-item label="地址信息" prop="consigneeAddressPath">
          <span>{{ addressForm.consigneeAddressPath || addr }}</span>
          <el-button size="small" style="margin-left: 8px" @click="$refs.map.open()">修改</el-button>
        </el-form-item>
        <el-form-item label="详细地址" prop="consigneeDetail">
          <el-input v-model="addressForm.consigneeDetail" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addressModal = false">关闭</el-button>
        <el-button type="primary" @click="editAddressSubmit">修改</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="orderLogModal" title="订单日志" width="60%">
      <div class="order-log-div">
        <el-table v-loading="loading" border :data="orderInfo.orderLogs || []" style="width: 100%">
          <el-table-column prop="operatorName" label="操作者" min-width="120" />
          <el-table-column prop="operatorType" label="操作类型" min-width="100" />
          <el-table-column prop="createTime" label="时间" width="180" />
          <el-table-column prop="message" label="日志" min-width="200" show-overflow-tooltip />
        </el-table>
      </div>
      <template #footer>
        <el-button @click="handelCancel">取消</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="fulfillModal" title="订单发货" width="1200px">
      <div v-if="showFulfillModeSelector" class="fulfill-mode-selector">
        <el-radio-group v-model="fulfillForm.fulfillmentMode">
          <el-radio v-if="allowOperation.fulfillWhole" label="WHOLE">整单发货</el-radio>
          <el-radio v-if="allowOperation.fulfillSplit" label="SPLIT">拆单发货</el-radio>
          <el-radio v-if="allowOperation.fulfillNoDelivery" label="NO_DELIVERY">无需配送</el-radio>
        </el-radio-group>
      </div>
      <div v-else-if="fulfillForm.fulfillmentMode === 'SPLIT'" class="fulfill-mode-tip">继续拆单发货</div>

      <el-form ref="fulfillFormRef" :model="fulfillForm" label-width="100px" :rules="fulfillRules">
        <template v-if="fulfillForm.fulfillmentMode !== 'NO_DELIVERY'">
          <el-form-item label="物流公司" prop="logisticsId">
            <el-select v-model="fulfillForm.logisticsId" placeholder="请选择物流公司" filterable style="width: 260px">
              <el-option
                v-for="item in checkedLogistics"
                :key="getLogisticsId(item)"
                :label="getLogisticsName(item)"
                :value="getLogisticsId(item)"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="物流单号" prop="logisticsNo">
            <el-input v-model="fulfillForm.logisticsNo" placeholder="请输入物流单号" style="width: 260px" />
          </el-form-item>
        </template>

        <el-form-item
          v-if="fulfillForm.fulfillmentMode === 'NO_DELIVERY'"
          label="配送说明"
          prop="deliveryRemark"
        >
          <el-input
            v-model="fulfillForm.deliveryRemark"
            type="textarea"
            :rows="3"
            maxlength="500"
            show-word-limit
            placeholder="选填，如：商家自行配送，预计今日送达"
            style="width: 480px"
          />
        </el-form-item>

        <el-form-item label-width="0" class="part-delivery-goods-item">
          <div v-if="deliverableOrderItems.length" class="part-delivery-table-wrap">
            <el-table
              v-if="fulfillForm.fulfillmentMode === 'SPLIT'"
              ref="fulfillTable"
              border
              :data="deliverableOrderItems"
              style="width: 100%"
              @selection-change="handleFulfillSelectionChange"
            >
              <el-table-column type="selection" width="55" :selectable="isPartDeliveryRowSelectable" />
              <el-table-column label="商品" min-width="420">
                <template #default="{ row }">
                  <div class="part-delivery-goods">
                    <img :src="row.image" class="part-delivery-goods-img" alt="" />
                    <div class="part-delivery-goods-info">
                      <div class="part-delivery-goods-name">{{ row.goodsName }}</div>
                      <div
                        v-for="(specValue, specKey) in parseOrderItemSpecs(row.specs)"
                        :key="specKey"
                        class="part-delivery-goods-spec"
                      >
                        <span v-if="specKey !== 'images'">{{ specKey }}：{{ specValue }}</span>
                      </div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="单价" min-width="110" align="center">
                <template #default="{ row }">
                  {{ $filters.unitPrice(row.unitPrice || 0, "￥") }}
                </template>
              </el-table-column>
              <el-table-column label="待发/购买" min-width="120" align="center">
                <template #default="{ row }">
                  {{ getRemainingDeliveryNum(row) }} / {{ row.num }}
                </template>
              </el-table-column>
              <el-table-column label="本次发货" min-width="140" align="center">
                <template #default="{ row }">
                  <el-input-number
                    v-model="fulfillForm.deliveryNumMap[getOrderItemId(row)]"
                    :min="1"
                    :max="getRemainingDeliveryNum(row)"
                    :precision="0"
                    controls-position="right"
                    size="default"
                    class="part-delivery-num-input"
                    @change="(val) => handleFulfillNumChange(row, val)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="已发" min-width="80" align="center">
                <template #default="{ row }">
                  {{ getShippedPackageNum(row) }}
                </template>
              </el-table-column>
            </el-table>

            <el-table v-else border :data="deliverableOrderItems" style="width: 100%">
              <el-table-column label="商品" min-width="420">
                <template #default="{ row }">
                  <div class="part-delivery-goods">
                    <img :src="row.image" class="part-delivery-goods-img" alt="" />
                    <div class="part-delivery-goods-info">
                      <div class="part-delivery-goods-name">{{ row.goodsName }}</div>
                      <div
                        v-for="(specValue, specKey) in parseOrderItemSpecs(row.specs)"
                        :key="specKey"
                        class="part-delivery-goods-spec"
                      >
                        <span v-if="specKey !== 'images'">{{ specKey }}：{{ specValue }}</span>
                      </div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="单价" min-width="110" align="center">
                <template #default="{ row }">
                  {{ $filters.unitPrice(row.unitPrice || 0, "￥") }}
                </template>
              </el-table-column>
              <el-table-column label="待发数量" min-width="120" align="center">
                <template #default="{ row }">
                  {{ getRemainingDeliveryNum(row) }}
                </template>
              </el-table-column>
              <el-table-column label="购买数量" min-width="100" align="center" prop="num" />
            </el-table>
          </div>
          <div v-else class="delivery-empty">暂无可发货商品</div>
        </el-form-item>
      </el-form>

      <div v-if="orderPackages.length" class="package-list">
        <div class="package-title">已有包裹</div>
        <el-table :data="orderPackages" border size="small">
          <el-table-column label="方式" width="100">
            <template #default="{ row }">{{ getFulfillmentModeLabel(row.fulfillmentMode) }}</template>
          </el-table-column>
          <el-table-column label="物流/说明" min-width="200">
            <template #default="{ row }">
              <template v-if="isNoDeliveryPackage(row)">
                无需配送<span v-if="row.deliveryRemark">（{{ row.deliveryRemark }}）</span>
              </template>
              <template v-else>{{ row.logisticsName }} / {{ row.logisticsNo }}</template>
            </template>
          </el-table-column>
          <el-table-column prop="logisticsTime" label="发货时间" width="170" />
        </el-table>
      </div>
      <template #footer>
        <el-button @click="fulfillModal = false">关闭</el-button>
        <el-button type="primary" :loading="fulfillSubmitting" @click="submitFulfill">确认发货</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="printModal" width="530px" @close="printCancel">
      <template #header>
        <div style="line-height:26px;height:26px;">
          <span style="float: left;">打印发货单</span>
          <el-button size="small" style="margin-right:35px;float: right;padding-bottom: 2px;" @click="printHiddenInfo">
            {{ printHiddenFlag ? "显示" : "隐藏" }}敏感信息
          </el-button>
        </div>
      </template>
      <div style="max-height:500px;overflow-y:auto;overflow-x:hidden;">
        <div id="printInfo">
          <el-row v-if="orderInfo.order.remark !== ''">
            <el-col :span="24">
            <p class="lineH30 f14">备注：{{ orderInfo.order.remark }}</p>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
            <p class="lineH30 f14">收件人：{{ orderInfo.order.consigneeName }}</p>
            </el-col>
            <el-col v-if="orderInfo.order.consigneeMobile" :span="12">
            <p v-if="printHiddenFlag" class="lineH30 f14">手机号：{{
              orderInfo.order.consigneeMobile.replace(/^(.{3})(?:\d+)(.{4})$/, "$1****$2") }}</p>
            <p v-else class="lineH30 f14">手机号：{{ orderInfo.order.consigneeMobile }}</p>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
            <p class="lineH30 f14">收货地址：{{ orderInfo.order.consigneeAddressPath }}{{ orderInfo.order.consigneeDetail }}
            </p>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
            <p class="printgoodtitle">商品信息</p>
            <div class="printgoodinfo">
              <div v-for="(item, index) in orderInfo.orderItems" :key="index" class="printgooditem">
                <div class="printgoodname">
                  <p>{{ item.goodsName }}</p>
                  <div class="printgoodguid">
                    <span v-for="(itemchild, keychild) in parseOrderItemSpecs(item.specs)" :key="keychild">
                      <span class="printgoodguiditem" v-if="keychild != 'images'">
                        {{ keychild }} : {{ itemchild }}</span>
                    </span>
                  </div>
                </div>
                <span class="printgoodnumber">数量：{{ item.num }}</span>
              </div>
            </div>
            </el-col>
          </el-row>
        </div>
      </div>

      <template #footer>
        <el-button @click="printModal = false">关闭</el-button>
        <el-button type="primary" @click="handlePrintInvoice">打印发货单</el-button>
      </template>
    </el-dialog>


    <el-dialog v-model="logisticsModal" title="查询物流" width="40%">
      <div class="layui-layer-wrap">
        <dl>
          <dt>订单号：</dt>
          <dd>
            <div class="text-box">{{ sn }}</div>
          </dd>
        </dl>
      </div>
      <template v-if="packageTraceList.length > 0">
        <div
          v-for="(packageItem, packageIndex) in packageTraceList"
          :key="packageIndex"
        >
        <div class="layui-layer-wrap">
          <template v-if="isNoDeliveryPackage(packageItem)">
            <dl>
              <dt>配送方式：</dt>
              <dd><div class="text-box">无需配送</div></dd>
            </dl>
            <dl v-if="packageItem.logisticsTime">
              <dt>发货时间：</dt>
              <dd><div class="text-box">{{ packageItem.logisticsTime }}</div></dd>
            </dl>
            <dl v-if="packageItem.deliveryRemark">
              <dt>配送说明：</dt>
              <dd><div class="text-box">{{ packageItem.deliveryRemark }}</div></dd>
            </dl>
          </template>
          <template v-else>
          <dl>
            <dt>物流公司：</dt>
            <dd><div class="text-box">{{ packageItem.logisticsName }}</div></dd>
          </dl>
          <dl>
            <dt>快递单号：</dt>
            <dd><div class="text-box">{{ packageItem.logisticsNo }}</div></dd>
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
          </div>
          <div v-if="!isNoDeliveryPackage(packageItem)" class="div-express-log">
            <ul v-if="packageItem.traces && packageItem.traces.traces" class="express-log">
              <li v-for="(item, index) in packageItem.traces.traces" :key="index">
                <span class="time">{{ item.AcceptTime || item.acceptTime }}</span>
                <span class="detail">{{ item.AcceptStation || item.remark }}</span>
              </li>
            </ul>
            <ul v-else class="express-log"><li>暂无物流信息</li></ul>
          </div>
        </div>
        </div>
      </template>
      <div v-if="packageTraceList.length == 0 && logisticsInfo">
        <div class="layui-layer-wrap">
          <dl>
            <dt>物流公司：</dt>
            <dd><div class="text-box">{{ logisticsInfo.shipper }}</div></dd>
          </dl>
          <dl>
            <dt>快递单号：</dt>
            <dd><div class="text-box">{{ logisticsInfo.logisticCode }}</div></dd>
          </dl>
          <div class="div-express-log">
            <ul v-if="logisticsInfo && logisticsInfo.traces" class="express-log">
              <li v-for="(item, index) in logisticsInfo.traces" :key="index">
                <span class="time">{{ item.AcceptTime }}</span>
                <span class="detail">{{ item.AcceptStation }}</span>
              </li>
            </ul>
            <ul v-else class="express-log"><li>暂无物流信息</li></ul>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="logisticsModal = false">取消</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="faceSheetModal" title="打印电子面单" width="500px">
      <el-form
        ref="faceSheetFormRef"
        :model="faceSheetForm"
        :rules="faceSheetFormValidate"
        label-width="90px"
      >
        <el-form-item label="物流公司" prop="logisticsId">
          <el-select v-model="faceSheetForm.logisticsId" placeholder="请选择" style="width: 250px">
            <el-option
              v-for="(item, i) in checkedLogistics"
              :key="i"
              :label="item.name"
              :value="item.logisticsId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="faceSheetModal = false">关闭</el-button>
        <el-button type="primary" @click="submitFaceSheet">打印</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="orderTakeModal"
      :title="isAppointmentOrder ? '预约核销' : '订单核销'"
      width="560px"
    >
      <template v-if="isAppointmentOrder">
        <el-alert
          v-if="appointmentVerification.verifiedCount > 0"
          type="info"
          :closable="false"
          show-icon
          class="mb_10"
        >
          已核销 {{ appointmentVerification.verifiedCount }}/{{ appointmentVerification.totalCount }}，
          请继续输入剩余核销码直至全部完成。
        </el-alert>
        <el-form ref="appointmentTakeFormRef" :model="appointmentTakeForm" label-width="100px" :rules="appointmentTakeValidate">
          <el-form-item label="服务人员" prop="staffId">
            <el-select
              v-model="appointmentTakeForm.staffId"
              placeholder="请选择启用中的服务人员"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="item in enabledStaffList"
                :key="item.id"
                :label="item.staffName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="核销码" prop="code">
            <el-input
              v-model="appointmentTakeForm.code"
              placeholder="请输入预约核销码"
              maxlength="16"
              clearable
              @keyup.enter="appointmentVerifySubmit"
            />
          </el-form-item>
        </el-form>
        <el-table
          v-if="appointmentVerification.codes && appointmentVerification.codes.length"
          :data="appointmentVerification.codes"
          border
          size="small"
          class="mt_10"
        >
          <el-table-column prop="seqNo" label="序号" width="70" />
          <el-table-column prop="code" label="核销码" min-width="120" />
          <el-table-column label="状态" width="90">
            <template #default="{ row }">{{ row.status === "USED" ? "已核销" : "待核销" }}</template>
          </el-table-column>
        </el-table>
      </template>
      <el-form v-else ref="orderTakeFormRef" :model="orderTakeForm" label-width="100px" :rules="orderTakeValidate">
        <el-form-item label="核销码" prop="qrCode">
          <el-input v-model="orderTakeForm.qrCode" placeholder="请输入核销码" maxlength="10" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="orderTakeModal = false">取消</el-button>
        <el-button
          type="primary"
          :loading="appointmentVerifyLoading"
          @click="isAppointmentOrder ? appointmentVerifySubmit() : orderTakeSubmit()"
        >
          核销
        </el-button>
      </template>
    </el-dialog>

    <multipleMap ref="map" @callback="selectedRegion" />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
import * as API_Order from "@/api/order";
import * as API_Logistics from "@/api/logistics";
import * as RegExp from "@/libs/RegExp.js";

import multipleMap from "@/views/my-components/map/multiple-map";
import vueQr from "vue-qr";
import { printElement } from "@/utils/print";
import { formatCardKeyStatus } from "@/constants/cardKey";
import {
  collectCardKeyFulfillLines,
  orderHasCardKeySection,
  cardKeyFulfillAlertType,
  resolveCardKeyFulfillMessage,
} from "@/constants/goodsType";
import {
  validateFulfillForm,
  isNoDeliveryPackage,
  getFulfillmentModeLabel,
  resolveDefaultFulfillmentMode,
  canShowShipButton,
} from "@/utils/orderFulfill";
import {
  getEnabledServiceStaff,
  getAppointmentVerificationByOrderSn,
  verifyAppointmentCode,
} from "@/api/appointment";
import { WORK_ORDER_STATUS_LABEL, parseFormAnswerGroups } from "@/constants/appointment";
import { Message } from "@/utils/message";

defineOptions({ name: "orderDetail" });

const route = useRoute();
const router = useRouter();

// 模板 ref（与表单 data 同名的改为 xxxRef，避免互相覆盖）
const modifyPriceFormRef = ref(null);
const modifyRemarkFormRef = ref(null);
const addressFormRef = ref(null);
const faceSheetFormRef = ref(null);
const appointmentTakeFormRef = ref(null);
const orderTakeFormRef = ref(null);
const fulfillFormRef = ref(null);
const fulfillTable = ref(null);
const map = ref(null);

const typeList = ref([]);
const showPrices = ref(false);
const printHiddenFlag = ref(false);
const loading = ref(false);
const logisticsType = ref("KUAIDINIAO");
const someJSONdata = ref("");
const faceSheetForm = reactive({
  logisticsId: "",
});
const faceSheetFormValidate = {
  logisticsId: [{ required: true, message: "请选择物流公司" }],
};
const logisticsModal = ref(false);
const faceSheetModal = ref(false);
const logisticsInfo = ref({
  shipper: "",
});
const packageTraceList = ref([]);
const sellerRemarkModal = ref(false);
const addr = ref("");
const regionId = ref("");

const orderLogModal = ref(false);
const checkedLogistics = ref([]); //选中的物流公司集合
const allowOperation = ref({}); //订单可才做选项
const sn = ref(""); //订单编号
const orderInfo = ref({
  order: {
    priceDetailDTO: {},
  },
});
const modal = ref(false);
//调整价格表单
const modifyPriceForm = reactive({
  orderPrice: 0,
});
const modifyRemarkForm = reactive({
  sellerRemark: "",
});
const fulfillModal = ref(false);
const fulfillSubmitting = ref(false);
const autoOpenFulfill = ref(true);
const fulfillForm = ref({
  fulfillmentMode: "WHOLE",
  logisticsNo: "",
  logisticsId: "",
  deliveryRemark: "",
  selectedOrderItemIds: [],
  deliveryNumMap: {},
});
const orderPackages = ref([]);
//验证要调整的订单金额
const modifyPriceValidate = {
  orderPrice: [
    { required: true, message: "请输入大于等于0或小于99999的合法金额" },
    {
      pattern: /^\d+(\.(([1-9])|(0[1-9])|([\d^0]\d)))?$/,
      message: "请输入大于0小于9999的合法金额",
      trigger: "change",
    },
  ],
};

const addressModal = ref(false);
const printModal = ref(false);
const orderTakeModal = ref(false);
const orderTakeForm = reactive({
  qrCode: "",
});
const appointmentVerification = ref({
  codes: [],
  totalCount: 0,
  verifiedCount: 0,
  workOrderStatus: "",
  workOrderVisible: false,
});
const enabledStaffList = ref([]);
const appointmentTakeForm = ref({
  staffId: "",
  code: "",
});
const appointmentVerifyLoading = ref(false);
const appointmentTakeValidate = {
  staffId: [{ required: true, message: "请选择服务人员", trigger: "change" }],
  code: [{ required: true, message: "核销码不能为空", trigger: "blur" }],
};
const orderTakeValidate = {
  qrCode: [{ required: true, message: "订单核销码不能为空", trigger: "blur" }],
};
//收件地址表单
const addressForm = reactive({
  consigneeName: "",
  consigneeMobile: "",
  consigneeDetail: "",
  consigneeAddressPath: "",
  consigneeAddressIdPath: "",
});
const fulfillRules = {
  logisticsNo: [{ required: true, message: "发货单号不能为空", trigger: "change" }],
  logisticsId: [{ required: true, message: "请选择物流公司", trigger: "change" }],
};
const addressRule = {
  consigneeName: [
    { required: true, message: "收货人姓名不能为空", trigger: "blur" },
  ],
  consigneeMobile: [
    { required: true, message: "联系方式不能为空", trigger: "blur" },
    {
      pattern: RegExp.mobile,
      trigger: "blur",
      message: "请输入正确的手机号",
    },
  ],
  consigneeDetail: [
    { required: true, message: "详细地址不能为空", trigger: "blur" },
  ],
};

const data = ref([]); // 表单数据

/** 电子卡券订单：隐藏物流/发货/售后，展示 orderItems[].cardKeys（FR-S-04 / FR-S-05） */
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
  // 详情未回时用路由 query 兜底
  return t === "APPOINTMENT" || route.query.orderType === "APPOINTMENT";
});
const isNonPhysicalOrder = computed(() => {
  return isVirtualOrder.value || isECouponOrder.value || isAppointmentOrder.value;
});
/** 实物订单才展示收货、配送、运费和发货记录 */
const showDelivery = computed(() => {
  return !isNonPhysicalOrder.value;
});
/** 实物订单始终展示发票；卡密、预约、虚拟仅在买家索取发票时展示 */
const showInvoice = computed(() => {
  const order = orderInfo.value && orderInfo.value.order;
  if (!order) return false;
  if (order.needReceipt == true) return true;
  return showDelivery.value;
});
const appointmentWorkOrderStatusText = computed(() => {
  return WORK_ORDER_STATUS_LABEL[appointmentVerification.value.workOrderStatus]
    || appointmentVerification.value.workOrderStatus
    || "—";
});
const appointmentSlotText = computed(() => {
  const v = appointmentVerification.value || {};
  if (!v.slotDate) return "";
  const date = String(v.slotDate).slice(0, 10);
  const slot = v.slotStartTime && v.slotEndTime ? `${v.slotStartTime}-${v.slotEndTime}` : "";
  return [date, slot].filter(Boolean).join(" ");
});
const appointmentFormGroups = computed(() => {
  return parseFormAnswerGroups(appointmentVerification.value?.formAnswerJson);
});
const hasCardKeySection = computed(() => {
  return orderHasCardKeySection({
    orderItems: data.value,
    isECouponOrder: isECouponOrder.value,
  });
});
const cardKeyFulfillLines = computed(() => {
  return collectCardKeyFulfillLines(data.value);
});
const canShip = computed(() => {
  return canShowShipButton(allowOperation.value, orderInfo.value?.order);
});
const showFulfillModeSelector = computed(() => {
  const status = orderInfo.value?.order?.orderStatus;
  if (status === "PARTS_DELIVERED") return false;
  const op = allowOperation.value || {};
  return [op.fulfillWhole, op.fulfillSplit, op.fulfillNoDelivery].filter(Boolean).length > 1;
});
const deliverableOrderItems = computed(() => {
  return (data.value || []).filter((item) => {
    if (!getOrderItemId(item)) return false;
    return getRemainingDeliveryNum(item) > 0;
  });
});
const canOrderTake = computed(() => {
  if (isAppointmentOrder.value) {
    const order = orderInfo.value?.order;
    if (!order || order.orderStatus !== "TAKE") return false;
    return (appointmentVerification.value.verifiedCount || 0)
      < (appointmentVerification.value.totalCount || 0);
  }
  if (allowOperation.value.take) return true;
  const order = orderInfo.value?.order;
  if (!order) return false;
  const isVirtual =
    route.query.orderType === "VIRTUAL" ||
    order.orderType === "VIRTUAL";
  return isVirtual && order.orderStatus === "TAKE";
});

watch(
  () => route.query,
  (to, from) => {
    router.go(0);
  }
);

onMounted(() => {
  sn.value = route.query.sn;
  getDataDetail();
  getLogisticsSetting();
  getOrderPackages();
});

onBeforeRouteLeave((to, from, next) => {
  if (to.name === "orderList" || to.name === "virtualOrderList") {
    to.meta.keepAlive = true;
  }
  next();
});

function lineCardKeyRows(line) {
  return line.cardKeys || [];
}
function copyCardKey(row) {
  const text = `卡号：${row.cardNo || ""}\n卡密：${row.cardSecret || ""}`;
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
function getPromotionText(row) {
  let resultText = "";
  if (row && row.promotionType) {
    const type = row.promotionType.split(",");
    if (type.indexOf("PINTUAN") != -1) resultText += "拼团 ";
    if (type.indexOf("SECKILL") != -1) resultText += "秒杀 ";
    if (type.indexOf("COUPON") != -1) resultText += "优惠券 ";
    if (type.indexOf("FULL_DISCOUNT") != -1) resultText += "满减 ";
    if (type.indexOf("POINTS_GOODS") != -1) resultText += "积分商品 ";
  }
  return resultText === "" ? "未参与" : resultText;
}
function getOrderItemId(item) {
  return item && (item.id || item.orderItemId || item.sn);
}
function getLogisticsId(item) {
  return item && (item.logisticsId || item.id);
}
function getLogisticsName(item) {
  return item && (item.logisticsName || item.name || item.logisticsCompany || item.logisticsId || item.id);
}
function parseOrderItemSpecs(specs) {
  if (!specs) return {};
  try {
    return JSON.parse(specs);
  } catch (e) {
    return {};
  }
}
function getShippedPackageNum(item) {
  if (item != null && item.deliverNumber != null && item.deliverNumber !== "") {
    const direct = Number(item.deliverNumber);
    if (Number.isFinite(direct)) return direct;
  }
  const orderItemId = getOrderItemId(item);
  if (!orderItemId || !orderPackages.value.length) return 0;
  let total = 0;
  orderPackages.value.forEach((pkg) => {
    (pkg.orderPackageItemList || []).forEach((pkgItem) => {
      if (isPackageItemMatch(item, pkgItem)) {
        total += Number(pkgItem.deliverNumber ?? pkgItem.num ?? 0);
      }
    });
  });
  return total;
}
function isPackageItemMatch(orderItem, pkgItem) {
  const orderKeys = [
    getOrderItemId(orderItem),
    orderItem?.sn,
    orderItem?.id,
    orderItem?.orderItemId,
  ]
    .filter(Boolean)
    .map(String);
  const pkgKeys = [
    pkgItem.orderItemSn,
    pkgItem.orderItemId,
    pkgItem.orderItemsId,
    pkgItem.id,
    pkgItem.sn,
  ]
    .filter(Boolean)
    .map(String);
  return pkgKeys.some((key) => orderKeys.includes(key));
}
function getRemainingDeliveryNum(item) {
  if (item != null && item.remainDeliverNumber != null && item.remainDeliverNumber !== "") {
    const remain = Number(item.remainDeliverNumber);
    if (Number.isFinite(remain)) return Math.max(remain, 0);
  }
  const total = Number(item && item.num) || 0;
  return Math.max(total - getShippedPackageNum(item), 0);
}
function initFulfillNumMap() {
  const deliveryMap = {};
  deliverableOrderItems.value.forEach((item) => {
    const id = getOrderItemId(item);
    if (id) {
      deliveryMap[id] = getRemainingDeliveryNum(item);
    }
  });
  fulfillForm.value.deliveryNumMap = deliveryMap;
}
function refreshFulfillAfterSubmit() {
  fulfillModal.value = false;
  loading.value = true;
  return Promise.all([
    API_Order.getOrderDetail(sn.value).then((res) => {
      if (res.success) {
        orderInfo.value = res.result;
        allowOperation.value = res.result.allowOperationVO;
        data.value = res.result.orderItems;
        typeList.value = res.result.order.priceDetailDTO.discountPriceDetail
          ? JSON.parse(JSON.stringify(res.result.order.priceDetailDTO.discountPriceDetail))
          : [];
        getContentPrice();
        getOrderPrice();
      }
    }),
    getOrderPackages(),
  ]).finally(() => {
    loading.value = false;
    resetFulfillForm(false);
    initFulfillNumMap();
    nextTick(() => {
      fulfillTable.value?.clearSelection();
      fulfillFormRef.value?.clearValidate();
    });
  });
}
function handleFulfillNumChange(row, value) {
  const id = getOrderItemId(row);
  if (!id) return;
  const num = Number(value);
  if (!Number.isFinite(num) || num < 1) return;
  if (!fulfillForm.value.selectedOrderItemIds.includes(id)) {
    fulfillForm.value.selectedOrderItemIds = [...fulfillForm.value.selectedOrderItemIds, id];
    nextTick(() => {
      fulfillTable.value?.toggleRowSelection(row, true);
    });
  }
}
function isPartDeliveryRowSelectable(row) {
  return getRemainingDeliveryNum(row) > 0;
}
function handleFulfillSelectionChange(selection) {
  const selectedIds = [];
  selection.forEach((item) => {
    const id = getOrderItemId(item);
    if (!id) return;
    selectedIds.push(id);
    if (fulfillForm.value.deliveryNumMap[id] == null) {
      fulfillForm.value.deliveryNumMap[id] = getRemainingDeliveryNum(item);
    }
  });
  fulfillForm.value.selectedOrderItemIds = selectedIds;
}
function buildFulfillItems() {
  return fulfillForm.value.selectedOrderItemIds
    .map((orderItemId) => ({
      orderItemId,
      deliveryNum: Number(fulfillForm.value.deliveryNumMap[orderItemId]),
    }))
    .filter((item) => item.orderItemId && item.deliveryNum > 0);
}
function resetFulfillForm(clearMode = true) {
  const mode = clearMode
    ? resolveDefaultFulfillmentMode(
        allowOperation.value,
        orderInfo.value?.order?.orderStatus
      ) || "WHOLE"
    : fulfillForm.value.fulfillmentMode;
  fulfillForm.value = {
    fulfillmentMode: mode,
    logisticsNo: "",
    logisticsId: "",
    deliveryRemark: "",
    selectedOrderItemIds: [],
    deliveryNumMap: {},
  };
  nextTick(() => {
    fulfillFormRef.value?.clearValidate();
    fulfillTable.value?.clearSelection();
  });
}
function openFulfill(presetMode) {
  resetFulfillForm(true);
  if (presetMode === "SPLIT" || route.query.fulfillMode === "SPLIT") {
    fulfillForm.value.fulfillmentMode = "SPLIT";
  } else {
    const mode = resolveDefaultFulfillmentMode(
      allowOperation.value,
      orderInfo.value?.order?.orderStatus
    );
    if (mode) fulfillForm.value.fulfillmentMode = mode;
  }
  fulfillModal.value = true;
  getCheckedLogistics();
  getOrderPackages();
}
function buildFulfillPayload() {
  const mode = fulfillForm.value.fulfillmentMode;
  const payload = { fulfillmentMode: mode };
  if (mode === "WHOLE" || mode === "SPLIT") {
    payload.logisticsId = fulfillForm.value.logisticsId;
    payload.logisticsNo = fulfillForm.value.logisticsNo;
  }
  if (mode === "NO_DELIVERY") {
    const remark = (fulfillForm.value.deliveryRemark || "").trim();
    if (remark) payload.deliveryRemark = remark;
  }
  if (mode === "SPLIT") {
    payload.items = buildFulfillItems();
  }
  return payload;
}
function submitFulfill() {
  const mode = fulfillForm.value.fulfillmentMode;
  const payload = buildFulfillPayload();
  const validateMsg = validateFulfillForm(mode, payload);
  if (validateMsg) {
    Message.error(validateMsg);
    return;
  }
  if (mode !== "NO_DELIVERY") {
    fulfillFormRef.value.validate((valid) => {
      if (!valid) return;
      doSubmitFulfill(payload);
    });
  } else {
    doSubmitFulfill(payload);
  }
}
function doSubmitFulfill(payload) {
  fulfillSubmitting.value = true;
  API_Order.orderFulfill(sn.value, payload)
    .then((res) => {
      if (res.success) {
        Message.success("发货成功");
        refreshFulfillAfterSubmit();
      } else if (res.code === 1003) {
        Message.warning(res.message || "访问过于频繁，请稍后再试");
      }
    })
    .finally(() => {
      fulfillSubmitting.value = false;
    });
}
function getCheckedLogistics() {
  API_Order.getLogisticsChecked().then((res) => {
    if (res.success) {
      checkedLogistics.value = Array.isArray(res.result) ? res.result : [];
    }
  });
}
function getOrderPackages() {
  return API_Order.getPackage(sn.value).then((res) => {
    if (res.success) {
      orderPackages.value = Array.isArray(res.result) ? res.result : [];
    }
    initFulfillNumMap();
  });
}

// 获取订单详情
function getDataDetail () {
  loading.value = true;
  API_Order.getOrderDetail(sn.value).then((res) => {
    loading.value = false;
    if (res.success) {
      orderInfo.value = res.result;
      allowOperation.value = res.result.allowOperationVO;
      data.value = res.result.orderItems || [];
      const discountDetail = res.result.order.priceDetailDTO?.discountPriceDetail;
      typeList.value = discountDetail
        ? JSON.parse(JSON.stringify(discountDetail))
        : [];
      getContentPrice();
      getOrderPrice();
      if (isAppointmentOrder.value) {
        loadAppointmentVerification();
      }
      if (
        autoOpenFulfill.value &&
        canShip.value &&
        (route.query.openFulfill || route.query.fulfillMode)
      ) {
        autoOpenFulfill.value = false;
        nextTick(() => openFulfill(route.query.fulfillMode));
      }
    }
  });
}
function modifyPrice () {
  modifyPriceForm.orderPrice = orderInfo.value.order.flowPrice;
  modal.value = true;
}
function modifyPriceSubmit () {
  modifyPriceFormRef.value.validate((valid) => {
    if (valid) {
      API_Order.modifyOrderPrice(sn.value, modifyPriceForm).then((res) => {
        if (res.success) {
          Message.success("修改订单金额成功");
          modal.value = false;
          getDataDetail();
        }
      });
    }
  });
}
function modifyRemark () {
  modifyRemarkForm.sellerRemark = orderInfo.value.order.sellerRemark || "";
  sellerRemarkModal.value = true;
}
function modifyRemarkSubmit () {
  modifyRemarkFormRef.value.validate((valid) => {
    if (valid) {
      API_Order.modifyOrderRemark(sn.value, modifyRemarkForm).then((res) => {
        if (res.success) {
          Message.success("编辑订单备注成功");
          sellerRemarkModal.value = false;
          getDataDetail();
        }
      });
    }
  });
}
function checkLogistics () {
  logisticsModal.value = true;
  if (orderPackages.value.length > 0) {
    logisticsList();
  } else {
    logistics();
  }
}
function logisticsList () {
  API_Order.getPackage(sn.value).then((res) => {
    if (res.success && res.result != null) {
      packageTraceList.value = res.result;
    }
  });
}
function logistics () {
  API_Order.getTraces(sn.value).then((res) => {
    if (res.success && res.result != null) {
      logisticsInfo.value = res.result;
    }
  });
}
function toPrint () {
  API_Logistics.getCheckedOn().then((res) => {
    if (res.success) {
      checkedLogistics.value = res.result;
      faceSheetModal.value = true;
    }
  });
}
function sfPrint () {
  API_Order.getOrderFaceSheet(sn.value, faceSheetForm).then((res) => {
    if (res.success) {
      const headers = {
        "X-Auth-token": res.result.token,
      };
      API_Logistics.getShunFengFaceSheet(res.result.url, headers).then((sheetRes) => {
        const blob = new Blob([sheetRes], {
          type: "application/pdf;charset=utf-8",
        });
        if ("download" in document.createElement("a")) {
          const link = document.createElement("a");
          link.download = `${orderInfo.value.order.sn}.pdf`;
          link.style.display = "none";
          link.href = URL.createObjectURL(blob);
          document.body.appendChild(link);
          link.click();
          URL.revokeObjectURL(link.href);
          document.body.removeChild(link);
        } else {
          navigator.msSaveBlob(blob, `${orderInfo.value.order.sn}.pdf`);
        }
      });
    }
  });
}
function toPrints (printWindow) {
  faceSheetModal.value = false;
  if (!someJSONdata.value) {
    printWindow && printWindow.close();
    return;
  }
  const win = printWindow || window.open("", "_blank");
  if (!win) {
    Message.error("无法打开打印窗口，请允许浏览器弹窗");
    return;
  }
  win.document.write(someJSONdata.value);
  win.document.close();
  win.focus();
  Message.success("电子面单发货成功");
  getDataDetail();
  getOrderPackages();
}
function submitFaceSheet () {
  faceSheetFormRef.value.validate((valid) => {
    if (valid) {
      const printWindow = window.open("", "_blank");
      API_Order.getOrderFaceSheet(sn.value, faceSheetForm).then((res) => {
        if (res.success && res.result.printTemplate) {
          someJSONdata.value = res.result.printTemplate;
          toPrints(printWindow);
        } else {
          printWindow && printWindow.close();
          Message.error("电子面单发货失败！");
        }
      }).catch(() => {
        printWindow && printWindow.close();
        Message.error("电子面单发货失败！");
      });
    }
  });
}
function getLogisticsSetting () {
  API_Logistics.getLogisticsSetting().then((res) => {
    if (res.success) {
      logisticsType.value = res.result;
    }
  });
}
function getOrderPrice () {
  if (showPrices.value) {
    showPrices.value = false
  } else if (!showPrices.value) {
    showPrices.value = true
  }
}
function getContentPrice () {
  for (let i = 0; i < typeList.value.length; i++) {
    for (let j = i + 1; j < typeList.value.length; j++) {
      if (typeList.value[i].promotionId === typeList.value[j].promotionId) {
        typeList.value[i].discountPrice = typeList.value[i].discountPrice + typeList.value[j].discountPrice
        typeList.value.splice(j, 1)
      }
    }
  }
  if (typeList.value.length >= 3) {
    getContentPrice();
  }
}
function selectedRegion (val) {
  if (val.type === "select") {
    const paths = val.data.map((item) => item.name).join(",");
    const ids = val.data.map((item) => item.id).join(",");
    addr.value = paths;
    regionId.value = ids;
    addressForm.consigneeAddressPath = paths;
    addressForm.consigneeAddressIdPath = ids;
  } else {
    addr.value = val.data.addr;
    regionId.value = val.data.addrId;
    addressForm.consigneeAddressPath = val.data.addr;
    addressForm.consigneeAddressIdPath = val.data.addrId;
  }
}
//订单日志
function orderLog () {
  orderLogModal.value = true;
}
//订单日志取消
function handelCancel () {
  orderLogModal.value = false;
}
function loadAppointmentVerification() {
  getAppointmentVerificationByOrderSn(sn.value)
    .then((res) => {
      if (res.success && res.result) {
        appointmentVerification.value = res.result;
      }
    })
    .catch(() => {});
}
function loadEnabledStaff() {
  getEnabledServiceStaff()
    .then((res) => {
      if (res.success) {
        enabledStaffList.value = res.result || [];
      }
    })
    .catch(() => {});
}
function orderTake() {
  if (isAppointmentOrder.value) {
    appointmentTakeForm.value = { staffId: "", code: "" };
    loadEnabledStaff();
    loadAppointmentVerification();
    orderTakeModal.value = true;
    nextTick(() => {
      appointmentTakeFormRef.value?.clearValidate();
    });
    return;
  }
  orderTakeForm.qrCode = orderInfo.value.order.verificationCode || "";
  orderTakeModal.value = true;
  nextTick(() => {
    orderTakeFormRef.value?.clearValidate();
  });
}
function appointmentVerifySubmit() {
  appointmentTakeFormRef.value.validate((valid) => {
    if (!valid) return;
    appointmentVerifyLoading.value = true;
    verifyAppointmentCode({
      code: appointmentTakeForm.value.code,
      staffId: appointmentTakeForm.value.staffId,
    })
      .then((res) => {
        if (!res.success) return;
        const result = res.result || {};
        appointmentTakeForm.value.code = "";
        loadAppointmentVerification();
        if (result.allVerified) {
          if (result.orderCompleted) {
            Message.success("全部核销完成，订单已完成");
            orderTakeModal.value = false;
            getDataDetail();
          } else {
            Message.success("全部核销完成，请在工单中结束服务");
            orderTakeModal.value = false;
            getDataDetail();
          }
        } else {
          Message.success(`核销成功（${result.verifiedCount}/${result.totalCount}）`);
        }
      })
      .finally(() => {
        appointmentVerifyLoading.value = false;
      });
  });
}
function orderTakeSubmit() {
  orderTakeFormRef.value.validate((valid) => {
    if (!valid) return;
    API_Order.orderTake(sn.value, orderTakeForm.qrCode).then((res) => {
      if (res.success) {
        Message.success("订单核销成功");
        orderTakeModal.value = false;
        getDataDetail();
      }
    });
  });
}
//打印发货单
function printOrder () {
  printModal.value = true;
}
function printHiddenInfo () {
  printHiddenFlag.value = !printHiddenFlag.value;
}
function printCancel () {
  // printHiddenFlag.value = false;
}
function handlePrintInvoice() {
  printElement("printInfo", "发货单");
}
//弹出修改收货地址框
function editAddress () {
  addressModal.value = true;
  addr.value = orderInfo.value.order.consigneeAddressPath;
  regionId.value = orderInfo.value.order.consigneeAddressIdPath;
  addressForm.consigneeName = orderInfo.value.order.consigneeName;
  addressForm.consigneeMobile = orderInfo.value.order.consigneeMobile;
  addressForm.consigneeDetail = orderInfo.value.order.consigneeDetail;
  addressForm.consigneeAddressPath = orderInfo.value.order.consigneeAddressPath;
  addressForm.consigneeAddressIdPath = orderInfo.value.order.consigneeAddressIdPath;
}
//修改收货地址
function editAddressSubmit () {
  if (regionId.value == "") {
    Message.error("请选择地址");
    return;
  }
  addressForm.consigneeAddressPath = addr.value;
  addressForm.consigneeAddressIdPath = regionId.value;
  addressFormRef.value.validate((valid) => {
    if (valid) {
      API_Order.editOrderConsignee(sn.value, addressForm).then((res) => {
        if (res.success) {
          Message.success("收货地址修改成功");
          addressModal.value = false;
          getDataDetail();
        }
      });
    }
  });
}
</script>
<style lang="scss">
.lineH30 {
  line-height: 30px;
}

.order-log-div {
  line-height: 30px;
  max-height: 500px;
  overflow-y: scroll;
}

.div-express-log {
  max-height: 300px;
  border: solid 1px #e7e7e7;
  background: #fafafa;
  overflow-y: auto;
  overflow-x: auto;
}

.express-log {
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

.express-log-name li {
  display: flex;

  span {
    display: flex;
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

.order-goods-card {
  overflow-x: hidden;
  max-width: 100%;
}

.order-info-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  max-width: 100%;
}

.order-info-col {
  flex: 1 1 280px;
  min-width: 0;
}

.order-fit-wrap {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.order-fit-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.order-fit-table th,
.order-fit-table td {
  border: 1px solid #ebeef5;
  padding: 10px 12px;
  font-size: 14px;
  color: #606266;
  text-align: left;
  vertical-align: middle;
  word-break: break-all;
}

.order-fit-table th {
  background: #f5f7fa;
  color: #909399;
  font-weight: 500;
}

.order-fit-table .is-center {
  text-align: center;
}

.card-secret-cell {
  word-break: break-all;
}

.card-key-copy {
  padding: 0;
  height: auto;
  justify-content: flex-start;
}

.order-goods-cell {
  display: flex;
  align-items: flex-start;
  min-width: 0;
}

.order-goods-img {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  object-fit: cover;
}

.order-goods-meta {
  margin-left: 13px;
  min-width: 0;
  flex: 1;
}

.order-goods-spec {
  display: inline-block;
  max-width: 100%;
  font-size: 12px;
  color: #999;
  word-break: break-all;
}

.delivery-empty {
  color: #999;
}

.part-delivery-goods-item :deep(.el-form-item__content) {
  line-height: normal;
}

.part-delivery-table-wrap {
  width: 100%;
  min-height: 360px;
  max-height: 520px;
  overflow: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;

  :deep(.el-table__cell) {
    padding: 18px 0;
  }

  :deep(.el-table__header .el-table__cell) {
    padding: 14px 0;
    font-size: 14px;
  }

  :deep(.el-table__body .el-table__cell) {
    font-size: 14px;
  }
}

.part-delivery-goods {
  display: flex;
  align-items: flex-start;
  padding: 8px 0;
  min-height: 88px;
}

.part-delivery-goods-img {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 4px;
}

.part-delivery-goods-info {
  margin-left: 16px;
  min-width: 0;
}

.part-delivery-goods-name {
  line-height: 1.5;
  font-size: 14px;
  word-break: break-all;
}

.part-delivery-goods-spec {
  font-size: 13px;
  color: #999;
  line-height: 1.6;
}

.part-delivery-num-input {
  width: 130px;
}

.package-list {
  margin-top: 12px;
}

.package-title {
  margin-bottom: 8px;
  font-weight: bold;
}

.fulfill-mode-selector {
  margin-bottom: 16px;
}

.fulfill-mode-tip {
  margin-bottom: 12px;
  color: #606266;
}

.package-item-line {
  line-height: 1.8;
}

.delivery-remark-text {
  color: #909399;
  margin-left: 4px;
}

.flex-card {
  display: flex;
  height: 600px;
}

.card-item {
  margin: 5px 0;
}

.flex-card-left {
  flex: 4;
  //background: #f8f8f8;
}

.flex-card-right {
  flex: 6;
}

.search {
  max-width: 100%;
  overflow-x: clip;

  .operation {
    margin-bottom: 2vh;
  }

  .select-clear {
    margin-left: 10px;
  }

  .div-item {
    line-height: 35px;
    display: flex;

    >.div-item-left {
      width: 80px;
    }

    >.div-item-right {
      flex: 1;
      word-break: break-all;
    }
  }

  .div-status-right {
    margin-top: 20px;
    margin-left: 30px;
    font-size: 20px;
  }

  .page {
    margin-top: 2vh;
  }

  button {
    margin-left: 5px;
  }

  .goods-total {
    box-sizing: border-box;
    padding: 20px;
    height: auto;
    width: 100%;
    max-width: 100%;
    overflow: hidden;

    ul {
      margin: 0 10px 0 auto;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      list-style-type: none;
      max-width: 100%;
    }

    li {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      max-width: 100%;
    }

    .label {
      font-size: 14px;
      text-align: right;
    }

    .txt {
      min-width: 88px;
      font-size: 14px;
      text-align: right;
      font-family: verdana;
    }

    .flowPrice {
      color: #cc0000;
      font-size: 22px;
    }
  }
}

.f14 {
  font-size: 14px;
  color: #333;
}

.printgoodtitle {
  font-size: 14px;
  line-height: 1.5;
  margin-top: 15px;
  color: #333;
}

.printgoodinfo {
  // font-size: 14px;
  // background: #f2f2f2;
  // border-bottom:2px solid #333 ;
  padding: 10px;
  overflow: hidden;
  color: #333;

  .printgooditem {
    border-bottom: 1px solid #e8eaec;
    display: flex;
    align-items: flex-start;
    overflow: hidden;
    line-height: 30px;
    margin-bottom: 10px;
    padding-bottom: 10px;

    .printgoodname {
      flex: 1;
      overflow: hidden;

      .printgoodguid {
        font-size: 12px;
        color: #999999;
        line-height: 1.5;

        .printgoodguiditem {
          margin-right: 10px;
        }
      }
    }

    .printgoodprice {
      width: 135px;
      margin-left: 15px;
    }

    .printgoodnumber {
      width: 85px;
      margin-left: 15px;
    }
  }
}

@media print {
  @page {
    size: auto;
    margin: 3mm;
  }

  html,
  body {
    height: inherit;
  }
}
</style>
