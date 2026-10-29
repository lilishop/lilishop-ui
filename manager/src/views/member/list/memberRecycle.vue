<template>
  <div class="member-recycle-page search">
    <!-- 顶部筛选条件表单 -->
    <el-card shadow="never" class="filter-card">
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        inline
        label-width="76px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="客户ID" prop="id">
          <el-input
            v-model="searchForm.id"
            placeholder="请输入客户ID"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="客户名称" prop="username">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入客户名称"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="联系方式" prop="mobile">
          <el-input
            v-model="searchForm.mobile"
            placeholder="请输入手机联系方式"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item class="form-actions">
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 回收站会员表格卡片 -->
    <el-card shadow="never" class="table-card mt_10">
      <template #header>
        <div class="card-header-bar">
          <div class="header-title">
            <span>会员回收站列表</span>
          </div>
          <div class="header-actions">
            <el-button size="small" @click="getData">刷新</el-button>
          </div>
        </div>
      </template>

      <el-table
        ref="table"
        v-loading="loading"
        border
        stripe
        :data="data"
        style="width: 100%"
      >
        <!-- 客户ID -->
        <el-table-column prop="id" label="客户ID" min-width="190" show-overflow-tooltip />

        <!-- 客户名称 -->
        <el-table-column prop="username" label="客户名称" min-width="150" show-overflow-tooltip />

        <!-- 昵称 -->
        <el-table-column prop="nickName" label="昵称" min-width="140" show-overflow-tooltip />

        <!-- 联系方式 -->
        <el-table-column label="联系方式" min-width="140">
          <template #default="{ row }">
            {{ row && row.mobile ? row.mobile : "-" }}
          </template>
        </el-table-column>

        <!-- 积分数量 -->
        <el-table-column label="积分数量" width="120">
          <template #default="{ row }">
            {{ row ? (row.point == void 0 ? "0" : row.point) : "0" }}
          </template>
        </el-table-column>

        <!-- 注册时间 -->
        <el-table-column prop="createTime" label="注册时间" min-width="180" align="center" />

        <!-- 操作栏 -->
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <template v-if="selectedMember">
                <a class="link-text" @click="callback(row)">
                  {{ row.___selected ? "已选择" : "选择" }}
                </a>
              </template>
              <template v-else>
                <a class="link-text" @click="detail(row)">查看</a>
                <span class="op-split">|</span>
                <a class="link-text" @click="enable(row)">启用</a>
                <span class="op-split">|</span>
                <a class="link-text" @click="editPerm(row)">编辑</a>
              </template>
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

    <!-- 编辑会员弹窗 -->
    <el-dialog
      v-model="descFlag"
      :title="descTitle"
      width="540px"
      destroy-on-close
      class="edit-member-dialog"
    >
      <el-form ref="formValidateRef" :model="formValidate" :rules="ruleValidate" label-width="90px">
        <el-form-item label="客户ID">
          <span>{{ formValidate.id }}</span>
        </el-form-item>
        <el-form-item label="头像">
          <div class="avatar-edit-box">
            <el-avatar :size="50" :src="formValidate.face || undefined" class="dialog-avatar">
              {{ (formValidate.username || "用")[0] }}
            </el-avatar>
            <el-button
              type="primary"
              link
              class="upload-btn"
              @click="openPicSelector"
            >
              修改头像
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="客户名称" prop="name">
          <el-input v-model="formValidate.username" style="width: 260px" disabled />
        </el-form-item>
        <el-form-item label="用户昵称" prop="name">
          <el-input v-model="formValidate.nickName" placeholder="请输入用户昵称" style="width: 260px" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="formValidate.sex">
            <el-radio-button :value="1">男</el-radio-button>
            <el-radio-button :value="0">女</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="重置密码" prop="password">
          <el-input
            v-model="formValidate.newPassword"
            type="password"
            show-password
            placeholder="留空则保持原密码"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-date-picker
            v-model="formValidate.birthday"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择生日"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item label="所在地" prop="mail">
          <div class="region-box">
            <span class="region-text">{{ formValidate.region || "暂无地址" }}</span>
            <el-button size="small" @click="$refs.map.open()">选择地区</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="descFlag = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitModal">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="picModelFlag" width="1200px" title="选择头像图片">
      <ossManage
        ref="ossManageRef"
        @callback="callbackSelected"
        :isComponent="true"
        :initialize="picModelFlag"
      />
    </el-dialog>
    <multipleMap ref="map" @callback="selectedRegion" />
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from "vue";
import * as API_Member from "@/api/member.js";
import ossManage from "@/views/sys/oss-manage/ossManage";
import multipleMap from "@/components/map/multiple-map";
import { ElMessage, ElMessageBox } from "element-plus";
import { customRouterPush } from "@/utils/filters";
import { md5 } from "@/utils/md5.js";

defineOptions({ name: "memberRecycle" });

const emit = defineEmits(["callback"]);

const searchFormRef = ref(null);
const table = ref(null);
const formValidateRef = ref(null);
const ossManageRef = ref(null);

const selectedMember = ref(false);
const descTitle = ref("");
const descFlag = ref(false);
const loading = ref(true);

const searchForm = ref({
  pageNumber: 1,
  pageSize: 20,
  order: "desc",
  id: "",
  username: "",
  mobile: "",
  disabled: "CLOSE",
});

const picModelFlag = ref(false);
const formValidate = ref({});
const ruleValidate = ref({});
const data = ref([]);
const total = ref(0);

function callback(val) {
  emit("callback", val);
}

function init() {
  getData();
}

function changePage() {
  getData();
}

function changePageSize() {
  searchForm.value.pageNumber = 1;
  getData();
}

function handleSearch() {
  searchForm.value.pageNumber = 1;
  searchForm.value.pageSize = 20;
  getData();
}

function handleReset() {
  searchForm.value.pageNumber = 1;
  searchForm.value.id = "";
  searchForm.value.username = "";
  searchForm.value.mobile = "";
  getData();
}

function editPerm(val) {
  descTitle.value = `编辑停用客户 - ${val.username || "客户"}`;
  descFlag.value = true;
  getMemberInfo(val.id);
}

function getMemberInfo(id) {
  API_Member.getMemberInfoData(id).then((res) => {
    if (res.result) {
      formValidate.value = res.result;
    }
  });
}

function getData() {
  loading.value = true;
  API_Member.getMemberListData(searchForm.value)
    .then((res) => {
      loading.value = false;
      if (res.success && res.result) {
        data.value = res.result.records || [];
        total.value = res.result.total || 0;
      }
    })
    .catch(() => {
      loading.value = false;
    });
}

function openPicSelector() {
  picModelFlag.value = true;
  nextTick(() => {
    if (ossManageRef.value) {
      ossManageRef.value.selectImage = true;
    }
  });
}

function callbackSelected(val) {
  picModelFlag.value = false;
  formValidate.value.face = val.url;
}

function selectedRegion(val) {
  if (val.type === "select") {
    const paths = val.data.map((item) => item.name).join(",");
    const ids = val.data.map((item) => item.id).join(",");
    formValidate.value.region = paths;
    formValidate.value.regionId = ids;
  } else {
    formValidate.value.region = val.data.addr;
    formValidate.value.regionId = val.data.addrId;
  }
}

function detail(row) {
  customRouterPush({ name: "member-detail", query: { id: row.id } });
}

function enable(v) {
  let params = {
    memberIds: [v.id],
    disabled: true,
  };
  ElMessageBox.confirm(`确定启用客户 "${v.username || v.nickName || "该客户"}" 吗？`, "提示", {
    type: "warning",
    confirmButtonText: "确定启用",
    cancelButtonText: "取消",
  })
    .then(() => {
      API_Member.updateMemberStatus(params).then((res) => {
        if (res.success) {
          ElMessage.success("启用成功");
          getData();
        }
      });
    })
    .catch(() => {});
}

function handleSubmitModal() {
  const { nickName, sex, username, face, newPassword, id, regionId, region } = formValidate.value;
  let time = new Date(formValidate.value.birthday);
  let birthday = time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate();
  let submit = {
    regionId: regionId,
    region: region,
    nickName,
    sex,
    birthday,
    face: face || "",
    id,
  };
  if (newPassword) {
    submit.password = md5(newPassword);
  }
  API_Member.updateMember(submit).then((res) => {
    if (res.result) {
      ElMessage.success("修改成功！");
      descFlag.value = false;
      init();
    }
  });
}

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.member-recycle-page {
  .filter-card {
    .search-form {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 0;

      :deep(.el-form-item) {
        margin-bottom: 0;
        margin-right: 16px;
      }

      .form-actions {
        margin-left: auto;
      }
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

.avatar-edit-box {
  display: flex;
  align-items: center;
  gap: 12px;

  .dialog-avatar {
    background-color: #f56c6c;
    color: #ffffff;
  }

  .upload-btn {
    padding: 0;
  }
}

.region-box {
  display: flex;
  align-items: center;
  gap: 8px;

  .region-text {
    color: #606266;
  }
}
</style>
