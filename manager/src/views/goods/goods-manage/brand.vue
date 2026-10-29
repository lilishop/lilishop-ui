<template>
  <div class="brand-manage-page search">
    <!-- 顶部筛选表单 -->
    <el-card shadow="never" class="filter-card">
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        inline
        label-width="76px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="品牌名称" prop="name">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入品牌名称"
            clearable
            style="width: 220px"
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item class="form-actions">
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 品牌数据表格卡片 -->
    <el-card shadow="never" class="table-card mt_10">
      <template #header>
        <div class="card-header-bar">
          <div class="header-title">
            <span>商品品牌列表</span>
          </div>
          <div class="header-actions">
            <el-button size="small" @click="getDataList">刷新</el-button>
            <el-button type="primary" size="small" @click="add">添加品牌</el-button>
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
        class="custom-brand-table"
      >
        <!-- 品牌ID -->
        <el-table-column prop="id" label="品牌ID" min-width="190" show-overflow-tooltip />

        <!-- 品牌图标 -->
        <el-table-column label="品牌图标" width="96" align="center">
          <template #default="{ row }">
            <div v-if="row && row.logo" class="logo-box">
              <el-image
                :src="row.logo"
                fit="contain"
                preview-teleported
                :preview-src-list="[row.logo]"
                class="brand-logo-img"
              >
                <template #error>
                  <div class="logo-slot">无图</div>
                </template>
              </el-image>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <!-- 品牌名称 -->
        <el-table-column prop="name" label="品牌名称" min-width="180" show-overflow-tooltip />

        <!-- 状态 -->
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-switch
              v-if="row"
              :model-value="row.deleteFlag == 0"
              inline-prompt
              active-text="启用"
              inactive-text="禁用"
              @change="(val) => handleStatusSwitchChange(row, val)"
            />
          </template>
        </el-table-column>

        <!-- 创建时间 -->
        <el-table-column prop="createTime" label="创建时间" min-width="170" align="center" show-overflow-tooltip />

        <!-- 操作栏 -->
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <a class="link-text" @click="edit(row)">编辑</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="openCategoryModal(row)">关联分类</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="delBrand(row)">删除</a>
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
          @current-change="getDataList"
          @size-change="() => { searchForm.pageNumber = 1; getDataList(); }"
        />
      </div>
    </el-card>

    <!-- 添加 / 编辑品牌弹窗 -->
    <el-dialog
      v-model="modalVisible"
      :title="modalTitle"
      width="520px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" label-width="90px" :rules="formValidate">
        <el-form-item v-if="modalType === 1 && form.id" label="品牌ID">
          <span class="font-mono text-dark">{{ form.id }}</span>
        </el-form-item>
        <el-form-item label="品牌名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入品牌名称" style="width: 100%" />
        </el-form-item>
        <el-form-item label="品牌图标" prop="logo">
          <div class="dialog-logo-picker">
            <div class="logo-preview-box">
              <img
                :src="form.logo || defaultPic"
                alt="品牌图标"
                class="dialog-logo-img"
              />
            </div>
            <el-button type="primary" link @click="openLogoPicker">上传/选择图标</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>

    <!-- OSS 图片选择组件弹窗 -->
    <el-dialog v-model="picModelFlag" width="1200px" title="选择品牌图标" :show-close="true">
      <ossManage
        ref="ossManageRef"
        :is-component="true"
        :initialize="picModelFlag"
        @callback="callbackSelected"
      />
    </el-dialog>

    <!-- 关联分类弹窗 -->
    <el-dialog
      v-model="categoryModalVisible"
      :title="categoryModalTitle"
      width="680px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div v-loading="categoryTreeLoading" class="category-tree-wrap">
        <el-tree
          ref="categoryTree"
          :key="categoryTreeKey"
          :data="categoryTreeData"
          :props="{ label: 'title', children: 'children' }"
          node-key="id"
          show-checkbox
          default-expand-all
          :default-checked-keys="selectedCategoryIds"
          @check="onCategoryTreeCheckChange"
        />
      </div>
      <template #footer>
        <el-button @click="categoryModalVisible = false">取消</el-button>
        <el-button type="primary" :loading="categorySubmitLoading" @click="submitBrandCategory">
          提交关联
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, getCurrentInstance } from "vue";
import { useTable } from "@/utils/useTable";
import {
  getManagerBrandPage,
  addBrand,
  updateBrand,
  disableBrand,
  delBrand as delBrandApi,
  getCategoryTree,
  getBrandCategoryListData,
  saveBrandCategory,
} from "@/api/goods";
import ossManage from "@/views/sys/oss-manage/ossManage";
import { regular } from "@/utils";
import { ElMessage, ElMessageBox } from "element-plus";
import defaultPic from "@/assets/default.png";

defineOptions({ name: "brand" });

const { proxy } = getCurrentInstance();

const modalType = ref(0);
const modalVisible = ref(false);
const modalTitle = ref("");
const picModelFlag = ref(false);
const categoryModalVisible = ref(false);
const categoryModalTitle = ref("关联分类");
const categoryTreeLoading = ref(false);
const categoryTreeData = ref([]);
const categoryTreeKey = ref(0);
const categorySubmitLoading = ref(false);
const currentBrandId = ref("");
const selectedCategoryIds = ref([]);

const form = ref({
  name: "",
  logo: "",
  deleteFlag: "",
});
const formValidate = reactive({
  name: [regular.REQUIRED, regular.VARCHAR20],
  logo: [regular.REQUIRED, regular.URL200],
});
const submitLoading = ref(false);

const searchFormRef = ref(null);
const formRef = ref(null);
const ossManageRef = ref(null);

const { loading, data, total, searchForm, getDataList, handleSearch, resetSearch } = useTable(
  getManagerBrandPage,
  {
    pageSize: 20,
    sort: "create_time",
    order: "desc",
    form: { name: "" },
  }
);

function openLogoPicker() {
  picModelFlag.value = true;
  nextTick(() => {
    if (ossManageRef.value) {
      ossManageRef.value.selectImage = true;
    }
  });
}

function callbackSelected(val) {
  picModelFlag.value = false;
  form.value.logo = val.url;
}

function buildCategoryTreeNodes(list) {
  if (!Array.isArray(list) || list.length === 0) return [];
  return list.map((item) => ({
    id: item.id,
    title: item.name,
    children: buildCategoryTreeNodes(item.children || []),
  }));
}

async function openCategoryModal(row) {
  currentBrandId.value = row.id;
  categoryModalTitle.value = "关联分类 - " + (row.name || "");
  categoryModalVisible.value = true;
  categoryTreeLoading.value = true;
  categoryTreeKey.value += 1;
  categoryTreeData.value = [];
  selectedCategoryIds.value = [];
  try {
    const [treeRes, bindRes] = await Promise.all([
      getCategoryTree(),
      getBrandCategoryListData(row.id),
    ]);
    const selectedIds = Array.isArray(bindRes?.result)
      ? bindRes.result
          .map((x) => (typeof x === "string" ? x : x && x.id))
          .filter(Boolean)
      : [];
    selectedCategoryIds.value = selectedIds;
    categoryTreeData.value =
      treeRes && treeRes.success
        ? buildCategoryTreeNodes(treeRes.result || [])
        : [];
  } finally {
    categoryTreeLoading.value = false;
  }
}

function onCategoryTreeCheckChange(_data, checkedInfo) {
  selectedCategoryIds.value = checkedInfo?.checkedKeys || [];
}

function submitBrandCategory() {
  if (!currentBrandId.value) return;
  categorySubmitLoading.value = true;
  saveBrandCategory(
    currentBrandId.value,
    (selectedCategoryIds.value || []).map((id) => String(id))
  )
    .then((res) => {
      categorySubmitLoading.value = false;
      if (res && res.success) {
        ElMessage.success("操作成功");
        categoryModalVisible.value = false;
      }
    })
    .catch(() => {
      categorySubmitLoading.value = false;
    });
}

function handleStatusSwitchChange(row, checked) {
  const disable = !checked;
  ElMessageBox.confirm(
    "您确认要" + (disable ? "禁用" : "启用") + "品牌 " + row.name + " ?",
    disable ? "确认禁用" : "确认启用",
    { type: "warning" }
  ).then(() => {
    return disableBrand(row.id, { disable }).then((res) => {
      if (res.success) {
        ElMessage.success("操作成功");
      }
      getDataList();
    });
  }).catch(() => {
    nextTick(() => proxy.$forceUpdate());
  });
}

function delBrand(row) {
  ElMessageBox.confirm("您确认要删除品牌 " + row.name + " ?", "确认删除", { type: "warning" }).then(() => {
    return delBrandApi(row.id).then((res) => {
      if (res.success) {
        ElMessage.success("品牌删除成功!");
        getDataList();
      }
    });
  }).catch(() => {});
}

function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true;
      if (modalType.value === 0) {
        delete form.value.id;
        addBrand(form.value).then((res) => {
          submitLoading.value = false;
          if (res.success) {
            ElMessage.success("操作成功");
            getDataList();
            modalVisible.value = false;
          }
        });
      } else {
        updateBrand(form.value).then((res) => {
          submitLoading.value = false;
          if (res.success) {
            ElMessage.success("操作成功");
            getDataList();
            modalVisible.value = false;
          }
        });
      }
    }
  });
}

function add() {
  modalType.value = 0;
  modalTitle.value = "添加品牌";
  formRef.value?.resetFields();
  delete form.value.id;
  modalVisible.value = true;
}

function edit(v) {
  modalType.value = 1;
  modalTitle.value = "编辑品牌";
  formRef.value?.resetFields();
  for (const attr in v) {
    if (v[attr] === null) {
      v[attr] = "";
    }
  }
  form.value = JSON.parse(JSON.stringify(v));
  modalVisible.value = true;
}
</script>

<style lang="scss" scoped>
.brand-manage-page {
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
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 15px;
      font-weight: 600;
      color: #303133;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .font-mono {
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  }

  .font-semibold {
    font-weight: 600;
  }

  .text-dark {
    color: #303133;
  }

  .text-placeholder {
    color: #c0c4cc;
  }

  .time-text {
    font-size: 12px;
    color: #909399;
    font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  }

  .custom-brand-table {
    .logo-box {
      width: 52px;
      height: 40px;
      margin: 0 auto;
      border: 1px solid #ebeef5;
      border-radius: 4px;
      background: #fafafa;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      .brand-logo-img {
        width: 48px;
        height: 36px;
      }

      .logo-slot {
        font-size: 11px;
        color: #c0c4cc;
      }
    }
  }

  .pagination-wrap {
    display: flex;
    justify-content: flex-end;
  }
}

.dialog-logo-picker {
  display: flex;
  align-items: center;
  gap: 12px;

  .logo-preview-box {
    width: 64px;
    height: 48px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background: #fafafa;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    .dialog-logo-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}

.category-tree-wrap {
  position: relative;
  max-height: 520px;
  overflow: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 10px;
}
</style>
