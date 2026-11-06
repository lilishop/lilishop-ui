<template>
  <div class="wrapper my-gift-cards">
    <UserCenterLayout>
    <div class="gift-page-heading">
      <div><h2>我的礼品卡</h2><p>查看卡片权益，兑换你的心意好礼</p></div>
    </div>
    <div class="bind-section mb_20">
      <div class="section-title">兑换礼品卡</div>
      <el-form ref="bindFormRef" :model="bindForm" :rules="bindRules" class="bind-form">
        <el-form-item label="卡号" prop="cardNo" label-width="60px">
          <el-input v-model="bindForm.cardNo" placeholder="请输入卡号" maxlength="64" />
        </el-form-item>
        <el-form-item label="兑换码" prop="cardSecret" label-width="70px">
          <el-input
            v-model="bindForm.cardSecret"
            placeholder="请输入兑换码（卡密）"
            maxlength="128"
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
      <el-tab-pane name="PENDING_ACTIVATION">
        <template #label>
          <span class="pending-tab-label">待激活<span v-if="pendingCount !== null" class="pending-count">{{ pendingCount }}</span></span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <div class="card-list-wrap">
      <el-skeleton v-if="loading" :rows="5" animated />
      <template v-if="!loading">
        <div v-if="loadFailed" class="gift-load-error"><p>卡片加载失败，请稍后重试</p><el-button @click="getList">重新加载</el-button></div>
        <el-empty v-else-if="list.length === 0" :description="emptyDescription" :image-size="100" />
        <div v-else class="gift-card-grid">
          <div v-for="item in list" :key="item.id || item.cardNo" class="gcc-card-item" :class="{ 'is-unavailable': statusTab === 'UNAVAILABLE', 'is-pickup': item.cardType === 'PICKUP' }">
            <div class="gcc-card-header">
              <div class="gcc-header-pattern" aria-hidden="true" />
              <div class="gcc-header-inner">
                <div class="gcc-header-left">
                  <div class="gcc-name-row">
                    <div class="gcc-title">{{ item.giftCardName || "礼品卡" }}</div>
                    <span class="gcc-status-chip">{{ statusChipLabel }}</span>
                  </div>
                  <div v-if="item.cardType === 'PICKUP'" class="gcc-face">兑换 <strong>{{ item.pickupCount }}</strong> 种商品</div>
                  <div v-else class="gcc-face"><span class="gcc-face-symbol">￥</span>{{ formatYuan(item.faceValue) }}</div>
                  <div class="gcc-cardno">卡号 {{ item.cardNo }}</div>
                  <div class="gcc-expire">{{ formatValidity(item) }}</div>
                </div>
                <div class="gcc-header-right">
                  <div class="gcc-type">{{ item.cardType === 'PICKUP' ? '提货卡' : '现金卡' }}</div>
                </div>
              </div>
            </div>
            <div class="gcc-card-body">
              <div v-if="item.cardType === 'PICKUP'" class="gcc-row">每种一件 · 一次兑完 · 免邮</div>
              <div v-else class="gcc-row">
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
const pendingCount = ref(null);
const loadFailed = ref(false);
let listRequestId = 0;
let pendingCountRequestId = 0;
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
const emptyDescription = computed(() => ({
  AVAILABLE: "暂无可用礼品卡，可输入卡号和兑换码添加",
  UNAVAILABLE: "暂无不可用礼品卡",
  PENDING_ACTIVATION: "暂无待激活礼品卡",
}[statusTab.value]));

onMounted(() => {
  getList();
  refreshPendingCount();
});

/** 复用会员分页接口的 total 获取全部待激活数量，独立于当前标签和每页条数。 */
async function refreshPendingCount() {
  const requestId = ++pendingCountRequestId;
  try {
    const res = await getGiftCardCashMemberCardPage({ memberCardStatus: "PENDING_ACTIVATION", pageNumber: 1, pageSize: 1 });
    if (requestId === pendingCountRequestId && res.success && res.result) {
      pendingCount.value = Number(res.result.total) || 0;
    }
  } catch {
    // 统计失败时保留已知数量，不将未知数量显示成零。
  }
}

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
  const requestId = ++listRequestId;
  loading.value = true;
  loadFailed.value = false;
  const p = { ...params };
  if (p.memberCardStatus) {
    p.memberCardStatus = String(p.memberCardStatus);
  }
  getGiftCardCashMemberCardPage(p)
    .then((res) => {
      if (requestId !== listRequestId) return;
      loading.value = false;
      if (res.success && res.result) {
        list.value = res.result.records || [];
        total.value = res.result.total || 0;
        if (p.memberCardStatus === "PENDING_ACTIVATION") {
          ++pendingCountRequestId;
          pendingCount.value = Number(total.value);
        }
      } else {
        loadFailed.value = true;
      }
    })
    .catch(() => {
      if (requestId !== listRequestId) return;
      loading.value = false;
      loadFailed.value = true;
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
          refreshPendingCount();
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
          refreshPendingCount();
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
    router.push(item.cardType === "PICKUP" ? { name: "PickupCard", query: { id: resolveMemberCardId(item) } } : { path: "/goodsList" });
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
  .gift-page-heading {
    padding: 10px 4px 22px;
    h2 { margin: 0 0 8px; font-size: 22px; font-weight: 600; color: #252833; }
    p { margin: 0; font-size: 13px; color: #909399; }
  }
  .bind-section {
    padding: 20px 24px 24px;
    border-radius: 10px;
    border: 1px solid #f3e7e8;
    background: #fff9f9;
  }
  .section-title { margin-bottom: 18px; font-size: 15px; font-weight: 600; color: #303133; }
  .bind-form {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
    align-items: start;
    gap: 16px;
    :deep(.el-form-item) { margin: 0; min-width: 0; }
    :deep(.el-form-item__content) { min-width: 0; }
    :deep(.el-input__wrapper) { min-height: 36px; box-sizing: border-box; background: #fff; }
    :deep(.el-button) { height: 36px; min-width: 88px; border-radius: 6px; }
  }
  .status-tabs {
    margin-top: 28px;
    :deep(.el-tabs__header) { margin-bottom: 0; }
    :deep(.el-tabs__item) { height: 48px; font-size: 15px; }
    :deep(.el-tabs__nav-wrap::after) { height: 1px; background: #eceef2; }
  }
  .pending-tab-label { display: inline-flex; align-items: center; gap: 8px; }
  .pending-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    padding: 0 6px;
    height: 20px;
    box-sizing: border-box;
    border-radius: 10px;
    color: $theme_color;
    background: #fff0f1;
    font-size: 12px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }
  .card-list-wrap { position: relative; min-height: 290px; margin-top: 24px; }
  .gift-load-error { padding: 64px 0; text-align: center; color: #909399; }
  .gift-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    align-items: start;
  }
  .gcc-card-item {
    overflow: hidden;
    border: 1px solid #f0e3e4;
    border-radius: 12px;
    background: #fff;
    transition: box-shadow .2s, border-color .2s;
    &:hover { border-color: #edc9cd; box-shadow: 0 6px 20px rgba(100, 33, 40, .06); }
  }
  .gcc-card-header { position: relative; overflow: hidden; background: linear-gradient(120deg, #fff3f3, #fff9f7); }
  .gcc-header-pattern {
    position: absolute;
    width: 180px;
    height: 180px;
    right: -70px;
    bottom: -110px;
    border: 24px solid rgba(211, 134, 141, .07);
    border-radius: 50%;
    pointer-events: none;
  }
  .gcc-header-inner { position: relative; display: flex; gap: 12px; padding: 22px 20px 18px; }
  .gcc-header-left { flex: 1; min-width: 0; }
  .gcc-name-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
  .gcc-title { max-width: 100%; overflow-wrap: anywhere; font-size: 15px; font-weight: 600; line-height: 1.5; color: #523338; }
  .gcc-status-chip { padding: 1px 7px; border-radius: 4px; background: rgba(255,255,255,.8); color: #a9757b; font-size: 11px; line-height: 18px; }
  .gcc-face { margin-top: 18px; color: #a63e4a; font-size: 30px; font-weight: 600; line-height: 1.3; }
  .gcc-face strong { font-size: 32px; font-weight: 600; }
  .gcc-face-symbol { margin-right: 3px; font-size: 18px; }
  .gcc-cardno { margin-top: 18px; color: #96777b; font-size: 12px; overflow-wrap: anywhere; letter-spacing: .03em; }
  .gcc-header-right { flex-shrink: 0; text-align: right; }
  .gcc-type { padding: 3px 7px; border: 1px solid #e9cdd0; border-radius: 4px; font-size: 12px; color: #a46f75; white-space: nowrap; }
  .gcc-expire { margin-top: 8px; color: #a08a8d; font-size: 12px; }
  .gcc-card-body { padding: 16px 20px 20px; }
  .gcc-row { min-height: 22px; color: #777e89; font-size: 13px; line-height: 22px; }
  .gcc-strong { color: #a63e4a; font-weight: 600; }
  .gcc-action {
    display: block;
    width: 100%;
    margin-top: 16px;
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    background: $theme_color;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity .2s;
    &:hover:not(.is-disabled) { opacity: .85; }
    &:focus-visible { outline: 2px solid $theme_color; outline-offset: 3px; }
    &.is-disabled { color: #aaa; background: #f3f4f6; cursor: not-allowed; }
  }
  .is-pickup .gcc-face { font-size: 22px; }
  .gcc-card-item.is-unavailable {
    border-color: #e8eaed;
    .gcc-card-header { background: #f5f6f8; }
    .gcc-title, .gcc-face, .gcc-strong { color: #92969e; }
    .gcc-cardno, .gcc-expire, .gcc-status-chip, .gcc-type { color: #a1a5ad; }
    .gcc-type { border-color: #dddfe4; }
  }
  .page-size { display: flex; justify-content: flex-end; margin-top: 28px; padding-top: 20px; border-top: 1px solid #f0f1f4; }
  @media (max-width: 900px) {
    .bind-form { grid-template-columns: minmax(0, 1fr); gap: 22px; }
    .bind-form :deep(.el-form-item__label) { width: 70px !important; }
    .bind-form :deep(.el-form-item:last-child .el-form-item__content) { padding-left: 70px; }
    .gift-card-grid { grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }
  }
}
.gcc-notice-text { line-height: 1.7; color: #515a6e; margin-bottom: 16px; }
.gcc-notice-footer { text-align: right; }
</style>