<template>
  <div class="shop-detail">
    <!-- 店铺名片头 -->
    <el-card class="shop-header-card" :body-style="{ padding: 0 }" shadow="never">
      <div class="shop-banner">
        <div class="banner-left">
          <el-avatar :size="72" :src="storeInfo.storeLogo" class="shop-avatar" />
          <div class="shop-title">
            <div class="name-row">
              <span class="shop-name" :title="storeInfo.storeName">{{ storeInfo.storeName }}</span>
              <el-tag v-if="storeInfo.selfOperated == 1" type="success" size="small" effect="dark">自营</el-tag>
              <el-tag v-else type="danger" size="small" effect="dark">非自营</el-tag>
              <el-tag :type="storeEnabled ? 'success' : 'info'" size="small" effect="plain" class="status-tag">
                {{ storeEnabled ? "营业中" : "已禁用" }}
              </el-tag>
            </div>
            <div class="shop-meta">
              <span>商家账号：{{ storeInfo.memberName || "-" }}</span>
              <span v-if="storeInfo.createTime">开店时间：{{ storeInfo.createTime }}</span>
            </div>
          </div>
        </div>
        <div class="banner-right">
          <div class="status-pill">
            <span class="switch-label">{{ storeEnabled ? "店铺启用中" : "店铺已禁用" }}</span>
            <el-switch
              v-model="storeEnabled"
              :active-value="true"
              :inactive-value="false"
              :loading="storeStatusChanging"
              @change="shopStatusChange"
            />
          </div>
        </div>
      </div>
    </el-card>

    <!-- 详情页签 -->
    <el-card class="mt_10" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="storeInfoChange">
        <el-tab-pane label="基本信息" name="basic">
          <el-descriptions :column="1" border class="shop-desc">
            <el-descriptions-item label="店铺名称">{{ storeInfo.storeName || "-" }}</el-descriptions-item>
            <el-descriptions-item label="商家账号">{{ storeInfo.memberName || "-" }}</el-descriptions-item>
            <el-descriptions-item label="店铺定位">
              {{ storeInfo.storeCenter || "未定位" }}
            </el-descriptions-item>
            <el-descriptions-item label="店铺所在地">{{ storeAddress }}</el-descriptions-item>
            <el-descriptions-item label="退货地址">{{ returnAddress }}</el-descriptions-item>
            <el-descriptions-item label="联系人姓名">{{ storeInfo.linkName || "-" }}</el-descriptions-item>
            <el-descriptions-item label="联系人电话">{{ storeInfo.linkPhone || "-" }}</el-descriptions-item>
            <el-descriptions-item label="店铺简介">
              {{ storeInfo.storeDesc || "暂未完善" }}
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="工商信息" name="business">
          <el-descriptions :column="1" border class="shop-desc">
            <el-descriptions-item label="公司名称">{{ storeInfo.companyName || "-" }}</el-descriptions-item>
            <el-descriptions-item label="公司电话">{{ storeInfo.companyPhone || "-" }}</el-descriptions-item>
            <el-descriptions-item label="电子邮箱">{{ storeInfo.companyEmail || "-" }}</el-descriptions-item>
            <el-descriptions-item label="员工总数">
              {{ storeInfo.employeeNum ? storeInfo.employeeNum + " 人" : "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="注册资金">
              {{ storeInfo.registeredCapital ? storeInfo.registeredCapital + " 万" : "-" }}
            </el-descriptions-item>
            <el-descriptions-item label="公司地址">{{ companyAddress }}</el-descriptions-item>
            <el-descriptions-item label="法人姓名">{{ storeInfo.legalName || "-" }}</el-descriptions-item>
            <el-descriptions-item label="法人身份证">{{ storeInfo.legalId || "-" }}</el-descriptions-item>
            <el-descriptions-item label="身份证照片">
              <template v-if="storeInfo.legalPhoto && storeInfo.legalPhoto.length">
                <el-image
                  v-for="item in storeInfo.legalPhoto"
                  :key="item"
                  :src="item"
                  :preview-src-list="storeInfo.legalPhoto"
                  fit="cover"
                  preview-teleported
                  class="cert-img"
                />
              </template>
              <span v-else>暂未上传</span>
            </el-descriptions-item>
            <el-descriptions-item label="营业执照号">{{ storeInfo.licenseNum || "-" }}</el-descriptions-item>
            <el-descriptions-item label="法定经营范围">{{ storeInfo.scope || "-" }}</el-descriptions-item>
            <el-descriptions-item label="营业执照电子版">
              <el-image
                v-if="storeInfo.licencePhoto"
                :src="storeInfo.licencePhoto"
                :preview-src-list="[storeInfo.licencePhoto]"
                fit="cover"
                preview-teleported
                class="cert-img"
              />
              <span v-else>暂未上传</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="财务信息" name="finance">
          <el-descriptions :column="1" border class="shop-desc">
            <el-descriptions-item label="银行名称">{{ blankFilter(storeInfo.settlementBankAccountName) }}</el-descriptions-item>
            <el-descriptions-item label="银行账号">{{ blankFilter(storeInfo.settlementBankAccountNum) }}</el-descriptions-item>
            <el-descriptions-item label="银行开户支行名称">{{ blankFilter(storeInfo.settlementBankBranchName) }}</el-descriptions-item>
            <el-descriptions-item label="银行支行联行号">{{ blankFilter(storeInfo.settlementBankJointName) }}</el-descriptions-item>
            <el-descriptions-item label="结算日">
              <span v-if="settlementCycles.length">每月 {{ settlementCycles.join("、") }} 日</span>
              <span v-else>-</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="签约信息" name="contract">
          <el-descriptions :column="1" border class="shop-desc">
            <el-descriptions-item label="店铺类型">
              <el-tag v-if="storeInfo.selfOperated == 1" type="success" size="small">自营</el-tag>
              <el-tag v-else type="danger" size="small">非自营</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="开店时间">{{ storeInfo.createTime || "-" }}</el-descriptions-item>
            <el-descriptions-item label="经营类目">
              <span v-if="displayCategories.length">
                {{ displayCategories.map((item) => item.name).join("、") }}
              </span>
              <span v-else>暂未签约经营类目</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>

        <el-tab-pane label="店员列表" name="clerk">
          <el-form
            ref="clerkSearchForm"
            :model="clerkSearchForm"
            inline
            label-width="70px"
            class="search-form"
          >
            <el-form-item label="店员名称" prop="clerkName">
              <el-input
                v-model="clerkSearchForm.clerkName"
                placeholder="请输入店员名称"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="手机号" prop="mobile">
              <el-input
                v-model="clerkSearchForm.mobile"
                placeholder="请输入手机号"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="search-btn" @click="getClerkData">搜索</el-button>
            </el-form-item>
          </el-form>

          <div style="min-height: 180px">
            <el-table v-loading="clerkLoading" border :data="clerkData" class="mt_10" style="width: 100%">
              <el-table-column prop="clerkName" label="店员名称" min-width="140" show-overflow-tooltip />
              <el-table-column prop="mobile" label="手机号" width="150" />
              <el-table-column label="角色" width="120">
                <template #default="{ row }">
                  <el-tag v-if="row && row.shopkeeper" type="danger" size="small">店主</el-tag>
                  <el-tag v-else-if="row" type="info" size="small">店员</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="departmentTitle" label="所属部门" min-width="120" show-overflow-tooltip>
                <template #default="{ row }">
                  <span v-if="row">{{ row.departmentTitle || "-" }}</span>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag v-if="row" :type="row.status ? 'success' : 'info'" size="small">
                    {{ row.status ? "启用" : "禁用" }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="创建时间" width="170" />
            </el-table>

            <div class="mt_10" style="display: flex; justify-content: flex-end; margin-top: 10px">
              <el-pagination
                v-model:current-page="clerkSearchForm.pageNumber"
                v-model:page-size="clerkSearchForm.pageSize"
                :page-sizes="[20, 50, 100]"
                :total="clerkTotal"
                layout="total, sizes, prev, pager, next, jumper"
                size="small"
                @current-change="clerkChangePage"
                @size-change="clerkChangePageSize"
              />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="订单列表" name="order" style="min-height: 200px">
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
                <el-option label="电子卡券订单" value="E_COUPON" />
                <el-option label="预约服务订单" value="APPOINTMENT" />
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

        <el-tab-pane label="售后列表" name="afterSale">
          <el-form
            ref="afterSaleSearchForm"
            :model="afterSaleSearchForm"
            inline
            label-width="70px"
            class="search-form"
          >
            <el-form-item label="订单编号" prop="orderSn">
              <el-input
                v-model="afterSaleSearchForm.orderSn"
                placeholder="请输入订单编号"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="售后单号" prop="sn">
              <el-input
                v-model="afterSaleSearchForm.sn"
                placeholder="请输入售后单号"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="售后类型">
              <el-select
                v-model="afterSaleSearchForm.serviceType"
                placeholder="全部"
                clearable
                style="width: 200px"
              >
                <el-option label="退款" value="RETURN_MONEY" />
                <el-option label="退货" value="RETURN_GOODS" />
                <el-option label="换货" value="EXCHANGE_GOODS" />
              </el-select>
            </el-form-item>
            <el-form-item label="售后状态">
              <el-select
                v-model="afterSaleSearchForm.serviceStatus"
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
                v-model="afterSaleSelectDate"
                type="datetimerange"
                value-format="YYYY-MM-DD HH:mm:ss"
                clearable
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                placeholder="选择起始时间"
                style="width: 360px"
                @change="selectAfterSaleDateRange"
              />
            </el-form-item>
            <el-form-item label="会员名称" prop="memberName">
              <el-input
                v-model="afterSaleSearchForm.memberName"
                placeholder="请输入会员名称"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="search-btn" @click="getAfterSaleData">搜索</el-button>
            </el-form-item>
          </el-form>

          <div style="min-height: 180px">
            <el-table v-loading="loading" border :data="afterSaleData" class="mt_10" style="width: 100%">
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
                v-model:current-page="afterSaleSearchForm.pageNumber"
                v-model:page-size="afterSaleSearchForm.pageSize"
                :page-sizes="[20, 50, 100]"
                :total="afterSaleTotal"
                layout="total, sizes, prev, pager, next, jumper"
                size="small"
                @current-change="afterSaleChangePage"
                @size-change="afterSaleChangePageSize"
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

const isValid = (v) => v !== null && v !== undefined && v !== "" && v !== "null";

export default {
  name: "member",
  components: {
    ossManage,
  },
  data() {
    return {
      id: "",
      activeTab: "basic",
      categories: [],
      loading: true,
      storeInfo: {},
      storeEnabled: false,
      storeStatusChanging: false,
      checkAllGroup: [],
      orderSelectDate: null,
      afterSaleSelectDate: null,
      orderData: [],
      orderTotal: 0,
      orderSearchForm: {
        pageNumber: 1,
        pageSize: 20,
        payStatus: "",
        orderSn: "",
        orderType: "",
      },
      afterSaleData: [],
      afterSaleTotal: 0,
      afterSaleSearchForm: {
        pageNumber: 1,
        pageSize: 20,
      },
      clerkData: [],
      clerkTotal: 0,
      clerkLoading: false,
      clerkSearchForm: {
        pageNumber: 1,
        pageSize: 20,
        clerkName: "",
        mobile: "",
      },
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
    storeAddress() {
      const path = isValid(this.storeInfo.storeAddressPath) ? this.storeInfo.storeAddressPath : "";
      const detail = isValid(this.storeInfo.storeAddressDetail) ? this.storeInfo.storeAddressDetail : "";
      return path || detail ? `${path} ${detail}`.trim() : "暂未完善";
    },
    returnAddress() {
      const s = this.storeInfo;
      const consignee = [s.salesConsigneeName, s.salesConsigneeMobile].filter(isValid).join(" ");
      const addr = [s.salesConsigneeAddressPath, s.salesConsigneeDetail].filter(isValid).join(" ");
      const text = `${consignee} ${addr}`.trim();
      return text || "暂未完善";
    },
    companyAddress() {
      const s = this.storeInfo;
      if (!isValid(s.companyAddressPath) && !isValid(s.companyAddress)) {
        return "暂未完善";
      }
      return `${isValid(s.companyAddressPath) ? s.companyAddressPath : ""} ${
        isValid(s.companyAddress) ? s.companyAddress : ""
      }`.trim();
    },
    settlementCycles() {
      if (!this.storeInfo.settlementCycle) {
        return [];
      }
      return this.storeInfo.settlementCycle.split(",").filter(Boolean);
    },
  },
  methods: {
    blankFilter(v) {
      return isValid(v) ? v : "-";
    },
    orderTypeText(v) {
      const map = {
        NORMAL: "普通订单",
        VIRTUAL: "虚拟订单",
        E_COUPON: "电子卡券订单",
        APPOINTMENT: "预约服务订单",
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
    },
    storeInfoChange(v) {
      if (v == "order") {
        this.getOrderData();
      }
      if (v == "afterSale") {
        this.getAfterSaleData();
      }
      if (v == "clerk") {
        this.getClerkData();
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
        this.storeInfo.legalPhoto = (this.storeInfo.legalPhoto || "")
          .split(",")
          .filter(Boolean);
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
    getAfterSaleData() {
      this.loading = true;
      this.afterSaleSearchForm.storeId = this.id;
      API_Order.getAfterSaleOrderPage(this.afterSaleSearchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.afterSaleData = res.result.records;
          this.afterSaleTotal = res.result.total;
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
    afterSaleChangePage(v) {
      this.afterSaleSearchForm.pageNumber = v;
      this.getAfterSaleData();
    },
    afterSaleChangePageSize(v) {
      this.afterSaleSearchForm.pageSize = v;
      this.afterSaleSearchForm.pageNumber = 1;
      this.getAfterSaleData();
    },
    getClerkData() {
      this.clerkLoading = true;
      API_Store.getShopClerkPage(this.id, this.clerkSearchForm)
        .then((res) => {
          if (res.success) {
            this.clerkData = res.result.records;
            this.clerkTotal = res.result.total;
          }
        })
        .finally(() => {
          this.clerkLoading = false;
        });
    },
    clerkChangePage(v) {
      this.clerkSearchForm.pageNumber = v;
      this.getClerkData();
    },
    clerkChangePageSize(v) {
      this.clerkSearchForm.pageSize = v;
      this.clerkSearchForm.pageNumber = 1;
      this.getClerkData();
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
    selectAfterSaleDateRange(v) {
      if (v && v.length === 2) {
        this.afterSaleSearchForm.startDate = v[0];
        this.afterSaleSearchForm.endDate = v[1];
      } else {
        this.afterSaleSearchForm.startDate = "";
        this.afterSaleSearchForm.endDate = "";
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
