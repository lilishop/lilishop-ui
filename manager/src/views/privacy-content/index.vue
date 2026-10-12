<template>
  <div class="wrapper">
    <el-row>
      <el-col :span="24">
        <el-card class="article-detail">
          <el-alert
            title="隐私协议在移动端中 设置->关于我们->对应的文章展示"
            type="info"
            :closable="false"
            show-icon
            style="margin-bottom: 16px"
          />
          <el-table ref="table" v-loading="loading" border :data="data" style="width: 100%">
            <el-table-column prop="name" label="协议名称" width="150" />
            <el-table-column prop="type" label="协议类型" width="150" />
            <el-table-column label="操作" width="230" align="center">
              <template #default="{ row }">
                <a v-if="row" class="link-text ops" @click="edit(row)">编辑</a>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      v-if="!selected"
      v-model="modalVisible"
      :title="modalTitle"
      width="1100px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-row :gutter="16">
        <el-col :span="16">
          <el-form ref="formRef" :model="form.article" label-width="100px">
            <el-form-item label="文章标题" prop="title">
              <el-input v-model="form.article.title" clearable style="width: 40%" />
            </el-form-item>
            <el-form-item class="form-item-view-el" label="文章内容" prop="content">
              <editor
                v-if="modalVisible"
                ref="editorRef"
                open-xss
                v-model="form.article.content"
              />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="8">
          <div class="mobile-effect">
            <div class="title">页面预览</div>
            <div class="content">
              <div v-html="form.article.content"></div>
            </div>
          </div>
        </el-col>
      </el-row>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { getArticleCategory, updatePrivacy, getPrivacy } from "@/api/pages";
import editor from "@/components/editor/index.vue";
import { Message } from "@/utils/message";

defineOptions({ name: "privacy" });

defineProps({
  selected: {
    type: Boolean,
    default: false,
  },
});

const loading = ref(false);
const modalVisible = ref(false);
const treeDataDefault = ref([]);
const list = ref([]);
const treeValue = ref("");
const treeData = ref([]);
const submitLoading = ref(false);
const modalTitle = ref("");
const currindex = ref("");
const form = reactive({
  type: "",
  article: {
    openStatus: false,
    title: "",
    categoryId: "",
    sort: 1,
    content: "",
    type: "",
  },
  id: "",
});
const data = ref([
  { name: "店铺入驻协议", type: "STORE_REGISTER" },
  { name: "用户协议", type: "USER_AGREEMENT" },
  { name: "证照信息", type: "LICENSE_INFORMATION" },
  { name: "关于我们", type: "ABOUT" },
  { name: "隐私策略", type: "PRIVACY_POLICY" },
]);

// 原代码未在 data 中声明，直接在 edit() 中挂载到 this 上
let modalType = 0;

const formRef = ref(null);
const editorRef = ref(null);

function init() {
  getAllList(0);
}

function handleCheckChange(data) {
  let value = "";
  let title = "";
  list.value = [];
  data.forEach((item) => {
    value += `${item.value},`;
    title += `${item.title},`;
  });
  value = value.substring(0, value.length - 1);
  title = title.substring(0, title.length - 1);
  list.value.push({ value, title });
  form.article.categoryId = value;
}

function getAllList(parent_id) {
  loading.value = true;
  getArticleCategory(parent_id).then((res) => {
    loading.value = false;
    if (res.success) {
      treeData.value = getTree(res.result);
      treeDataDefault.value = getTree(res.result);
      treeData.value.unshift({
        title: "全部",
        level: 0,
        children: [],
        id: "0",
        categoryId: 0,
      });
    }
  });
}

function getTree(tree = []) {
  const arr = [];
  if (!!tree && tree.length !== 0) {
    tree.forEach((item) => {
      const obj = {};
      obj.title = item.articleCategoryName;
      obj.value = item.id;
      obj.attr = item.articleCategoryName;
      obj.children = getTree(item.children);
      arr.push(obj);
    });
  }
  return arr;
}

function edit(data) {
  modalType = 1;
  modalTitle.value = "编辑协议";
  form.article = { content: "" };
  formRef.value?.resetFields();
  loading.value = true;
  getPrivacy(data.type).then((res) => {
    loading.value = false;
    modalVisible.value = true;
    form.article.categoryId = res.result.categoryId;
    form.id = res.result.id;
    form.article.content = res.result.content;
    form.article.title = res.result.title;
    form.article.sort = res.result.sort;
    form.article.openStatus = res.result.openStatus;
    form.article.type = res.result.type;
    form.type = res.result.type;
  });
  loading.value = false;
}

function handleSubmit() {
  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true;
      updatePrivacy(form.id, form.type, form.article).then((res) => {
        submitLoading.value = false;
        if (res.success) {
          Message.success("操作成功");
          modalVisible.value = false;
        }
      });
    }
  });
}

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.mobile-effect {
  box-sizing: border-box;
  margin: 0 20px;
  border: 2px solid #f1f2f3;
  height: 610px;
  .title {
    align-items: center;
    background: #f9f9fa;
    border-radius: 4px 4px 0 0;
    color: #85878a;
    display: flex;
    font-size: 12px;
    height: 32px;
    line-height: 20px;
    padding: 0 12px;
  }
  .content {
    width: 100%;
    height: 560px;
    padding: 0 14px;
    overflow-y: scroll;
  }
}
.ops a {
  color: #2d8cf0;
  cursor: pointer;
  text-decoration: none;
}
.ops span {
  display: inline-block;
  margin: 0 8px;
  color: #dcdee2;
}
</style>
