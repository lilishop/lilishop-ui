<template>
  <div>
    <el-card style="padding: 10px 12px 0px">
      <div class="head-title">基本信息</div>
      <div class="detail-body">
        <div class="ant-col-md-6" style="width: 25%">
          <div class="info">
            <div class="head-info">
              <el-avatar :size="64" :src="storeInfo.storeLogo" />
              <div>
                <div class="name" v-if="storeInfo.storeName && storeInfo.storeName.length > 15">
                  {{ storeInfo.storeName.slice(0, 15) }}...
                </div>
                <div class="name" v-else>
                  {{ storeInfo.storeName }}
                </div>
              </div>
            </div>
            <div class="bottom-info">
              <p v-if="storeInfo.createTime">{{ storeInfo.createTime }}&nbsp;开店</p>
              <p v-if="storeInfo.selfOperated == 1">
                <el-tag type="success">自营</el-tag>
              </p>
              <p v-else>
                <el-tag type="danger">非自营</el-tag>
              </p>
              <p>
                <el-switch
                  v-model="storeEnabled"
                  :active-value="true"
                  :inactive-value="false"
                  :loading="storeStatusChanging"
                  active-text="启用"
                  inactive-text="禁用"
                  @change="shopStatusChange"
                />
              </p>
            </div>
            <div style="margin-top: 20px">
              <p class="item">
                <span class="label">公司名称：</span>
                <span class="info">{{ storeInfo.companyName }}</span>
              </p>
              <p class="item">
                <span class="label">公司电话：</span>
                <span class="info">{{ storeInfo.companyPhone }}</span>
              </p>
              <p class="item">
                <span class="label">电子邮箱：</span>
                <span class="info">{{ storeInfo.companyEmail }}</span>
              </p>
              <p class="item">
                <span class="label">员工总数：</span>
                <span class="info">{{ storeInfo.employeeNum }}人</span>
              </p>
              <p class="item">
                <span class="label">注册资金：</span>
                <span class="info">{{ storeInfo.registeredCapital }}万</span>
              </p>
              <p class="item">
                <span class="label">电子邮箱：</span>
                <span class="info">{{ storeInfo.companyEmail }}</span>
              </p>
              <p class="item">
                <span class="label">联系人姓名：</span>
                <span class="info">{{ storeInfo.linkName }}</span>
              </p>
              <p class="item">
                <span class="label">联系人电话：</span>
                <span class="info">{{ storeInfo.linkPhone }}</span>
              </p>
              <p class="item">
                <span class="label">公司地址：</span>
                <span class="info">
                  {{
                    storeInfo.companyAddressPath || storeInfo.companyAddress
                      ? storeInfo.companyAddressPath + " " + storeInfo.companyAddress
                      : "暂未完善"
                  }}</span>
              </p>
            </div>
          </div>
        </div>
        <div class="ant-col-md-6">
          <p class="item">
            <span class="label">商家账号：</span>
            <span class="info">{{ storeInfo.memberName }}</span>
          </p>
          <p class="item">
            <span class="label">库存预警数：</span>
            <span class="info">{{ storeInfo.stockWarning ? storeInfo.stockWarning : "0" }}</span>
          </p>
          <p class="item">
            <span class="label">店铺所在地：</span>
            <span class="info">
              <span>
                {{
                  storeInfo.storeAddressPath !== null &&
                  storeInfo.storeAddressPath !== "" &&
                  storeInfo.storeAddressPath !== "null" &&
                  storeInfo.storeAddressPath !== undefined
                    ? storeInfo.storeAddressPath
                    : ""
                }}</span>
              <span>
                {{
                  storeInfo.storeAddressDetail !== null &&
                  storeInfo.storeAddressDetail !== "" &&
                  storeInfo.storeAddressDetail !== "null" &&
                  storeInfo.storeAddressDetail !== undefined
                    ? storeInfo.storeAddressDetail
                    : ""
                }}</span>
              {{
                (storeInfo.storeAddressPath !== null &&
                  storeInfo.storeAddressPath !== "" &&
                  storeInfo.storeAddressPath !== "null" &&
                  storeInfo.storeAddressPath !== undefined) ||
                (storeInfo.storeAddressDetail !== null &&
                  storeInfo.storeAddressDetail !== "" &&
                  storeInfo.storeAddressDetail !== "null" &&
                  storeInfo.storeAddressDetail !== undefined)
                  ? ""
                  : "暂未完善"
              }}</span>
          </p>
          <p class="item">
            <span class="label">退货地址：</span>
            <span class="info">
              {{
                storeInfo.salesConsigneeName !== "null"
                  ? storeInfo.salesConsigneeName
                  : "" || storeInfo.salesConsigneeMobile !== "null"
                    ? storeInfo.salesConsigneeMobile
                    : "" || storeInfo.salesConsigneeAddressPath !== "null"
                      ? storeInfo.salesConsigneeAddressPath
                      : "" || storeInfo.salesConsigneeDetail !== "null"
                        ? storeInfo.salesConsigneeDetail
                        : ""
                          ? storeInfo.salesConsigneeName +
                            storeInfo.salesConsigneeMobile +
                            " " +
                            storeInfo.salesConsigneeAddressPath +
                            storeInfo.salesConsigneeDetail
                          : "暂未完善"
              }}</span>
          </p>
          <p class="item">
            <span class="label">店铺定位：</span>
            <span class="info">{{ storeInfo.storeCenter ? "已定位" : "未定位" }}</span>
          </p>
          <p class="item">
            <span class="label">经营范围：</span>
            <span class="info">
              <template v-if="displayCategories.length">
                <el-tag
                  v-for="item in displayCategories"
                  :key="item.id"
                  type="info"
                  class="category-tag"
                >
                  {{ item.name }}
                </el-tag>
              </template>
              <span v-else>暂未完善</span>
            </span>
          </p>
          <p class="item">
            <span class="label">店铺简介：</span>
            <span class="info">
              {{ storeInfo.storeDesc ? storeInfo.storeDesc : "暂未完善" }}</span>
          </p>
        </div>
        <div class="ant-col-md-6">
          <p class="item">
            <span class="label">法人姓名：</span>
            <span class="info">{{ storeInfo.legalName }}</span>
          </p>
          <p class="item">
            <span class="label">法人身份证：</span>
            <span class="info">{{ storeInfo.legalId }}</span>
          </p>
          <p class="item">
            <span class="label">身份证照片：</span>
            <span class="info">
              <img
                style="height: 100px; width: 100px"
                class="mr_10"
                v-for="item in storeInfo.legalPhoto"
                :src="item"
                :key="item"
              />
            </span>
          </p>
          <p class="item">
            <span class="label">营业执照号：</span>
            <span class="info">{{ storeInfo.licenseNum }}</span>
          </p>
          <p class="item">
            <span class="label">法定经营范围：</span>
            <span class="info">{{ storeInfo.scope }}</span>
          </p>
          <p class="item">
            <span class="label">营业执照电子版：</span>
            <span class="info">
              <img style="height: 100px; width: 100px" :src="storeInfo.licencePhoto" />
            </span>
          </p>
          <p class="item">
            <span class="label">银行名称：</span>
            <span class="info">
              {{
                storeInfo.settlementBankAccountName == "null" || !storeInfo.settlementBankAccountName
                  ? ""
                  : storeInfo.settlementBankAccountName
              }}</span>
          </p>
          <p class="item">
            <span class="label">银行账号：</span>
            <span class="info">
              {{
                storeInfo.settlementBankAccountNum == "null" || !storeInfo.settlementBankAccountNum
                  ? ""
                  : storeInfo.settlementBankAccountNum
              }}</span>
          </p>
          <p class="item">
            <span class="label">银行开户支行名称：</span>
            <span class="info">
              {{
                storeInfo.settlementBankBranchName == "null" || !storeInfo.settlementBankBranchName
                  ? ""
                  : storeInfo.settlementBankBranchName
              }}</span>
          </p>
          <p class="item">
            <span class="label">银行支行联行号：</span>
            <span class="info">
              {{
                storeInfo.settlementBankJointName == "null" || !storeInfo.settlementBankJointName
                  ? ""
                  : storeInfo.settlementBankJointName
              }}</span>
          </p>
          <p class="item">
            <span class="label">结算周期：</span>
            <span class="info" v-if="storeInfo.settlementCycle">
              <template v-for="item in storeInfo.settlementCycle.split(',')">
                <el-tag :key="item" v-if="item !== ''" style="margin-left: 10px">{{ item }}</el-tag>
              </template>
            </span>
          </p>
        </div>
      </div>
    </el-card>

    <el-card class="mt_10">
      <el-tabs v-model="activeTab" @tab-change="storeInfoChange">
        <el-tab-pane label="TA的订单" name="order" style="min-height: 200px">
          <el-form ref="searchForm" :model="orderSearchForm" inline label-width="70px" class="search-form">
            <el-form-item label="订单号" prop="orderSn">
              <el-input
                v-model="orderSearchForm.orderSn"
                placeholder="请输入订单号"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="订单状态" prop="orderStatus">
              <el-select v-model="orderSearchForm.orderStatus" placeholder="请选择" clearable style="width: 200px">
                <el-option label="未付款" value="UNPAID" />
                <el-option label="已付款" value="PAID" />
                <el-option label="待发货" value="UNDELIVERED" />
                <el-option label="已发货" value="DELIVERED" />
                <el-option label="已完成" value="COMPLETED" />
                <el-option label="待核验" value="TAKE" />
                <el-option label="已关闭" value="CANCELLED" />
              </el-select>
            </el-form-item>
            <el-form-item label="支付状态" prop="payStatus">
              <el-select v-model="orderSearchForm.payStatus" placeholder="请选择" clearable style="width: 200px">
                <el-option label="未付款" value="UNPAID" />
                <el-option label="已付款" value="PAID" />
              </el-select>
            </el-form-item>
            <el-form-item label="订单类型" prop="orderType">
              <el-select v-model="orderSearchForm.orderType" placeholder="请选择" clearable style="width: 200px">
                <el-option label="普通订单" value="NORMAL" />
                <el-option label="虚拟订单" value="VIRTUAL" />
                <el-option label="赠品订单" value="GIFT" />
                <el-option label="拼团订单" value="PINTUAN" />
              </el-select>
            </el-form-item>
            <el-form-item label="订单来源" prop="clientType">
              <el-select v-model="orderSearchForm.clientType" placeholder="请选择" clearable style="width: 200px">
                <el-option label="移动端" value="H5" />
                <el-option label="PC端" value="PC" />
                <el-option label="小程序" value="WECHAT_MP" />
                <el-option label="移动应用端" value="APP" />
                <el-option label="未知" value="UNKNOWN" />
              </el-select>
            </el-form-item>
            <el-form-item label="下单时间">
              <el-date-picker
                v-model="orderSelectDate"
                type="datetimerange"
                value-format="YYYY-MM-DD HH:mm:ss"
                clearable
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                placeholder="选择起始时间"
                style="width: 360px"
                @change="selectDateRange"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="search-btn" @click="getOrderData">搜索</el-button>
            </el-form-item>
          </el-form>

          <div style="min-height: 180px">
            <el-table v-loading="loading" border :data="orderData" class="mt_10" style="width: 100%">
              <el-table-column label="订单编号" min-width="100" show-overflow-tooltip>
                <template #default="{ row }">
                  <a
                    v-if="row"
                    class="link-text"
                    @click="$router.push({ name: 'order-detail', query: { sn: row.sn } })"
                  >{{ row.sn }}</a>
                </template>
              </el-table-column>
              <el-table-column label="订单金额" width="140">
                <template #default="{ row }">
                  <priceColorScheme v-if="row" :value="row.flowPrice" :color="$mainColor" />
                </template>
              </el-table-column>
              <el-table-column label="订单类型" width="100">
                <template #default="{ row }">
                  <span v-if="row">{{ orderTypeText(row.orderType) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="来源" width="80">
                <template #default="{ row }">
                  <span v-if="row">{{ clientTypeText(row.clientType) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="订单状态" width="95">
                <template #default="{ row }">
                  <span v-if="row">{{ orderStatusText(row.orderStatus) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="支付状态" width="95">
                <template #default="{ row }">
                  <span v-if="row">{{ payStatusText(row.payStatus) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="售后状态" width="100">
                <template #default="{ row }">
                  <span v-if="row">{{ groupAfterSaleStatusText(row.groupAfterSaleStatus) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="投诉状态" width="95">
                <template #default="{ row }">
                  <span v-if="row">{{ groupComplainStatusText(row.groupComplainStatus) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="storeName" label="购买店铺" width="180" show-overflow-tooltip />
              <el-table-column prop="createTime" label="下单时间" width="170" />
            </el-table>

            <div class="mt_10" style="display: flex; justify-content: flex-end; margin-top: 10px">
              <el-pagination
                v-model:current-page="orderSearchForm.pageNumber"
                v-model:page-size="orderSearchForm.pageSize"
                :page-sizes="[20, 50, 100]"
                :total="orderTotal"
                layout="total, sizes, prev, pager, next, jumper"
                size="small"
                @current-change="orderChangePage"
                @size-change="orderChangePageSize"
              />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="TA的退货单" name="refundGoods">
          <el-form
            ref="refundGoodsOrderSearchForm"
            :model="refundGoodsOrderSearchForm"
            inline
            label-width="70px"
            class="search-form"
          >
            <el-form-item label="订单编号" prop="orderSn">
              <el-input
                v-model="refundGoodsOrderSearchForm.orderSn"
                placeholder="请输入订单编号"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="售后单号" prop="sn">
              <el-input
                v-model="refundGoodsOrderSearchForm.sn"
                placeholder="请输入售后单号"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="售后状态">
              <el-select
                v-model="refundGoodsOrderSearchForm.serviceStatus"
                placeholder="全部"
                clearable
                style="width: 200px"
              >
                <el-option label="申请售后" value="APPLY" />
                <el-option label="通过售后" value="PASS" />
                <el-option label="拒绝售后" value="REFUSE" />
                <el-option label="买家退货，待卖家收货" value="BUYER_RETURN" />
                <el-option label="商家换货/补发" value="SELLER_RE_DELIVERY" />
                <el-option label="卖家确认收货" value="SELLER_CONFIRM" />
                <el-option label="卖家终止售后" value="SELLER_TERMINATION" />
                <el-option label="买家确认收货" value="BUYER_CONFIRM" />
                <el-option label="买家取消售后" value="BUYER_CANCEL" />
                <el-option label="完成售后" value="COMPLETE" />
              </el-select>
            </el-form-item>
            <el-form-item label="申请时间">
              <el-date-picker
                v-model="refundGoodsSelectDate"
                type="datetimerange"
                value-format="YYYY-MM-DD HH:mm:ss"
                clearable
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                placeholder="选择起始时间"
                style="width: 360px"
                @change="selectRefundGoodsDateRange"
              />
            </el-form-item>
            <el-form-item label="商家名称" prop="storeName">
              <el-input
                v-model="refundGoodsOrderSearchForm.storeName"
                placeholder="请输入商家名称"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="会员名称" prop="memberName">
              <el-input
                v-model="refundGoodsOrderSearchForm.memberName"
                placeholder="请输入会员名称"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="search-btn" @click="getRefundGoodsOrderData">搜索</el-button>
            </el-form-item>
          </el-form>

          <div style="min-height: 180px">
            <el-table v-loading="loading" border :data="refundGoodsOrderData" class="mt_10" style="width: 100%">
              <el-table-column label="售后服务单号" min-width="140">
                <template #default="{ row }">
                  <a
                    v-if="row"
                    class="link-text"
                    @click="$router.push({ name: 'after-order-detail', query: { sn: row.sn } })"
                  >{{ row.sn }}</a>
                </template>
              </el-table-column>
              <el-table-column label="订单编号" min-width="120">
                <template #default="{ row }">
                  <a
                    v-if="row"
                    class="link-text"
                    @click="$router.push({ name: 'order-detail', query: { sn: row.orderSn } })"
                  >{{ row.orderSn }}</a>
                </template>
              </el-table-column>
              <el-table-column label="商品" min-width="300">
                <template #default="{ row }">
                  <div v-if="row" style="margin-top: 5px; height: 80px; display: flex">
                    <div>
                      <img :src="row.goodsImage" style="height: 60px; margin-top: 3px" />
                    </div>
                    <div style="margin-left: 13px; margin-top: 3px">
                      <div class="div-zoom">
                        <a>{{ row.goodsName }}</a>
                      </div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="memberName" label="会员名称" width="140" />
              <el-table-column prop="storeName" label="商家名称" min-width="100" show-overflow-tooltip />
              <el-table-column label="售后金额" width="110">
                <template #default="{ row }">
                  <priceColorScheme v-if="row" :value="row.applyRefundPrice" :color="$mainColor" />
                </template>
              </el-table-column>
              <el-table-column label="售后类型" width="100">
                <template #default="{ row }">
                  <span v-if="row">{{ serviceTypeText(row.serviceType) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="售后状态" width="110">
                <template #default="{ row }">
                  <span v-if="row">{{ serviceStatusText(row.serviceStatus) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="申请时间" min-width="145" show-overflow-tooltip />
            </el-table>

            <div class="mt_10" style="display: flex; justify-content: flex-end; margin-top: 10px">
              <el-pagination
                v-model:current-page="refundGoodsOrderSearchForm.pageNumber"
                v-model:page-size="refundGoodsOrderSearchForm.pageSize"
                :page-sizes="[20, 50, 100]"
                :total="refundGoodsOrderTotal"
                layout="total, sizes, prev, pager, next, jumper"
                size="small"
                @current-change="refundGoodsOrderChangePage"
                @size-change="refundGoodsOrderChangePageSize"
              />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="TA的退款单" name="refund">
          <el-form
            ref="refundOrderSearchForm"
            :model="refundOrderSearchForm"
            inline
            label-width="70px"
            class="search-form"
          >
            <el-form-item label="订单编号" prop="orderSn">
              <el-input
                v-model="refundOrderSearchForm.orderSn"
                placeholder="请输入订单编号"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="售后单号" prop="sn">
              <el-input
                v-model="refundOrderSearchForm.sn"
                placeholder="请输入售后单号"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="售后状态">
              <el-select
                v-model="refundOrderSearchForm.serviceStatus"
                placeholder="全部"
                clearable
                style="width: 200px"
              >
                <el-option label="申请售后" value="APPLY" />
                <el-option label="通过售后" value="PASS" />
                <el-option label="拒绝售后" value="REFUSE" />
                <el-option label="买家退货，待卖家收货" value="BUYER_RETURN" />
                <el-option label="商家换货/补发" value="SELLER_RE_DELIVERY" />
                <el-option label="卖家确认收货" value="SELLER_CONFIRM" />
                <el-option label="卖家终止售后" value="SELLER_TERMINATION" />
                <el-option label="买家确认收货" value="BUYER_CONFIRM" />
                <el-option label="买家取消售后" value="BUYER_CANCEL" />
                <el-option label="完成售后" value="COMPLETE" />
              </el-select>
            </el-form-item>
            <el-form-item label="申请时间">
              <el-date-picker
                v-model="refundSelectDate"
                type="datetimerange"
                value-format="YYYY-MM-DD HH:mm:ss"
                clearable
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                placeholder="选择起始时间"
                style="width: 360px"
                @change="selectRefundDateRange"
              />
            </el-form-item>
            <el-form-item label="商家名称" prop="storeName">
              <el-input
                v-model="refundOrderSearchForm.storeName"
                placeholder="请输入商家名称"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="会员名称" prop="memberName">
              <el-input
                v-model="refundOrderSearchForm.memberName"
                placeholder="请输入会员名称"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="search-btn" @click="getRefundOrder">搜索</el-button>
            </el-form-item>
          </el-form>

          <div style="min-height: 180px">
            <el-table v-loading="loading" border :data="refundOrderData" class="mt_10" style="width: 100%">
              <el-table-column label="售后服务单号" min-width="140">
                <template #default="{ row }">
                  <a
                    v-if="row"
                    class="link-text"
                    @click="$router.push({ name: 'after-order-detail', query: { sn: row.sn } })"
                  >{{ row.sn }}</a>
                </template>
              </el-table-column>
              <el-table-column label="订单编号" min-width="120">
                <template #default="{ row }">
                  <a
                    v-if="row"
                    class="link-text"
                    @click="$router.push({ name: 'order-detail', query: { sn: row.orderSn } })"
                  >{{ row.orderSn }}</a>
                </template>
              </el-table-column>
              <el-table-column label="商品" min-width="300">
                <template #default="{ row }">
                  <div v-if="row" style="margin-top: 5px; height: 80px; display: flex">
                    <div>
                      <img :src="row.goodsImage" style="height: 60px; margin-top: 3px" />
                    </div>
                    <div style="margin-left: 13px; margin-top: 3px">
                      <div class="div-zoom">
                        <a>{{ row.goodsName }}</a>
                      </div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="memberName" label="会员名称" width="140" />
              <el-table-column prop="storeName" label="商家名称" min-width="100" show-overflow-tooltip />
              <el-table-column label="售后金额" width="110">
                <template #default="{ row }">
                  <priceColorScheme v-if="row" :value="row.applyRefundPrice" :color="$mainColor" />
                </template>
              </el-table-column>
              <el-table-column label="售后类型" width="100">
                <template #default="{ row }">
                  <span v-if="row">{{ serviceTypeText(row.serviceType) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="售后状态" width="110">
                <template #default="{ row }">
                  <span v-if="row">{{ serviceStatusText(row.serviceStatus) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="申请时间" min-width="145" show-overflow-tooltip />
            </el-table>

            <div class="mt_10" style="display: flex; justify-content: flex-end; margin-top: 10px">
              <el-pagination
                v-model:current-page="refundOrderSearchForm.pageNumber"
                v-model:page-size="refundOrderSearchForm.pageSize"
                :page-sizes="[20, 50, 100]"
                :total="refundOrderTotal"
                layout="total, sizes, prev, pager, next, jumper"
                size="small"
                @current-change="refundOrderChangePage"
                @size-change="refundOrderChangePageSize"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import ossManage from "@/views/sys/oss-manage/ossManage";
import { getCategoryTree } from "@/api/goods";
import * as API_Store from "@/api/shops.js";
import * as API_Order from "@/api/order.js";

export default {
  name: "member",
  components: {
    ossManage,
  },
  data() {
    return {
      id: "",
      activeTab: "order",
      categories: [],
      loading: true,
      storeInfo: {},
      storeEnabled: false,
      storeStatusChanging: false,
      checkAllGroup: [],
      orderSelectDate: null,
      refundGoodsSelectDate: null,
      refundSelectDate: null,
      orderData: [],
      orderTotal: 0,
      orderSearchForm: {
        pageNumber: 1,
        pageSize: 20,
        payStatus: "",
        orderSn: "",
        orderType: "",
      },
      refundGoodsOrderData: [],
      refundGoodsOrderTotal: 0,
      refundGoodsOrderSearchForm: {
        pageNumber: 1,
        pageSize: 20,
      },
      refundOrderSearchForm: {
        pageNumber: 1,
        pageSize: 20,
      },
      refundOrderData: [],
      refundOrderTotal: 0,
    };
  },
  computed: {
    displayCategories() {
      if (!this.categories?.length || !this.checkAllGroup?.length) {
        return [];
      }
      const selected = new Set(this.checkAllGroup.map(String));
      return this.categories.filter(
        (item) => item?.id != null && selected.has(String(item.id))
      );
    },
  },
  methods: {
    orderTypeText(v) {
      const map = {
        NORMAL: "普通订单",
        VIRTUAL: "虚拟订单",
        GIFT: "赠品订单",
        PINTUAN: "拼团订单",
      };
      return map[v] || v || "";
    },
    clientTypeText(v) {
      const map = {
        H5: "移动端",
        PC: "PC端",
        WECHAT_MP: "小程序端",
        APP: "移动应用端",
      };
      return map[v] || v || "";
    },
    orderStatusText(v) {
      const map = {
        UNPAID: "未付款",
        PAID: "已付款",
        UNDELIVERED: "待发货",
        DELIVERED: "已发货",
        COMPLETED: "已完成",
        TAKE: "待核验",
        CANCELLED: "已关闭",
      };
      return map[v] || v || "";
    },
    payStatusText(v) {
      const map = {
        UNPAID: "未付款",
        PAID: "已付款",
      };
      return map[v] || v || "";
    },
    groupAfterSaleStatusText(v) {
      const map = {
        NEW: "未申请",
        NOT_APPLIED: "未申请",
        ALREADY_APPLIED: "已申请",
        EXPIRED: "已失效",
      };
      return map[v] || v || "";
    },
    groupComplainStatusText(v) {
      const map = {
        NEW: "未申请",
        NO_APPLY: "未申请",
        APPLYING: "申请中",
        COMPLETE: "已完成",
        EXPIRED: "已失效",
        CANCEL: "取消投诉",
      };
      return map[v] || v || "";
    },
    serviceTypeText(type) {
      const map = {
        RETURN_MONEY: "退款",
        RETURN_GOODS: "退货",
        EXCHANGE_GOODS: "换货",
      };
      return map[type] || type || "";
    },
    serviceStatusText(status) {
      const map = {
        APPLY: "申请中",
        PASS: "通过售后",
        REFUSE: "拒绝售后",
        BUYER_RETURN: "买家退货，待卖家收货",
        SELLER_RE_DELIVERY: "商家换货/补发",
        SELLER_CONFIRM: "卖家确认收货",
        SELLER_TERMINATION: "卖家终止售后",
        BUYER_CONFIRM: "买家确认收货",
        BUYER_CANCEL: "买家取消售后",
        COMPLETE: "完成售后",
        WAIT_REFUND: "待平台退款",
      };
      return map[status] || status || "";
    },
    init() {
      this.getStoreInfo();
      this.getCategories();
      this.getOrderData();
    },
    storeInfoChange(v) {
      if (v == "order") {
        this.getOrderData();
      }
      if (v == "refundGoods") {
        this.getRefundGoodsOrderData();
      }
      if (v == "refund") {
        this.getRefundOrder();
      }
    },
    getStoreInfo() {
      API_Store.getShopDetailData(this.id).then((res) => {
        this.storeInfo = res.result;
        this.storeEnabled = this.storeInfo.storeDisable === "OPEN";
        if (this.storeInfo.goodsManagementCategory != null) {
          this.checkAllGroup = this.storeInfo.goodsManagementCategory
            .split(",")
            .filter(Boolean);
        }
        this.storeInfo.legalPhoto = this.storeInfo.legalPhoto.split(",");
      });
    },
    shopStatusChange(v) {
      this.storeStatusChanging = true;
      const request = v ? API_Store.enableBrand(this.id) : API_Store.disableShop(this.id);
      request
        .then((res) => {
          if (res.success) {
            this.$Message.success("操作成功");
            this.getStoreInfo();
          } else {
            this.storeEnabled = !v;
          }
        })
        .catch(() => {
          this.storeEnabled = !v;
        })
        .finally(() => {
          this.storeStatusChanging = false;
        });
    },
    getOrderData() {
      this.loading = true;
      this.orderSearchForm.storeId = this.id;
      API_Order.getOrderList(this.orderSearchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.orderData = res.result.records;
          this.orderTotal = res.result.total;
        }
      });
      this.loading = false;
    },
    getRefundOrder() {
      this.loading = true;
      this.refundOrderSearchForm.storeId = this.id;
      this.refundOrderSearchForm.serviceType = "RETURN_MONEY";
      API_Order.getAfterSaleOrderPage(this.refundOrderSearchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.refundOrderData = res.result.records;
          this.refundOrderTotal = res.result.total;
        }
      });
      this.loading = false;
    },
    getRefundGoodsOrderData() {
      this.loading = true;
      this.refundGoodsOrderSearchForm.storeId = this.id;
      this.refundGoodsOrderSearchForm.serviceType = "RETURN_GOODS";
      API_Order.getAfterSaleOrderPage(this.refundGoodsOrderSearchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.refundGoodsOrderData = res.result.records;
          this.refundGoodsOrderTotal = res.result.total;
        }
      });
      this.loading = false;
    },
    getCategories() {
      getCategoryTree().then((res) => {
        if (res.success) {
          this.categories = res.result;
        }
      });
    },
    refundGoodsOrderChangePage(v) {
      this.refundGoodsOrderSearchForm.pageNumber = v;
      this.getRefundGoodsOrderData();
    },
    refundGoodsOrderChangePageSize(v) {
      this.refundGoodsOrderSearchForm.pageSize = v;
      this.refundGoodsOrderSearchForm.pageNumber = 1;
      this.getRefundGoodsOrderData();
    },
    refundOrderChangePage(v) {
      this.refundOrderSearchForm.pageNumber = v;
      this.getRefundOrder();
    },
    refundOrderChangePageSize(v) {
      this.refundOrderSearchForm.pageSize = v;
      this.refundOrderSearchForm.pageNumber = 1;
      this.getRefundOrder();
    },
    orderChangePage(v) {
      this.orderSearchForm.pageNumber = v;
      this.getOrderData();
    },
    orderChangePageSize(v) {
      this.orderSearchForm.pageSize = v;
      this.orderSearchForm.pageNumber = 1;
      this.getOrderData();
    },
    selectDateRange(v) {
      if (v && v.length === 2) {
        this.orderSearchForm.startDate = v[0];
        this.orderSearchForm.endDate = v[1];
      } else {
        this.orderSearchForm.startDate = "";
        this.orderSearchForm.endDate = "";
      }
    },
    selectRefundGoodsDateRange(v) {
      if (v && v.length === 2) {
        this.refundGoodsOrderSearchForm.startDate = v[0];
        this.refundGoodsOrderSearchForm.endDate = v[1];
      } else {
        this.refundGoodsOrderSearchForm.startDate = "";
        this.refundGoodsOrderSearchForm.endDate = "";
      }
    },
    selectRefundDateRange(v) {
      if (v && v.length === 2) {
        this.refundOrderSearchForm.startDate = v[0];
        this.refundOrderSearchForm.endDate = v[1];
      } else {
        this.refundOrderSearchForm.startDate = "";
        this.refundOrderSearchForm.endDate = "";
      }
    },
  },
  mounted() {
    this.id = this.$route.query.id;
    this.init();
  },
};
</script>
<style lang="scss" scoped>
@import "shopDetail.scss";
</style>
