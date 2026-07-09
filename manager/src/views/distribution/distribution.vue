<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchForm"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="会员名称" prop="memberName">
          <el-input
            v-model="searchForm.memberName"
            placeholder="请输入会员名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.distributionStatus" style="width: 240px">
            <el-option
              v-for="item in distributionStatusList"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        class="mt_10"
        style="width: 100%"
      >
        <el-table-column prop="memberName" label="会员名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="idNumber" label="身份证号" min-width="120" />
        <el-table-column prop="settlementBankAccountName" label="结算银行开户行名称" min-width="120" />
        <el-table-column prop="settlementBankAccountNum" label="结算银行开户账号" min-width="120" />
        <el-table-column prop="settlementBankBranchName" label="结算银行开户支行名称" min-width="120" />
        <el-table-column prop="distributionOrderCount" label="推广单数" width="150" />
        <el-table-column label="分销订单金额" width="150">
          <template #default="{ row }">
            <priceColorScheme v-if="row" :value="row.distributionOrderPrice" :color="$mainColor" />
          </template>
        </el-table-column>
        <el-table-column label="分销金额" width="150">
          <template #default="{ row }">
            <priceColorScheme v-if="row" :value="row.rebateTotal" :color="$mainColor" />
          </template>
        </el-table-column>
        <el-table-column label="待提现金额" width="150">
          <template #default="{ row }">
            <priceColorScheme v-if="row" :value="row.canRebate" color="green" />
          </template>
        </el-table-column>
        <el-table-column label="冻结金额" width="150">
          <template #default="{ row }">
            <priceColorScheme v-if="row" :value="row.commissionFrozen" color="#347dda" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="150">
          <template #default="{ row }">
            <template v-if="row">
              <el-tag v-if="row.distributionStatus == 'PASS'" type="success">通过</el-tag>
              <el-tag v-else-if="row.distributionStatus == 'APPLY'" type="primary">待审核</el-tag>
              <el-tag v-else-if="row.distributionStatus == 'RETREAT'" type="warning">清退</el-tag>
              <el-tag v-else-if="row.distributionStatus == 'REFUSE'" type="danger">拒绝</el-tag>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <a v-if="row.distributionStatus != 'RETREAT'" class="link-text" @click="retreat(row)">清退</a>
              <a v-if="row.distributionStatus == 'RETREAT'" class="link-text" @click="resume(row)">恢复</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="edit(row)">编辑</a>
            </template>
          </template>
        </el-table-column>
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

    <el-dialog
      v-model="modalVisible"
      title="修改分销员"
      width="640px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="distributionForm"
        :model="distributionForm"
        label-width="180px"
        class="distribution-form"
        :rules="distributionFormValidate"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="distributionForm.name" clearable style="width: 100%" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idNumber">
          <el-input v-model="distributionForm.idNumber" clearable style="width: 100%" />
        </el-form-item>
        <el-form-item label="结算银行开户行名称" prop="settlementBankAccountName">
          <el-input v-model="distributionForm.settlementBankAccountName" clearable style="width: 100%" />
        </el-form-item>
        <el-form-item label="结算银行开户账号" prop="settlementBankAccountNum">
          <el-input v-model="distributionForm.settlementBankAccountNum" clearable style="width: 100%" />
        </el-form-item>
        <el-form-item label="结算银行开户支行名称" prop="settlementBankBranchName">
          <el-input v-model="distributionForm.settlementBankBranchName" clearable style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { editDistribution, getDistributionListData, resumeDistribution, retreatDistribution } from "@/api/distribution";
import { distributionStatusList } from "./dataJson.js";
import { regular } from "@/utils";

export default {
  name: "distribution",
  data() {
    return {
      distributionStatusList,
      loading: true,
      modalVisible: false,
      distributionForm: {
        name: "",
        idNumber: "",
        settlementBankAccountName: "",
        settlementBankAccountNum: "",
        settlementBankBranchName: "",
      },
      distributionFormValidate: {
        name: [regular.REQUIRED, regular.VARCHAR20],
        idNumber: [regular.REQUIRED, regular.VARCHAR20],
        settlementBankAccountName: [regular.REQUIRED, regular.VARCHAR20],
        settlementBankAccountNum: [regular.REQUIRED, regular.VARCHAR20],
        settlementBankBranchName: [regular.REQUIRED, regular.VARCHAR20],
      },
      submitLoading: false,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
      },
      data: [],
      total: 0,
    };
  },
  methods: {
    init() {
      this.getDataList();
    },
    changePage() {
      this.getDataList();
    },
    changePageSize() {
      this.searchForm.pageNumber = 1;
      this.getDataList();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 20;
      this.getDataList();
    },
    getDataList() {
      this.loading = true;
      this.searchForm.status = "PASS";
      getDistributionListData(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    retreat(v) {
      this.$Modal.confirm({
        title: "提示",
        content: "您确认要清退 " + v.memberName + " ?",
        loading: true,
        onOk: () => {
          retreatDistribution(v.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.getDataList();
            }
          });
        },
      });
    },
    resume(v) {
      this.$Modal.confirm({
        title: "提示",
        content: "您确认要恢复 " + v.memberName + " ?",
        loading: true,
        onOk: () => {
          resumeDistribution(v.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.getDataList();
            }
          });
        },
      });
    },
    edit(v) {
      this.$refs.distributionForm?.resetFields();
      for (let attr in v) {
        if (v[attr] === null) {
          v[attr] = "";
        }
      }
      let str = JSON.stringify(v);
      let data = JSON.parse(str);
      this.distributionForm = data;
      this.modalVisible = true;
    },
    handleSubmit() {
      this.$refs.distributionForm.validate((valid) => {
        if (valid) {
          editDistribution(this.distributionForm).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success("操作成功");
              this.getDataList();
              this.modalVisible = false;
            }
          });
        }
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style scoped lang="scss">
.distribution-form :deep(.el-form-item__label) {
  white-space: nowrap;
}
</style>
