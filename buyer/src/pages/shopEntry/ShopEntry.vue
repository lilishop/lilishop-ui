<template>
  <div class="shop-entry">
    <div style="height: 20px"></div>
    <div class="content">
      <h1>店铺入驻</h1>
      <el-steps :active="currentIndex" class="margin" finish-status="success">
        <el-step title="企业资质信息"></el-step>
        <el-step title="财务资质信息"></el-step>
        <el-step title="其他信息"></el-step>
        <el-step title="提交审核"></el-step>
      </el-steps>
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

      <div class="success-page" v-if="currentIndex == 3">
        <span v-if="storeDisable == '' || storeDisable == 'APPLYING'">入驻申请提交成功，等待平台审核</span>
        <span v-if="storeDisable == 'OPEN'">申请已通过，请联系管理员</span>
        <span v-if="storeDisable == 'CLOSED'">店铺已关闭，重申请联系管理员</span>
        <span v-if="storeDisable == 'REFUSED'">审核未通过,请修改资质信息，如有疑问请联系管理员</span>
      </div>
      <el-button v-if="currentIndex === 3" @click="$router.push('/')">返回</el-button>
      &nbsp;
      <el-button type="primary" @click='currentIndex = 0'
        v-if="storeDisable === 'REFUSED' && currentIndex === 3">重新申请</el-button>
    </div>

    <el-dialog title="店铺入驻协议" v-model="showAgreement" width="1200" :show-close="false" :close-on-click-modal="false">
      <div class="agreement-scroll">
        <div class="agreeent-con" v-html="agreementCon"></div>
      </div>

      <template #footer><div style="text-align: center">
        <p>
          <el-checkbox v-model="checked">我已同意以上协议</el-checkbox>
        </p>
        <el-button type="primary" :disabled="!checked" class="margin" @click="confirmAgreement">同意协议填写资质信息</el-button>
      </div></template>
    </el-dialog>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref } from "vue";
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
  padding: 10px 20px;

  h1 {

    margin-top: 20px;
  }
}

.margin {
  margin: 30px 0;
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
.success-page {
  height: 500px;
  width: 100%;
  line-height: 500px;
  text-align: center;
  font-size: 20px;
}
.shop-entry {
  min-height: 100vh;
  padding: 32px 0;
}
</style>
