<!--
  店铺信息页面：展示商家入驻时填写的企业及联系人信息、营业执照与法人信息、财务结算信息、店铺及经营信息。
  @author Bulbasaur
  @since 2026-11-09
-->
<template>
  <div class="shop-info-page">
    <el-card v-loading="loading" shadow="never" class="info-card">
      <div class="section-block">
        <div class="section-title">店铺及经营信息</div>
        <el-descriptions :column="2" border class="shop-desc">
          <el-descriptions-item label="店铺名称">
            {{ blankFilter(storeInfo.storeName) }}
          </el-descriptions-item>
          <el-descriptions-item label="商家账号">
            {{ blankFilter(storeInfo.memberName) }}
          </el-descriptions-item>
          <el-descriptions-item label="店铺类型">
            {{ storeInfo.selfOperated == 1 || storeInfo.selfOperated === true ? "自营" : "非自营" }}
          </el-descriptions-item>
          <el-descriptions-item label="店铺状态">
            {{ storeStatusText(storeInfo.storeDisable) }}
          </el-descriptions-item>
          <el-descriptions-item label="开店时间">
            {{ blankFilter(storeInfo.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="店铺定位">
            {{ blankFilter(storeInfo.storeCenter) }}
          </el-descriptions-item>
          <el-descriptions-item label="店铺所在地">
            {{ blankFilter(storeInfo.storeAddressPath) }}
          </el-descriptions-item>
          <el-descriptions-item label="店铺详细地址">
            {{ blankFilter(storeInfo.storeAddressDetail) }}
          </el-descriptions-item>
          <el-descriptions-item label="店铺LOGO">
            <el-image
              v-if="isValid(storeInfo.storeLogo)"
              :src="storeInfo.storeLogo"
              :preview-src-list="[storeInfo.storeLogo]"
              fit="cover"
              preview-teleported
              class="cert-img"
            />
            <span v-else>暂未上传</span>
          </el-descriptions-item>
          <el-descriptions-item label="店铺经营类目">
            {{ categories.length ? categories.map((item) => item.name).join("、") : "暂未配置" }}
          </el-descriptions-item>
          <el-descriptions-item label="店铺简介" :span="2">
            {{ blankFilter(storeInfo.storeDesc) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="section-block">
        <div class="section-title">企业及联系人信息</div>
        <el-descriptions :column="2" border class="shop-desc">
          <el-descriptions-item label="公司名称">
            {{ blankFilter(storeInfo.companyName) }}
          </el-descriptions-item>
          <el-descriptions-item label="公司电话">
            {{ blankFilter(storeInfo.companyPhone) }}
          </el-descriptions-item>
          <el-descriptions-item label="公司所在地">
            {{ blankFilter(storeInfo.companyAddressPath) }}
          </el-descriptions-item>
          <el-descriptions-item label="公司详细地址">
            {{ blankFilter(storeInfo.companyAddress) }}
          </el-descriptions-item>
          <el-descriptions-item label="员工总数">
            {{ isValid(storeInfo.employeeNum) ? `${storeInfo.employeeNum} 人` : "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="注册资金">
            {{ isValid(storeInfo.registeredCapital) ? `${storeInfo.registeredCapital} 万元` : "-" }}
          </el-descriptions-item>
          <el-descriptions-item label="联系人姓名">
            {{ blankFilter(storeInfo.linkName) }}
          </el-descriptions-item>
          <el-descriptions-item label="联系人电话">
            {{ blankFilter(storeInfo.linkPhone) }}
          </el-descriptions-item>
          <el-descriptions-item label="电子邮箱" :span="2">
            {{ blankFilter(storeInfo.companyEmail) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="section-block">
        <div class="section-title">营业执照与法人信息</div>
        <el-descriptions :column="2" border class="shop-desc">
          <el-descriptions-item label="营业执照号">
            {{ blankFilter(storeInfo.licenseNum) }}
          </el-descriptions-item>
          <el-descriptions-item label="法人姓名">
            {{ blankFilter(storeInfo.legalName) }}
          </el-descriptions-item>
          <el-descriptions-item label="法人证件号" :span="2">
            {{ blankFilter(storeInfo.legalId) }}
          </el-descriptions-item>
          <el-descriptions-item label="法定经营范围" :span="2">
            {{ blankFilter(storeInfo.scope) }}
          </el-descriptions-item>
          <el-descriptions-item label="营业执照电子版">
            <el-image
              v-if="isValid(storeInfo.licencePhoto)"
              :src="storeInfo.licencePhoto"
              :preview-src-list="[storeInfo.licencePhoto]"
              fit="cover"
              preview-teleported
              class="cert-img"
            />
            <span v-else>暂未上传</span>
          </el-descriptions-item>
          <el-descriptions-item label="法人证件电子版">
            <template v-if="legalPhotoList.length">
              <el-image
                v-for="(img, idx) in legalPhotoList"
                :key="idx"
                :src="img"
                :preview-src-list="legalPhotoList"
                :initial-index="idx"
                fit="cover"
                preview-teleported
                class="cert-img"
              />
            </template>
            <span v-else>暂未上传</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="section-block">
        <div class="section-title">财务结算信息</div>
        <el-descriptions :column="2" border class="shop-desc">
          <el-descriptions-item label="银行开户名">
            {{ blankFilter(storeInfo.settlementBankAccountName) }}
          </el-descriptions-item>
          <el-descriptions-item label="银行账号">
            {{ blankFilter(storeInfo.settlementBankAccountNum) }}
          </el-descriptions-item>
          <el-descriptions-item label="开户银行支行名称">
            {{ blankFilter(storeInfo.settlementBankBranchName) }}
          </el-descriptions-item>
          <el-descriptions-item label="支行联行号">
            {{ blankFilter(storeInfo.settlementBankJointName) }}
          </el-descriptions-item>
          <el-descriptions-item label="结算日" :span="2">
            <span v-if="settlementCycles.length">每月 {{ settlementCycles.join("、") }} 日</span>
            <span v-else>-</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import * as API_Shop from "@/api/shops";
import { getGoodsCategoryAll } from "@/api/goods";

defineOptions({ name: "shopInfo" });

const loading = ref(false);
const storeInfo = ref({});
const categories = ref([]);

const isValid = (v) => v !== null && v !== undefined && v !== "" && v !== "null";

function blankFilter(v) {
  return isValid(v) ? v : "-";
}

function storeStatusText(status) {
  const map = {
    OPEN: "营业中",
    CLOSED: "已关闭",
    APPLY: "申请开店中",
    APPLYING: "待平台审核",
    REFUSED: "审核未通过",
  };
  return map[status] || status || "-";
}

const legalPhotoList = computed(() => {
  if (!isValid(storeInfo.value.legalPhoto)) {
    return [];
  }
  if (Array.isArray(storeInfo.value.legalPhoto)) {
    return storeInfo.value.legalPhoto.filter(isValid);
  }
  return String(storeInfo.value.legalPhoto)
    .split(",")
    .map((s) => s.trim())
    .filter(isValid);
});

const settlementCycles = computed(() => {
  if (!isValid(storeInfo.value.settlementCycle)) {
    return [];
  }
  return String(storeInfo.value.settlementCycle)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
});

async function loadData() {
  loading.value = true;
  try {
    const [baseRes, detailRes, catRes] = await Promise.allSettled([
      API_Shop.getShopInfo(),
      API_Shop.getShopEntryDetail(),
      getGoodsCategoryAll(),
    ]);

    const merged = {};
    if (baseRes.status === "fulfilled" && baseRes.value?.success && baseRes.value.result) {
      Object.assign(merged, baseRes.value.result);
    }
    if (detailRes.status === "fulfilled" && detailRes.value?.success && detailRes.value.result) {
      Object.assign(merged, detailRes.value.result);
    }
    storeInfo.value = merged;

    if (catRes.status === "fulfilled" && catRes.value?.success && Array.isArray(catRes.value.result)) {
      categories.value = catRes.value.result;
    }
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style lang="scss" scoped>
.shop-info-page {
  padding-left: 10px;
}

.section-block + .section-block {
  margin-top: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;

  &::before {
    content: "";
    width: 4px;
    height: 16px;
    border-radius: 2px;
    background: var(--el-color-primary);
    margin-right: 8px;
  }
}

.shop-desc {
  :deep(.el-descriptions__label) {
    width: 160px;
    color: #606266;
    background: #fafbfc;
    font-weight: 400;
  }

  :deep(.el-descriptions__content) {
    color: #303133;
    word-break: break-all;
  }

  :deep(.el-descriptions__cell) {
    padding: 12px 16px !important;
  }
}

.cert-img {
  width: 96px;
  height: 96px;
  margin: 0 10px 4px 0;
  border-radius: 6px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  vertical-align: top;
}
</style>
