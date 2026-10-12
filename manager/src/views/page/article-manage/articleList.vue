<template>
  <div class="article-page">
    <div class="article-page__aside">
      <el-card class="article-category">
        <el-tree
          :data="treeData"
          :props="{ label: 'title', children: 'children' }"
          node-key="value"
          highlight-current
          default-expand-all
          @node-click="handleCateChange"
        />
      </el-card>
    </div>
    <div class="article-page__main">
      <el-card class="article-detail">
          <el-form
            ref="searchFormRef"
            :model="searchForm"
            inline
            label-width="70px"
            style="width: 100%"
            class="search-form"
            @keyup.enter="handleSearch"
          >
            <el-form-item label="文章标题" prop="title">
              <el-input
                v-model="searchForm.title"
                placeholder="请输入文章标题"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
            </el-form-item>
          </el-form>

          <div class="operation padding-row">
            <el-button v-if="!selected" type="primary" @click="add">添加</el-button>
          </div>

          <div class="article-table-wrap">
            <el-table ref="table" v-loading="loading" border :data="data" style="width: 100%">
            <el-table-column prop="articleCategoryName" label="分类名称" width="150" />
            <el-table-column prop="title" label="文章标题" min-width="200" show-overflow-tooltip />
            <el-table-column label="是否显示" width="100">
              <template #default="{ row }">
                <el-switch
                  v-if="row"
                  v-model="row.openStatus"
                  inline-prompt
                  active-text="展示"
                  inactive-text="隐藏"
                  @change="changeSwitch(row)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="sort" label="排序" width="100" />
            <el-table-column label="操作" width="230" align="center">
              <template #default="{ row, $index }">
                <template v-if="row">
                  <a
                    v-if="selected"
                    class="link-text"
                    @click="selectRow(row, $index)"
                  >
                    {{ selectedIndex == $index ? "已选" : "选择" }}
                  </a>
                  <span v-if="selected" class="op-split">|</span>
                  <a class="link-text" @click="edit(row)">编辑</a>
                  <span class="op-split">|</span>
                  <a class="link-text" @click="remove(row)">删除</a>
                </template>
              </template>
            </el-table-column>
            </el-table>
          </div>

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
    </div>

    <el-dialog
      v-if="!selected"
      v-model="modalVisible"
      :title="modalTitle"
      width="1100px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" label-width="100px" :rules="formValidate">
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="form.title" clearable style="width: 40%" />
        </el-form-item>
        <el-form-item label="文章分类" prop="categoryId">
          <el-tree-select
            v-model="form.categoryId"
            :data="treeDataDefault"
            :props="{ label: 'title', value: 'value', children: 'children' }"
            placeholder="请选择"
            clearable
            check-strictly
            style="width: 180px"
            @change="handleCategoryChange"
          />
        </el-form-item>
        <el-form-item label="文章排序" prop="sort">
          <el-input v-model="form.sort" type="number" clearable style="width: 10%" />
        </el-form-item>
        <el-form-item class="form-item-view-el" label="文章内容" prop="content">
          <tinymec
            v-if="modalVisible"
            ref="editor"
            open-xss
            v-model="form.content"
          />
        </el-form-item>
        <el-form-item label="是否展示" prop="openStatus">
          <el-switch
            v-model="form.openStatus"
            inline-prompt
            active-text="展示"
            inactive-text="隐藏"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from "vue";
import {
  getArticleCategory,
  saveArticle,
  getArticle,
  delArticle,
  updateArticle,
  seeArticle,
  updateArticleStatus,
} from "@/api/pages";
import tinymec from "@/components/editor/index.vue";
import { regular } from "@/utils";
import { Message, Modal } from "@/utils/message";

const validateArticleContent = (rule, value, callback) => {
  const html = String(value || "").trim();
  if (!html) {
    callback(new Error("请填写文章内容"));
    return;
  }
  const text = html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
  const hasImage = /<img[\s>]/i.test(html);
  if (!text && !hasImage) {
    callback(new Error("请填写文章内容"));
    return;
  }
  callback();
};

defineProps({
  selected: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["callbacked"]);

// 模板 el-form 的 ref（原 ref="searchForm"，与 data 同名会互相覆盖，改名为 searchFormRef）
const searchFormRef = ref(null);
const table = ref(null);
// 模板 el-form 的 ref（原 ref="form"，与 data 同名会互相覆盖，改名为 formRef）
const formRef = ref(null);
const editor = ref(null);

const selectedIndex = ref(99999);
const loading = ref(true);
const modalType = ref(0);
const modalVisible = ref(false);
const modalTitle = ref("");
const treeDataDefault = ref([]);
const searchForm = ref({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
  categoryId: "",
});
const searchTreeValue = ref("");
const form = ref({
  openStatus: false,
  title: "",
  categoryId: "",
  sort: 1,
  content: "",
  id: "",
});
const formValidate = ref({
  title: [{ required: true, message: "请输入文章标题", trigger: "blur" }],
  categoryId: [{ required: true, message: "请选择文章分类", trigger: "change" }],
  sort: [regular.REQUIRED, regular.INTEGER],
  content: [{ required: true, validator: validateArticleContent, trigger: "change" }],
});
const list = ref([]);
const treeValue = ref("");
const treeData = ref([]);
const submitLoading = ref(false);
const data = ref([]);
const total = ref(0);

watch(
  () => searchForm.value.categoryId,
  () => {
    handleSearch();
  },
  { deep: true }
);
watch(
  () => searchForm.value.title,
  () => {
    handleSearch();
  },
  { deep: true }
);

function getDefaultForm() {
  return {
    openStatus: false,
    title: "",
    categoryId: "",
    sort: 1,
    content: "",
  };
}
function init() {
  getDataList();
  getAllList(0);
}
function selectRow(row, index) {
  selectedIndex.value = index;
  emit("callbacked", row);
}
function handleCateChange(data) {
  if (!data) return;
  const { value, title } = data;
  searchForm.value.categoryId =
    value === "0" || value === 0 ? "" : value;
  searchTreeValue.value = title;
}
function changeSwitch(v) {
  const params = { status: v.openStatus };
  updateArticleStatus(v.id, params).then((res) => {
    submitLoading.value = false;
    if (res.success) {
    }
  });
}
function handleCategoryChange(value) {
  form.value.categoryId = value;
  const findTitle = (nodes, id) => {
    for (const node of nodes || []) {
      if (node.value === id) return node.title;
      const childTitle = findTitle(node.children, id);
      if (childTitle) return childTitle;
    }
    return "";
  };
  treeValue.value = findTitle(treeDataDefault.value, value);
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
  form.value.categoryId = value;
  treeValue.value = title;
}
function changePage(v) {
  searchForm.value.pageNumber = v;
  getDataList();
}
function changePageSize(v) {
  searchForm.value.pageNumber = 1;
  searchForm.value.pageSize = v;
  getDataList();
}
function handleSearch() {
  searchForm.value.pageNumber = 1;
  searchForm.value.pageSize = 20;
  getDataList();
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
        value: "0",
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
function buildArticleSearchParams() {
  const params = { ...searchForm.value };
  const categoryId = params.categoryId;
  if (
    categoryId === "" ||
    categoryId === null ||
    categoryId === undefined ||
    categoryId === 0 ||
    categoryId === "0"
  ) {
    delete params.categoryId;
  }
  return params;
}
function getDataList(val) {
  if (val) form.value = {};
  loading.value = true;
  getArticle(buildArticleSearchParams())
    .then((res) => {
      if (res.success) {
        total.value = res.result.total;
        data.value = res.result.records?.length ? res.result.records : [];
      }
    })
    .finally(() => {
      loading.value = false;
    });
}
function handleSubmit() {
  if (editor.value?.getContent) {
    form.value.content = editor.value.getContent();
  }
  formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true;
      if (modalType.value === 0) {
        delete form.value.id;
        saveArticle(form.value).then((res) => {
          submitLoading.value = false;
          if (res.success) {
            Message.success("操作成功");
            getDataList();
            modalVisible.value = false;
          }
        });
      } else {
        updateArticle(form.value).then((res) => {
          submitLoading.value = false;
          if (res.success) {
            Message.success("操作成功");
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
  modalTitle.value = "添加文章";
  treeValue.value = "";
  form.value = getDefaultForm();
  modalVisible.value = true;
  nextTick(() => {
    formRef.value?.clearValidate?.();
  });
}
function edit(data) {
  modalType.value = 1;
  modalTitle.value = "编辑文章";
  treeValue.value = "";
  form.value = getDefaultForm();
  seeArticle(data.id).then((res) => {
    if (res.result) {
      modalVisible.value = true;
      form.value.categoryId = res.result.categoryId;
      treeValue.value = data.articleCategoryName;
      form.value.id = data.id;
      form.value.content = res.result.content;
      form.value.title = res.result.title;
      form.value.sort = res.result.sort;
      form.value.openStatus = res.result.openStatus;
    }
  });
}
function remove(v) {
  Modal.confirm({
    title: "确认删除",
    content: "您确认要删除么?",
    loading: true,
    onOk: () => {
      delArticle(v.id).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("操作成功");
          getDataList();
        }
      });
    },
  });
}

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.article-page {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
}

.article-page__aside {
  flex: 0 0 220px;
  width: 220px;
  min-width: 180px;
  max-width: 260px;
}

.article-page__main {
  flex: 1;
  min-width: 0;
}

.article-category,
.article-detail {
  width: 100%;
}

.article-table-wrap {
  width: 100%;
  overflow-x: auto;
}
</style>
