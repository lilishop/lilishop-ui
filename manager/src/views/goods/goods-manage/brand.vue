<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="品牌名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入品牌名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <div class="operation padding-row">
        <el-button type="primary" @click="add">添加</el-button>
      </div>

      <el-table ref="table" v-loading="loading" border :data="data" style="width: 100%">
        <el-table-column prop="name" label="品牌名称" width="200" />
        <el-table-column label="品牌图标" align="left" >
          <template #default="{ row }">
            <img
              v-if="row"
              :src="row.logo || ''"
              alt="加载图片失败"
              style="cursor: pointer; width: 80px; height: 60px; margin: 10px 0; object-fit: contain"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" align="left" width="150">
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
        <el-table-column prop="createTime" label="创建时间" min-width="170" show-overflow-tooltip />
        <el-table-column label="操作" width="230" align="center" fixed="right">
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
      :title="modalTitle"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" label-width="100px" :rules="formValidate">
        <el-form-item label="品牌名称" prop="name">
          <el-input v-model="form.name" clearable style="width: 100%" />
        </el-form-item>
        <el-form-item label="品牌图标" prop="logo">
          <div style="display: flex; align-items: center; gap: 12px">
            <img
              :src="form.logo || defaultPic"
              alt="品牌图标"
              style="width: 80px; height: 60px; object-fit: contain; border: 1px solid #dcdee2; border-radius: 4px; background: #fff"
            />
            <el-button type="primary" link @click="openLogoPicker">修改</el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="picModelFlag" width="1200px" :show-close="true">
      <ossManage
        ref="ossManageRef"
        :is-component="true"
        :initialize="picModelFlag"
        @callback="callbackSelected"
      />
    </el-dialog>

    <el-dialog
      v-model="categoryModalVisible"
      :title="categoryModalTitle"
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-loading="categoryTreeLoading" style="position: relative; max-height: 520px; overflow: auto">
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
          提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, getCurrentInstance } from "vue";
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

const loading = ref(true);
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
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "create_time",
  order: "desc",
});
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
const data = ref([]);
const total = ref(0);

const searchFormRef = ref(null);
const formRef = ref(null);
const ossManageRef = ref(null);

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
  ElMessageBox.confirm("您确认要删除 " + row.name + " ?", "确认删除", { type: "warning" }).then(() => {
    return delBrandApi(row.id).then((res) => {
      if (res.success) {
        ElMessage.success("品牌删除成功!");
        getDataList();
      }
    });
  }).catch(() => {});
}

function init() {
  getDataList();
}

function changePage(v) {
  searchForm.pageNumber = v;
  getDataList();
}

function changePageSize(v) {
  searchForm.pageSize = v;
  getDataList();
}

function handleSearch() {
  searchForm.pageNumber = 1;
  searchForm.pageSize = 20;
  getDataList();
}

function getDataList() {
  loading.value = true;
  getManagerBrandPage(searchForm).then((res) => {
    loading.value = false;
    if (res.success) {
      data.value = res.result.records;
      total.value = res.result.total;
    }
  });
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
  modalTitle.value = "添加";
  formRef.value?.resetFields();
  delete form.value.id;
  modalVisible.value = true;
}

function edit(v) {
  modalType.value = 1;
  modalTitle.value = "编辑";
  formRef.value?.resetFields();
  for (const attr in v) {
    if (v[attr] === null) {
      v[attr] = "";
    }
  }
  const str = JSON.stringify(v);
  const data = JSON.parse(str);
  form.value = data;
  modalVisible.value = true;
}

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
</style>
