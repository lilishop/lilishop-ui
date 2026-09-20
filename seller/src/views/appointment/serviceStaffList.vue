<template>
  <div class="search">
    <el-card>
      <el-form ref="searchForm" :model="searchForm" inline label-width="80px" @keyup.enter="handleSearch">
        <el-form-item label="员工姓名" prop="staffName">
          <el-input v-model="searchForm.staffName" clearable placeholder="模糊搜索" style="width: 220px" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="searchForm.status" clearable placeholder="全部" style="width: 160px">
            <el-option label="开启" value="ENABLED" />
            <el-option label="关闭" value="DISABLED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button type="success" @click="openCreate">新增服务人员</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table v-loading="loading" :data="data" border style="width: 100%">
        <el-table-column prop="staffName" label="员工姓名" min-width="120" />
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="contactPhone" label="联系电话" min-width="130" />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column label="人员状态" width="110">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 'ENABLED'"
              @change="(val) => toggleStatus(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
      </el-table>
      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :total="total"
          layout="total, prev, pager, next"
          size="small"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <el-dialog v-model="createVisible" title="新增服务人员" width="480px" destroy-on-close>
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="店员用户ID">
          <el-input v-model="createForm.clerkUserId" placeholder="关联店员 clerk_user_id" />
        </el-form-item>
        <el-form-item label="员工姓名">
          <el-input v-model="createForm.staffName" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="createForm.contactPhone" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" @click="submitCreate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  getServiceStaffPage,
  createServiceStaff,
  updateServiceStaffStatus,
} from "@/api/appointment";

export default {
  name: "appointmentServiceStaffList",
  data() {
    return {
      loading: false,
      data: [],
      total: 0,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        staffName: "",
        status: "",
      },
      createVisible: false,
      createLoading: false,
      createForm: {
        clerkUserId: "",
        staffName: "",
        contactPhone: "",
      },
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.loadData();
    },
    loadData() {
      this.loading = true;
      getServiceStaffPage(this.searchForm)
        .then((res) => {
          if (res.success) {
            this.data = res.result?.records || [];
            this.total = res.result?.total || 0;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    openCreate() {
      this.createForm = { clerkUserId: "", staffName: "", contactPhone: "" };
      this.createVisible = true;
    },
    submitCreate() {
      this.createLoading = true;
      createServiceStaff(this.createForm)
        .then((res) => {
          if (res.success) {
            this.$message.success("创建成功");
            this.createVisible = false;
            this.loadData();
          }
        })
        .finally(() => {
          this.createLoading = false;
        });
    },
    toggleStatus(row, enabled) {
      updateServiceStaffStatus(row.id, enabled ? "ENABLED" : "DISABLED").then((res) => {
        if (res.success) {
          row.status = enabled ? "ENABLED" : "DISABLED";
        }
      });
    },
  },
};
</script>
