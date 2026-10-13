<template>
  <div>
    <el-card>
      <div class="mb_10">
        <el-button type="primary" @click="addParent">添加一级分类</el-button>
      </div>

      <el-table
        v-loading="loading"
        class="table"
        :data="tableData"
        row-key="id"
        border
        :tree-props="{ children: 'children' }"
        style="width: 100%"
      >
        <el-table-column prop="name" label="分类名称" min-width="200" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-switch
              v-if="row"
              v-model="row.deleteFlag"
              :active-value="false"
              :inactive-value="true"
              inline-prompt
              active-text="开启"
              inactive-text="关闭"
              :loading="!!row._statusLoading"
              @change="(val) => onStatusSwitchChange(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="佣金" width="120">
          <template #default="{ row }">
            <span
              v-if="row"
              :style="row.commissionRate > 0 ? { color: $mainColor } : {}"
            >
              {{ row.commissionRate }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="220" fixed="right">
          <template #default="{ row }">
            <div v-if="row" class="ops">
              <a class="link-text" @click="edit(row)">编辑</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="remove(row)">删除</a>
              <template v-if="row.level != 2">
                <span class="op-split">|</span>
                <a class="link-text" @click="addChildren(row)">添加子分类</a>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog
        v-model="modalVisible"
        :title="modalTitle"
        width="500px"
        :close-on-click-modal="false"
        destroy-on-close
      >
        <el-form ref="formRef" :model="formAdd" label-width="110px" :rules="formValidate">
          <el-form-item v-if="showParent" label="上级分类" prop="parentId">
            {{ parentTitle }}
            <el-input v-model="formAdd.parentId" style="display: none" />
          </el-form-item>
          <el-form-item label="层级" prop="level" style="display: none">
            <el-input v-model="formAdd.level" />
          </el-form-item>
          <el-form-item label="分类名称" prop="name">
            <el-input v-model="formAdd.name" clearable />
          </el-form-item>
          <el-form-item v-if="formAdd.level !== 1" label="分类图标" prop="image">
            <upload-pic-input v-model="formAdd.image" style="width: 100%" />
          </el-form-item>
          <el-form-item label="排序值" prop="sortOrder">
            <el-input-number v-model="formAdd.sortOrder" style="width: 200px" />
          </el-form-item>
          <el-form-item prop="commissionRate" class="commission-rate-item">
            <template #label>佣金比例(%)</template>
            <el-input-number v-model="formAdd.commissionRate" :min="0" :max="100" style="width: 200px" />
          </el-form-item>
          <el-form-item label="是否启用" prop="deleteFlag">
            <el-switch
              v-model="formAdd.deleteFlag"
              :active-value="false"
              :inactive-value="true"
              inline-prompt
              active-text="启用"
              inactive-text="禁用"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="modalVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="Submit">提交</el-button>
        </template>
      </el-dialog>

      <el-dialog
        v-model="modalBrandVisible"
        :title="modalBrandTitle"
        width="500px"
        :close-on-click-modal="false"
      >
        <el-form ref="brandFormRef" :model="brandForm" label-width="100px">
          <el-select v-model="brandForm.categoryBrands" filterable multiple style="width: 100%">
            <el-option v-for="item in brandWay" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form>
        <template #footer>
          <el-button @click="modalBrandVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="saveCategoryBrand">提交</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import {
  delCategory,
  disableCategory,
  getBrandListData,
  getCategoryBrandListData,
  getCategoryTree,
  insertCategory,
  saveCategoryBrand as apiSaveCategoryBrand,
  updateCategory,
} from "@/api/goods";
import uploadPicInput from "@/components/lili/upload-pic-input";
import { regular } from "@/utils";
import { ElMessage, ElMessageBox } from "element-plus";

defineOptions({ name: "goods-category" });

const submitLoading = ref(false);
const categoryList = ref([]);
const loading = ref(false);
const brands = ref([]);
const categoryId = ref("");
const modalType = ref(0);
const modalVisible = ref(false);
const modalBrandVisible = ref(false);
const modalTitle = ref("");
const showParent = ref(false);
const parentTitle = ref("");
const modalBrandTitle = ref("");
const formAdd = reactive({
  parentId: "",
  name: "",
  image: "",
  sortOrder: 0,
  deleteFlag: false,
  commissionRate: 0,
  level: 0,
});
const brandForm = reactive({
  categoryBrands: [],
});
const brandWay = ref([]);
const formValidate = reactive({
  commissionRate: [regular.REQUIRED, regular.INTEGER],
  name: [regular.REQUIRED, regular.VARCHAR20],
  sortOrder: [regular.REQUIRED, regular.INTEGER],
});
const tableData = ref([]);

const formRef = ref(null);
const brandFormRef = ref(null);

function normalizeCategoryTree(list) {
  if (!Array.isArray(list) || list.length === 0) return;
  list.forEach((item) => {
    if (!item || typeof item !== "object") return;
    if (item.deleteFlag === 0) item.deleteFlag = false;
    else if (item.deleteFlag === 1) item.deleteFlag = true;
    else item.deleteFlag = !!item.deleteFlag;
    if (Array.isArray(item.children) && item.children.length) {
      normalizeCategoryTree(item.children);
    }
  });
}

function onStatusSwitchChange(row, nextDeleteFlag) {
  const previousDeleteFlag = !nextDeleteFlag;
  const isClosing = nextDeleteFlag === true;
  ElMessageBox.confirm(
    `您是否要${isClosing ? "关闭" : "开启"}当前分类 ${row.name} 及其子分类?`,
    isClosing ? "确认关闭" : "确认开启",
    { type: "warning", confirmButtonText: "是", cancelButtonText: "否" }
  ).then(() => {
    row._statusLoading = true;
    return disableCategory(row.id, { enableOperations: isClosing ? true : 0 }).then((res) => {
      row._statusLoading = false;
      if (res && res.success) {
        ElMessage.success("操作成功");
        getAllList();
        return;
      }
      row.deleteFlag = previousDeleteFlag;
    });
  }).catch(() => {
    row.deleteFlag = previousDeleteFlag;
  });
}

function init() {
  getAllList();
  getBrandList();
}

function getBrandList() {
  getBrandListData().then((res) => {
    brandWay.value = res;
  });
}

function brandOperation(v) {
  getCategoryBrandListData(v.id).then((res) => {
    categoryId.value = v.id;
    modalBrandTitle.value = "品牌关联";
    brandForm.categoryBrands = res.result.map((item) => item.id);
    modalBrandVisible.value = true;
  });
}

function saveCategoryBrand() {
  apiSaveCategoryBrand(categoryId.value, brandForm).then((res) => {
    submitLoading.value = false;
    if (res.success) {
      ElMessage.success("操作成功");
      modalBrandVisible.value = false;
    }
  });
}

function addChildren(v) {
  modalType.value = 0;
  modalTitle.value = "添加子分类";
  parentTitle.value = v.name;
  formAdd.level = Number(v.level) + 1;
  formAdd.commissionRate = v.commissionRate;
  showParent.value = true;
  delete formAdd.id;
  formAdd.parentId = v.id;
  modalVisible.value = true;
}

function edit(v) {
  modalType.value = 1;
  modalTitle.value = "编辑";
  formAdd.id = v.id;
  formAdd.name = v.name;
  formAdd.level = v.level;
  formAdd.parentId = v.parentId;
  formAdd.sortOrder = v.sortOrder;
  formAdd.commissionRate = v.commissionRate;
  formAdd.deleteFlag = v.deleteFlag;
  formAdd.image = v.image;
  showParent.value = false;
  modalVisible.value = true;
}

function addParent() {
  modalType.value = 0;
  modalTitle.value = "添加一级分类";
  parentTitle.value = "顶级分类";
  showParent.value = true;
  formRef.value?.resetFields();
  delete formAdd.id;
  formAdd.parentId = 0;
  formAdd.level = 0;
  modalVisible.value = true;
}

function Submit() {
  formRef.value.validate((valid) => {
    if (!valid) return;
    submitLoading.value = true;
    if (modalType.value === 0) {
      delete formAdd.id;
      insertCategory(formAdd).then((res) => {
        submitLoading.value = false;
        if (res.success) {
          ElMessage.success("添加成功");
          getAllList();
          modalVisible.value = false;
          formRef.value.resetFields();
        }
      });
    } else {
      updateCategory(formAdd).then((res) => {
        submitLoading.value = false;
        if (res.success) {
          ElMessage.success("修改成功");
          getAllList();
          modalVisible.value = false;
          formRef.value.resetFields();
        }
      });
    }
  });
}

function remove(v) {
  ElMessageBox.confirm("您确认要删除 " + v.name + " ?", "确认删除", { type: "warning" }).then(() => {
    return delCategory(v.id).then((res) => {
      if (res.success) {
        ElMessage.success("操作成功");
        getAllList();
      }
    });
  }).catch(() => {});
}

function getAllList() {
  loading.value = true;
  getCategoryTree()
    .then((res) => {
      loading.value = false;
      if (res.success) {
        localStorage.setItem("category", JSON.stringify(res.result));
        normalizeCategoryTree(res.result);
        categoryList.value = JSON.parse(JSON.stringify(res.result));
        tableData.value = JSON.parse(JSON.stringify(res.result));
      }
    })
    .catch(() => {
      loading.value = false;
    });
}

function enable(v) {
  ElMessageBox.confirm(
    "您是否要启用当前分类 " + v.name + " 及其子分类?",
    "确认启用",
    { type: "warning", confirmButtonText: "是", cancelButtonText: "否" }
  ).then(() => {
    return disableCategory(v.id, { enableOperations: 0 }).then((res) => {
      if (res.success) {
        ElMessage.success("操作成功");
        getAllList();
      }
    });
  }).catch(() => {
    getAllList();
  });
}

function disable(v) {
  ElMessageBox.confirm(
    "您是否要禁用当前分类 " + v.name + " 及其子分类?",
    "确认禁用",
    { type: "warning", confirmButtonText: "是", cancelButtonText: "否" }
  ).then(() => {
    return disableCategory(v.id, { enableOperations: true }).then((res) => {
      if (res.success) {
        ElMessage.success("操作成功");
        getAllList();
      }
    });
  }).catch(() => {
    getAllList();
  });
}

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
:deep(.el-table__body-wrapper) {
  overflow: auto;
}
.table {
  min-height: 60vh;
}
.mb_10 {
  margin-bottom: 10px;
}
.commission-rate-item :deep(.el-form-item__label) {
  white-space: nowrap;
}
</style>
