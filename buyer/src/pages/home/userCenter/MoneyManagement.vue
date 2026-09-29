<template>
  <div class="wrapper">
    <UserCenterLayout>

    <div class="wallet-summary">
      <div class="wallet-stat">
        <div class="label">账户余额</div>
        <div class="value">￥{{ $filters.unitPrice(memberDeposit) }}</div>
      </div>
      <div class="wallet-stat">
        <div class="label">冻结金额</div>
        <div class="value is-muted">￥{{ $filters.unitPrice(frozenDeposit) }}</div>
      </div>
    </div>
    <div class="account-btns">
      <button type="button" class="op-btn" @click="recharge">在线充值</button>
      <button type="button" class="ghost-btn" @click="withdrawalApply">申请提现</button>
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
    <div class="wallet-tabs">
      <div class="wallet-tab" :class="{ active: activeWalletTab === 'log' }" @click="tabPaneChange('log')">余额日志</div>
      <div class="wallet-tab" :class="{ active: activeWalletTab === 'recharge' }" @click="tabPaneChange('recharge')">充值记录</div>
      <div class="wallet-tab" :class="{ active: activeWalletTab === 'withdrawApply' }" @click="tabPaneChange('withdrawApply')">提现记录</div>
    </div>

    <div v-show="activeWalletTab === 'log'">
      <empty v-if="!(logColumnsData.records || []).length" />
      <div v-else class="wallet-list log-list">
        <div class="wallet-head">
          <span>时间</span>
          <span>金额</span>
          <span>变动日志</span>
        </div>
        <div class="wallet-row" v-for="(row, index) in logColumnsData.records" :key="row.id || index">
          <div class="wallet-time">{{ row.createTime }}</div>
          <div class="wallet-money" :class="row.money > 0 ? 'is-plus' : 'is-minus'">
            <span v-if="row.money > 0">{{ $filters.unitPrice(row.money, '+ ¥') }}</span>
            <span v-else-if="row.money < 0">{{ $filters.unitPrice(0 - row.money, '- ¥') }}</span>
          </div>
          <div class="wallet-detail">{{ row.detail }}</div>
        </div>
      </div>
      <div class="page-size">
        <el-pagination v-model:current-page="walletForm.pageNumber" v-model:page-size="walletForm.pageSize"
          :page-sizes="[20, 50, 100]" :total="logColumnsData.total" @current-change="changePage"
          @size-change="changePageSize" layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
    </div>

    <div v-show="activeWalletTab === 'recharge'">
      <empty v-if="!(rechargeListData.records || []).length" />
      <div v-else class="wallet-list recharge-list">
        <div class="wallet-head">
          <span>充值时间</span>
          <span>支付单号</span>
          <span>充值金额</span>
          <span>支付状态</span>
          <span>支付方式</span>
          <span>支付时间</span>
        </div>
        <div class="wallet-row" v-for="(row, index) in rechargeListData.records" :key="row.rechargeSn || index">
          <div>{{ row.createTime }}</div>
          <div class="wallet-detail">{{ row.rechargeSn }}</div>
          <div class="wallet-money" :class="row.payStatus === 'PAID' ? 'is-plus' : ''">
            {{ $filters.unitPrice(row.rechargeMoney, row.payStatus === 'PAID' ? '+ ¥' : '¥') }}
          </div>
          <div>{{ rechargeStatusText(row.payStatus) }}</div>
          <div>{{ rechargeWayText(row.rechargeWay) }}</div>
          <div>{{ row.payTime || '—' }}</div>
        </div>
      </div>
      <div class="page-size">
        <el-pagination v-model:current-page="rechargeForm.pageNumber" v-model:page-size="rechargeForm.pageSize"
          :page-sizes="[20, 50, 100]" :total="rechargeListData.total" @current-change="rechargeChangePage"
          @size-change="rechargeChangePageSize" layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
    </div>

    <div v-show="activeWalletTab === 'withdrawApply'">
      <empty v-if="!(withdrawApplyColumnsListData.records || []).length" />
      <div v-else class="wallet-list withdraw-list">
        <div class="wallet-head">
          <span>申请时间</span>
          <span>提现单号</span>
          <span>提现金额</span>
          <span>提现状态</span>
          <span>审核时间</span>
          <span>审核备注</span>
        </div>
        <div class="wallet-row" v-for="(row, index) in withdrawApplyColumnsListData.records" :key="row.sn || index">
          <div>{{ row.createTime }}</div>
          <div class="wallet-detail">{{ row.sn }}</div>
          <div class="wallet-money" :class="row.applyStatus === 'VIA_AUDITING' ? 'is-plus' : ''">
            {{ $filters.unitPrice(row.applyMoney, row.applyStatus === 'VIA_AUDITING' ? '+ ¥' : '¥') }}
          </div>
          <div>{{ withdrawStatusText(row.applyStatus) }}</div>
          <div>{{ row.inspectTime || '—' }}</div>
          <div class="wallet-detail">{{ row.inspectRemark || '—' }}</div>
        </div>
      </div>
      <div class="page-size">
        <el-pagination v-model:current-page="withdrawApplyForm.pageNumber" v-model:page-size="withdrawApplyForm.pageSize"
          :page-sizes="[20, 50, 100]" :total="withdrawApplyColumnsListData.total" @current-change="withdrawChangePage"
          @size-change="withdrawChangePageSize" layout="total, sizes, prev, pager, next, jumper"></el-pagination>
      </div>
    </div>
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
        pageSize: 20
      },
      // 充值记录
      rechargeForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 20 // 页面大小
      },
      // 提现记录
      withdrawApplyForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 20 // 页面大小
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
        }
      });
    },
    tabPaneChange(v) {
      this.activeWalletTab = v;
      if (v === 'recharge') {
        this.getRechargeData();
      }
      if (v === 'log') {
        this.init();
      }
      if (v === 'withdrawApply') {
        this.getWithdrawApplyData();
      }
    },
    // 充值记录
    getRechargeData() {
      getRecharge(this.rechargeForm).then((res) => {
        if (res.message === 'success') {
          this.rechargeListData = res.result;
        }
      });
    },
    // 提现记录
    getWithdrawApplyData() {
      getWithdrawApply(this.withdrawApplyForm).then((res) => {
        if (res.message === 'success') {
          this.withdrawApplyColumnsListData = res.result;
        }
      });
    },
    rechargeStatusText (status) {
      const map = { PAID: '已付款', UNPAID: '未付款', CANCEL: '已取消' }
      return map[status] || status || '—'
    },
    rechargeWayText (way) {
      const map = { ALIPAY: '支付宝', WECHAT: '微信', BANK_TRANSFER: '线下转账' }
      return map[way] || way || '—'
    },
    withdrawStatusText (status) {
      const map = {
        APPLY: '申请中',
        VIA_AUDITING: '审核通过',
        SUCCESS: '提现成功',
        ERROR: '提现失败'
      }
      return map[status] || '审核拒绝'
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
.wallet-summary {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.wallet-stat {
  flex: 1;
  padding: 16px 20px;
  background: #fafafa;
  border-radius: 8px;

  .label {
    color: #666;
    font-size: 14px;
    line-height: 22px;
  }

  .value {
    margin-top: 4px;
    color: $theme_color;
    font-size: 28px;
    font-weight: 600;
    line-height: 1.2;

    &.is-muted {
      color: #171A26;
      font-size: 22px;
    }
  }
}

.account-btns {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.op-btn,
.ghost-btn {
  height: 32px;
  padding: 0 16px;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  line-height: 30px;
  cursor: pointer;
}

.op-btn {
  border: 1px solid $theme_color;
  background: $theme_color;
  color: #fff;

  &:hover {
    opacity: 0.9;
  }
}

.ghost-btn {
  border: 1px solid #ddd;
  background: #fff;
  color: #171A26;

  &:hover {
    border-color: $theme_color;
    color: $theme_color;
  }
}

.wallet-tabs {
  display: flex;
  gap: 24px;
  margin: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.wallet-tab {
  position: relative;
  padding: 10px 0;
  color: #666;
  font-size: 14px;
  line-height: 22px;
  cursor: pointer;

  &.active {
    color: $theme_color;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 2px;
      background: $theme_color;
    }
  }
}

.wallet-list {
  --wallet-cols: 180px 120px minmax(0, 1fr);
}

.recharge-list,
.withdraw-list {
  --wallet-cols: 156px minmax(120px, 1.1fr) 100px 80px 80px 156px;
}

.withdraw-list {
  --wallet-cols: 156px minmax(120px, 1fr) 100px 80px 156px minmax(100px, 1fr);
}

.wallet-head,
.wallet-row {
  display: grid;
  grid-template-columns: var(--wallet-cols);
  column-gap: 12px;
  align-items: start;
}

.wallet-head {
  padding: 0 8px 10px;
  color: #999;
  font-size: 13px;
}

.wallet-row {
  padding: 14px 8px;
  border-top: 1px solid #f0f0f0;
  color: #171A26;
  font-size: 14px;
  line-height: 22px;
}

.wallet-detail {
  min-width: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.wallet-money {
  font-weight: 600;

  &.is-plus {
    color: #19be6b;
  }

  &.is-minus {
    color: $theme_color;
  }
}

.page-size {
  margin: 16px 0;
  display: flex;
  justify-content: flex-end;

  :deep(.el-pagination) {
    justify-content: flex-end;
  }
}
</style>
