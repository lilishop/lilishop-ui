<template>
  <div class="shop-entry">
    <div class="content">
      <div class="page-header">
        <div class="header-icon">
          <el-icon><Shop /></el-icon>
        </div>
        <div class="header-text">
          <h1>店铺入驻</h1>
          <p>完善企业资质信息，快速开启您的电商之旅</p>
        </div>
      </div>

      <div class="steps-bar">
        <div
          v-for="(step, i) in steps"
          :key="i"
          class="step-item"
          :class="{
            active: currentIndex === i,
            done: currentIndex > i,
            clickable: canClickStep(i),
          }"
          @click="onStepClick(i)"
        >
          <div class="step-circle">
            <el-icon v-if="currentIndex > i"><Check /></el-icon>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <div class="step-title">{{ step.title }}</div>
          <div class="step-desc">{{ step.desc }}</div>
          <div class="step-line" v-if="i < steps.length - 1"></div>
        </div>
      </div>

      <div v-if="initLoading" class="step-loading" v-loading="true"></div>
      <template v-else>
        <first-apply
          v-if="currentIndex === 0 && agreementAccepted"
          :content="firstData"
          @change="nextPage"
        ></first-apply>

        <second-apply
          v-if="currentIndex === 1 && agreementAccepted"
          :content="secondData"
          @change="nextPage"
        ></second-apply>

        <third-apply
          v-if="currentIndex === 2 && agreementAccepted"
          :content="thirdData"
          @change="nextPage"
        ></third-apply>
      </template>

      <div class="status-page" v-if="currentIndex === 3">
        <el-result
          v-if="storeDisable === '' || storeDisable === 'APPLYING'"
          icon="info"
          title="入驻申请提交成功"
          sub-title="您的入驻申请已提交，请耐心等待平台审核"
        >
          <template #extra>
            <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
          </template>
        </el-result>
        <el-result
          v-else-if="storeDisable === 'OPEN'"
          icon="success"
          title="申请已通过"
          sub-title="您的店铺已开通，如有问题请联系管理员"
        >
          <template #extra>
            <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
          </template>
        </el-result>
        <el-result
          v-else-if="storeDisable === 'CLOSED'"
          icon="warning"
          title="店铺已关闭"
          sub-title="如需重新入驻，请联系管理员"
        >
          <template #extra>
            <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
          </template>
        </el-result>
        <el-result
          v-else-if="storeDisable === 'REFUSED'"
          icon="error"
          title="审核未通过"
          sub-title="请修改资质信息后重新提交，如有疑问请联系管理员"
        >
          <template #extra>
            <el-button @click="$router.push('/')">返回首页</el-button>
            <el-button type="primary" @click="currentIndex = 0">重新申请</el-button>
          </template>
        </el-result>
      </div>
    </div>

    <el-dialog title="店铺入驻协议" v-model="showAgreement" width="900px" :show-close="false" :close-on-click-modal="false">
      <div class="agreement-scroll">
        <div class="agreeent-con" v-html="agreementCon"></div>
      </div>

      <template #footer><div style="text-align: center">
        <p>
          <el-checkbox v-model="checked">我已阅读并同意以上协议</el-checkbox>
        </p>
        <el-button type="primary" :disabled="!checked" class="margin" @click="confirmAgreement">同意协议，填写资质信息</el-button>
      </div></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref } from "vue";
import { Check, Shop } from "@element-plus/icons-vue";
import { agreement, applyStatus } from "@/api/shopentry";
import firstApply from "./FirstApply";
import secondApply from "./SecondApply";
import thirdApply from "./ThirdApply";

const currentIndex = ref(0); // 当前步骤
const showAgreement = ref(false); // 协议显示
const agreementCon = ref(""); // 协议内容
const checked = ref(false); // 选中协议
const firstData = reactive({}); // 第一步数据
const secondData = reactive({}); // 第二步数据
const thirdData = reactive({}); // 第三步数据
const storeDisable = ref(""); // APPLY OPEN 开店中 CLOSED 关闭 REFUSED 拒绝 APPLYING 申请中，审核
const initLoading = ref(true);
const agreementAccepted = ref(false); // 是否已同意入驻协议

const steps = [
  { title: "企业资质信息", desc: "填写企业与法人资料" },
  { title: "财务资质信息", desc: "填写结算银行信息" },
  { title: "其他信息", desc: "完善店铺资料" },
  { title: "提交审核", desc: "等待平台审核" },
];

// 已完成步骤可点击回跳；审核状态页仅在 REFUSED 时允许回跳修改
function canClickStep(i) {
  if (!agreementAccepted.value || i >= currentIndex.value) return false;
  if (currentIndex.value === 3) return storeDisable.value === "REFUSED";
  return true;
}

function onStepClick(i) {
  if (canClickStep(i)) nextPage(i);
}

function confirmAgreement() {
  agreementAccepted.value = true;
  showAgreement.value = false;
  sessionStorage.setItem("shopEntryAgreementAccepted", "1");
}

function assignApplyData(data) {
  const first = [
    "companyAddressPath",
    "companyAddress",
    "companyAddressIdPath",
    "companyEmail",
    "companyName",
    "employeeNum",
    "companyPhone",
    "legalId",
    "legalName",
    "licencePhoto",
    "legalPhoto",
    "licenseNum",
    "linkName",
    "linkPhone",
    "registeredCapital",
    "scope",
  ];
  const second = [
    "settlementBankAccountName",
    "settlementBankAccountNum",
    "settlementBankBranchName",
    "settlementBankJointName",
  ];
  const third = [
    "goodsManagementCategory",
    "storeCenter",
    "storeDesc",
    "storeLogo",
    "storeName",
    "storeAddressIdPath",
    "storeAddressPath",
    "storeAddressDetail",
  ];

  storeDisable.value = data.storeDisable || "";
  Object.assign(firstData, Object.fromEntries(first.map((key) => [key, data[key]])));
  Object.assign(secondData, Object.fromEntries(second.map((key) => [key, data[key]])));
  Object.assign(thirdData, Object.fromEntries(third.map((key) => [key, data[key]])));
}

function getArticle() {
  // 入驻协议：库中无 STORE_REGISTER 文章时 result 为 null，不能直接读 content
  agreement().then((res) => {
    agreementCon.value = res.result?.content || "";
  });
}

function getData(status) {
  applyStatus().then((res) => {
    if (!res.success) {
      return;
    }
    if (!res.result) {
      if (status === "init" && !agreementAccepted.value) {
        showAgreement.value = true;
      }
      return;
    }

    assignApplyData(res.result);
    if (status === "init") {
      agreementAccepted.value = true;
      sessionStorage.setItem("shopEntryAgreementAccepted", "1");
      if (storeDisable.value === "APPLY") {
        currentIndex.value = 0;
      } else {
        currentIndex.value = 3;
      }
    }
  }).finally(() => {
    if (status === "init") {
      initLoading.value = false;
    }
  });
}

function refreshApplyData() {
  return applyStatus().then((res) => {
    if (res.success && res.result) {
      assignApplyData(res.result);
    }
  }).catch((err) => {
    console.warn('获取入驻申请状态失败', err);
  });
}

// 下一步：先拉最新申请数据，再切步骤，避免第三步挂载后再改 content 触发校验
async function nextPage(step) {
  if (typeof step !== "number") return;
  if (step > 0 && step <= 3) {
    await refreshApplyData();
  }
  currentIndex.value = step;
}

// 初始化（原 created 钩子逻辑）
agreementAccepted.value = sessionStorage.getItem("shopEntryAgreementAccepted") === "1";

onMounted(() => {
  getData("init");
  getArticle();
});
</script>
<style lang="scss" scoped>
.content {
  width: 1200px;
  margin: 0 auto;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  min-height: 500px;
  border-radius: 20px;
  background: #fff;
  padding: 28px 48px 48px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;

  .header-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: $theme_color;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
  }

  h1 {
    margin: 0;
    font-size: 22px;
    color: #303133;
  }

  p {
    margin: 4px 0 0;
    font-size: 13px;
    color: #909399;
  }
}

.steps-bar {
  display: flex;
  align-items: flex-start;
  margin: 28px 0 36px;
}

.step-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  &.clickable {
    cursor: pointer;

    &:hover .step-title {
      color: $theme_color;
    }
  }

  &.active .step-circle {
    border-color: $theme_color;
    background: $theme_color;
    color: #fff;
  }

  &.active .step-title {
    color: $theme_color;
  }

  &.done .step-circle {
    border-color: $theme_color;
    color: $theme_color;
  }

  &.done .step-line {
    background: $theme_color;
  }
}

.step-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid #dcdfe6;
  background: #fff;
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  position: relative;
  z-index: 1;
  transition: all 0.25s;
}

.step-title {
  margin-top: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  transition: color 0.25s;
}

.step-desc {
  margin-top: 2px;
  font-size: 12px;
  color: #909399;
}

.step-line {
  position: absolute;
  top: 18px;
  left: calc(50% + 28px);
  width: calc(100% - 56px);
  height: 2px;
  background: #e4e7ed;
  transition: background 0.25s;
}

.margin {
  margin: 30px 0 0;
}
.agreeent-con {
  max-height: 500px;
  :deep(img){
    max-width: 100%;

  }
}
.agreement-scroll {
  max-height: 500px;
  overflow-y: auto;
}
.step-loading {
  min-height: 320px;
}
.status-page {
  min-height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.shop-entry {
  min-height: 100vh;
  padding: 32px 0;
}
</style>
