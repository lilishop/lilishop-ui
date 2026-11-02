<template>
  <div class="article-page">
    <div class="article-page__aside">
      <el-card class="article-category">
        <template #header>
          <span>文章分类</span>
        </template>
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
      <el-card class="article-search">
        <el-form
          ref="searchFormRef"
          :model="searchForm"
          inline
          label-width="70px"
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
      </el-card>

      <el-card class="article-detail mt_10">
          <div class="toolbar">
            <el-button v-if="!selected" type="primary" @click="add">添加</el-button>
          </div>

          <div class="article-table-wrap">
            <el-table ref="table" v-loading="loading" border :data="data" style="width: 100%">
            <el-table-column prop="articleCategoryName" label="分类名称" width="150" />
            <el-table-column label="文章标题" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                {{ decodeEntities(row.title) }}
              </template>
            </el-table-column>
            <el-table-column label="是否显示" width="100" align="center">
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
            <el-table-column prop="sort" label="排序" width="80" align="center" />
            <el-table-column label="操作" width="160" align="right">
              <template #default="{ row, $index }">
                <div v-if="row" class="ops-row">
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
                </div>
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
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  getArticleCategory,
  getArticle,
  delArticle,
  updateArticleStatus,
} from "@/api/pages";
import { Message, Modal } from "@/utils/message";

defineProps({
  selected: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["callbacked"]);

const router = useRouter();

// 模板 el-form 的 ref（原 ref="searchForm"，与 data 同名会互相覆盖，改名为 searchFormRef）
const searchFormRef = ref(null);
const table = ref(null);

const selectedIndex = ref(99999);
const loading = ref(true);
const searchForm = ref({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
  categoryId: "",
});
const searchTreeValue = ref("");
const treeData = ref([]);
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
  updateArticleStatus(v.id, params).then(() => {});
}
function decodeEntities(str) {
  if (!str) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
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
function getDataList() {
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
function add() {
  router.push({ name: "article-edit" });
}
function edit(row) {
  router.push({ name: "article-edit", query: { id: row.id } });
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
  align-items: stretch;
  width: 100%;
  min-width: 0;
}

.article-page__aside {
  flex: 0 0 220px;
  width: 220px;
  min-width: 180px;
  max-width: 260px;
  display: flex;
  flex-direction: column;
}

.article-page__main {
  flex: 1;
  min-width: 0;
}

.article-category,
.article-search,
.article-detail {
  width: 100%;
}

.article-category {
  flex: 1;
  height: 100%;
}

.toolbar {
  display: flex;
  margin-bottom: 10px;
}

.ops-row {
  white-space: nowrap;
}

.article-table-wrap {
  width: 100%;
  overflow-x: auto;
}
</style>
