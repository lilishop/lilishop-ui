<template>
  <div class="wrapper">
    <UserCenterLayout title="资金管理" :tabs="['资金管理']">

    <div class="box">
      <div class="mb_20 account-price">
        <span class="subTips">账户余额：</span>
        <span class="global_color mr_10" style="font-size:26px">￥{{ $filters.unitPrice(memberDeposit) }}</span>
        <span class="subTips">冻结金额：</span>
        <span class="">￥{{ $filters.unitPrice(frozenDeposit) }}</span>
      </div>
      <div class="account-btns">
        <el-button type="primary" @click="recharge">在线充值</el-button>
        <el-button @click="withdrawalApply">申请提现</el-button>
      </div>
    </div>
    <el-dialog v-model="modal" width="530">
      <template #header><p>
        <el-icon><Edit /></el-icon>
        <span>充值金额</span>
      </p></template>
      <div>
        <el-form
          ref="formData"
          label-width="100px"
          :model="formData"
          :rules="formValidate"
          label-position="left"
        >
          <el-form-item label="充值金额" prop="price">
            <el-input v-model="formData.price" maxlength="9" number size="large"
            ><template #append><span>元</span></template></el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer><div style="text-align: center">
        <el-button size="large" type="success" @click="rechargePrice">充值</el-button>
      </div></template>
    </el-dialog>
    <!-- 提现申请 -->
    <el-dialog v-model="withdrawApplyModal" width="530">
      <template #header><p>
        <el-icon><Edit /></el-icon>
        <span>提现金额</span>
      </p></template>
      <div>
        <el-form
          ref="withdrawApplyFormData"
          label-width="120px"
          :model="withdrawApplyFormData"
          :rules="withdrawApplyFormValidate"
        >
          <el-form-item label="提现类型" prop="type">
            <el-select v-model="withdrawApplyFormData.type" disabled>
              <el-option value="ALI">支付宝</el-option>
              <el-option value="WECHAT">微信</el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="提现金额" prop="price">
            <el-input
              v-model="withdrawApplyFormData.price"
              maxlength="9"
              number
              size="large"
            ><template #append><span>元</span></template></el-input>
            <span style="color: red">最低提现金额 {{ withdrawApplyFormData.minPrice }}元</span>
          </el-form-item>
          <el-form-item v-if="withdrawApplyFormData.type === 'ALI'" label="真实姓名" prop="realName">
            <el-input
              v-model="withdrawApplyFormData.realName"
              maxlength="9"
              number
              size="large"
            ></el-input>
          </el-form-item>
          <el-form-item v-if="withdrawApplyFormData.type === 'ALI'" label="第三方登录账号" prop="connectNumber">
            <el-input
              v-model="withdrawApplyFormData.connectNumber"
              maxlength="9"
              number
              size="large"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer><div style="text-align: center">
        <el-button size="large" type="success" @click="withdrawal">提现</el-button>
      </div></template>
    </el-dialog>
    <!-- 余额日志 -->
    <el-tabs v-model="activeWalletTab" @tab-click="(tab) => tabPaneChange(tab.paneName)">
      <el-tab-pane label="余额日志" name="log">
        <el-table ref="logTable" :data="logColumnsData.records || []">
          <el-table-column prop="createTime" label="时间" width="190" />
          <el-table-column label="金额" width="180">
            <template #default="{ row }">
              <span v-if="row.money > 0" style="color: green">{{ $filters.unitPrice(row.money, '+ ¥') }}</span>
              <span v-else-if="row.money < 0" style="color: red">{{ $filters.unitPrice(0 - row.money, '- ¥') }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="detail" label="变动日志" />
        </el-table>
        <!-- 分页 -->
        <div class="page-size">
          <el-pagination             v-model:current-page="walletForm.pageNumber"
            v-model:page-size="walletForm.pageSize"
            :page-sizes="[10, 20, 50]"
            :total="logColumnsData.total"
            @current-change="changePage"
            @size-change="changePageSize"
           layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </el-tab-pane>
      <!-- 充值记录 -->
      <el-tab-pane label="充值记录" name="recharge">
        <el-table ref="rechargeTable" :data="rechargeListData.records || []">
          <el-table-column prop="createTime" label="充值时间" width="168" />
          <el-table-column prop="rechargeSn" label="支付单号" width="200" />
          <el-table-column label="充值金额">
            <template #default="{ row }">
              <span v-if="row.payStatus === 'PAID'" style="color: green">{{ $filters.unitPrice(row.rechargeMoney, '+ ¥') }}</span>
              <span v-else>{{ $filters.unitPrice(row.rechargeMoney, '¥') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="支付状态">
            <template #default="{ row }">
              <span v-if="row.payStatus === 'PAID'">已付款</span>
              <span v-else-if="row.payStatus === 'UNPAID'">未付款</span>
              <span v-else-if="row.payStatus === 'CANCEL'">已取消</span>
            </template>
          </el-table-column>
          <el-table-column label="支付方式">
            <template #default="{ row }">
              <span v-if="row.rechargeWay === 'ALIPAY'">支付宝</span>
              <span v-else-if="row.rechargeWay === 'WECHAT'">微信</span>
              <span v-else-if="row.rechargeWay === 'BANK_TRANSFER'">线下转账</span>
            </template>
          </el-table-column>
          <el-table-column prop="payTime" label="支付时间" width="180" />
        </el-table>
        <!-- 分页 -->
        <div class="page-size">
          <el-pagination             v-model:current-page="rechargeForm.pageNumber"
            v-model:page-size="rechargeForm.pageSize"
            :page-sizes="[10, 20, 50]"
            :total="rechargeListData.total"
            @current-change="rechargeChangePage"
            @size-change="rechargeChangePageSize"
           layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </el-tab-pane>

      <el-tab-pane label="提现记录" name="withdrawApply">
        <el-table ref="withdrawTable" :data="withdrawApplyColumnsListData.records || []">
          <el-table-column prop="createTime" label="申请时间" width="168" />
          <el-table-column prop="sn" label="提现单号" width="200" />
          <el-table-column label="提现金额" width="110">
            <template #default="{ row }">
              <span v-if="row.applyStatus === 'VIA_AUDITING'" style="color: green">{{ $filters.unitPrice(row.applyMoney, '+ ¥') }}</span>
              <span v-else>{{ $filters.unitPrice(row.applyMoney, '¥') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="提现状态" width="95">
            <template #default="{ row }">
              <span v-if="row.applyStatus === 'APPLY'">申请中</span>
              <span v-else-if="row.applyStatus === 'VIA_AUDITING'">审核通过</span>
              <span v-else-if="row.applyStatus === 'SUCCESS'">提现成功</span>
              <span v-else-if="row.applyStatus === 'ERROR'">提现失败</span>
              <span v-else>审核拒绝</span>
            </template>
          </el-table-column>
          <el-table-column prop="inspectTime" label="审核时间" width="168" />
          <el-table-column prop="inspectRemark" label="审核备注" show-overflow-tooltip />
        </el-table>
        <!-- 分页 -->
        <div class="page-size">
          <el-pagination             v-model:current-page="withdrawApplyForm.pageNumber"
            v-model:page-size="withdrawApplyForm.pageSize"
            :page-sizes="[10, 20, 50]"
            :total="withdrawApplyColumnsListData.total"
            @current-change="withdrawChangePage"
            @size-change="withdrawChangePageSize"
           layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        </div>
      </el-tab-pane>
    </el-tabs>
    </UserCenterLayout>
  </div>
</template>

<script>
import { Message } from "@/utils/message";
import {getDepositLog, getMembersWallet, getRecharge, getWithdrawApply, recharge, withdrawalApply} from '@/api/member';
import {withdrawalSettingVO} from "@/api/pay";
import { Edit } from '@element-plus/icons-vue';

export default {
  name: 'MoneyManagement',
  components: { Edit },
  data() {
    return {
      activeWalletTab: "log",
      frozenDeposit: 0, // 冻结余额
      memberDeposit: 0, // 余额

      modal: false, // 余额充值
      withdrawApplyModal: false, // 提现申请
      formData: {
        // 充值金额
        price: 1
      },
      // 提现金额
      withdrawApplyFormData: {
        price: 1,
        minPrice: 1,
        type: '',
        realName: '',
        connectNumber: '',
      },
      // 余额日志
      walletForm: {
        // 搜索框初始化对象
        pageNumber: 1,
        pageSize: 10
      },
      // 充值记录
      rechargeForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10 // 页面大小
      },
      // 提现记录
      withdrawApplyForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10 // 页面大小
      },
      // 提现申请校验
      withdrawApplyFormValidate: {
        price: [
          {required: true, message: '请输入大于0小于9999的合法提现金额'},
          {
            pattern: /^[1-9]\d{0,3}(\.\d{1,2})?$/,
            message: '请输入大于0小于9999的合法提现金额',
            trigger: 'change'
          }
        ],
        realName: [
          {required: true, message: '请输入真实姓名'},
        ],
        connectNumber: [
          {required: true, message: '请输入第三方登录账号'},
        ],
      },
      formValidate: {
        price: [
          {required: true, message: '请输入大于等于1小于9999的合法充值金额'},
          {
            pattern: /^[1-9]\d{0,3}(\.\d{1,2})?$/,
            message: '请输入大于等于1小于9999的合法充值金额',
            trigger: 'change'
          }
        ]
      },
      logColumnsData: {},
      rechargeListData: {},
      withdrawApplyColumnsListData: {}
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    // 初始化数据
    init() {
      getMembersWallet().then((res) => {
        this.frozenDeposit = res.result.memberFrozenWallet;
        this.memberDeposit = res.result.memberWallet;
      });
      getDepositLog(this.walletForm).then((res) => {
        if (res.message === 'success') {
          this.logColumnsData = res.result;
          this.refreshActiveTableLayout();
        }
      });
    },
    tabPaneChange(v) {
      // 如果查询充值记录
      if (v === 'recharge') {
        this.getRechargeData();
      }
      // 如果是余额日志
      if (v === 'log') {
        this.init();
      }
      // 如果是提现记录
      if (v === 'withdrawApply') {
        this.getWithdrawApplyData();
      }
      this.refreshActiveTableLayout();
    },
    // 充值记录
    getRechargeData() {
      getRecharge(this.rechargeForm).then((res) => {
        if (res.message === 'success') {
          this.rechargeListData = res.result;
          this.refreshActiveTableLayout();
        }
      });
    },
    // 提现记录
    getWithdrawApplyData() {
      getWithdrawApply(this.withdrawApplyForm).then((res) => {
        if (res.message === 'success') {
          this.withdrawApplyColumnsListData = res.result;
          this.refreshActiveTableLayout();
        }
      });
    },
    refreshActiveTableLayout() {
      this.$nextTick(() => {
        const tableMap = {
          log: this.$refs.logTable,
          recharge: this.$refs.rechargeTable,
          withdrawApply: this.$refs.withdrawTable
        };
        tableMap[this.activeWalletTab]?.doLayout?.();
      });
    },
    // 余额日志
    changePage(v) {
      this.walletForm.pageNumber = v;
      this.init();
    },
    changePageSize(v) {
      this.walletForm.pageNumber = 1;
      this.walletForm.pageSize = v;
      this.init();
    },
    // 充值记录
    rechargeChangePage(v) {
      this.rechargeForm.pageNumber = v;
      this.getRechargeData();
    },
    rechargeChangePageSize(v) {
      this.rechargeForm.pageNumber = 1;
      this.rechargeForm.pageSize = v;
      this.getRechargeData();
    },
    // 提现记录
    withdrawChangePage(v) {
      this.withdrawApplyForm.pageNumber = v;
      this.getWithdrawApplyData();
    },
    withdrawChangePageSize(v) {
      this.withdrawApplyForm.pageNumber = 1;
      this.withdrawApplyForm.pageSize = v;
      this.getWithdrawApplyData();
    },
    // 弹出在线充值框
    recharge() {
      this.formData.price = 1;
      this.modal = true;
    },
    // 在线充值
    rechargePrice() {
      this.$refs['formData'].validate((valid) => {
        if (valid) {
          recharge(this.formData).then((res) => {
            if (res.message === 'success') {
              this.$router.push({
                path: '/payment',
                query: {orderType: 'RECHARGE', sn: res.result.rechargeSn}
              });
            }
          });
        }
      });
    },
    // 申请提现弹出框
    withdrawalApply() {
      this.withdrawApplyModal = true;
      this.withdrawApplyFormData.minPrice = 1;
      this.withdrawApplyFormData.price = 1;
      this.withdrawApplyFormData.type = '';
      this.withdrawApplyFormData.realName = '';
      this.withdrawApplyFormData.connectNumber = '';
      withdrawalSettingVO().then((res) => {
        if (res.code === 200) {
          this.withdrawApplyFormData.minPrice = res.result.minPrice;
          this.withdrawApplyFormData.type = res.result.type;
          this.withdrawApplyFormData.price = 1;
        }
      });
    },
    // 提现
    withdrawal() {
      this.$refs['withdrawApplyFormData'].validate((valid) => {
        if (valid) {
          withdrawalApply(this.withdrawApplyFormData).then((res) => {
            if (res && res.success) {
              Message.success('提现申请成功，关注提现状态');
              this.withdrawApplyModal = false;
              this.init(); // 余额查询
              this.getWithdrawApplyData(); // 提现记录
            }
          });
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.box {
  margin: 20px 0;
}

.page-size {
  margin: 15px 0px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.account-price {
  font-weight: bold;
}

.subTips {
  margin-left: 10px;
}

.account-btns {
  margin: 10px 0;
}

.el-button {
  margin: 0 4px;
}

</style>
