<template>
  <div class="search">
    <Card style="height: 60px">
      <div>
        <Button v-if="allowOperation.editPrice" @click="modifyPrice" type="primary">调整价格</Button>
        <Button v-if="allowOperation.editConsignee" @click="editAddress" type="primary">修改收货地址</Button>
        <Button v-if="allowOperation.showLogistics || orderPackage.length > 0" @click="checkLogistics" type="primary">查看物流</Button>
        <Button @click="orderLogModal = true" type="primary">订单日志</Button>
        <Button @click="printOrder" type="primary" ghost style="float:right;">打印发货单</Button>
        <Button v-if="allowOperation.take" @click="orderTake" type="primary">订单核销</Button>
        <!-- <Button v-if="allowOperation.ship" @click="orderDeliver" type="primary">发货</Button> -->

        <Button v-if="allowOperation.ship" @click="groupShip" type="primary">分包裹发货</Button>

        <Button @click="sfPrint" type="primary" ghost
          v-if="allowOperation.showLogistics && logisticsType == 'SHUNFENG'">下载面单</Button>
        <Button @click="toPrint" type="primary" ghost
          v-if="allowOperation.ship && logisticsType != 'SHUNFENG'">打印电子面单</Button>
      </div>
    </Card>

    <Card class="mt_10">
      <Row>
        <Col span="12">
        <div class="div-item">
          <div class="div-item-left">订单号：</div>
          <div class="div-item-right">{{ orderInfo.order.sn }}</div>
        </div>
        <div class="div-item">
          <div class="div-item-left">订单来源：</div>
          <div class="div-item-right">
            {{ orderInfo.order.clientType | clientTypeWay }}
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
        <div class="div-item" v-if="orderInfo.order.needReceipt == false">
          <div class="div-item-left">发票信息：</div>
          <div class="div-item-right">暂无发票信息</div>
        </div>
        <template v-if="orderInfo.order.needReceipt == true && orderInfo.receipt">
          <div class="div-item">
            <div class="div-item-left">发票抬头：</div>
            <div class="div-item-right">
              {{
                orderInfo.receipt.receiptTitle
                ? orderInfo.receipt.receiptTitle
                : "暂无"
              }}
            </div>
          </div>

          <div class="div-item" v-if="orderInfo.receipt.taxpayerId">
            <div class="div-item-left">发票税号：</div>
            <div class="div-item-right">
              {{
                orderInfo.receipt.taxpayerId
                ? orderInfo.receipt.taxpayerId
                : "暂无"
              }}
            </div>
          </div>

          <div class="div-item">
            <div class="div-item-left">发票内容：</div>
            <div class="div-item-right">
              {{
                orderInfo.receipt.receiptContent
                ? orderInfo.receipt.receiptContent
                : "暂无"
              }}
            </div>
          </div>

          <div class="div-item">
            <div class="div-item-left">发票金额：</div>
            <div class="div-item-right">
              <span v-if="orderInfo.receipt.receiptPrice">￥</span>{{
                orderInfo.receipt.receiptPrice
                ? orderInfo.receipt.receiptPrice
                : "暂无" | unitPrice
              }}
            </div>
          </div>

          <div class="div-item">
            <div class="div-item-left">是否开票：</div>
            <div class="div-item-right">
              {{ orderInfo.receipt.receiptStatus == 0 ? "未开" : "已开" }}
            </div>
          </div>
        </template>
        </Col>
        <Col span="12">
        <div class="div-item" v-if="orderInfo.order.deliveryMethod != 'SELF_PICK_UP'">
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

        <div class="div-item" v-if="orderInfo.order.orderType != 'VIRTUAL'">
          <div class="div-item-left">配送方式：</div>
          <div class="div-item-right">
            {{
              orderInfo.deliveryMethodValue
              ? orderInfo.deliveryMethodValue
              : "暂无配送方式"
            }}
          </div>
        </div>
        </Col>
      </Row>
    </Card>

    <Card class="mt_10">
      <Table :loading="loading" border :columns="columns" :data="data" ref="table">
        <!-- 商品栏目格式化 -->
        <template slot="goodsSlot" slot-scope="{ row }">
          <div style="margin-top: 5px; height: 80px; display: flex">
            <div style="">
              <img :src="row.image" style="height: 60px; margin-top: 1px; width: 60px" />
            </div>

            <div style="margin-left: 13px">
              <div class="div-zoom">
                <a @click="linkTo(row.goodsId, row.skuId)">{{
                  row.goodsName
                }}</a>
              </div>
              <span v-for="(item, key) in JSON.parse(row.specs)" :key="key">
                <span v-show="key != 'images'" style="font-size: 12px; color: #999999">
                  {{ key }} : {{ item }}
                </span>
              </span>
              <Poptip trigger="hover" style="display: block" title="扫码在手机中查看" transfer>
                <div slot="content">
                  <vue-qr :text="wapLinkTo(row.goodsId, row.skuId)" :margin="0" colorDark="#000" colorLight="#fff"
                    :size="150"></vue-qr>
                </div>
                <img src="../../../assets/qrcode.svg" class="hover-pointer" width="20" height="20" alt="" />
              </Poptip>
            </div>
          </div>
        </template>
      </Table>
      <div class="goods-total">
        <ul>
          <li>
            <span class="label">商品总额：</span>
            <span class="txt">{{
              orderInfo.order.priceDetailDTO.goodsPrice | unitPrice("￥")
            }}</span>
          </li>
          <li v-if="orderInfo.order.priceDetailDTO.discountPrice && orderInfo.order.priceDetailDTO.discountPrice > 0">
            <span class="label">优惠金额：</span>
            <span class="txt"> {{ orderInfo.order.priceDetailDTO.discountPrice | unitPrice('￥') }} </span>
          </li>

          <li v-if="orderInfo.order.priceDetailDTO.couponPrice && orderInfo.order.priceDetailDTO.couponPrice > 0">
            <span class="label">优惠券金额：</span>
            <span class="txt"> {{ orderInfo.order.priceDetailDTO.couponPrice | unitPrice('￥') }} </span>
          </li>
          <li
            v-if="orderInfo.order.priceDetailDTO.discountPriceDetail != undefined && orderInfo.order.priceDetailDTO.discountPriceDetail && orderInfo.order.priceDetailDTO.discountPriceDetail != null && orderInfo.order.priceDetailDTO.discountPriceDetail != ''">
            <div class="label">
              <Poptip trigger="hover" placement="left" width="200">
                <Icon v-if="typeList.length > 0" type="ios-alert-outline" size="17" @click="getOrderPrice"
                  color="#cc0000" />
                <template #content>
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
                          <td>¥{{ item.discountPrice | unitPrice }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </template>
              </Poptip>
              <span>优惠详情：</span>
            </div>
          </li>
          <li>
            <span class="label">运费：</span>
            <span class="txt">{{
              orderInfo.order.freightPrice | unitPrice("￥")
            }}</span>
          </li>
          <li v-if="orderInfo.order.priceDetailDTO.updatePrice">
            <span class="label">修改金额：</span>
            <span class="txt theme_color">¥{{ orderInfo.order.priceDetailDTO.updatePrice | unitPrice }}</span>
          </li>
          <!-- <li v-if="showPrices"  v-for="(item,index) in typeList" :key="index" >
            <hr style="border:1px dashed black;">
              <span class="label" v-if="index == 1 && typeList.length > 1" style="font-size:10px !important;"><a  @click="gotoHomes" style="display: inline-block;border-bottom: 1px dashed;color:black;width:80px;">{{item.promotionName}}：</a></span>
              <span class="txt" style="border-bottom: 1px dashed;font-size:10px !important;" v-if="index == 1 &&  typeList.length > 1">¥{{ item.discountPrice | unitPrice }}</span>
              <span class="label" v-if="index == 0 &&  typeList.length > 1" style="font-size:10px !important;"><a  @click="gotoHomes" style="display: inline-block;border-top: 1px dashed;color:black;width:80px;">{{item.promotionName}}：</a></span>
              <span class="txt" style="border-top: 1px dashed;font-size:10px !important;" v-if="index == 0 && typeList.length > 1">¥{{ item.discountPrice | unitPrice }}</span>
              <span class="label" v-if="typeList.length == 1 && index == 0" style="font-size:10px !important;"><a  @click="gotoHomes" style="display: inline-block;border-top: 1px dashed;border-bottom: 1px dashed;color:black;width:80px;">{{item.promotionName}}：</a></span>
              <span class="txt"  v-if="typeList.length == 1 && index == 0" style="border-top: 1px dashed;border-bottom: 1px dashed;font-size:10px !important;">¥{{ item.discountPrice | unitPrice }}</span>
            </li> -->
          <li v-if="orderInfo.order.priceDetailDTO.payPoint != 0">
            <span class="label">使用积分：</span>
            <span class="txt">{{
              orderInfo.order.priceDetailDTO.payPoint
            }}</span>
          </li>
          <li>
            <span class="label">应付金额：</span>
            <span class="txt flowPrice">¥{{ orderInfo.order.flowPrice | unitPrice }}</span>
            <!-- <template v-if="orderInfo.order.priceDetailDTO.discountPriceDetail != undefined && orderInfo.order.priceDetailDTO.discountPriceDetail && orderInfo.order.priceDetailDTO.discountPriceDetail != null && orderInfo.order.priceDetailDTO.discountPriceDetail != ''">
                <Space style="height:20px;float: right;text-align: center;margin-left:30px;margin-right:53px;">
                      <Button type="primary" ghost size="small" @click="getOrderPrice()">优惠详情</Button>
                </Space>
            </template> -->
          </li>
        </ul>
      </div>
    </Card>
    <Modal v-model="modal" width="530">
      <p slot="header">
        <Icon type="edit"></Icon>
        <span>修改金额</span>
      </p>
      <div>
        <Form ref="modifyPriceForm" :model="modifyPriceForm" label-position="left" :label-width="100"
          :rules="modifyPriceValidate">
          <FormItem label="订单金额" prop="orderPrice">
            <InputNumber style="width: 100%" v-model="modifyPriceForm.orderPrice" size="large" :min="0.01" :max="99999">
              <span slot="append">元</span>
            </InputNumber>
          </FormItem>
        </Form>
      </div>
      <div slot="footer" style="text-align: right">
        <Button @click="modal = false">关闭</Button>
        <Button type="primary" @click="modifyPriceSubmit">调整</Button>
      </div>
    </Modal>
    <!--收件地址弹出框-->
    <Modal v-model="addressModal" width="530">
      <p slot="header">
        <Icon type="edit"></Icon>
        <span>修改收件信息</span>
      </p>
      <div>
        <Form ref="addressForm" :model="addressForm" label-position="left" :label-width="100" :rules="addressRule">
          <FormItem label="收件人" prop="consigneeName">
            <Input v-model="addressForm.consigneeName" size="large" maxlength="20"></Input>
          </FormItem>
          <FormItem label="联系方式" prop="consigneeMobile">
            <Input v-model="addressForm.consigneeMobile" size="large" maxlength="11"></Input>
          </FormItem>
          <FormItem label="地址信息" prop="consigneeAddressPath">
            <span>{{ addressForm.consigneeAddressPath }}</span>
            <Button  size="small" type="default" @click="$refs.map.open()"
              style="margin-left: 8px">修改
            </Button>

          </FormItem>
          <FormItem label="详细地址" prop="consigneeDetail">
            <Input v-model="addressForm.consigneeDetail" size="large"></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer" style="text-align: right">
        <Button @click="addressModal = false">关闭</Button>
        <Button type="primary" @click="editAddressSubmit">修改</Button>
      </div>
    </Modal>
    <!-- 订单核销 -->
    <Modal v-model="orderTakeModal" width="530">
      <p slot="header">
        <Icon type="edit"></Icon>
        <span>订单核销</span>
      </p>
      <div>
        <Form ref="orderTakeForm" :model="orderTakeForm" label-position="left" :label-width="100"
          :rules="orderTakeValidate">
          <FormItem label="核销码" prop="qrCode">
            <Input v-model="orderTakeForm.qrCode" size="large" maxlength="10"></Input>
          </FormItem>
        </Form>
      </div>
      <div slot="footer" style="text-align: right">
        <Button @click="orderTakeModal = false">关闭</Button>
        <Button type="primary" @click="orderTakeSubmit">核销</Button>
      </div>
    </Modal>
    <!-- 订单日志 -->
    <Modal v-model="orderLogModal" width="60">
      <p slot="header">
        <span>订单日志</span>
      </p>
      <div class="order-log-div">
        <Table :loading="loading" border :columns="orderLogColumns" :data="orderLogData" ref="table"></Table>
      </div>

      <div slot="footer" style="text-align: right">
        <Button @click="orderLogModal = false">取消</Button>
      </div>
    </Modal>

    <!-- 查询物流 -->
    <Modal v-model="logisticsModal" width="40">
      <p slot="header">
        <span>查询物流</span>
      </p>
      <div class="layui-layer-wrap">
        <dl>
          <dt>订单号：</dt>
          <dd>
            <div class="text-box">{{ sn }}</div>
          </dd>
        </dl>
      </div>
      <div v-if="packageTraceList.length > 0" v-for="(packageItem, packageIndex) in packageTraceList" :key="packageIndex">
        <div class="layui-layer-wrap">
          <dl>
            <dt>物流公司：</dt>
            <dd><div class="text-box">{{ packageItem.logisticsName }}</div></dd>
          </dl>
          <dl>
            <dt>快递单号：</dt>
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
          </div>
          <div class="div-express-log">
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
      <div v-if = "packageTraceList.length == 0 && logisticsInfo">
        <div class="layui-layer-wrap">
          <dl>
            <dt>物流公司：</dt>
            <dd><div class="text-box">{{ logisticsInfo.shipper }}</div></dd>
          </dl>
          <dl>
            <dt>快递单号：</dt>
            <dd><div nctype="ordersSn" class="text-box">{{ logisticsInfo.logisticCode }}</div></dd>
          </dl>
          <div class="div-express-log">
            <ul class="express-log" v-if="logisticsInfo && logisticsInfo.traces">
              <li v-for="(item, index) in logisticsInfo.traces" :key="index">
                <span class="time">{{ item.AcceptTime }}</span>
                <span class="detail">{{ item.AcceptStation }}</span>
              </li>
            </ul>
            <ul class="express-log" v-else><li>暂无物流信息</li></ul>
          </div>
        </div>
      </div>
      <div slot="footer" style="text-align: right">
        <Button @click="logisticsModal = false">取消</Button>
      </div>
    </Modal>


    <!-- 订单发货 -->
    <Modal v-model="orderDeliverModal" width="500px">
      <p slot="header">
        <span>订单发货</span>
      </p>
      <div>
        <Form :model="faceSheetForm" ref="faceSheetForm" v-if="facesheetFlag" :rules="faceSheetFormValidate">
          <FormItem label="物流公司" prop="logisticsId" style="position: relative" :label-width="90">
            <Select v-model="faceSheetForm.logisticsId" placeholder="请选择" style="width: 250px">
              <Option v-for="(item, i) in checkedLogistics" :key="i" :value="item.id">{{ item.name }}
              </Option>
            </Select>
          </FormItem>
        </Form>
        <Form v-else ref="orderDeliveryForm" :model="orderDeliveryForm" :label-width="90"
          :rules="orderDeliverFormValidate" style="position: relative">
          <FormItem label="物流公司" prop="logisticsId">
            <Select v-model="orderDeliveryForm.logisticsId" placeholder="请选择" style="width: 250px">
              <Option v-for="(item, i) in checkedLogistics" :key="i" :value="item.id">{{ item.name }}
              </Option>
            </Select>
          </FormItem>
          <!-- v-if="showOrder" -->
          <FormItem label="物流单号" prop="logisticsNo">
            <Input v-model="orderDeliveryForm.logisticsNo" style="width: 250px" />
          </FormItem>
        </Form>
      </div>

      <div slot="footer" style="text-align: right">
        <Button @click="orderDeliverModal = false">关闭</Button>
        <Button type="primary" @click="orderDeliverySubmit">发货</Button>
      </div>
    </Modal>
    <!-- 打印发货单 -->
    <Modal v-model="printModal" width="530" @on-cancel="printCancel">
      <p slot="header" style="line-height:26px;height:26px;">
        <span style="float: left;">打印发货单</span>
        <Button size="small" style="margin-right:35px;float: right;padding-bottom: 2px;"
          @click="printHiddenInfo"><template v-if="printHiddenFlag">显示</template><template
            v-else>隐藏</template>敏感信息</Button>
      </p>
      <div style="max-height:500px;overflow-y:auto;overflow-x:hidden;">
        <div id="printInfo">
          <Row v-if="orderInfo.order.remark !== ''">
            <Col span="24">
            <p class="lineH30 f14">备注：{{ orderInfo.order.remark }}</p>
            </Col>
          </Row>
          <Row>
            <Col span="12">
            <p class="lineH30 f14">收件人：{{ orderInfo.order.consigneeName }}</p>
            </Col>
            <Col span="12" v-if="orderInfo.order.consigneeMobile">
            <p class="lineH30 f14" v-if="printHiddenFlag">手机号：{{
              orderInfo.order.consigneeMobile.replace(/^(.{3})(?:\d+)(.{4})$/, "$1****$2") }}</p>
            <p class="lineH30 f14" v-else>手机号：{{ orderInfo.order.consigneeMobile }}</p>
            </Col>
          </Row>
          <Row>
            <Col span="24">
            <p class="lineH30 f14">收货地址：{{ orderInfo.order.consigneeAddressPath }}{{ orderInfo.order.consigneeDetail }}
            </p>
            </Col>
          </Row>
          <Row>
            <Col span="24">
            <p class="printgoodtitle">商品信息</p>
            <div class="printgoodinfo">
              <div v-for="(item, index) in orderInfo.orderItems" :key="index" class="printgooditem">
                <div class="printgoodname">
                  <p>{{ item.goodsName }}</p>
                  <div class="printgoodguid">
                    <span v-for="(itemchild, keychild) in JSON.parse(item.specs)" :key="keychild">
                      <span class="printgoodguiditem" v-if="keychild != 'images'">
                        {{ keychild }} : {{ itemchild }}
                      </span>
                    </span>
                  </div>
                </div>
                <span class="printgoodnumber">数量：{{ item.num }}</span>
              </div>
            </div>
            </Col>
          </Row>
        </div>
      </div>

      <div slot="footer" style="text-align: right">
        <Button @click="printModal = false">关闭</Button>
        <Button type="primary" v-print="printInfoObj">打印发货单</Button>
      </div>
    </Modal>
    <!--订单分包裹发货-->
    <Modal v-model="groupShipModal" :loading="shipLoading" title="分包裹发快递" width="1000">
      <div>
        <Form ref="groupOrderDeliveryForm" :model="groupOrderDeliveryForm" :label-width="90" :rules="groupOrderDeliverFormValidate" style="position: relative">
          <FormItem label="物流公司" prop="logisticsId">
            <Select v-model="groupOrderDeliveryForm.logisticsId" placeholder="请选择" style="width: 250px">
              <Option v-for="(item, i) in checkedLogistics" :key="i" :value="item.logisticsId">{{ item.name }}
              </Option>
            </Select>
          </FormItem>
          <FormItem label="物流单号" prop="logisticsNo">
            <Input v-model="groupOrderDeliveryForm.logisticsNo" style="width: 250px" />
          </FormItem>
        </Form>
      </div>
      <Table @on-select="selectGroupShipGoodsMethods" @on-selection-change="selectGroupShipGoodsMethods"
             @on-select-all="selectGroupShipGoodsMethods" :data="data" :columns="groupShipColumns" border>
        <template slot="goodsSlot" slot-scope="{ row }">
          <div style="margin-top: 5px; height: 80px; display: flex">
            <div style="">
              <img :src="row.image" style="height: 60px; margin-top: 1px; width: 60px" />
            </div>

            <div style="margin-left: 13px">
              <div class="div-zoom">
                <a @click="linkTo(row.goodsId, row.skuId)">{{
                  row.goodsName
                  }}</a>
              </div>
              <span v-for="(item, key) in JSON.parse(row.specs)" :key="key">
                <span v-show="key != 'images'" style="font-size: 12px; color: #999999">
                  {{ key }} : {{ item }}
                </span>
              </span>
              <Poptip trigger="hover" style="display: block" title="扫码在手机中查看" transfer>
                <div slot="content">
                  <vue-qr :text="wapLinkTo(row.goodsId, row.skuId)" :margin="0" colorDark="#000" colorLight="#fff"
                          :size="150"></vue-qr>
                </div>
                <img src="../../../assets/qrcode.svg" class="hover-pointer" width="20" height="20" alt="" />
              </Poptip>
            </div>
          </div>
        </template>
        <template slot="numSlot" slot-scope="{ row, index }">
          <InputNumber :min="0" :max="row.___num - row.deliverNumber" v-model="data[index].canNum">
          </InputNumber>
        </template>
      </Table>
      <div slot="footer">
        <Button type="default" @click="groupShipModal = false">取消</Button>
        <Button type="primary" @click="confirmShipGroupGoods">确定</Button>
      </div>
    </Modal>

    <multipleMap ref="map" @callback="getAddress"></multipleMap>
  </div>
</template>

<script>
import * as API_Order from "@/api/order";
import * as API_Logistics from "@/api/logistics";
import * as RegExp from "@/libs/RegExp.js";

import multipleMap from "@/views/my-components/map/multiple-map";


export default {
  name: "orderDetail",
  components: {
    multipleMap,
  },
  data () {
    return {
      loading:false,
      typeList: [],
      showPrices: false,
      printHiddenFlag: false,//隐藏信息
      printInfoObj: {
        id: "printInfo",//要打印的id名 无#号
        popTitle: '&nbsp;',//页眉标题 默认浏览器标题 空字符串时显示undefined 使用html语言
        extraHead: '',//头部文字 默认空
      },
      submitLoading: false, // 添加或编辑提交状态
      logisticsType: 'KUAIDINIAO', //物流类型

      someJSONdata: '',
      faceSheetForm: {
        logisticsId: '',
      },
      faceSheetFormValidate: {
        logisticsId: [
          { required: true, message: "请选择物流公司" },
        ],
      },
      facesheetFlag: false, //电子面单标识
      orderLogModal: false, //弹出调整价格框
      logisticsModal: false, //弹出查询物流框
      orderDeliverModal: false, //订单发货弹出框
      orderTakeModal: false, //订单核销弹出框
      checkedLogistics: [], //选中的物流公司集合
      allowOperation: {}, //订单可才做选项
      logisticsInfo: {
        shipper: "",
      }, //物流信息
      sn: "", //订单编号
      orderInfo: {
        // 订单信息
        order: {
          priceDetailDTO: {},
        },
      },
      modal: false, //弹出调整价格框
      printModal: false,//弹出打印发货单
      //调整价格表单
      modifyPriceForm: {
        orderPrice: 0,
      },
      //订单核销表单
      orderTakeForm: {
        qrCode: "",
      },
      //验证要调整的订单金额
      orderTakeValidate: {
        qrCode: [
          { required: true, message: "订单核销码不能为空", trigger: "blur" },
        ],
      },
      //订单发货
      orderDeliveryForm: {
        logisticsNo: "", //发货单号
        logisticsId: "", //物流公司
      },
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
      addressModal: false, //弹出修改收件信息框
      //收件地址表单
      addressForm: {
        consigneeName: "",
        consigneeMobile: "",
        consigneeDetail: "",
        consigneeAddressPath: "",
        consigneeAddressIdPath: "",
      },
      orderDeliverFormValidate: {
        logisticsNo: [
          { required: true, message: "发货单号不能为空", trigger: "change" },
        ]
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

      columns: [
        {
          title: "商品",
          key: "goodsName",
          minWidth: 400,
          slot: "goodsSlot",
        },
        {
          title: "优惠",
          key: "num",
          minWidth: 100,
          render: (h, params) => {
            let resultText = "";
            if (params.row.promotionType) {
              let type = params.row.promotionType.split(",");
              if (type.indexOf("PINTUAN") != -1) {
                resultText += "拼团 ";
              }
              if (type.indexOf("SECKILL") != -1) {
                resultText += "秒杀 ";
              }
              if (type.indexOf("COUPON") != -1) {
                resultText += "优惠券 ";
              }
              if (type.indexOf("FULL_DISCOUNT") != -1) {
                resultText += "满减 ";
              }
              if (type.indexOf("POINTS_GOODS") != -1) {
                resultText += "积分商品 ";
              }
            }
            if (resultText === "") {
              resultText = "暂无未参与任何促销";
            }
            return h("div", resultText);
          },
        },
        {
          title: "单价",
          key: "unitPrice",
          minWidth: 100,
          render: (h, params) => {
            if (!params.row.unitPrice) {
              return h("div", this.$options.filters.unitPrice(0, "￥"));
            }
            return h(
              "div",
              this.$options.filters.unitPrice(
                params.row.unitPrice,
                "￥"
              )
            );
          },
        },

        {
          title: "数量",
          key: "num",
          minWidth: 80,
        },
        {
          title: "小计",
          key: "subTotal",
          minWidth: 100,
          render: (h, params) => {
            return h(
              "div",
              this.$options.filters.unitPrice(params.row.flowPrice, "￥")
            );
          },
        },
      ],
      data: [], // 商品表单数据
      orderLogColumns: [
        // 表头
        {
          title: "时间",
          key: "createTime",
          minWidth: 120,
        },
        {
          title: "操作者",
          key: "operatorName",
          minWidth: 120,
        },
        {
          title: "操作类型",
          key: "operatorType",
          minWidth: 120,
        },
        {
          title: "日志",
          key: "message",
          minWidth: 200,
        },
      ],
      // 订单日志数据
      orderLogData: [],

      // 分包裹发货
      groupShipModal: false,
      shipLoading: true,
      groupOrderDeliveryForm: {
        logisticsNo: "", //发货单号
        logisticsId: "", //物流公司
      },
      groupOrderDeliverFormValidate: {
        logisticsNo: [{ required: true, message: "发货单号不能为空", trigger: "change" },],
        logisticsId: [{ required: true, message: "请选择物流公司", trigger: "blur" },],
      },
      // 选择要发货的商品
      selectGroupShipGoods: [],
      groupShipColumns: [
        {type: "selection", width: 60, align: "center",},
        {title: "商品", key: "goodsName", width: 300, slot: "goodsSlot",},
        {
          title: "单价",
          key: "unitPrice",
          slot: "priceSlot",
          width: 100,
          render: (h, params) => {
            if (!params.row.unitPrice) {
              return h("div", this.$options.filters.unitPrice(0, "￥"));
            }
            return h("div", this.$options.filters.unitPrice(params.row.unitPrice, "￥"));
          },
        },
        {title: "数量", key: "num", slot: "numSlot", width: 120,},
        {
          title: "已发包裹",
          key: "deliverNumber",
          render: (h, params) => {
            return h("div", params.row.deliverNumber ? params.row.deliverNumber : 0);
          },
        },
        {
          title: "小计",
          key: "subTotal",
          width: 120,
          render: (h, params) => {
            return h("div", this.$options.filters.unitPrice(params.row.subTotal, "￥"));
          },
        },
      ],
      orderPackage: [],
      packageTraceList: []
    };
  },
  methods: {
    // 选中
    selectGroupShipGoodsMethods (selected) {
      this.selectGroupShipGoods = selected;
    },
    // 分包裹发货
    groupShip () {
      this.groupShipModal = true;
      this.getLogisticsList();
    },
    // 分页获取物流公司
    getLogisticsList () {
      API_Order.getLogisticsChecked().then((res) => {
        if (res.success) {
          this.checkedLogistics = res.result;
        }
      });
    },
    // 分包裹发货
    confirmShipGroupGoods () {
      this.$refs.groupOrderDeliveryForm.validate(async (valid) => {
        if (valid) {
          if (this.selectGroupShipGoods.length) {
            let submit = {
              ...this.groupOrderDeliveryForm,
              orderSn: this.sn,
              partDeliveryDTOList: this.selectGroupShipGoods.map((item) => {
                return {
                  orderItemId: item.id,
                  deliveryNum: item.canNum ? item.canNum : item.num,
                };
              }),
            };
            const res = await API_Order.partDelivery(this.sn, submit);
            if (res.success) {
              this.$Message.success("发货成功!");
              this.shipLoading = false;
              this.getDataDetail();
              this.getOrderPackage();
              this.groupShipModal = false;
              this.groupOrderDeliveryForm = []
            } else {
              this.shipLoading = false;
              this.groupShipModal = true;
            }
          } else {
            this.shipLoading = false;
            this.groupShipModal = true;
            this.$Message.error("请选择要发货的商品");
          }
        } else {
          this.shipLoading = false;
        }
      });
    },

    // 回调地址信息
    getAddress(val){
      if(val.type === 'select'){
          const paths = val.data.map(item => item.name).join(',')
          const ids = val.data.map(item => item.id).join(',')
          this.$set(this.addressForm, 'consigneeAddressPath', paths)
          this.$set(this.addressForm, 'consigneeAddressIdPath', ids)
      }
      else{
          this.$set(this.addressForm, 'consigneeAddressPath', val.data.addr)
          this.$set(this.addressForm, 'consigneeAddressIdPath', val.data.addrId)
      }
    },

    //弹出订单核销框
    orderTake () {
      this.orderTakeForm.qrCode = this.orderInfo.order.verificationCode;
      this.orderTakeModal = true;
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
    //订单核销提交
    orderTakeSubmit () {
      this.$refs.orderTakeForm.validate((valid) => {
        if (valid) {
          API_Order.orderTake(this.sn, this.orderTakeForm.qrCode).then(
            (res) => {
              if (res.success) {
                this.$Message.success("订单核销成功");
                this.orderTakeModal = false;
                this.getDataDetail();
              }
            }
          );
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

        this.getContentPrice()
      }
    },
    //获取订单详细信息
    getDataDetail () {
      this.loading = true;
      API_Order.getOrderDetail(this.sn).then((res) => {
        this.loading = false;
        if (res.success) {
          this.orderInfo = res.result;
          this.allowOperation = res.result.allowOperationVO;
          if (res.result.orderItems.length) {
            this.data = res.result.orderItems.map((item) => {
              return {
                ...item,
                ___num: item.num,
                _disabled: item.deliverNumber >= item.num,
                canNum: item.num - item.deliverNumber
              };
            });
          }
          this.orderLogData = res.result.orderLogs;
          this.typeList = JSON.parse(JSON.stringify(res.result.order.priceDetailDTO.discountPriceDetail));
          this.getContentPrice()
          this.getOrderPrice()
        }
      });
    },
    toPrint () {
      this.facesheetFlag = true;
      API_Logistics.getCheckedOn().then(res => {
        if (res.success) {
          this.checkedLogistics = res.result;
          this.orderDeliverModal = true;
        }
      });
    },
    // 修改订单金额
    modifyPrice () {
      //默认要修改的金额为订单总金额
      this.modifyPriceForm.orderPrice = this.orderInfo.order.flowPrice;
      this.modal = true;
    },
    //修改订单金额提交
    modifyPriceSubmit () {
      this.$refs.modifyPriceForm.validate((valid) => {
        if (valid) {
          API_Order.modifyOrderPrice(this.sn, this.modifyPriceForm).then(
            (res) => {
              if (res.success) {
                this.$Message.success("修改订单金额成功");
                this.modal = false;
                this.getDataDetail();
              }
            }
          );
        }
      });
    },
    getOrderPackage() {
      API_Order.getPackage(this.sn).then(res => {
        if (res.success) {
          this.orderPackage = res.result;
          console.log('this.orderPackage',this.orderPackage);
        }
      })
    },
    //查询物流
    checkLogistics () {
      this.logisticsModal = true;
      if (this.orderPackage.length > 0) {
        this.logisticsList();
      } else {
        this.logistics();
      }
    },
    logisticsList () {
      this.logisticsModal = true;
      API_Order.getPackage(this.sn).then((res) => {
        if (res.success && res.result != null) {
          this.packageTraceList = res.result;
        }
      });
    },
    logistics () {
      this.logisticsModal = true;
      API_Order.getTraces(this.sn).then((res) => {
        if (res.success && res.result != null) {
          this.logisticsInfo = res.result;
        }
      });
    },
    //订单发货
    orderDeliver () {
      this.facesheetFlag = false
      if (this.logisticsType == 'SHUNFENG') {
        this.$Modal.confirm({
          title: "确认发货",
          content: "您确认使用顺丰发货 " + this.sn + " 订单?",
          loading: true,
          onOk: () => {
            API_Order.orderShunFengDelivery(this.sn).then((res) => {
              if (res.success) {
                this.$Modal.remove();
                this.$Message.success("订单发货成功");
                this.getDataDetail()
              }
            })
          }
        })
      } else {
        API_Order.getLogisticsChecked().then((res) => {
          if (res.success) {
            this.checkedLogistics = res.result;
            this.orderDeliverModal = true;
          }
        });
      }
    },
    //顺丰打印面单
    sfPrint () {
      API_Order.getOrderFaceSheet(this.sn, this.faceSheetForm).then(res => {
        if (res.success) {
          let headers = {
            'X-Auth-token': res.result.token
          }
          API_Logistics.getShunFengFaceSheet(res.result.url, headers).then(res => {
            const blob = new Blob([res], {
              type: "application/pdf;charset=utf-8",
            });

            //对于<a>标签，只有 Firefox 和 Chrome（内核） 支持 download 属性
            //IE10以上支持blob但是依然不支持download
            if ("download" in document.createElement("a")) {
              //支持a标签download的浏览器
              const link = document.createElement("a"); //创建a标签
              link.download = this.orderInfo.order.sn + ".pdf"; //a标签添加属性
              link.style.display = "none";
              link.href = URL.createObjectURL(blob);
              document.body.appendChild(link);
              link.click(); //执行下载
              URL.revokeObjectURL(link.href); //释放url
              document.body.removeChild(link); //释放标签
            } else {
              navigator.msSaveBlob(blob, fileName);
            }
          })
        }
      })
    },
    toPrints () {
      if (this.form.logisticsId != null && this.form.logisticsId != '') {
        this.orderDeliverModal = false;
      }
    },
    //订单发货提交
    orderDeliverySubmit () {
      if (this.facesheetFlag) {
        this.$refs['faceSheetForm'].validate((valid) => {
          if (valid) {
            API_Order.getOrderFaceSheet(this.sn, this.faceSheetForm).then(res => {
              if (res.success) {
                this.someJSONdata = res.result.printTemplate;
                this.toPrints();
              }
            })
          }
        })
      } else {
        console.log("this.orderDeliveryForm",this.orderDeliveryForm)
        this.$refs['orderDeliveryForm'].validate((valid) => {
          if (valid) {
            API_Order.orderDelivery(this.sn, this.orderDeliveryForm).then(
              (res) => {
                if (res.success) {
                  this.$Message.success("订单发货成功");
                  this.orderDeliverModal = false;
                  this.getDataDetail();
                }
              }
            );
          }
        });
      }
    },
    //弹出修改收货地址框
    editAddress () {
      this.addressModal = true;
      this.addressForm.consigneeName = this.orderInfo.order.consigneeName;
      this.addressForm.consigneeMobile = this.orderInfo.order.consigneeMobile;
      this.addressForm.consigneeDetail = this.orderInfo.order.consigneeDetail;
      this.addressForm.consigneeAddressPath =
        this.orderInfo.order.consigneeAddressPath;
      this.addressForm.consigneeAddressIdPath =
        this.orderInfo.order.consigneeAddressIdPath;
    },
    //修改收货地址
    editAddressSubmit () {
      this.$refs.addressForm.validate((valid) => {
        if (valid) {
          API_Order.editOrderConsignee(this.sn, this.addressForm).then(
            (res) => {
              if (res.success) {
                this.$Message.success("收货地址修改成功");
                this.addressModal = false;
                this.getDataDetail();
              }
            }
          );
        }
      });
    },

    getLogisticsSetting () {
      API_Logistics.getLogisticsSetting().then(res => {
        if (res.success) {
          this.logisticsType = res.result;
        }
      })
    },

  },
  mounted () {
    this.sn = this.$route.query.sn;
    this.getDataDetail();
    this.getLogisticsSetting();
    this.getOrderPackage();
  },
  // 如果是从详情页返回列表页，修改列表页keepAlive为true，确保不刷新页面
  beforeRouteLeave (to, from, next) {
    if (to.name === 'orderList' || to.name === 'virtualOrderList') {
      to.meta.keepAlive = true
    }
    next()
  }
};
</script>
<style lang="scss" scoped>
// 建议引入通用样式 可删除下面样式代码
// @import "@/styles/table-common.scss";
.lineH30 {
  line-height: 30px;
}

.order-log-div {
  line-height: 30px;
  height: 500px;
  overflow-y: scroll;
}

dl dt {
  width: 100px;
  text-align: right;
}

.div-express-log {
  max-height: 300px;
  border: solid 1px #e7e7e7;
  background: #fafafa;
  overflow-y: auto;
  overflow-x: auto;
}

.express-log {
  /*margin: 5px -10px 5px 5px;*/
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


.search {


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
      line-height: 25px;
    }

    .label {
      float: left;
      width: 500px;
      font-size: 14px;
      text-align: right;
    }

    .txt {
      float: left;
      width: 130px;
      font-size: 14px;
      text-align: right;
      font-family: verdana;
    }

    .flowPrice {
      color: $theme_color;
      font-size: 22px;
    }
  }
}

.theme_color {
  color: $theme_color;
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
