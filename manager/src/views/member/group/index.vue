<template>
  <div class="member-group-page search">
    <!-- 顶部筛选与操作栏 -->
    <el-card shadow="never" class="filter-card">
      <div class="card-toolbar">
        <el-form inline :model="searchForm" class="filter-form" @keyup.enter="handleSearch">
          <el-form-item label="分组名称">
            <el-input
              v-model="searchForm.groupName"
              placeholder="请输入分组名称"
              clearable
              style="width: 220px"
              @clear="handleSearch"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        <div class="toolbar-right">
          <el-button type="primary" @click="openAdd">添加分组</el-button>
        </div>
      </div>
    </el-card>

    <!-- 分组数据表格 -->
    <el-card shadow="never" class="table-card mt_10">
      <template #header>
        <div class="card-header-bar">
          <div class="header-title">
            <span>会员分组列表</span>
          </div>
          <div class="header-actions">
            <el-button size="small" @click="getData">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table
        ref="table"
        v-loading="loading"
        :data="data"
        border
        stripe
        style="width: 100%"
        class="custom-group-table"
      >
        <!-- 分组ID -->
        <el-table-column prop="id" label="分组ID" min-width="190" />

        <!-- 分组名称 -->
        <el-table-column prop="groupName" label="分组名称" min-width="160" show-overflow-tooltip />

        <!-- 分组人数 -->
        <el-table-column prop="memberCount" label="分组人数" width="110" align="center">
          <template #default="{ row }">
            <template v-if="row">
              <a
                v-if="row.memberCount > 0"
                class="link-text"
                @click="viewGroupMembers(row)"
              >
                {{ row.memberCount }}
              </a>
              <span v-else>{{ row.memberCount ?? 0 }}</span>
            </template>
          </template>
        </el-table-column>

        <!-- 分组描述 -->
        <el-table-column prop="description" label="分组描述" min-width="240" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row ? row.description || "-" : "-" }}
          </template>
        </el-table-column>

        <!-- 创建时间 -->
        <el-table-column prop="createTime" label="创建时间" min-width="170" align="center" />

        <!-- 更新时间 -->
        <el-table-column prop="updateTime" label="更新时间" min-width="170" align="center" />

        <!-- 操作栏 -->
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <a class="link-text" @click="viewGroupMembers(row)">查看会员</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="openEdit(row)">编辑</a>
              <span class="op-split">|</span>
              <a class="link-text error-text" @click="remove(row)">删除</a>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 底部分页 -->
      <div class="pagination-wrap mt_10">
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

    <!-- 添加分组弹窗 -->
    <el-dialog
      v-model="addFlag"
      title="添加分组"
      width="520px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="addForm" :model="formAdd" :rules="rulesAdd" label-width="90px">
        <el-form-item label="分组名称" prop="groupName">
          <el-input
            v-model="formAdd.groupName"
            maxlength="30"
            show-word-limit
            placeholder="请输入分组名称"
          />
        </el-form-item>
        <el-form-item label="分组描述" prop="description">
          <el-input
            v-model="formAdd.description"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="请输入分组描述信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addFlag = false">取消</el-button>
        <el-button type="primary" :loading="submitAddLoading" @click="submitAdd">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑分组弹窗 -->
    <el-dialog
      v-model="editFlag"
      title="编辑分组"
      width="520px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="editForm" :model="formEdit" :rules="rulesEdit" label-width="90px">
        <el-form-item label="分组ID">
          <span>{{ formEdit.id }}</span>
        </el-form-item>
        <el-form-item label="分组名称" prop="groupName">
          <el-input
            v-model="formEdit.groupName"
            maxlength="30"
            show-word-limit
            placeholder="请输入分组名称"
          />
        </el-form-item>
        <el-form-item label="分组描述" prop="description">
          <el-input
            v-model="formEdit.description"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="请输入分组描述信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editFlag = false">取消</el-button>
        <el-button type="primary" :loading="submitEditLoading" @click="submitEdit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { nextTick, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import * as API_Member from "@/api/member.js";
import { ElMessage, ElMessageBox } from "element-plus";

defineOptions({ name: "memberGroup" });

const router = useRouter();

function viewGroupMembers(row) {
  router.push({
    name: "memberList",
    query: { groupId: row.id },
  });
}

const addForm = ref(null);
const editForm = ref(null);

const loading = ref(true);
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  groupName: "",
});
const data = ref([]);
const total = ref(0);
const addFlag = ref(false);
const editFlag = ref(false);
const submitAddLoading = ref(false);
const submitEditLoading = ref(false);

const formAdd = ref({
  groupName: "",
  description: "",
});

const formEdit = ref({
  id: "",
  groupName: "",
  description: "",
});

const rulesAdd = reactive({
  groupName: [{ required: true, message: "请输入分组名称", trigger: "blur" }],
});

const rulesEdit = reactive({
  groupName: [{ required: true, message: "请输入分组名称", trigger: "blur" }],
});

function handleSearch() {
  searchForm.pageNumber = 1;
  getData();
}

function handleReset() {
  searchForm.pageNumber = 1;
  searchForm.groupName = "";
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

function getData() {
  loading.value = true;
  API_Member.getMemberGroupByPage(searchForm)
    .then((res) => {
      loading.value = false;
      if (res && res.success && res.result) {
        const records = res.result.records || [];
        data.value = records;
        total.value = res.result.total || 0;

        // 异步获取各分组的会员总数
        records.forEach((row) => {
          if (row.memberCount == null) {
            API_Member.getMemberGroupUsers(row.id, { pageNumber: 1, pageSize: 1 })
              .then((userRes) => {
                if (userRes && userRes.success && userRes.result) {
                  row.memberCount = userRes.result.total || 0;
                } else {
                  row.memberCount = 0;
                }
              })
              .catch(() => {
                row.memberCount = 0;
              });
          }
        });
      }
    })
    .catch(() => {
      loading.value = false;
    });
}

function openAdd() {
  addFlag.value = true;
  nextTick(() => {
    if (addForm.value) addForm.value.resetFields();
    formAdd.value = { groupName: "", description: "" };
  });
}

function submitAdd() {
  addForm.value.validate((valid) => {
    if (!valid) return;
    submitAddLoading.value = true;
    API_Member.addMemberGroup(formAdd.value)
      .then((res) => {
        submitAddLoading.value = false;
        if (res && res.success) {
          ElMessage.success("添加成功");
          addFlag.value = false;
          getData();
        }
      })
      .catch(() => {
        submitAddLoading.value = false;
      });
  });
}

function openEdit(row) {
  editFlag.value = true;
  submitEditLoading.value = false;
  API_Member.getMemberGroup(row.id).then((res) => {
    if (res && res.success && res.result) {
      formEdit.value = {
        id: res.result.id,
        groupName: res.result.groupName || "",
        description: res.result.description || "",
      };
    } else {
      formEdit.value = {
        id: row.id,
        groupName: row.groupName || "",
        description: row.description || "",
      };
    }
  });
}

function submitEdit() {
  editForm.value.validate((valid) => {
    if (!valid) return;
    submitEditLoading.value = true;
    const { id, groupName, description } = formEdit.value;
    API_Member.updateMemberGroup(id, { groupName, description })
      .then((res) => {
        submitEditLoading.value = false;
        if (res && res.success) {
          ElMessage.success("修改成功");
          editFlag.value = false;
          getData();
        }
      })
      .catch(() => {
        submitEditLoading.value = false;
      });
  });
}

function remove(row) {
  ElMessageBox.confirm(`确定删除分组 "${row.groupName || "该分组"}" 吗？`, "删除确认", {
    type: "warning",
    confirmButtonText: "确定删除",
    cancelButtonText: "取消",
  })
    .then(() => {
      API_Member.deleteMemberGroup(row.id).then((res) => {
        if (res && res.success) {
          ElMessage.success("删除成功");
          getData();
        } else if (res && res.message) {
          ElMessage.error(res.message);
        }
      });
    })
    .catch(() => {});
}

onMounted(() => {
  getData();
});
</script>

<style scoped lang="scss">
.member-group-page {
  .card-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;

    .filter-form {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 0;

      :deep(.el-form-item) {
        margin-bottom: 0;
        margin-right: 16px;
      }
    }

    .toolbar-right {
      display: flex;
      align-items: center;
    }
  }

  .card-header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-title {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
    }
  }

  .pagination-wrap {
    display: flex;
    justify-content: flex-end;
  }
}

.link-text {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;
  line-height: 1;
  display: inline-block;

  &:hover {
    color: #57a3f3;
  }

  &.error-text {
    color: #ed4014;

    &:hover {
      color: #f16643;
    }
  }
}

.op-split {
  margin: 0 8px;
  color: #dcdee2;
  font-size: 14px;
}
</style>
