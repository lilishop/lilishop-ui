<template>
  <div class="search">
    <el-card>
      <el-tabs v-model="activeTab" @tab-click="onTabClick">
        <el-tab-pane label="退款" name="RETURN_MONEY">
          <div class="operation" style="margin-bottom: 10px">
            <el-button type="primary" @click="add">添加</el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="取消" name="CANCEL">
          <div class="operation" style="margin-bottom: 10px">
            <el-button type="primary" @click="add">添加</el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="退货" name="RETURN_GOODS">
          <div class="operation" style="margin-bottom: 10px">
            <el-button type="primary" @click="add">添加</el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="投诉" name="COMPLAIN">
          <div class="operation" style="margin-bottom: 10px">
            <el-button type="primary" @click="add">添加</el-button>
            <el-button @click="getDataList">刷新</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>

      <el-table v-loading="loading" border :data="data" ref="table" style="width: 100%">
        <el-table-column prop="createBy" label="创建人" min-width="120" />
        <el-table-column prop="reason" label="原因" min-width="400" />
        <el-table-column prop="createTime" label="时间" min-width="100" />
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <template v-if="row">
              <a class="link-text" @click="edit(row)">编辑</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="remove(row)">删除</a>
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

    <el-dialog v-model="modalVisible" :title="modalTitle" width="500px" :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="100px" :rules="formValidate">
        <el-form-item label="售后原因" prop="reason">
          <el-input v-model="form.reason" maxlength="20" clearable style="width: 100%" />
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
import * as API_Order from "@/api/order";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  data() {
    return {
      activeTab: "RETURN_MONEY",
      modalVisible: false,
      modalTitle: "",
      loading: true,
      submitLoading: false,
      form: { reason: "" },
      formValidate: {
        reason: [{ required: true, message: "请输入售后原因", trigger: "blur" }],
      },
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
        serviceType: "RETURN_MONEY",
      },
      data: [],
      total: 0,
    };
  },
  methods: {
    onTabClick(tab) {
      this.handleClickType(tab.paneName);
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    changePageSize(v) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    handleClickType(v) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 20;
      this.searchForm.serviceType = v;
      this.getDataList();
    },
    getDataList() {
      this.loading = true;
      API_Order.getAfterSaleReasonPage(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    add() {
      this.form.reason = "";
      this.modalVisible = true;
      this.modalTitle = "添加售后原因";
    },
    edit(v) {
      this.form.reason = v.reason;
      this.form.id = v.id;
      this.modalVisible = true;
      this.modalTitle = "修改售后原因";
    },
    handleSubmit() {
      this.form.serviceType = this.searchForm.serviceType;
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          if (this.modalTitle == "添加售后原因") {
            delete this.form.id;
            API_Order.addAfterSaleReason(this.form).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                ElMessage.success("添加成功");
                this.getDataList();
                this.modalVisible = false;
              }
            });
          } else {
            API_Order.editAfterSaleReason(this.form.id, this.form).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                ElMessage.success("修改成功");
                this.getDataList();
                this.modalVisible = false;
              }
            });
          }
        }
      });
    },
    remove(v) {
      ElMessageBox.confirm("确认要删除此售后原因?", "确认删除", { type: "warning" }).then(() => {
        API_Order.delAfterSaleReason(v.id).then((res) => {
          if (res.success) {
            ElMessage.success("售后原因已删除");
            this.getDataList();
          }
        });
      }).catch(() => {});
    },
  },
  mounted() {
    this.getDataList();
  },
};
</script>
<style scoped>
.link-text {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}
.op-split {
  display: inline-block;
  margin: 0 8px;
  color: #dcdee2;
}
</style>
