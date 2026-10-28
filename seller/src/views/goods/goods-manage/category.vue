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
        <el-table-column align="right" label="操作" min-width="220" fixed="right">
          <template #default="{ row }">
            <div v-if="row" class="ops">
              <a class="link-text" @click="edit(row)">编辑</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="remove(row)">删除</a>
              <template v-if="row.level === 0">
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
        <el-form ref="formRef" :model="formAdd" label-width="120px" :rules="formValidate">
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
        </el-form>
        <template #footer>
          <el-button @click="modalVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="Submit">提交</el-button>
        </template>
      </el-dialog>

    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import {
  addShopGoodsLabel,
  delCategdelShopGoodsLabel,
  editShopGoodsLabel,
  getShopGoodsLabelList,
} from "@/api/goods";
import uploadPicInput from "@/views/my-components/lili/upload-pic-input";
import { regular } from "@/utils";
import { Message, Modal } from "@/utils/message";

defineOptions({ name: "goods-category" });

const submitLoading = ref(false);
const categoryList = ref([]);
const loading = ref(false);
const modalType = ref(0);
const modalVisible = ref(false);
const modalTitle = ref("");
const showParent = ref(false);
const parentTitle = ref("");
const formAdd = ref(createDefaultForm());
const formValidate = {
  name: [regular.REQUIRED, regular.VARCHAR20],
  sortOrder: [regular.REQUIRED, regular.INTEGER],
};
const tableData = ref([]);

// formRef：模板 ref 改名避免与顶层变量互相覆盖
const formRef = ref(null);

onMounted(() => {
  init();
});

function createDefaultForm() {
  return {
    parentId: "",
    name: "",
    image: "",
    sortOrder: 0,
    level: 0,
  };
}
function normalizeCategoryTree(list, parentId = 0, level = 0) {
  if (!Array.isArray(list) || list.length === 0) return;
  list.forEach((item) => {
    if (!item || typeof item !== "object") return;
    item.name = item.name || item.labelName;
    item.parentId = item.parentId ?? parentId;
    item.level = item.level ?? level;
    if (Array.isArray(item.children) && item.children.length) {
      normalizeCategoryTree(item.children, item.id, Number(item.level) + 1);
    }
  });
}
function init() {
  getAllList();
}
function addChildren(v) {
  modalType.value = 0;
  modalTitle.value = "添加子分类";
  parentTitle.value = v.name;
  formAdd.value = createDefaultForm();
  formAdd.value.level = Number(v.level) + 1;
  showParent.value = true;
  delete formAdd.value.id;
  formAdd.value.parentId = v.id;
  modalVisible.value = true;
}
function edit(v) {
  modalType.value = 1;
  modalTitle.value = "编辑";
  formAdd.value.id = v.id;
  formAdd.value.name = v.name;
  formAdd.value.level = v.level;
  formAdd.value.parentId = v.parentId ?? 0;
  formAdd.value.sortOrder = v.sortOrder;
  formAdd.value.image = v.image;
  showParent.value = false;
  modalVisible.value = true;
}
function addParent() {
  modalType.value = 0;
  modalTitle.value = "添加一级分类";
  parentTitle.value = "顶级分类";
  showParent.value = true;
  formAdd.value = createDefaultForm();
  delete formAdd.value.id;
  formAdd.value.parentId = 0;
  formAdd.value.level = 0;
  modalVisible.value = true;
}
function Submit() {
  formRef.value.validate((valid) => {
    if (!valid) return;
    submitLoading.value = true;
    const params = buildLabelParams(formAdd.value);
    if (modalType.value === 0) {
      delete params.id;
      addShopGoodsLabel(params).then((res) => {
        submitLoading.value = false;
        if (res.success) {
          Message.success("添加成功");
          getAllList();
          modalVisible.value = false;
          formRef.value.resetFields();
        }
      });
    } else {
      editShopGoodsLabel(params).then((res) => {
        submitLoading.value = false;
        if (res.success) {
          Message.success("修改成功");
          getAllList();
          modalVisible.value = false;
          formRef.value.resetFields();
        }
      });
    }
  });
}
function remove(v) {
  Modal.confirm({
    title: "确认删除",
    content: "您确认要删除 " + v.name + " ?",
    loading: true,
    onOk: () => {
      delCategdelShopGoodsLabel(v.id).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("操作成功");
          getAllList();
        }
      });
    },
  });
}
function getAllList() {
  loading.value = true;
  getShopGoodsLabelList()
    .then((res) => {
      loading.value = false;
      if (res.success) {
        normalizeCategoryTree(res.result);
        categoryList.value = JSON.parse(JSON.stringify(res.result));
        tableData.value = JSON.parse(JSON.stringify(res.result));
      }
    })
    .catch(() => {
      loading.value = false;
    });
}
function buildLabelParams(form) {
  const params = {
    id: form.id,
    parentId: form.parentId,
    labelName: form.name,
    image: form.image,
    sortOrder: form.sortOrder,
    level: form.level,
  };
  Object.keys(params).forEach((key) => {
    if (params[key] === undefined || params[key] === "") {
      delete params[key];
    }
  });
  return params;
}
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
</style>
