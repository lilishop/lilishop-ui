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
      <el-table v-loading="loading" :data="data" border :fit="false">
        <el-table-column prop="staffName" label="员工姓名" width="160" />
        <el-table-column prop="contactPhone" label="联系电话" width="140" />
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
        <el-table-column label="操作" width="140" align="center">
          <template #default="{ row }">
            <a class="link-text" @click="openEdit(row)">编辑</a>
            <span class="op-split">|</span>
            <a class="link-text" @click="handleDelete(row)">删除</a>
          </template>
        </el-table-column>
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

    <el-dialog v-model="createVisible" :title="createForm.id ? '编辑服务人员' : '新增服务人员'" width="480px" destroy-on-close>
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="店员">
          <el-select
            v-model="createForm.clerkUserId"
            filterable
            clearable
            placeholder="请选择店员"
            style="width: 100%"
            :loading="clerkLoading"
            @change="onClerkChange"
          >
            <el-option
              v-for="clerk in clerkOptions"
              :key="clerk.memberId"
              :label="clerkOptionLabel(clerk)"
              :value="clerk.memberId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="员工姓名">
          <el-input v-model="createForm.staffName" placeholder="选择店员后自动填入" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="createForm.contactPhone" placeholder="选择店员后自动填入" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="createForm.sortOrder" :min="0" :max="9999" controls-position="right" />
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
import { ElMessageBox } from "element-plus";
import { getUserListData } from "@/api/index";
import {
  getServiceStaffPage,
  createServiceStaff,
  updateServiceStaff,
  updateServiceStaffStatus,
  deleteServiceStaff,
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
      clerkLoading: false,
      clerkOptions: [],
      createForm: {
        id: "",
        clerkUserId: "",
        staffName: "",
        contactPhone: "",
        sortOrder: 0,
        status: "ENABLED",
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
    emptyForm() {
      return {
        id: "",
        clerkUserId: "",
        staffName: "",
        contactPhone: "",
        sortOrder: 0,
        status: "ENABLED",
      };
    },
    openCreate() {
      this.createForm = this.emptyForm();
      this.createVisible = true;
      this.loadClerks();
    },
    openEdit(row) {
      this.createForm = {
        id: row.id,
        clerkUserId: row.clerkUserId || "",
        staffName: row.staffName || "",
        contactPhone: row.contactPhone || "",
        sortOrder: row.sortOrder == null ? 0 : row.sortOrder,
        status: row.status || "ENABLED",
      };
      this.createVisible = true;
      this.loadClerks();
    },
    loadClerks() {
      this.clerkLoading = true;
      getUserListData({ pageNumber: 1, pageSize: 200 })
        .then((res) => {
          if (res.success) {
            const records = res.result?.records || [];
            const usedIds = new Set(
              (this.data || [])
                .filter((staff) => staff.id !== this.createForm.id)
                .map((staff) => staff.clerkUserId)
                .filter(Boolean)
            );
            const options = records.filter(
              (clerk) => clerk.memberId && clerk.status !== false && !usedIds.has(clerk.memberId)
            );
            const currentId = this.createForm.clerkUserId;
            if (currentId && !options.some((clerk) => clerk.memberId === currentId)) {
              options.unshift({
                memberId: currentId,
                clerkName: this.createForm.staffName || "当前店员",
              });
            }
            this.clerkOptions = options;
          }
        })
        .finally(() => {
          this.clerkLoading = false;
        });
    },
    clerkOptionLabel(clerk) {
      return clerk.clerkName || "未命名店员";
    },
    onClerkChange(memberId) {
      const clerk = this.clerkOptions.find((item) => item.memberId === memberId);
      if (!clerk) {
        return;
      }
      this.createForm.staffName = clerk.clerkName || "";
      this.createForm.contactPhone = clerk.mobile || "";
    },
    submitCreate() {
      if (!this.createForm.clerkUserId) {
        this.$message.warning("请选择店员");
        return;
      }
      if (!this.createForm.staffName) {
        this.$message.warning("请填写员工姓名");
        return;
      }
      const editing = !!this.createForm.id;
      const request = editing ? updateServiceStaff(this.createForm.id, this.createForm) : createServiceStaff(this.createForm);
      this.createLoading = true;
      request
        .then((res) => {
          if (res.success) {
            this.$message.success(editing ? "已保存" : "创建成功");
            this.createVisible = false;
            this.loadData();
          }
        })
        .finally(() => {
          this.createLoading = false;
        });
    },
    handleDelete(row) {
      ElMessageBox.confirm(`确认删除服务人员「${row.staffName || ""}」？`, "提示", { type: "warning" })
        .then(() => deleteServiceStaff(row.id))
        .then((res) => {
          if (res && res.success) {
            this.$message.success("已删除");
            this.loadData();
          }
        })
        .catch(() => {});
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
