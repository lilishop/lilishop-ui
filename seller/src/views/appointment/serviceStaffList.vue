<template>
  <div class="search">
    <el-card>
      <el-form ref="searchFormRef" :model="searchForm" inline label-width="80px" @keyup.enter="handleSearch">
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
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="openCreate">新增服务人员</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt_10">
      <el-table v-loading="loading" :data="data" border style="width: 100%">
        <el-table-column prop="staffName" label="员工姓名" min-width="140" />
        <el-table-column prop="contactPhone" label="联系电话" min-width="140" />
        <el-table-column prop="sortOrder" label="排序" width="90" align="center" />
        <el-table-column label="人员状态" width="110" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 'ENABLED'"
              @change="(val) => toggleStatus(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="170" />
        <el-table-column label="操作" width="140" align="center" fixed="right">
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
        <el-form-item label="排序值">
          <el-input-number v-model="createForm.sortOrder" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="createForm.status">
            <el-radio value="ENABLED">开启</el-radio>
            <el-radio value="DISABLED">关闭</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" @click="submitCreate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useTable } from "@/utils/useTable";
import { getUserListData } from "@/api/member";
import {
  getServiceStaffPage,
  createServiceStaff,
  updateServiceStaff,
  updateServiceStaffStatus,
  deleteServiceStaff,
} from "@/api/appointment";
import { ElMessageBox } from "element-plus";
import { Message } from "@/utils/message";

defineOptions({ name: "appointmentServiceStaffList" });

const searchFormRef = ref(null);
const createVisible = ref(false);
const createLoading = ref(false);
const clerkLoading = ref(false);
const clerkOptions = ref([]);
const createForm = ref({
  id: "",
  clerkUserId: "",
  staffName: "",
  contactPhone: "",
  sortOrder: 0,
  status: "ENABLED",
});

const { loading, data, total, searchForm, getDataList: loadData, handleSearch, resetSearch } = useTable(
  getServiceStaffPage,
  {
    pageSize: 20,
    form: {
      staffName: "",
      status: "",
    },
  }
);

function emptyForm() {
  return {
    id: "",
    clerkUserId: "",
    staffName: "",
    contactPhone: "",
    sortOrder: 0,
    status: "ENABLED",
  };
}

function openCreate() {
  createForm.value = emptyForm();
  createVisible.value = true;
  loadClerks();
}

function openEdit(row) {
  createForm.value = {
    id: row.id,
    clerkUserId: row.clerkUserId || "",
    staffName: row.staffName || "",
    contactPhone: row.contactPhone || "",
    sortOrder: row.sortOrder == null ? 0 : row.sortOrder,
    status: row.status || "ENABLED",
  };
  createVisible.value = true;
  loadClerks();
}

function loadClerks() {
  clerkLoading.value = true;
  getUserListData({ pageNumber: 1, pageSize: 200 })
    .then((res) => {
      if (res.success) {
        const records = res.result?.records || [];
        const usedIds = new Set(
          (data.value || [])
            .filter((staff) => staff.id !== createForm.value.id)
            .map((staff) => staff.clerkUserId)
            .filter(Boolean)
        );
        const options = records.filter(
          (clerk) => clerk.memberId && clerk.status !== false && !usedIds.has(clerk.memberId)
        );
        const currentId = createForm.value.clerkUserId;
        if (currentId && !options.some((clerk) => clerk.memberId === currentId)) {
          options.unshift({
            memberId: currentId,
            clerkName: createForm.value.staffName || "当前店员",
          });
        }
        clerkOptions.value = options;
      }
    })
    .finally(() => {
      clerkLoading.value = false;
    });
}

function clerkOptionLabel(clerk) {
  return clerk.clerkName || "未命名店员";
}

function onClerkChange(memberId) {
  const clerk = clerkOptions.value.find((item) => item.memberId === memberId);
  if (!clerk) {
    return;
  }
  createForm.value.staffName = clerk.clerkName || "";
  createForm.value.contactPhone = clerk.mobile || "";
}

function submitCreate() {
  if (!createForm.value.clerkUserId) {
    Message.warning("请选择店员");
    return;
  }
  if (!createForm.value.staffName) {
    Message.warning("请填写员工姓名");
    return;
  }
  const editing = !!createForm.value.id;
  const request = editing ? updateServiceStaff(createForm.value.id, createForm.value) : createServiceStaff(createForm.value);
  createLoading.value = true;
  request
    .then((res) => {
      if (res.success) {
        Message.success(editing ? "已保存" : "创建成功");
        createVisible.value = false;
        loadData();
      }
    })
    .finally(() => {
      createLoading.value = false;
    });
}

function handleDelete(row) {
  ElMessageBox.confirm(`确认删除服务人员「${row.staffName || ""}」？`, "提示", { type: "warning" })
    .then(() => deleteServiceStaff(row.id))
    .then((res) => {
      if (res && res.success) {
        Message.success("已删除");
        loadData();
      }
    })
    .catch(() => {});
}

function toggleStatus(row, enabled) {
  updateServiceStaffStatus(row.id, enabled ? "ENABLED" : "DISABLED").then((res) => {
    if (res.success) {
      row.status = enabled ? "ENABLED" : "DISABLED";
    }
  });
}
</script>

<style scoped>
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
.op-split {
  margin: 0 8px;
  color: #dcdfe6;
}
</style>
