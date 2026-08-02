<template>
  <div class="search">
    <div>
      <el-card style="height: 60px">
        <div>
          <el-button v-if="allowOperation.editPrice" type="primary" @click="modifyPrice">调整价格</el-button>
          <el-button v-if="allowOperation.editConsignee" type="primary" @click="editAddress">修改收货地址</el-button>
          <el-button
            v-if="allowOperation.showLogistics || orderPackages.length > 0"
            type="primary"
            @click="checkLogistics"
          >查看物流</el-button>
          <el-button type="primary" @click="orderLog">订单日志</el-button>
          <el-button v-if="canOrderTake" type="primary" @click="orderTake">订单核销</el-button>
          <el-button v-if="canPartDelivery" type="primary" @click="openPartDelivery">分包裹发货</el-button>
          <el-button type="primary" @click="modifyRemark">添加备注</el-button>
          <el-button
            v-if="allowOperation.showLogistics && logisticsType === 'SHUNFENG'"
            type="primary"
            plain
            @click="sfPrint"
          >下载面单</el-button>
          <el-button
            v-if="allowOperation.ship && logisticsType !== 'SHUNFENG'"
            type="primary"
            plain
            @click="toPrint"
          >打印电子面单</el-button>
          <el-button
            v-if="!isNonPhysicalOrder"
            type="primary"
            plain
            style="float: right"
            @click="printOrder"
          >打印发货单</el-button>
        </div>
      </el-card>
      <el-card class="mt_10 clearfix">
        <div style="width: 30%; float: left; margin-left: 20px">
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
          <div class="div-item" v-if="orderInfo.order.verificationCode">
            <div class="div-item-left">核验码：</div>
            <div class="div-item-right">{{ orderInfo.order.verificationCode }}</div>
          </div>
        </div>
        <div style="width: 30%; float: left; margin-left: 20px">
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
        <div style="width: 36%; float: left">
          <div class="div-item" v-if="!isECouponOrder && orderInfo.order.deliveryMethod != 'SELF_PICK_UP'">
            <div class="div-item-left">收货信息：</div>
            <div class="div-item-right">
              {{ orderInfo.order.consigneeName }}
              {{ orderInfo.order.consigneeMobile }}
              {{ orderInfo.order.consigneeAddressPath }}
              {{ orderInfo.order.consigneeDetail }}
            </div>
          </div>
          <div class="div-item" v-if="orderInfo.order.deliveryMethod == 'SELF_PICK_UP'">
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

          <!-- <div class="div-item" v-if="orderInfo.order.needReceipt == false">
            <div class="div-item-left">发票信息：</div>
            <div class="div-item-right">暂无发票信息</div>
          </div> -->

          <!-- <div class="div-item" v-if="orderInfo.order.needReceipt == true">
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
              {{
                $filters.unitPrice(
                  orderInfo.receipt && orderInfo.receipt.receiptPrice
                    ? orderInfo.receipt.receiptPrice
                    : "暂无",
                  "￥"
                )
              }}
            </div>
          </div>

          <div class="div-item" v-if="orderInfo.order.needReceipt == true">
            <div class="div-item-left">是否开票：</div>
            <div class="div-item-right">
              {{ orderInfo.receipt ? (orderInfo.receipt.receiptStatus == 0 ? "未开" : "已开") : "空" }}
            </div>
          </div> -->

          <div class="div-item" v-if="!isNonPhysicalOrder">
            <div class="div-item-left">配送方式：</div>
            <div class="div-item-right">
              {{ orderInfo.deliveryMethodValue }}
            </div>
          </div>
        </div>
      </el-card>
      <el-card class="mt_10">
        <el-table v-loading="loading" border :data="data" ref="table" style="width: 100%">
          <el-table-column label="商品" min-width="200">
            <template #default="{ row }">
              <div v-if="row" style="margin-top: 5px; height: 80px; display: flex">
                <div>
                  <img :src="row.image" style="height: 60px; margin-top: 1px; width: 60px" />
                </div>
                <div style="margin-left: 13px">
                  <div class="div-zoom">
                    <a class="link-text" @click="linkTo(row.goodsId, row.skuId)">{{ row.goodsName }}</a>
                  </div>
                  <span v-for="(item, key) in parseOrderItemSpecs(row.specs)" :key="key">
                    <span v-show="key != 'images'" style="font-size: 12px; color: #999999">
                      {{ key }} : {{ item }}</span>
                  </span>
                  <el-popover trigger="hover" title="扫码在手机中查看" width="180">
                    <template #reference>
                      <img src="../../../assets/qrcode.svg" class="hover-pointer" width="20" height="20" alt="" style="display: block" />
                    </template>
                    <vue-qr :text="wapLinkTo(row.goodsId, row.skuId)" :margin="0" colorDark="#000" colorLight="#fff" :size="150" />
                  </el-popover>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="优惠" min-width="100">
            <template #default="{ row }">
              <span v-if="row">{{ getPromotionText(row) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="单价" min-width="100">
            <template #default="{ row }">
              <span v-if="row">{{ $filters.unitPrice(row.unitPrice || 0, "￥") }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="num" label="数量" min-width="80" />
          <el-table-column prop="returnGoodsNumber" label="退款数量" min-width="80" />
          <el-table-column label="小计" min-width="100">
            <template #default="{ row }">
              <span v-if="row">{{ $filters.unitPrice(row.flowPrice, "￥") }}</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 卡密信息（E_COUPON 主单或满赠子单，以 cardKeyFulfillStatus 为准） -->
        <div v-if="hasCardKeySection" class="ecoupon-card-keys mt_10">
          <h4>卡密信息</h4>
          <div
            v-for="line in cardKeyFulfillLines"
            :key="line.key"
            class="ecoupon-fulfill-block"
          >
            <div v-if="cardKeyFulfillLines.length > 1" class="ecoupon-fulfill-title mb_10">
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
            <el-table
              v-else-if="line.cardKeys.length"
              border
              :data="lineCardKeyRows(line)"
              style="width: 100%"
              class="mb_10"
            >
              <el-table-column type="index" label="序号" width="60" align="center" />
              <el-table-column
                v-if="cardKeyFulfillLines.length > 1"
                prop="goodsName"
                label="商品"
                min-width="140"
                show-overflow-tooltip
              />
              <el-table-column prop="cardNo" label="卡号" min-width="140" show-overflow-tooltip />
              <el-table-column prop="cardSecret" label="卡密" min-width="120" show-overflow-tooltip />
              <el-table-column prop="allocatedTime" label="发卡时间" width="170" />
              <el-table-column label="状态" width="90" align="center">
                <template #default="{ row }">
                  <span v-if="row">{{ formatCardKeyStatus(row.status || 'ALLOCATED') }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" align="center">
                <template #default="{ row }">
                  <el-button v-if="row" link type="primary" @click="copyCardKey(row)">复制</el-button>
                </template>
              </el-table-column>
            </el-table>
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
            <li v-if="!isECouponOrder">
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
      <el-form ref="modifyPriceForm" :model="modifyPriceForm" label-width="100px" :rules="modifyPriceValidate" @submit.prevent>
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
      <el-form ref="modifyRemarkForm" :model="modifyRemarkForm" label-width="100px">
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
      <el-form ref="addressForm" :model="addressForm" label-width="100px" :rules="addressRule">
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

    <el-dialog v-model="partDeliveryModal" title="分包裹发货" width="1200px">
      <el-form ref="partDeliveryForm" :model="partDeliveryForm" label-width="100px" :rules="partDeliveryRules">
        <el-form-item label="物流公司" prop="logisticsId">
          <el-select v-model="partDeliveryForm.logisticsId" placeholder="请选择物流公司" filterable style="width: 260px">
            <el-option
              v-for="item in checkedLogistics"
              :key="getLogisticsId(item)"
              :label="getLogisticsName(item)"
              :value="getLogisticsId(item)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号" prop="logisticsNo">
          <el-input v-model="partDeliveryForm.logisticsNo" placeholder="请输入物流单号" style="width: 260px" />
        </el-form-item>
        <el-form-item label-width="0" prop="partDeliveryDTOList" class="part-delivery-goods-item">
          <div v-if="deliverableOrderItems.length" class="part-delivery-table-wrap">
            <el-table
              ref="partDeliveryTable"
              border
              :data="deliverableOrderItems"
              style="width: 100%"
              @selection-change="handlePartDeliverySelectionChange"
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
            <el-table-column label="数量" min-width="140" align="center">
              <template #default="{ row }">
                <el-input-number
                  v-model="partDeliveryForm.deliveryNumMap[getOrderItemId(row)]"
                  :min="1"
                  :max="getRemainingDeliveryNum(row)"
                  :precision="0"
                  controls-position="right"
                  size="default"
                  class="part-delivery-num-input"
                  @change="(val) => handlePartDeliveryNumChange(row, val)"
                />
              </template>
            </el-table-column>
            <el-table-column label="已发包裹" min-width="110" align="center">
              <template #default="{ row }">
                {{ getShippedPackageNum(row) }}
              </template>
            </el-table-column>
            <el-table-column label="小计" min-width="110" align="center">
              <template #default="{ row }">
                {{ $filters.unitPrice(getPartDeliverySubtotal(row), "￥") }}
              </template>
            </el-table-column>
          </el-table>
          </div>
          <div v-else class="delivery-empty">暂无可发货商品</div>
        </el-form-item>
      </el-form>
      <div v-if="orderPackages.length" class="package-list">
        <div class="package-title">已有包裹</div>
        <el-table :data="orderPackages" border size="small">
          <el-table-column prop="logisticsName" label="物流公司" min-width="120" />
          <el-table-column prop="logisticsNo" label="物流单号" min-width="160" />
        </el-table>
      </div>
      <template #footer>
        <el-button @click="partDeliveryModal = false">关闭</el-button>
        <el-button type="primary" :loading="partDeliverySubmitting" @click="submitPartDelivery">确认发货</el-button>
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
          <dl>
            <dt>物流公司：</dt>
            <dd><div class="text-box">{{ packageItem.logisticsName }}</div></dd>
          </dl>
          <dl>
            <dt>快递单号：</dt>
            <dd><div class="text-box">{{ packageItem.logisticsNo }}</div></dd>
          </dl>
          <div class="div-express-log">
            <ul class="express-log express-log-name">
              <li v-for="(item, index) in packageItem.orderPackageItemList" :key="index">
                <span class="time" style="width: 50%;"><span>商品名称：</span><span>{{ item.goodsName }}</span></span>
                <span class="time" style="width: 30%;"><span>发货时间：</span><span>{{ item.logisticsTime }}</span></span>
                <span class="time" style="width: 20%;"><span>发货数量：</span><span>{{ item.deliverNumber }}</span></span>
              </li>
            </ul>
          </div>
          <div class="div-express-log">
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

    <el-dialog v-model="orderDeliverModal" title="订单发货" width="500px">
      <el-form
        v-if="facesheetFlag"
        ref="faceSheetForm"
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
      <el-form
        v-else
        ref="orderDeliveryForm"
        :model="orderDeliveryForm"
        :rules="orderDeliverFormValidate"
        label-width="90px"
      >
        <el-form-item label="物流公司" prop="logisticsId">
          <el-select v-model="orderDeliveryForm.logisticsId" placeholder="请选择" style="width: 250px">
            <el-option
              v-for="(item, i) in checkedLogistics"
              :key="i"
              :label="item.name"
              :value="item.logisticsId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号" prop="logisticsNo">
          <el-input v-model="orderDeliveryForm.logisticsNo" style="width: 250px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="orderDeliverModal = false">关闭</el-button>
        <el-button type="primary" @click="orderDeliverySubmit">发货</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="orderTakeModal" title="订单核销" width="530px">
      <el-form ref="orderTakeForm" :model="orderTakeForm" label-width="100px" :rules="orderTakeValidate">
        <el-form-item label="核销码" prop="qrCode">
          <el-input v-model="orderTakeForm.qrCode" placeholder="请输入核销码" maxlength="10" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="orderTakeModal = false">取消</el-button>
        <el-button type="primary" @click="orderTakeSubmit">核销</el-button>
      </template>
    </el-dialog>

    <multipleMap ref="map" @callback="selectedRegion" />
  </div>
</template>

<script>
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
  flattenOrderCardKeys,
  cardKeyFulfillAlertType,
  resolveCardKeyFulfillMessage,
} from "@/constants/goodsType";
export default {
  name: "orderDetail",
  components: {
    multipleMap,
    "vue-qr": vueQr,
  },
  data () {
    return {
      typeList: [],
      showPrices: false,
      printHiddenFlag: false,
      loading: false,
      logisticsType: "KUAIDINIAO",
      someJSONdata: "",
      faceSheetForm: {
        logisticsId: "",
      },
      faceSheetFormValidate: {
        logisticsId: [{ required: true, message: "请选择物流公司" }],
      },
      facesheetFlag: false,
      logisticsModal: false,
      orderDeliverModal: false,
      logisticsInfo: {
        shipper: "",
      },
      packageTraceList: [],
      sellerRemarkModal: false,
      addr: "",
      regionId: "",

      orderLogModal: false,
      checkedLogistics: [], //选中的物流公司集合
      allowOperation: {}, //订单可才做选项
      sn: "", //订单编号
      orderInfo: {
        order: {
          priceDetailDTO: {},
        },
      },
      modal: false,
      //调整价格表单
      modifyPriceForm: {
        orderPrice: 0,
      },
      modifyRemarkForm: {
        sellerRemark: "",
      },
      //订单发货
      orderDeliveryForm: {
        logisticsNo: "", //发货单号
        logisticsId: "", //物流公司
      },
      partDeliveryModal: false,
      partDeliverySubmitting: false,
      partDeliveryForm: {
        logisticsNo: "",
        logisticsId: "",
        selectedOrderItemIds: [],
        deliveryNumMap: {},
      },
      orderPackages: [],
      //验证要调整的订单金额
      modifyPriceValidate: {
        orderPrice: [
          { required: true, message: "请输入大于等于0或小于99999的合法金额" },
          {
            pattern: /^\d+(\.(([1-9])|(0[1-9])|([\d^0]\d)))?$/,
            message: "请输入大于0小于9999的合法金额",
            trigger: "change",
          },
        ],
      },

      addressModal: false,
      printModal: false,
      orderTakeModal: false,
      orderTakeForm: {
        qrCode: "",
      },
      orderTakeValidate: {
        qrCode: [{ required: true, message: "订单核销码不能为空", trigger: "blur" }],
      },
      //收件地址表单
      addressForm: {
        consigneeName: "",
        consigneeMobile: "",
        consigneeDetail: "",
        consigneeAddressPath: "",
        consigneeAddressIdPath: "",
      },
      orderDeliverFormValidate: {
        logisticsNo: [{ required: true, message: "发货单号不能为空", trigger: "change" }],
        logisticsId: [{ required: true, message: "请选择物流公司", trigger: "blur" }],
      },
      partDeliveryRules: {
        logisticsNo: [{ required: true, message: "发货单号不能为空", trigger: "change" }],
        logisticsId: [{ required: true, message: "请选择物流公司", trigger: "change" }],
      },
      addressRule: {
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
      },

      data: [], // 表单数据
    };
  },
  computed: {
    /** 电子卡券订单：隐藏物流/发货/售后，展示 orderItems[].cardKeys（FR-S-04 / FR-S-05） */
    isECouponOrder() {
      const t = this.orderInfo?.order?.orderType;
      return t === "E_COUPON" || this.$route.query.orderType === "E_COUPON";
    },
    isVirtualOrder() {
      const t = this.orderInfo?.order?.orderType;
      return t === "VIRTUAL" || this.$route.query.orderType === "VIRTUAL";
    },
    isNonPhysicalOrder() {
      return this.isVirtualOrder || this.isECouponOrder;
    },
    hasCardKeySection() {
      return orderHasCardKeySection({
        orderItems: this.data,
        giftSummaries: this.orderInfo.giftECouponOrders,
        isECouponOrder: this.isECouponOrder,
      });
    },
    cardKeyFulfillLines() {
      return collectCardKeyFulfillLines(this.data, this.orderInfo.giftECouponOrders);
    },
    ecouponCardKeyRows() {
      return flattenOrderCardKeys(this.data, true, this.orderInfo.giftECouponOrders);
    },
    canPartDelivery() {
      if (!this.allowOperation.ship) return false;
      const status = this.orderInfo.order && this.orderInfo.order.orderStatus;
      return (
        !this.isNonPhysicalOrder &&
        ["UNDELIVERED", "PARTS_DELIVERED"].includes(status) &&
        this.deliverableOrderItems.length > 0
      );
    },
    deliverableOrderItems() {
      return (this.data || []).filter((item) => {
        if (!this.getOrderItemId(item)) return false;
        return this.getRemainingDeliveryNum(item) > 0;
      });
    },
    canOrderTake() {
      if (this.allowOperation.take) return true;
      const order = this.orderInfo?.order;
      if (!order) return false;
      const isVirtual =
        this.$route.query.orderType === "VIRTUAL" ||
        order.orderType === "VIRTUAL";
      return isVirtual && order.orderStatus === "TAKE";
    },
  },
  watch: {
    $route (to, from) {
      this.$router.go(0);
    },
  },
  methods: {
    formatCardKeyStatus,
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
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.$Message.success("已复制到剪贴板");
        });
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        this.$Message.success("已复制到剪贴板");
      }
    },
    getPromotionText(row) {
      let resultText = "";
      if (row && row.promotionType) {
        const type = row.promotionType.split(",");
        if (type.indexOf("PINTUAN") != -1) resultText += "拼团 ";
        if (type.indexOf("SECKILL") != -1) resultText += "秒杀 ";
        if (type.indexOf("COUPON") != -1) resultText += "优惠券 ";
        if (type.indexOf("FULL_DISCOUNT") != -1) resultText += "满减 ";
        if (type.indexOf("POINTS_GOODS") != -1) resultText += "积分商品 ";
      }
      return resultText === "" ? "暂无未参与任何促销" : resultText;
    },
    gotoHomes () {
      return false
    },
    getOrderItemId(item) {
      return item && (item.id || item.orderItemId || item.sn);
    },
    getLogisticsId(item) {
      return item && (item.logisticsId || item.id);
    },
    getLogisticsName(item) {
      return item && (item.logisticsName || item.name || item.logisticsCompany || item.logisticsId || item.id);
    },
    parseOrderItemSpecs(specs) {
      if (!specs) return {};
      try {
        return JSON.parse(specs);
      } catch (e) {
        return {};
      }
    },
    getShippedPackageNum(item) {
      if (item != null && item.deliverNumber != null && item.deliverNumber !== "") {
        const direct = Number(item.deliverNumber);
        if (Number.isFinite(direct)) return direct;
      }
      const orderItemId = this.getOrderItemId(item);
      if (!orderItemId || !this.orderPackages.length) return 0;
      let total = 0;
      this.orderPackages.forEach((pkg) => {
        (pkg.orderPackageItemList || []).forEach((pkgItem) => {
          if (this.isPackageItemMatch(item, pkgItem)) {
            total += Number(pkgItem.deliverNumber ?? pkgItem.num ?? 0);
          }
        });
      });
      return total;
    },
    isPackageItemMatch(orderItem, pkgItem) {
      const orderKeys = [
        this.getOrderItemId(orderItem),
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
    },
    getRemainingDeliveryNum(item) {
      const total = Number(item && item.num) || 0;
      return Math.max(total - this.getShippedPackageNum(item), 0);
    },
    getPartDeliverySubtotal(row) {
      const id = this.getOrderItemId(row);
      const qty = Number(this.partDeliveryForm.deliveryNumMap[id]) || 0;
      const unitPrice = Number(row.unitPrice) || 0;
      return unitPrice * qty;
    },
    initPartDeliveryNumMap() {
      const map = {};
      this.deliverableOrderItems.forEach((item) => {
        const id = this.getOrderItemId(item);
        if (id) {
          map[id] = this.getRemainingDeliveryNum(item);
        }
      });
      this.partDeliveryForm.deliveryNumMap = map;
    },
    refreshPartDeliveryAfterSubmit() {
      this.partDeliveryModal = false;
      this.loading = true;
      return Promise.all([
        API_Order.getOrderDetail(this.sn).then((res) => {
          if (res.success) {
            this.orderInfo = res.result;
            this.allowOperation = res.result.allowOperationVO;
            this.data = res.result.orderItems;
            this.typeList = res.result.order.priceDetailDTO.discountPriceDetail
              ? JSON.parse(JSON.stringify(res.result.order.priceDetailDTO.discountPriceDetail))
              : [];
            this.getContentPrice();
            this.getOrderPrice();
          }
        }),
        this.getOrderPackages(),
      ]).finally(() => {
        this.loading = false;
        this.partDeliveryForm.logisticsNo = "";
        this.partDeliveryForm.logisticsId = "";
        this.partDeliveryForm.selectedOrderItemIds = [];
        this.initPartDeliveryNumMap();
        this.$nextTick(() => {
          this.$refs.partDeliveryTable?.clearSelection();
          this.$refs.partDeliveryForm?.clearValidate();
        });
      });
    },
    handlePartDeliveryNumChange(row, value) {
      const id = this.getOrderItemId(row);
      if (!id) return;
      const num = Number(value);
      if (!Number.isFinite(num) || num < 1) return;
      if (!this.partDeliveryForm.selectedOrderItemIds.includes(id)) {
        this.partDeliveryForm.selectedOrderItemIds = [
          ...this.partDeliveryForm.selectedOrderItemIds,
          id,
        ];
        this.$nextTick(() => {
          this.$refs.partDeliveryTable?.toggleRowSelection(row, true);
        });
      }
    },
    isPartDeliveryRowSelectable(row) {
      return this.getRemainingDeliveryNum(row) > 0;
    },
    handlePartDeliverySelectionChange(selection) {
      const selectedIds = [];
      selection.forEach((item) => {
        const id = this.getOrderItemId(item);
        if (!id) return;
        selectedIds.push(id);
        if (this.partDeliveryForm.deliveryNumMap[id] == null) {
          this.partDeliveryForm.deliveryNumMap[id] = this.getRemainingDeliveryNum(item);
        }
      });
      this.partDeliveryForm.selectedOrderItemIds = selectedIds;
    },
    isPartDeliveryItemSelected(item) {
      const id = this.getOrderItemId(item);
      return !!id && this.partDeliveryForm.selectedOrderItemIds.includes(id);
    },
    buildPartDeliveryDTOList() {
      return this.partDeliveryForm.selectedOrderItemIds
        .map((orderItemId) => ({
          orderItemId,
          deliveryNum: Number(this.partDeliveryForm.deliveryNumMap[orderItemId]),
        }))
        .filter((item) => item.orderItemId && item.deliveryNum > 0);
    },
    resetPartDeliveryForm() {
      this.partDeliveryForm = {
        logisticsNo: "",
        logisticsId: "",
        selectedOrderItemIds: [],
        deliveryNumMap: {},
      };
      this.$nextTick(() => {
        if (this.$refs.partDeliveryForm) {
          this.$refs.partDeliveryForm.clearValidate();
        }
        if (this.$refs.partDeliveryTable) {
          this.$refs.partDeliveryTable.clearSelection();
        }
      });
    },
    openPartDelivery() {
      this.resetPartDeliveryForm();
      this.partDeliveryModal = true;
      this.getCheckedLogistics();
      this.getOrderPackages();
    },
    getCheckedLogistics() {
      API_Order.getLogisticsChecked().then((res) => {
        if (res.success) {
          this.checkedLogistics = Array.isArray(res.result) ? res.result : [];
        }
      });
    },
    getOrderPackages() {
      return API_Order.getPackage(this.sn).then((res) => {
        if (res.success) {
          this.orderPackages = Array.isArray(res.result) ? res.result : [];
        }
        this.initPartDeliveryNumMap();
      });
    },
    submitPartDelivery() {
      this.$refs.partDeliveryForm.validate((valid) => {
        if (!valid) return;
        const partDeliveryDTOList = this.buildPartDeliveryDTOList();
        if (!partDeliveryDTOList.length) {
          this.$Message.error("请选择本次发货商品并填写发货数量");
          return;
        }
        this.partDeliverySubmitting = true;
        API_Order.partDelivery(this.sn, {
          orderSn: this.sn,
          logisticsNo: this.partDeliveryForm.logisticsNo,
          logisticsId: this.partDeliveryForm.logisticsId,
          partDeliveryDTOList,
        })
          .then((res) => {
            if (res.success) {
              this.$Message.success("发货成功");
              this.refreshPartDeliveryAfterSubmit();
            }
          })
          .finally(() => {
            this.partDeliverySubmitting = false;
          });
      });
    },

    // 获取订单详情
    getDataDetail () {
      this.loading = true;
      API_Order.getOrderDetail(this.sn).then((res) => {
        this.loading = false;
        if (res.success) {
          this.orderInfo = res.result;
          this.allowOperation = res.result.allowOperationVO;
          this.data = res.result.orderItems || [];
          const discountDetail = res.result.order.priceDetailDTO?.discountPriceDetail;
          this.typeList = discountDetail
            ? JSON.parse(JSON.stringify(discountDetail))
            : [];
          this.getContentPrice();
          this.getOrderPrice();
        }
      });
    },
    modifyPrice () {
      this.modifyPriceForm.orderPrice = this.orderInfo.order.flowPrice;
      this.modal = true;
    },
    modifyPriceSubmit () {
      this.$refs.modifyPriceForm.validate((valid) => {
        if (valid) {
          API_Order.modifyOrderPrice(this.sn, this.modifyPriceForm).then((res) => {
            if (res.success) {
              this.$Message.success("修改订单金额成功");
              this.modal = false;
              this.getDataDetail();
            }
          });
        }
      });
    },
    modifyRemark () {
      this.modifyRemarkForm.sellerRemark = this.orderInfo.order.sellerRemark || "";
      this.sellerRemarkModal = true;
    },
    modifyRemarkSubmit () {
      this.$refs.modifyRemarkForm.validate((valid) => {
        if (valid) {
          API_Order.modifyOrderRemark(this.sn, this.modifyRemarkForm).then((res) => {
            if (res.success) {
              this.$Message.success("编辑订单备注成功");
              this.sellerRemarkModal = false;
              this.getDataDetail();
            }
          });
        }
      });
    },
    checkLogistics () {
      this.logisticsModal = true;
      if (this.orderPackages.length > 0) {
        this.logisticsList();
      } else {
        this.logistics();
      }
    },
    logisticsList () {
      API_Order.getPackage(this.sn).then((res) => {
        if (res.success && res.result != null) {
          this.packageTraceList = res.result;
        }
      });
    },
    logistics () {
      API_Order.getTraces(this.sn).then((res) => {
        if (res.success && res.result != null) {
          this.logisticsInfo = res.result;
        }
      });
    },
    toPrint () {
      this.facesheetFlag = true;
      API_Logistics.getCheckedOn().then((res) => {
        if (res.success) {
          this.checkedLogistics = res.result;
          this.orderDeliverModal = true;
        }
      });
    },
    sfPrint () {
      API_Order.getOrderFaceSheet(this.sn, this.faceSheetForm).then((res) => {
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
              link.download = `${this.orderInfo.order.sn}.pdf`;
              link.style.display = "none";
              link.href = URL.createObjectURL(blob);
              document.body.appendChild(link);
              link.click();
              URL.revokeObjectURL(link.href);
              document.body.removeChild(link);
            } else {
              navigator.msSaveBlob(blob, `${this.orderInfo.order.sn}.pdf`);
            }
          });
        }
      });
    },
    toPrints (printWindow) {
      this.orderDeliverModal = false;
      if (!this.someJSONdata) {
        printWindow && printWindow.close();
        return;
      }
      const win = printWindow || window.open("", "_blank");
      if (!win) {
        this.$Message.error("无法打开打印窗口，请允许浏览器弹窗");
        return;
      }
      win.document.write(this.someJSONdata);
      win.document.close();
      win.focus();
      this.$Message.success("电子面单发货成功");
      this.getDataDetail();
    },
    orderDeliverySubmit () {
      if (this.facesheetFlag) {
        this.$refs.faceSheetForm.validate((valid) => {
          if (valid) {
            const printWindow = window.open("", "_blank");
            API_Order.getOrderFaceSheet(this.sn, this.faceSheetForm).then((res) => {
              if (res.success && res.result.printTemplate) {
                this.someJSONdata = res.result.printTemplate;
                this.toPrints(printWindow);
              } else {
                printWindow && printWindow.close();
                this.$Message.error("电子面单发货失败！");
              }
            }).catch(() => {
              printWindow && printWindow.close();
              this.$Message.error("电子面单发货失败！");
            });
          }
        });
      } else {
        this.$refs.orderDeliveryForm.validate((valid) => {
          if (valid) {
            API_Order.orderDelivery(this.sn, this.orderDeliveryForm).then((res) => {
              if (res.success) {
                this.$Message.success("订单发货成功");
                this.orderDeliverModal = false;
                this.getDataDetail();
              }
            });
          }
        });
      }
    },
    getLogisticsSetting () {
      API_Logistics.getLogisticsSetting().then((res) => {
        if (res.success) {
          this.logisticsType = res.result;
        }
      });
    },
    getOrderPrice () {
      if (this.showPrices) {
        this.showPrices = false
      } else if (!this.showPrices) {
        this.showPrices = true
      }
    },
    getContentPrice () {
      for (let i = 0; i < this.typeList.length; i++) {
        for (let j = i + 1; j < this.typeList.length; j++) {
          if (this.typeList[i].promotionId === this.typeList[j].promotionId) {
            this.typeList[i].discountPrice = this.typeList[i].discountPrice + this.typeList[j].discountPrice
            this.typeList.splice(j, 1)
          }
        }
      }
      if (this.typeList.length >= 3) {
        this.getContentPrice();
      }
    },
    selectedRegion (val) {
      if (val.type === "select") {
        const paths = val.data.map((item) => item.name).join(",");
        const ids = val.data.map((item) => item.id).join(",");
        this.addr = paths;
        this.regionId = ids;
        this.addressForm.consigneeAddressPath = paths;
        this.addressForm.consigneeAddressIdPath = ids;
      } else {
        this.addr = val.data.addr;
        this.regionId = val.data.addrId;
        this.addressForm.consigneeAddressPath = val.data.addr;
        this.addressForm.consigneeAddressIdPath = val.data.addrId;
      }
    },
    //订单日志
    orderLog () {
      this.orderLogModal = true;
    },
    //订单日志取消
    handelCancel () {
      this.orderLogModal = false;
    },
    orderTake() {
      this.orderTakeForm.qrCode = this.orderInfo.order.verificationCode || "";
      this.orderTakeModal = true;
      this.$nextTick(() => {
        this.$refs.orderTakeForm?.clearValidate();
      });
    },
    orderTakeSubmit() {
      this.$refs.orderTakeForm.validate((valid) => {
        if (!valid) return;
        API_Order.orderTake(this.sn, this.orderTakeForm.qrCode).then((res) => {
          if (res.success) {
            this.$Message.success("订单核销成功");
            this.orderTakeModal = false;
            this.getDataDetail();
          }
        });
      });
    },
    //打印发货单
    printOrder () {
      this.printModal = true;
    },
    printHiddenInfo () {
      this.printHiddenFlag = !this.printHiddenFlag;
    },
    printCancel () {
      // this.printHiddenFlag = false;
    },
    handlePrintInvoice() {
      printElement("printInfo", "发货单");
    },
    //弹出修改收货地址框
    editAddress () {
      this.addressModal = true;
      this.addr = this.orderInfo.order.consigneeAddressPath;
      this.regionId = this.orderInfo.order.consigneeAddressIdPath;
      this.addressForm.consigneeName = this.orderInfo.order.consigneeName;
      this.addressForm.consigneeMobile = this.orderInfo.order.consigneeMobile;
      this.addressForm.consigneeDetail = this.orderInfo.order.consigneeDetail;
      this.addressForm.consigneeAddressPath = this.orderInfo.order.consigneeAddressPath;
      this.addressForm.consigneeAddressIdPath = this.orderInfo.order.consigneeAddressIdPath;
    },
    //修改收货地址
    editAddressSubmit () {
      if (this.regionId == "") {
        this.$Message.error("请选择地址");
        return;
      }
      this.addressForm.consigneeAddressPath = this.addr;
      this.addressForm.consigneeAddressIdPath = this.regionId;
      this.$refs.addressForm.validate((valid) => {
        if (valid) {
          API_Order.editOrderConsignee(this.sn, this.addressForm).then((res) => {
            if (res.success) {
              this.$Message.success("收货地址修改成功");
              this.addressModal = false;
              this.getDataDetail();
            }
          });
        }
      });
    },
  },
  mounted () {
    this.sn = this.$route.query.sn;
    this.getDataDetail();
    this.getLogisticsSetting();
    this.getOrderPackages();
  },
  beforeRouteLeave (to, from, next) {
    if (to.name === "orderList" || to.name === "virtualOrderList") {
      to.meta.keepAlive = true;
    }
    next();
  },
};
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
    padding: 20px;
    height: 220px;
    width: 100%;

    ul {
      margin-right: 10px;
      display: block;
      float: right;
      list-style-type: none;

      li {
        text-align: -webkit-match-parent;
      }
    }

    .label {
      float: left;
      width: 500px;
      font-size: 14px;
      text-align: right;
    }

    .txt {
      float: left;
      font-size: 14px;
      width: 130px;
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
