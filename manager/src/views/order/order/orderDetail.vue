<template>
  <div class="search">
    <div>
      <el-card style="height: 60px">
        <div style="">
          <el-button v-if="allowOperation.editPrice" @click="modifyPrice">调整价格</el-button>
          <el-button v-if="allowOperation.editConsignee" plain type="primary" @click="editAddress">修改收货地址</el-button>
          <el-button v-if="allowOperation.cancel" plain type="warning" @click="orderCancel">订单取消</el-button>
          <el-button v-if="orderInfo.order.orderStatus === 'UNPAID'" type="primary" @click="confirmPrice">收款</el-button>
          <el-button plain @click="orderLog">订单日志</el-button>
          <el-button v-if="!isNonPhysicalOrder" plain type="primary" style="float:right;" @click="printOrder">打印发货单</el-button>
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
              {{ clientTypeWay(orderInfo.order.clientType) }}
            </div>
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
                unitPrice(
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
                  <span v-for="(item, key) in JSON.parse(row.specs)" :key="key">
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
              <span v-if="row">{{ unitPrice(row.unitPrice || 0, "￥") }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="num" label="数量" min-width="80" />
          <el-table-column prop="returnGoodsNumber" label="退款数量" min-width="80" />
          <el-table-column label="小计" min-width="100">
            <template #default="{ row }">
              <span v-if="row">{{ unitPrice(row.flowPrice, "￥") }}</span>
            </template>
          </el-table-column>
        </el-table>

        <!-- E_COUPON：平台订单详情只读展示卡密，无卡池代管（S-04） -->
        <div v-if="isECouponOrder" class="ecoupon-card-keys mt_10">
          <h4>卡密信息</h4>
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
            :data="ecouponCardKeyRows"
            style="width: 100%"
          >
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="goodsName" label="商品" min-width="140" show-overflow-tooltip />
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

        <div class="goods-total">
          <ul>
            <li>
              <span class="label">商品总额：</span>
              <span class="txt">{{
                unitPrice(orderInfo.order.priceDetailDTO.goodsPrice, "￥")
              }}</span>
            </li>
            <li v-if="
              orderInfo.order.priceDetailDTO.discountPrice &&
              orderInfo.order.priceDetailDTO.discountPrice > 0
            ">
              <span class="label">优惠金额：</span>
              <span class="txt">
                {{ unitPrice(orderInfo.order.priceDetailDTO.discountPrice, "￥") }}</span>
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
                          <td>¥{{ unitPrice(item.discountPrice) }}</td>
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
                <span class="txt" style="border-bottom: 1px dashed;font-size:10px !important;" v-if="index == 1 &&  typeList.length > 1">¥{{ unitPrice(item.discountPrice) }}</span>
                <span class="label" v-if="index == 0 &&  typeList.length > 1" style="font-size:10px !important;"><a  @click="gotoHomes" style="display: inline-block;border-top: 1px dashed;color:black;width:80px;">{{item.promotionName}}：</a><span class="op-split">|</span>
                <span class="txt" style="border-top: 1px dashed;font-size:10px !important;" v-if="index == 0 && typeList.length > 1">¥{{ unitPrice(item.discountPrice) }}</span>
                <span class="label" v-if="typeList.length == 1 && index == 0" style="font-size:10px !important;"><a  @click="gotoHomes" style="display: inline-block;border-top: 1px dashed;border-bottom: 1px dashed;color:black;width:80px;">{{item.promotionName}}：</a><span class="op-split">|</span>
                <span class="txt"  v-if="typeList.length == 1 && index == 0" style="border-top: 1px dashed;border-bottom: 1px dashed;font-size:10px !important;">¥{{ unitPrice(item.discountPrice) }}</span>
              </li> -->
            <li v-if="!isECouponOrder">
              <span class="label">运费：</span>
              <span class="txt">{{
                unitPrice(orderInfo.order.freightPrice, "￥")
              }}</span>
            </li>
            <li v-if="orderInfo.order.priceDetailDTO.updatePrice">
              <span class="label">修改金额：</span>
              <span class="txt theme_color">¥{{ unitPrice(orderInfo.order.priceDetailDTO.updatePrice) }}</span>
            </li>
            <li v-if="orderInfo.order.priceDetailDTO.payPoint != 0">
              <span class="label">使用积分：</span>
              <span class="txt flowPrice">{{
                orderInfo.order.priceDetailDTO.payPoint
              }}</span>
            </li>
            <li>
              <span class="label">应付金额：</span>
              <span class="txt flowPrice">¥{{ unitPrice(orderInfo.order.priceDetailDTO.flowPrice) }}</span>
            </li>
          </ul>
        </div>
      </el-card>
    </div>

    <el-dialog v-model="modal" title="修改金额" width="530px">
      <el-form ref="modifyPriceForm" :model="modifyPriceForm" label-width="70px" :rules="modifyPriceValidate" @submit.prevent>
        <el-form-item label="订单金额" prop="price">
          <el-input-number v-model="modifyPriceForm.price" :min="0" :max="999999" style="width: 120px" />
          <span class="ml_10">元</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modal = false">关闭</el-button>
        <el-button type="primary" @click="modifyPriceSubmit">调整</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="orderCancelModal" title="订单取消" width="530px">
      <el-form ref="orderCancelForm" :model="orderCancelForm" label-width="100px" :rules="orderCancelValidate">
        <el-form-item label="取消原因" prop="reason">
          <el-input v-model="orderCancelForm.reason" type="textarea" :rows="3" placeholder="请输入取消原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="orderCancelModal = false">关闭</el-button>
        <el-button type="primary" @click="orderCancelSubmit">确认</el-button>
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
          {{ addr }}
          <el-button @click="$refs.map.open()">选择</el-button>
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
                    <span v-for="(itemchild, keychild) in JSON.parse(item.specs)" :key="keychild">
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


    <multipleMap ref="map" @callback="selectedRegion" />
  </div>
</template>

<script>
import * as API_Order from "@/api/order";
import * as RegExp from "@/libs/RegExp.js";

import multipleMap from "@/components/map/multiple-map";
import vueQr from "vue-qr";
import { printElement } from "@/utils/print";
import { ElMessage, ElMessageBox } from "element-plus";
import { unitPrice, clientTypeWay } from "@/utils/filters";
import { formatCardKeyStatus } from "@/constants/cardKey";
export default {
  name: "orderList",
  components: {

    multipleMap,
    "vue-qr": vueQr,
  },
  computed: {
    /** 电子卡券订单：无物流区，卡密来自 orderItems[].cardKeys */
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
    ecouponCardKeyDelivered() {
      return (this.data || []).some((item) => item.cardKeyDelivered);
    },
    ecouponCardKeyRows() {
      const rows = [];
      (this.data || []).forEach((item) => {
        (item.cardKeys || []).forEach((ck) => {
          rows.push({
            ...ck,
            goodsName: item.goodsName,
          });
        });
      });
      return rows;
    },
  },
  data () {
    return {
      typeList: [],
      showPrices: false,
      printHiddenFlag: false,//隐藏信息
      loading: false, //加载表格

      addr: "", //地区


      orderLogInfo: [], //订单日志数据
      orderLogModal: false, //弹出调整价格框
      checkedLogistics: [], //选中的物流公司集合
      allowOperation: {}, //订单可才做选项
      sn: "", //订单编号
      orderInfo: {
        order: {
          priceDetailDTO: {},
        },
      },
      modal: false, //弹出调整价格框
      searchForm: {
        pageNumber: 1, // 当前页数
        pageSize: 100, // 页面大小
        orderSn: "", //订单sn
      },
      //调整价格表单
      modifyPriceForm: {
        price: 0,
      },
      //订单取消表单
      orderCancelForm: {
        reason: "",
      },
      //弹出订单取消框
      orderCancelModal: false,
      //订单发货
      orderDeliveryForm: {
        logisticsNo: "", //发货单号
        logisticsId: "", //物流公司
      },
      //验证要调整的订单金额
      modifyPriceValidate: {
        reason: [
          { required: true, message: "请输入大于0小于99999的合法金额" },
          {
            pattern: /^[1-9]\d{0,3}(\.\d{1,2})?$/,
            message: "请输入大于0小于9999的合法金额",
            trigger: "change",
          },
        ],
      },

      //验证取消订单原因
      orderCancelValidate: {
        reason: [{ required: true, message: "取消原因不能为空", trigger: "blur" }],
      },
      addressModal: false, //弹出修改收件信息框
      printModal: false,
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
  watch: {
    $route (to, from) {
      this.$router.go(0);
    },
  },
  methods: {
    unitPrice,
    clientTypeWay,
    formatCardKeyStatus,
    copyCardKey(row) {
      const text = `卡号：${row.cardNo || ""}\n卡密：${row.cardSecret || ""}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          ElMessage.success("已复制到剪贴板");
        });
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        ElMessage.success("已复制到剪贴板");
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

    //确认收款
    confirmPrice () {
      ElMessageBox.confirm(
        "您确定要收款吗？线下收款涉及库存变更，需异步进行，等待约一分钟刷新列表查看",
        "提示",
        { type: "warning" }
      ).then(() => {
        API_Order.orderPay(this.sn).then((res) => {
          if (res.success) {
            ElMessage.success("收款成功");
            this.getDataList();
          }
        });
      }).catch(() => {});
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
      console.log(this.typeList)
      if (this.typeList.length >= 3) {
        console.log(123123)
        this.getContentPrice()
      }
    },
    // 获取订单详情
    getDataList () {
      this.loading = true;
      API_Order.orderDetail(this.sn).then((res) => {
        this.loading = false;
        if (res.success) {
          this.orderInfo = res.result;
          this.allowOperation = res.result.allowOperationVO;
          this.data = res.result.orderItems;
          this.typeList = JSON.parse(JSON.stringify(res.result.order.priceDetailDTO.discountPriceDetail));
          this.getContentPrice()
          this.getOrderPrice()
        }
      });
    },
    modifyPrice () {
      //默认要修改的金额为订单总金额
      this.modifyPriceForm.price = this.orderInfo.order.flowPrice;
      this.modal = true;
    },
    //修改订单金额提交
    modifyPriceSubmit () {
      this.$refs.modifyPriceForm.validate((valid) => {
        if (valid) {
          API_Order.updateOrderPrice(this.sn, this.modifyPriceForm).then((res) => {
            if (res.success) {
              ElMessage.success("修改订单金额成功");
              this.modal = false;
              this.getDataList();
            }
          });
        }
      });
    },
    // 选中的地址
    selectedRegion (val) {
      if(val.type === 'select'){
        const paths = val.data.map(item => item.name).join(',')
        const ids = val.data.map(item => item.id).join(',')
        this.addr = paths;
        this.regionId = ids;
      }
      else{
        this.addr = val.data.addr;
        this.regionId = val.data.addrId;
      }

    },
    //订单取消
    orderCancel () {
      this.orderCancelModal = true;
    },
    //订单取消提交
    orderCancelSubmit () {
      this.$refs.orderCancelForm.validate((valid) => {
        if (valid) {
          API_Order.orderCancel(this.sn, this.orderCancelForm).then((res) => {
            if (res.success) {
              ElMessage.success("取消成功");
              this.getDataList();
            }
            this.orderCancelModal = false;
          });
        }
      });
    },
    //订单日志
    orderLog () {
      this.orderLogModal = true;
    },
    //订单日志取消
    handelCancel () {
      this.orderLogModal = false;
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
    handlePrintInvoice () {
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
        ElMessage.error("请选择地址");
        return;
      }
      this.addressForm.consigneeAddressPath = this.addr;
      this.addressForm.consigneeAddressIdPath = this.regionId;
      this.$refs.addressForm.validate((valid) => {
        if (valid) {
          API_Order.editOrderConsignee(this.sn, this.addressForm).then((res) => {
            if (res.success) {
              ElMessage.success("收货地址修改成功");
              this.addressModal = false;
              this.getDataList();
            }
          });
        }
      });
    },
  },
  mounted () {
    this.sn = this.$route.query.sn;
    this.getDataList();
  },
};
</script>
<style lang="scss">
.lineH30 {
  line-height: 30px;
}

.order-log-div {
  line-height: 30px;
  overflow-y: scroll;
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
