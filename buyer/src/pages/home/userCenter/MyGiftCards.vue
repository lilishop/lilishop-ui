<template>
  <div class="wrapper my-gift-cards">
    <UserCenterLayout title="我的礼品卡" :tabs="['我的礼品卡']">

    <div class="bind-section mb_20">
      <div class="section-title">兑换礼品卡</div>
      <el-form ref="bindForm" :model="bindForm" :rules="bindRules" inline class="bind-form">
        <el-form-item label="卡号" prop="cardNo" label-width="60px">
          <el-input v-model="bindForm.cardNo" placeholder="请输入卡号" maxlength="64" style="width: 220px" />
        </el-form-item>
        <el-form-item label="兑换码" prop="cardSecret" label-width="70px">
          <el-input
            v-model="bindForm.cardSecret"
            type="password"
            placeholder="请输入兑换码（卡密）"
            maxlength="128"
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label-width="0px">
          <el-button type="primary" :loading="bindSubmitting" @click="submitBind">兑换</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-tabs v-model="statusTab" class="status-tabs mb_16" @tab-click="(tab) => onStatusTab(tab.paneName)">
      <el-tab-pane label="可用" name="AVAILABLE" />
      <el-tab-pane label="不可用" name="UNAVAILABLE" />
      <el-tab-pane label="待激活" name="PENDING_ACTIVATION" />
    </el-tabs>

    <div class="card-list-wrap">
      <el-skeleton v-if="loading" fix />
      <template v-if="!loading">
        <empty v-if="list.length === 0" />
        <div v-else class="gift-card-grid">
          <div v-for="item in list" :key="item.id || item.cardNo" class="gcc-card-item">
            <div class="gcc-card-header">
              <div class="gcc-header-pattern" aria-hidden="true" />
              <div class="gcc-header-inner">
                <div class="gcc-header-left">
                  <div class="gcc-title">{{ item.giftCardName || "礼品卡" }}</div>
                  <div class="gcc-face">面值{{ formatYuan(item.faceValue) }}元</div>
                  <div class="gcc-cardno">{{ item.cardNo }}</div>
                </div>
                <div class="gcc-header-right">
                  <div class="gcc-type">现金卡</div>
                  <div class="gcc-expire">{{ formatValidity(item) }}</div>
                </div>
              </div>
            </div>
            <div class="gcc-card-body">
              <div class="gcc-row">
                当前余额：<span class="gcc-strong" v-if="item.balance != null">￥{{ $filters.unitPrice(item.balance) }}</span><span class="gcc-strong" v-else>—</span>
              </div>
              
              <button
                type="button"
                class="gcc-action"
                :class="{
                  'is-disabled': primaryActionDisabled || pendingActivateLocked || isActivating(item),
                }"
                :disabled="primaryActionDisabled || pendingActivateLocked || isActivating(item)"
                @click="onCardPrimaryAction(item)"
              >
                <span v-if="isActivating(item)">提交中...</span>
                <span v-else>{{ primaryActionLabel }}</span>
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="page-size">
      <el-pagination         v-model:current-page="params.pageNumber"
        v-model:page-size="params.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        @current-change="changePage"
        @size-change="changePageSize"
       layout="total, sizes, prev, pager, next, jumper" />
    </div>

    <el-dialog v-model="noticeModal" title="使用须知" width="520">
      <p class="gcc-notice-text">
        请在有效期内使用本礼品卡；消费时将优先使用卡内余额。具体使用范围以活动规则为准。如有疑问请联系客服。
      </p>
      <div class="gcc-notice-footer">
        <el-button type="primary" @click="noticeModal = false">我知道了</el-button>
      </div></el-dialog>
    </UserCenterLayout>
  </div>
</template>

<script>
import { Message } from "@/utils/message";
import {
  getGiftCardCashMemberCardPage,
  bindGiftCardCashMemberCard,
  activateGiftCardCashMemberCard,
} from "@/api/promotion.js";

export default {
  name: "MyGiftCards",
  data() {
    return {
      statusTab: "AVAILABLE",
      loading: false,
      total: 0,
      list: [],
      params: {
        pageNumber: 1,
        pageSize: 10,
        sort: "createTime",
        order: "desc",
        memberCardStatus: "AVAILABLE",
      },
      bindSubmitting: false,
      bindForm: {
        cardNo: "",
        cardSecret: "",
      },
      bindRules: {
        cardNo: [{ required: true, message: "请输入卡号", trigger: "blur" }],
        cardSecret: [{ required: true, message: "请输入兑换码", trigger: "blur" }],
      },
      noticeModal: false,
      serviceHotline: "12221111",
      activatingId: "",
    };
  },
  computed: {
    primaryActionLabel() {
      if (this.statusTab === "PENDING_ACTIVATION") {
        return "激活自用";
      }
      if (this.statusTab === "AVAILABLE") {
        return "去使用";
      }
      return "不可用";
    },
    primaryActionDisabled() {
      return this.statusTab === "UNAVAILABLE";
    },
    pendingActivateLocked() {
      return this.statusTab === "PENDING_ACTIVATION" && !!this.activatingId;
    },
  },
  mounted() {
    this.getList();
  },
  methods: {
    formatYuan(val) {
      if (val == null || val === "") {
        return "—";
      }
      const n = Number(val);
      if (Number.isNaN(n)) {
        return String(val);
      }
      return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
    },
    formatValidity(row) {
      const t = row && row.expireTime;
      if (!t) {
        return "长期有效";
      }
      const d = new Date(t);
      if (Number.isNaN(d.getTime())) {
        return "长期有效";
      }
      if (d.getFullYear() >= 2099) {
        return "长期有效";
      }
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day} 到期`;
    },
    onStatusTab(name) {
      this.statusTab = name;
      this.params.memberCardStatus = name;
      this.params.pageNumber = 1;
      this.getList();
    },
    getList() {
      this.loading = true;
      const p = { ...this.params };
      if (p.memberCardStatus) {
        p.memberCardStatus = String(p.memberCardStatus);
      }
      getGiftCardCashMemberCardPage(p)
        .then((res) => {
          this.loading = false;
          if (res.success && res.result) {
            this.list = res.result.records || [];
            this.total = res.result.total || 0;
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    changePage(val) {
      this.params.pageNumber = val;
      this.getList();
    },
    changePageSize(val) {
      this.params.pageNumber = 1;
      this.params.pageSize = val;
      this.getList();
    },
    resetBindForm() {
      this.bindForm = { cardNo: "", cardSecret: "" };
      this.$nextTick(() => {
        if (this.$refs.bindForm) {
          this.$refs.bindForm.resetFields();
        }
      });
    },
    submitBind() {
      this.$refs.bindForm.validate((valid) => {
        if (!valid) {
          return;
        }
        this.bindSubmitting = true;
        bindGiftCardCashMemberCard({
          cardNo: String(this.bindForm.cardNo).trim(),
          cardSecret: String(this.bindForm.cardSecret).trim(),
        })
          .then((res) => {
            this.bindSubmitting = false;
            if (res.success) {
              Message.success(res.message || "兑换成功");
              this.resetBindForm();
              this.params.pageNumber = 1;
              this.getList();
            }
          })
          .catch(() => {
            this.bindSubmitting = false;
          });
      });
    },
    onCardPrimaryAction(item) {
      if (this.primaryActionDisabled) {
        return;
      }
      if (this.statusTab === "PENDING_ACTIVATION") {
        const memberCardId = this.resolveMemberCardId(item);
        if (!memberCardId) {
          Message.error("卡片信息异常，无法激活");
          return;
        }
        this.activatingId = memberCardId;
        activateGiftCardCashMemberCard(memberCardId)
          .then((res) => {
            if (res.success) {
              Message.success(res.message || "激活成功");
              this.getList();
            }
          })
          .catch(() => {})
          .finally(() => {
            this.activatingId = "";
          });
        return;
      }
      if (this.statusTab === "AVAILABLE") {
        this.$router.push({ path: "/goodsList" });
      }
    },
    resolveMemberCardId(row) {
      if (!row) {
        return "";
      }
      return row.memberCardId != null && row.memberCardId !== ""
        ? String(row.memberCardId)
        : row.id != null && row.id !== ""
          ? String(row.id)
          : "";
    },
    isActivating(item) {
      const id = this.resolveMemberCardId(item);
      return !!this.activatingId && this.activatingId === id;
    },
  },
};
</script>

<style scoped lang="scss">
.my-gift-cards {
  .bind-section {
    padding: 16px 18px;
    border-radius: 4px;
    border: 1px solid #e8eaec;
    @include white_background_color();
  }
  .section-title {
    font-size: 15px;
    font-weight: 500;
    margin-bottom: 14px;
    @include title_color($light_title_color);
  }
  .bind-form {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 4px 8px;
  }
  .status-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }
  }
  .card-list-wrap {
    position: relative;
    min-height: 200px;
    margin-top: 24px;
  }
  .gift-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px 18px;
    align-items: start;
  }
  .gcc-card-item {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
    @include white_background_color();
  }
  .gcc-card-header {
    position: relative;
    min-height: 128px;
    padding: 0;
    background: linear-gradient(125deg, #ff9a4a 0%, #ff7729 42%, #ff8f3d 100%);
  }
  .gcc-header-pattern {
    position: absolute;
    inset: 0;
    opacity: 0.22;
    pointer-events: none;
    background-image: repeating-linear-gradient(
      -36deg,
      transparent,
      transparent 5px,
      rgba(255, 255, 255, 0.45) 5px,
      rgba(255, 255, 255, 0.45) 6px
    );
  }
  .gcc-header-inner {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px 14px 14px;
    color: #fff;
  }
  .gcc-header-left {
    flex: 1;
    min-width: 0;
    padding-right: 8px;
  }
  .gcc-title {
    font-size: 17px;
    font-weight: 700;
    line-height: 1.3;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  }
  .gcc-face {
    margin-top: 8px;
    font-size: 13px;
    opacity: 0.95;
  }
  .gcc-cardno {
    margin-top: 22px;
    font-size: 12px;
    letter-spacing: 0.02em;
    opacity: 0.75;
    word-break: break-all;
  }
  .gcc-header-right {
    text-align: right;
    flex-shrink: 0;
  }
  .gcc-type {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.2;
  }
  .gcc-expire {
    margin-top: 10px;
    font-size: 12px;
    opacity: 0.9;
    white-space: nowrap;
  }
  .gcc-card-body {
    padding: 14px 14px 16px;
  }
  .gcc-row {
    font-size: 13px;
    line-height: 1.85;
    @include title_color($light_title_color);
  }
  .gcc-muted {
    color: #999;
  }
  .gcc-strong {
    color: #ff6b22;
    font-weight: 600;
  }
  .gcc-link {
    color: $theme_color;
    cursor: pointer;
  }
  .gcc-service {
    color: #515a6e;
  }
  .gcc-action {
    display: block;
    width: 100%;
    margin-top: 14px;
    padding: 10px 16px;
    border: none;
    border-radius: 999px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    color: #e95b6c;
    background: #faf4f5;
    transition: opacity 0.2s, background 0.2s;
  }
  .gcc-action:hover:not(.is-disabled) {
    background: #f5e8ea;
  }
  .gcc-action.is-disabled {
    color: #c5c8ce;
    cursor: not-allowed;
    background: #f7f7f7;
  }
  .page-size {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
.gcc-notice-text {
  line-height: 1.7;
  color: #515a6e;
  margin-bottom: 16px;
}
.gcc-notice-footer {
  text-align: right;
}
</style>
