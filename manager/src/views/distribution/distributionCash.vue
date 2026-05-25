<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchForm"
        :model="searchForm"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="会员名称" class="flex" prop="memberName">
          <el-input
            v-model="searchForm.memberName"
            placeholder="请输入会员名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="编号" class="flex">
          <el-input
            v-model="searchForm.sn"
            placeholder="请输入编号"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="状态" style="width: 240px">
          <el-select v-model="searchForm.distributionCashStatus" clearable style="width: 150px">
            <el-option
              v-for="item in cashStatusList"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
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
        <el-table-column prop="sn" label="编号" min-width="200" />
        <el-table-column prop="distributionName" label="会员名称" min-width="120" />
        <el-table-column label="申请金额" min-width="90">
          <template #default="{ row }">
            <priceColorScheme v-if="row" :value="row.price" :color="$mainColor" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" min-width="130" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="idNumber" label="身份证号" min-width="120" />
        <el-table-column prop="settlementBankAccountName" label="结算银行开户行名称" min-width="120" />
        <el-table-column prop="settlementBankAccountNum" label="结算银行开户账号" min-width="120" />
        <el-table-column prop="settlementBankBranchName" label="结算银行开户支行名称" min-width="120" />
        <el-table-column prop="updateTime" label="处理时间" min-width="130" />
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <span v-if="row">
              <span v-if="row.distributionCashStatus == 'APPLY'">待处理</span>
              <span v-else-if="row.distributionCashStatus == 'VIA_AUDITING'">通过</span>
              <span v-else-if="row.distributionCashStatus == 'FAIL_AUDITING'">审核拒绝</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130" align="center" fixed="right">
          <template #default="{ row }">
            <div v-if="row" class="ops">
              <a class="link-text" v-if="row.distributionCashStatus != 'APPLY'" @click="view(row)">查看</a>
              <a class="link-text" v-else @click="edit(row)">审核</a>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt_10 page padding-row" style="display: flex; justify-content: flex-end">
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
      :title="modalTitle"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="form" :model="form" label-width="100px">
        <el-form-item label="编号">
          <el-input v-model="form.sn" disabled clearable style="width: 100%" />
        </el-form-item>
        <el-form-item label="会员名称">
          <el-input v-model="form.distributionName" disabled clearable style="width: 100%" />
        </el-form-item>
        <el-form-item label="金额">
          <el-input v-model="form.price" disabled clearable style="width: 100%" />
        </el-form-item>
        <el-form-item v-if="handleStatus == 'edit'" label="是否通过" prop="result">
          <el-radio-group v-model="result">
            <el-radio-button value="VIA_AUDITING">通过</el-radio-button>
            <el-radio-button value="FAIL_AUDITING">拒绝</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template v-if="handleStatus == 'edit'" #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { auditDistributionCash, getDistributionCash } from "@/api/distribution";
import { cashStatusList } from "./dataJson";

export default {
  name: "distributionCash",
  data() {
    return {
      cashStatusList,
      loading: true,
      modalVisible: false,
      modalTitle: "",
      result: "FAIL_AUDITING",
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
      },
      handleStatus: "edit",
      form: {
        sn: "",
        memberName: "",
        price: "",
      },
      submitLoading: false,
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
      getDistributionCash(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    handleSubmit() {
      let result = "拒绝";
      if (this.result == "VIA_AUDITING") {
        result = "通过";
      }
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$Modal.confirm({
            title: "确认审核",
            content: "您确认要审核" + result + "么?",
            loading: true,
            onOk: () => {
              auditDistributionCash(this.form.id, { result: this.result }).then((res) => {
                if (res.success) {
                  this.$Modal.remove();
                  this.$Message.success("审核成功");
                  this.getDataList();
                  this.modalVisible = false;
                } else {
                  this.modalVisible = false;
                }
              });
            },
          });
        }
      });
    },
    edit(v) {
      this.modalTitle = "审核";
      this.handleStatus = "edit";
      this.$refs.form?.resetFields();
      for (let attr in v) {
        if (v[attr] === null) {
          v[attr] = "";
        }
      }
      this.form = JSON.parse(JSON.stringify(v));
      this.modalVisible = true;
    },
    view(v) {
      this.modalTitle = "查看";
      this.handleStatus = "view";
      this.$refs.form?.resetFields();
      for (let attr in v) {
        if (v[attr] === null) {
          v[attr] = "";
        }
      }
      let str = JSON.stringify(v);
      let data = JSON.parse(str);
      this.form = data;
      this.modalVisible = true;
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style lang="scss" scoped>
.ops a {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}
.ops span {
  display: inline-block;
  margin: 0 8px;
  color: #dcdee2;
}
</style>
