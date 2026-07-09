<template>
  <div>
    <el-card style="height: 240px; padding: 12px 12px 0px">
      <div class="head-title">基本信息</div>
      <div class="detail-body">
        <div class="ant-col-md-6">
          <div class="info">
            <div class="head-info">
              <el-avatar :size="64" :src="memberInfo.face" />
              <div>
                <div class="name" v-if="memberInfo.username && memberInfo.username.length > 15">
                  {{ memberInfo.username.slice(0, 15) }}...
                </div>
                <div class="name" v-else>
                  {{ memberInfo.username }}
                </div>
                <div class="phone">
                  {{ memberInfo.mobile }}
                </div>
              </div>
            </div>
            <div class="bottom-info">
              <p>上次登录 {{ memberInfo.lastLoginDate }}</p>
              <p>
                <el-switch
                  v-model="memberInfo.disabled"
                  :active-value="true"
                  :inactive-value="false"
                  active-text="启用"
                  inactive-text="禁用"
                  @change="memberStatusChange"
                />
              </p>
            </div>
          </div>
        </div>
        <div class="ant-col-md-6">
          <p class="item">
            <span class="label">昵称：</span>
            <span class="info">{{ memberInfo.nickName }}</span>
          </p>
          <p class="item">
            <span class="label">会员名称：</span>
            <span class="info">{{ memberInfo.username }}</span>
          </p>
          <p class="item">
            <span class="label">性别：</span>
            <span v-if="memberInfo.sex === 1" class="info">男</span>
            <span v-else class="info">女</span>
          </p>
          <p class="item">
            <span class="label">生日：</span>
            <span v-if="memberInfo.birthday == null || memberInfo.birthday == 'undefined'">暂未完善</span>
            <span v-else class="info">{{ memberInfo.birthday }}</span>
          </p>
          <p class="item">
            <span class="label">地区：</span>
            <span
              v-if="memberInfo.region == null || memberInfo.region == '' || memberInfo.region === 'undefined'"
              class="info"
            >暂未完善</span>
            <span v-else class="info">{{ memberInfo.region }}</span>
          </p>
          <p class="item">
            <span class="label">注册时间：</span>
            <span class="info">{{ memberInfo.createTime }}</span>
          </p>
        </div>
      </div>
    </el-card>

    <el-card class="mt_10">
      <el-tabs v-model="activeTab" @tab-change="memberInfoChange">
        <el-tab-pane label="TA的积分" name="point">
          <div class="pointsTitle" style="justify-content: flex-start; text-align: left">
            <div style="width: 120px">
              <div class="points-top-title">剩余积分</div>
              <div class="points-top-text">
                {{ memberInfo.point ? memberInfo.point : 0 }}
              </div>
            </div>
          </div>
          <div class="point-data" style="margin-top: -5px">
            <el-table v-loading="loading" border :data="pointData" class="mt_10" style="width: 100%">
              <el-table-column prop="content" label="操作内容" min-width="120" show-overflow-tooltip />
              <el-table-column prop="createTime" label="操作时间" width="200" />
              <el-table-column prop="beforePoint" label="之前积分" width="150" />
              <el-table-column label="变动积分" width="150">
                <template #default="{ row }">
                  <priceColorScheme
                    v-if="row"
                    :value="row.variablePoint"
                    :color="row.pointType == 'INCREASE' ? 'green' : $mainColor"
                    :unit="row.pointType == 'INCREASE' ? '+' : '-'"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="point" label="当前积分" width="150" />
            </el-table>

            <div class="mt_10" style="display: flex; justify-content: flex-end; margin-top: 10px">
              <el-pagination
                v-model:current-page="pointSearchForm.pageNumber"
                v-model:page-size="pointSearchForm.pageSize"
                :page-sizes="[20, 50, 100]"
                :total="pointTotal"
                layout="total, sizes, prev, pager, next, jumper"
                size="small"
                @current-change="pointChangePage"
                @size-change="pointChangePageSize"
              />
            </div>
          </div>
        </el-tab-pane>

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
                v-model="selectDate"
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
              <el-table-column prop="sn" label="订单编号" min-width="100" show-overflow-tooltip />
              <el-table-column label="订单金额" width="130">
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
              <el-table-column prop="storeName" label="购买店铺" width="120" show-overflow-tooltip />
              <el-table-column prop="createTime" label="下单时间" width="170" />
              <el-table-column label="操作" align="center" width="100" fixed="right">
                <template #default="{ row }">
                  <a v-if="row" class="link-text" @click="orderDetail(row.sn)">查看</a>
                </template>
              </el-table-column>
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

        <el-tab-pane label="TA收货地址" name="address" lazy>
          <div v-loading="addressLoading" class="member-tab-panel">
            <el-table border :data="addressData" class="mt_10 address-table" style="width: 100%">
            <el-table-column prop="alias" label="地址别名" min-width="80" show-overflow-tooltip />
            <el-table-column prop="name" label="收货人姓名" min-width="90" show-overflow-tooltip />
            <el-table-column prop="mobile" label="收货人电话" width="125" />
            <el-table-column prop="consigneeAddressPath" label="地址" min-width="160" show-overflow-tooltip />
            <el-table-column prop="detail" label="详细地址" min-width="180" show-overflow-tooltip />
            <el-table-column label="默认" width="80">
              <template #default="{ row }">
                <span v-if="row">{{ row.isDefault ? "是" : "否" }}</span>
              </template>
            </el-table-column>
          </el-table>

          <div class="mt_10" style="display: flex; justify-content: flex-end; margin-top: 10px">
            <el-pagination
              v-model:current-page="addressSearchForm.pageNumber"
              v-model:page-size="addressSearchForm.pageSize"
              :page-sizes="[20, 50, 100]"
              :total="addressTotal"
              layout="total, sizes, prev, pager, next, jumper"
              size="small"
              @current-change="addressChangePage"
              @size-change="addressChangePageSize"
            />
          </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="TA的余额" name="wallet">
          <div class="pointsTitle" style="justify-content: flex-start; text-align: left">
            <div style="min-width: 120px; margin-right: 20px">
              <div class="points-top-title">余额</div>
              <div class="points-top-text">
                <priceColorScheme
                  :value="memberWalletInfo.memberWallet"
                  :color="$mainColor"
                  :customer="{ fontSize: '21px' }"
                />
              </div>
            </div>
            <div style="min-width: 120px">
              <div class="points-top-title">冻结余额</div>
              <div class="points-top-text">
                <priceColorScheme
                  :value="memberWalletInfo.memberFrozenWallet"
                  :color="$mainColor"
                  :customer="{ fontSize: '21px' }"
                />
              </div>
            </div>
          </div>
          <el-table v-loading="loading" border :data="walletData" class="mt_10" style="width: 100%">
            <el-table-column prop="memberName" label="会员名称" min-width="120" />
            <el-table-column label="业务类型" width="200">
              <template #default="{ row }">
                <span v-if="row">{{ walletServiceTypeText(row.serviceType) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="变动金额" width="150">
              <template #default="{ row }">
                <template v-if="row">
                  <priceColorScheme v-if="row.money > 0" :value="row.money" color="green" />
                  <priceColorScheme v-else-if="row.money < 0" :value="row.money" :color="$mainColor" />
                </template>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="变动时间" width="170" />
            <el-table-column prop="detail" label="变动明细" min-width="400" show-overflow-tooltip />
          </el-table>

          <div class="mt_10" style="display: flex; justify-content: flex-end; margin-top: 10px">
            <el-pagination
              v-model:current-page="walletSearchForm.pageNumber"
              v-model:page-size="walletSearchForm.pageSize"
              :page-sizes="[20, 50, 100]"
              :total="walletTotal"
              layout="total, sizes, prev, pager, next, jumper"
              size="small"
              @current-change="walletChangePage"
              @size-change="walletChangePageSize"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane label="TA的发票" name="receipt">
          <el-form ref="receiptSearchForm" :model="receiptRecordSearchForm" inline label-width="70px" class="search-form">
            <el-form-item label="订单号" prop="orderSn">
              <el-input
                v-model="receiptRecordSearchForm.orderSn"
                placeholder="请输入订单号"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="search-btn" @click="getReceiptRecordData">搜索</el-button>
            </el-form-item>
          </el-form>
          <el-table v-loading="loading" border :data="receiptRecordData" class="mt_10" style="width: 100%">
            <el-table-column label="订单编号" width="260">
              <template #default="{ row }">
                <a v-if="row" class="link-text" @click="orderDetail(row.orderSn)">{{ row.orderSn }}</a>
              </template>
            </el-table-column>
            <el-table-column prop="receiptTitle" label="发票抬头" min-width="130" show-overflow-tooltip />
            <el-table-column prop="taxpayerId" label="纳税人识别号" min-width="130" show-overflow-tooltip />
            <el-table-column label="发票金额" width="130">
              <template #default="{ row }">
                <priceColorScheme
                  v-if="row"
                  :value="row.receiptPrice == null ? 0 : row.receiptPrice"
                  :color="$mainColor"
                />
              </template>
            </el-table-column>
            <el-table-column prop="receiptContent" label="发票内容" min-width="120" show-overflow-tooltip />
          </el-table>

          <div class="mt_10" style="display: flex; justify-content: flex-end; margin-top: 10px">
            <el-pagination
              v-model:current-page="receiptRecordSearchForm.pageNumber"
              v-model:page-size="receiptRecordSearchForm.pageSize"
              :page-sizes="[20, 50, 100]"
              :total="receiptRecordTotal"
              layout="total, sizes, prev, pager, next, jumper"
              size="small"
              @current-change="walletChangePage"
              @size-change="walletChangePageSize"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog
      v-model="addressModalVisible"
      :title="addressModalTitle"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="addressForm" :model="addressForm" label-width="100px" :rules="addressFormValidate">
        <el-form-item label="收货人姓名" prop="name">
          <el-input v-model="addressForm.name" maxlength="8" clearable style="width: 80%" />
        </el-form-item>
        <el-form-item label="收货人手机" prop="mobile">
          <el-input v-model="addressForm.mobile" clearable style="width: 80%" maxlength="11" />
        </el-form-item>
        <el-form-item label="收货人地址" prop="consigneeAddressPath">
          <span>{{ addressForm.consigneeAddressPath || "暂无地址" }}</span>
          <el-button style="margin-left: 10px" @click="$refs.map.open()">选择</el-button>
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input v-model="addressForm.detail" maxlength="35" clearable style="width: 80%" />
        </el-form-item>
        <el-form-item label="地址别名" prop="alias">
          <el-input v-model="addressForm.alias" clearable style="width: 80%" maxlength="8" />
        </el-form-item>
        <el-form-item label="默认" prop="isDefault">
          <el-radio-group v-model="addressForm.isDefault">
            <el-radio-button :value="1">是</el-radio-button>
            <el-radio-button :value="0">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addressModalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="addressSubmit">保存</el-button>
      </template>
    </el-dialog>
    <multipleMap ref="map" @callback="getAddress"></multipleMap>
  </div>
</template>

<script>
import * as API_Member from "@/api/member.js";
import ossManage from "@/views/sys/oss-manage/ossManage";
import multipleMap from "@/components/map/multiple-map";
import * as RegExp from "@/libs/RegExp.js";
import * as API_Order from "@/api/order.js";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  name: "memberDetail",
  components: {
    ossManage,
    multipleMap,
  },
  data() {
    return {
      id: "",
      activeTab: "point",
      loading: true,
      addressLoading: false,
      memberInfo: {},
      memberWalletInfo: {},
      addressModalTitle: "",
      addressModalVisible: false,
      addressForm: {
        id: "",
        isDefault: 0,
        consigneeAddressPath: "",
        consigneeAddressIdPath: "",
      },
      selectDate: null,
      submitLoading: false,
      addressFormValidate: {
        name: [{ required: true, message: "收货人姓名不能为空" }],
        mobile: [
          { required: true, message: "请输入收货人手机号码" },
          {
            pattern: RegExp.mobile,
            message: "请输入正确的手机号",
          },
        ],
        consigneeAddressPath: [{ required: true, message: "收货人地址不能为空" }],
        detail: [{ required: true, message: "收货人详细地址不能为空" }],
      },
      pointData: [],
      pointTotal: 0,
      pointSearchForm: {
        pageNumber: 1,
        pageSize: 20,
      },
      orderData: [],
      orderTotal: 0,
      orderSearchForm: {
        pageNumber: 1,
        pageSize: 20,
        payStatus: "",
        orderSn: "",
        orderType: "",
      },
      addressData: [],
      addressTotal: 0,
      addressSearchForm: {
        pageNumber: 1,
        pageSize: 20,
      },
      walletSearchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
      },
      walletData: [],
      walletTotal: 0,
      receiptRecordSearchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
      },
      receiptRecordData: [],
      receiptRecordTotal: 0,
    };
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
    walletServiceTypeText(type) {
      if (type === "WALLET_WITHDRAWAL") return "余额提现";
      if (type === "WALLET_PAY") return "余额支付";
      if (type === "WALLET_REFUND") return "余额退款";
      if (type === "WALLET_RECHARGE") return "余额充值";
      return "佣金提成";
    },
    init() {
      this.getMemberInfo();
      this.getPointData();
    },
    memberInfoChange(v) {
      if (v == "point") {
        this.getPointData();
      }
      if (v == "address") {
        this.$nextTick(() => {
          this.getAddressData();
        });
      }
      if (v == "order") {
        this.getOrderData();
      }
      if (v == "wallet") {
        this.getMemberWalletData();
        this.getDepositLogData();
      }
      if (v == "receipt") {
        this.getReceiptRecordData();
      }
    },
    getMemberInfo() {
      API_Member.getMemberInfoData(this.id).then((res) => {
        this.memberInfo = res.result;
      });
    },
    memberStatusChange(v) {
      let params = {
        memberIds: [this.id],
        disabled: v,
      };
      API_Member.updateMemberStatus(params).then((res) => {});
    },
    getMemberWalletData() {
      this.loading = true;
      let params = {
        memberId: this.id,
      };
      API_Member.getMemberWallet(params).then((res) => {
        this.loading = false;
        if (res.success) {
          this.memberWalletInfo = res.result;
        }
      });
      this.loading = false;
    },
    getDepositLogData() {
      this.loading = true;
      this.walletSearchForm.memberId = this.id;
      API_Member.getUserWallet(this.walletSearchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.walletData = res.result.records;
          this.walletTotal = res.result.total;
        }
      });
      this.loading = false;
    },
    getReceiptRecordData() {
      this.loading = true;
      this.receiptRecordSearchForm.pageNumber = 1;
      this.receiptRecordSearchForm.pageSize = 20;
      this.receiptRecordSearchForm.memberId = this.id;
      API_Order.getReceiptPage(this.receiptRecordSearchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.receiptRecordData = res.result.records;
          this.receiptRecordTotal = res.result.total;
        }
      });
      this.loading = false;
    },
    getOrderData() {
      this.loading = true;
      this.orderSearchForm.pageNumber = 1;
      this.orderSearchForm.pageSize = 20;
      this.orderSearchForm.memberId = this.id;
      API_Order.getOrderList(this.orderSearchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.orderData = res.result.records;
          this.orderTotal = res.result.total;
        }
      });
      this.loading = false;
    },
    orderDetail(v) {
      this.$router.push({
        name: "order-detail",
        query: { sn: v },
      });
    },
    getPointData() {
      this.loading = true;
      this.pointSearchForm.memberId = this.id;
      API_Member.getHistoryPointData(this.pointSearchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.pointData = res.result.records;
          this.pointTotal = res.result.total;
        }
      });
      this.loading = false;
    },
    addressSubmit() {
      this.addressForm.memberId = this.id;
      this.$refs.addressForm.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          let submit = JSON.parse(JSON.stringify(this.addressForm));
          submit.isDefault ? (submit.isDefault = true) : (submit.isDefault = false);
          if (submit.id != "") {
            API_Member.editMemberAddress(submit).then((res) => {
              this.submitLoading = false;
              if (res && res.success) {
                ElMessage.success("修改成功");
                this.addressModalVisible = false;
                this.getAddressData();
              }
            });
          } else {
            API_Member.addMemberAddress(submit).then((res) => {
              this.submitLoading = false;
              if (res && res.success) {
                ElMessage.success("添加成功");
                this.addressModalVisible = false;
                this.getAddressData();
              }
            });
          }
        }
      });
    },
    getAddress(val) {
      if (val.type === "select") {
        const paths = val.data.map((item) => item.name).join(",");
        const ids = val.data.map((item) => item.id).join(",");

        this.addressForm.consigneeAddressPath = paths;
        this.addressForm.consigneeAddressIdPath = ids;

        const coord = val.data[val.data.length - 1].center.split(",");
        this.addressForm.lat = coord[1];
        this.addressForm.lon = coord[0];
      } else {
        this.addressForm.consigneeAddressPath = val.data.addr;
        this.addressForm.consigneeAddressIdPath = val.data.addrId;
        this.addressForm.lat = val.data.position.lat;
        this.addressForm.lon = val.data.position.lng;
      }
    },
    memberAddressRemove(v) {
      ElMessageBox.confirm("确定要删除此收货地址？", "删除", { type: "warning" }).then(() => {
        API_Member.removeMemberAddress(v.id).then((res) => {
          if (res.success) {
            ElMessage.success("删除成功");
            this.getAddressData();
          }
        });
      }).catch(() => {});
    },
    getAddressData() {
      this.addressLoading = true;
      API_Member.getMemberAddressData(this.id, this.addressSearchForm)
        .then((res) => {
          if (res.success) {
            this.addressData = res.result.records;
            this.addressTotal = res.result.total;
          }
        })
        .finally(() => {
          this.addressLoading = false;
        });
    },
    pointChangePage(v) {
      this.pointSearchForm.pageNumber = v;
      this.getPointData();
    },
    pointChangePageSize(v) {
      this.pointSearchForm.pageNumber = 1;
      this.pointSearchForm.pageSize = v;
      this.getPointData();
    },
    addressChangePage(v) {
      this.addressSearchForm.pageNumber = v;
      this.getAddressData();
    },
    addressChangePageSize(v) {
      this.addressSearchForm.pageNumber = 1;
      this.addressSearchForm.pageSize = v;
      this.getAddressData();
    },
    walletChangePage(v) {
      this.walletSearchForm.pageNumber = v;
      this.getDepositLogData();
    },
    walletChangePageSize(v) {
      this.walletSearchForm.pageNumber = 1;
      this.walletSearchForm.pageSize = v;
      this.getDepositLogData();
    },
    orderChangePage(v) {
      this.orderSearchForm.pageNumber = v;
      this.getOrderData();
    },
    orderChangePageSize(v) {
      this.orderSearchForm.pageNumber = 1;
      this.orderSearchForm.pageSize = v;
      this.getOrderData();
    },
    selectDateRange(v) {
      if (v && v.length === 2) {
        this.orderSearchForm.startDate = v[0];
        this.orderSearchForm.endDate = v[1];
      } else {
        delete this.orderSearchForm.startDate;
        delete this.orderSearchForm.endDate;
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
@import "memberDetail.scss";
</style>
