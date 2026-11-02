<template>
  <div>
    <el-card>
      <div class="operation mb_10">
        <el-button type="primary" @click="addParent">添加一级分类</el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        row-key="id"
        border
        default-expand-all
        :tree-props="{ children: 'children' }"
        style="width: 100%"
      >
        <el-table-column prop="articleCategoryName" label="分类名称" min-width="200" />
        <el-table-column prop="sort" label="排序" width="120" />
        <el-table-column label="操作" width="320" align="right">
          <template #default="{ row }">
            <template v-if="row">
              <a class="link-text" @click="edit(row)">编辑</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="remove(row)">删除</a>
              <template v-if="row.level != 1">
                <span class="op-split">|</span>
                <a class="link-text" @click="addChildren(row)">添加子分类</a>
              </template>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-drawer
      v-model="modalVisible"
      :title="modalTitle"
      size="500px"
      :close-on-click-modal="false"
      destroy-on-close
      append-to-body
    >
      <el-form ref="formRef" :model="formAdd" label-width="100px" :rules="formValidate">
        <el-form-item v-if="showParent" label="上级分类" prop="parentId">
          {{ parentTitle }}
          <el-input v-model="formAdd.parentId" style="display: none" />
        </el-form-item>
        <el-form-item label="分类名称" prop="articleCategoryName">
          <el-input v-model="formAdd.articleCategoryName" clearable />
        </el-form-item>
        <el-form-item label="排序值" prop="sort">
          <el-input-number v-model="formAdd.sort" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="Submit">提交</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { saveArticleCategory, getArticleCategory, delArticleCategory, updateArticleCategory } from "@/api/pages";
import { regular } from "@/utils";
import { Message, Modal } from "@/utils/message";

defineOptions({ name: "lili-components" });

const submitLoading = ref(false);
const loading = ref(false);
const expandLevel = ref(1);
const modalType = ref(0);
const modalVisible = ref(false);
const modalTitle = ref("");
const showParent = ref(false);
const parentTitle = ref("");
const formAdd = ref({
  parentId: "",
  sort: 1,
  level: 0,
  articleCategoryName: "",
});
const formValidate = ref({
  articleCategoryName: [regular.REQUIRED],
  sort: [regular.REQUIRED, regular.INTEGER],
});
const tableData = ref([]);

// 模板 el-form 的 ref（原 ref="form"，避免与顶层变量重名，改名为 formRef）
const formRef = ref(null);

function init() {
  getAllList();
}
function addChildren(v) {
  modalType.value = 0;
  modalTitle.value = "添加子分类";
  formAdd.value.articleCategoryName = "";
  parentTitle.value = v.articleCategoryName;
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
  formAdd.value.articleCategoryName = v.articleCategoryName;
  formAdd.value.level = v.level;
  formAdd.value.parentId = v.parentId;
  formAdd.value.sort = v.sort;
  showParent.value = false;
  modalVisible.value = true;
}
function addParent() {
  modalType.value = 0;
  modalTitle.value = "添加一级分类";
  parentTitle.value = "顶级分类";
  showParent.value = true;
  formRef.value?.resetFields();
  delete formAdd.value.id;
  formAdd.value.parentId = 0;
  modalVisible.value = true;
}
function Submit() {
  formRef.value.validate((valid) => {
    if (!valid) return;
    submitLoading.value = true;
    if (modalType.value === 0) {
      delete formAdd.value.id;
      saveArticleCategory(formAdd.value).then((res) => {
        submitLoading.value = false;
        if (res.success) {
          Message.success("添加成功");
          formAdd.value = {
            parentId: "",
            sort: 1,
            level: 0,
            articleCategoryName: "",
          };
        }
        getAllList();
        modalVisible.value = false;
      });
    } else {
      updateArticleCategory(formAdd.value, formAdd.value.id).then((res) => {
        submitLoading.value = false;
        if (res.success) {
          Message.success("修改成功");
        }
        getAllList();
        modalVisible.value = false;
        formRef.value.resetFields();
      });
    }
  });
}
function remove(v) {
  Modal.confirm({
    title: "确认删除",
    content: "您确认要删除 " + v.articleCategoryName + " ?",
    loading: true,
    onOk: () => {
      delArticleCategory(v.id).then((res) => {
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
  getArticleCategory()
    .then((res) => {
      if (res.success) {
        tableData.value = res.result || [];
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
.op-split {
  margin: 0 8px;
  color: #dcdee2;
}
.mb_10 {
  margin-bottom: 10px;
}
</style>
