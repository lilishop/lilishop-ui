<template>
  <div class="wrapper my-gift-cards">
    <UserCenterLayout>

    <div class="bind-section mb_20">
      <div class="section-title">兑换礼品卡</div>
      <el-form ref="bindFormRef" :model="bindForm" :rules="bindRules" inline class="bind-form">
        <el-form-item label="卡号" prop="cardNo" label-width="60px">
          <el-input v-model="bindForm.cardNo" placeholder="请输入卡号" maxlength="64" style="width: 220px" />
        </el-form-item>
        <el-form-item label="兑换码" prop="cardSecret" label-width="70px">
          <el-input
            v-model="bindForm.cardSecret"
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
          <div v-for="item in list" :key="item.id || item.cardNo" class="gcc-card-item" :class="{ 'is-unavailable': statusTab === 'UNAVAILABLE' }">
            <div class="gcc-card-header">
              <div class="gcc-header-pattern" aria-hidden="true" />
              <div class="gcc-header-inner">
                <div class="gcc-header-left">
                  <div class="gcc-name-row">
                    <div class="gcc-title">{{ item.giftCardName || "礼品卡" }}</div>
                    <span class="gcc-status-chip">{{ statusChipLabel }}</span>
                  </div>
                  <div class="gcc-face"><span class="gcc-face-symbol">￥</span>{{ formatYuan(item.faceValue) }}</div>
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
        :page-sizes="[20, 50, 100]"
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

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { Message } from "@/utils/message";
import {
  getGiftCardCashMemberCardPage,
  bindGiftCardCashMemberCard,
  activateGiftCardCashMemberCard,
} from "@/api/promotion.js";

defineOptions({ name: "MyGiftCards" });

const router = useRouter();

const statusTab = ref("AVAILABLE");
const loading = ref(false);
const total = ref(0);
const list = ref([]);
const params = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
  memberCardStatus: "AVAILABLE",
});
const bindSubmitting = ref(false);
const bindForm = ref({
  cardNo: "",
  cardSecret: "",
});
const bindRules = {
  cardNo: [{ required: true, message: "请输入卡号", trigger: "blur" }],
  cardSecret: [{ required: true, message: "请输入兑换码", trigger: "blur" }],
};
const noticeModal = ref(false);
const serviceHotline = ref("12221111");
const activatingId = ref("");
const bindFormRef = ref(null);

const primaryActionLabel = computed(() => {
  if (statusTab.value === "PENDING_ACTIVATION") {
    return "激活自用";
  }
  if (statusTab.value === "AVAILABLE") {
    return "去使用";
  }
  return "不可用";
});
const primaryActionDisabled = computed(() => {
  return statusTab.value === "UNAVAILABLE";
});
const pendingActivateLocked = computed(() => {
  return statusTab.value === "PENDING_ACTIVATION" && !!activatingId.value;
});
const statusChipLabel = computed(() => {
  const map = { AVAILABLE: "可用", UNAVAILABLE: "不可用", PENDING_ACTIVATION: "待激活" };
  return map[statusTab.value] || "";
});

onMounted(() => {
  getList();
});

function formatYuan(val) {
  if (val == null || val === "") {
    return "—";
  }
  const n = Number(val);
  if (Number.isNaN(n)) {
    return String(val);
  }
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
}

function formatValidity(row) {
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
}

function onStatusTab(name) {
  statusTab.value = name;
  params.memberCardStatus = name;
  params.pageNumber = 1;
  getList();
}

function getList() {
  loading.value = true;
  const p = { ...params };
  if (p.memberCardStatus) {
    p.memberCardStatus = String(p.memberCardStatus);
  }
  getGiftCardCashMemberCardPage(p)
    .then((res) => {
      loading.value = false;
      if (res.success && res.result) {
        list.value = res.result.records || [];
        total.value = res.result.total || 0;
      }
    })
    .catch(() => {
      loading.value = false;
    });
}

function changePage(val) {
  params.pageNumber = val;
  getList();
}

function changePageSize(val) {
  params.pageNumber = 1;
  params.pageSize = val;
  getList();
}

function resetBindForm() {
  bindForm.value = { cardNo: "", cardSecret: "" };
  nextTick(() => {
    if (bindFormRef.value) {
      bindFormRef.value.resetFields();
    }
  });
}

function submitBind() {
  bindFormRef.value.validate((valid) => {
    if (!valid) {
      return;
    }
    bindSubmitting.value = true;
    bindGiftCardCashMemberCard({
      cardNo: String(bindForm.value.cardNo).trim(),
      cardSecret: String(bindForm.value.cardSecret).trim(),
    })
      .then((res) => {
        bindSubmitting.value = false;
        if (res.success) {
          Message.success(res.message || "兑换成功");
          resetBindForm();
          params.pageNumber = 1;
          getList();
        }
      })
      .catch(() => {
        bindSubmitting.value = false;
      });
  });
}

function onCardPrimaryAction(item) {
  if (primaryActionDisabled.value) {
    return;
  }
  if (statusTab.value === "PENDING_ACTIVATION") {
    const memberCardId = resolveMemberCardId(item);
    if (!memberCardId) {
      Message.error("卡片信息异常，无法激活");
      return;
    }
    activatingId.value = memberCardId;
    activateGiftCardCashMemberCard(memberCardId)
      .then((res) => {
        if (res.success) {
          Message.success(res.message || "激活成功");
          getList();
        }
      })
      .catch((err) => {
        console.warn('激活礼品卡失败', err);
      })
      .finally(() => {
        activatingId.value = "";
      });
    return;
  }
  if (statusTab.value === "AVAILABLE") {
    router.push({ path: "/goodsList" });
  }
}

function resolveMemberCardId(row) {
  if (!row) {
    return "";
  }
  return row.memberCardId != null && row.memberCardId !== ""
    ? String(row.memberCardId)
    : row.id != null && row.id !== ""
      ? String(row.id)
      : "";
}

function isActivating(item) {
  const id = resolveMemberCardId(item);
  return !!activatingId.value && activatingId.value === id;
}
</script>

<style scoped lang="scss">
.my-gift-cards {
  .bind-section {
    padding: 16px 18px;
    border-radius: 8px;
    border: 1px solid #eee;
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
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
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
    font-size: 14px;
    font-weight: 600;
    line-height: 1.3;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  }
  .gcc-name-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .gcc-status-chip {
    padding: 0 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.2);
    font-size: 11px;
    line-height: 18px;
  }
  .gcc-face {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
  }
  .gcc-face-symbol {
    margin-right: 2px;
    font-size: 15px;
    font-weight: 500;
  }
  .gcc-cardno {
    margin-top: 14px;
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
    font-size: 14px;
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
    padding: 9px 16px;
    border: none;
    border-radius: 999px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    color: #fff;
    background: $theme_color;
    transition: opacity 0.2s, background 0.2s;
  }
  .gcc-action:hover:not(.is-disabled) {
    opacity: 0.9;
  }
  .gcc-action.is-disabled {
    color: #c5c8ce;
    cursor: not-allowed;
    background: #f7f7f7;
  }
  .gcc-card-item.is-unavailable {
    .gcc-card-header {
      background: linear-gradient(125deg, #c9c9c9 0%, #a8a8a8 100%);
    }
    .gcc-strong {
      color: #999;
    }
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
