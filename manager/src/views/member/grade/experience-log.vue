<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        inline
        label-width="90px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="客户手机号" prop="mobile">
          <el-input
            v-model="searchForm.memberMobile"
            clearable
            placeholder="请输入客户手机号"
            style="width: 220px"
          />
        </el-form-item>
        <el-form-item label="规则" prop="ruleKey">
          <el-select v-model="searchForm.ruleKey" clearable filterable style="width: 220px">
            <el-option
              v-for="item in ruleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table v-loading="loading" border :data="data" class="mt_10" style="width: 100%">
        <el-table-column label="客户手机号" width="140" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row">{{ row.memberMobile || row.mobile || "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="规则名称" width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row">{{ row.ruleName || findRuleName(row.ruleKey) || "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="变化经验值" width="120">
          <template #default="{ row }">
            <span v-if="row">{{ formatExperienceValue(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="经验值限额" width="120">
          <template #default="{ row }">
            <span v-if="row">{{ formatMaxValue(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作说明" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row">{{ row.content || row.remark || row.description || "-" }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
      </el-table>
      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="changePage"
          @size-change="changePageSize"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import * as API_Member from "@/api/member";

const RULE_OPTIONS = [
  { value: "CONSUME", label: "消费" },
  { value: "REGISTER", label: "注册" },
  { value: "SIGN_IN", label: "签到" },
  { value: "COMMENT", label: "评价" },
  { value: "SHARE", label: "分享商城" },
  { value: "PROFILE", label: "完善信息" },
  { value: "FOLLOW_STORE", label: "关注店铺" },
  { value: "BIND_WECHAT", label: "绑定微信" },
  { value: "ADD_ADDRESS", label: "添加收货地址" },
  { value: "SHARE_REGISTER", label: "分享注册" },
  { value: "SHARE_BUY", label: "分享购买" },
];

defineOptions({ name: "memberGradeExperienceLog" });

const searchFormRef = ref(null);

const loading = ref(false);
const total = ref(0);
const data = ref([]);
const ruleOptions = RULE_OPTIONS;
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  memberMobile: "",
  ruleKey: "",
});

onMounted(() => {
  init();
});

function formatExperienceValue(row) {
  const v = row.value ?? row.variableExperience ?? row.experience ?? row.variableValue;
  return v == null ? "-" : v;
}
function formatMaxValue(row) {
  const v = row.maxValue ?? row.maxExperience ?? row.limitValue;
  return v == null ? "-" : v;
}
function findRuleName(ruleKey) {
  const hit = ruleOptions.find((item) => item.value === ruleKey);
  return hit ? hit.label : "";
}
function init() {
  getData();
}
function buildParams() {
  const params = {
    pageNumber: searchForm.pageNumber,
    pageSize: searchForm.pageSize,
  };
  if (searchForm.memberMobile) params.mobile = searchForm.memberMobile;
  if (searchForm.ruleKey) params.ruleKey = searchForm.ruleKey;
  return params;
}
function getData() {
  loading.value = true;
  API_Member.getMemberExperienceByPage(buildParams())
    .then((res) => {
      if (res && res.success && res.result) {
        data.value = res.result.records || [];
        total.value = res.result.total || 0;
      } else {
        data.value = [];
        total.value = 0;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}
function handleSearch() {
  searchForm.pageNumber = 1;
  getData();
}
function changePage(v) {
  searchForm.pageNumber = v;
  getData();
}
function changePageSize(v) {
  searchForm.pageNumber = 1;
  searchForm.pageSize = v;
  getData();
}
</script>
