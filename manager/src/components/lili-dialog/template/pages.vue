<template>
  <div class="wrapper">
    <div class="content">
      <div class="query-wrapper">
        <div class="query-item">
          <div>文章标题</div>
          <el-input
            v-model="params.title"
            placeholder="请输入文章标题"
            clearable
            style="width: 180px"
            @clear="resetSearch"
            @keyup.enter="resetSearch"
          />
        </div>
        <div class="query-item">
          <el-select
            v-model="params.categoryId"
            placeholder="全部分类"
            clearable
            filterable
            style="width: 220px"
            @change="resetSearch"
          >
            <el-option
              v-for="item in categories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </div>
        <div class="query-item">
          <el-button type="primary" @click="resetSearch">搜索</el-button>
        </div>
      </div>

      <div>
        <el-table
          ref="tableRef"
          v-loading="loading"
          class="articles-select-table"
          :data="data"
          row-key="id"
          height="340"
          empty-text="暂无文章信息"
          @selection-change="onSelectionChange"
        >
          <el-table-column
            type="selection"
            label="选择"
            width="60"
            align="center"
            reserve-selection
          />
          <el-table-column
            prop="title"
            label="文章标题"
            min-width="240"
            show-overflow-tooltip
          />
          <el-table-column
            prop="articleCategoryName"
            label="分类名称"
            width="140"
            show-overflow-tooltip
          />
          <el-table-column label="是否显示" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.openStatus ? 'success' : 'info'" size="small">
                {{ row.openStatus ? "展示" : "隐藏" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" width="80" align="center" />
          <el-table-column
            prop="id"
            label="文章ID"
            width="180"
            show-overflow-tooltip
          />
        </el-table>

        <el-pagination
          v-model:current-page="params.pageNumber"
          class="pageration"
          size="small"
          layout="total, prev, pager, next, jumper"
          :total="total"
          :page-size="params.pageSize"
          @current-change="changePage"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, reactive, ref } from "vue";
import { getArticle, getArticleCategory } from "@/api/pages";

const emit = defineEmits(["selected"]);

const loading = ref(false);
const total = ref(0);
const params = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
  categoryId: "",
  title: "",
});
const data = ref([]);
const categories = ref([]);
const tableRef = ref(null);
const selectedArticle = ref(null);

onMounted(() => {
  loadCategories();
  getDataList();
});

function flattenCategories(tree, level = 0) {
  const result = [];
  (tree || []).forEach((node) => {
    result.push({
      id: node.id,
      name: `${"　".repeat(level)}${node.articleCategoryName}`,
    });
    if (node.children && node.children.length) {
      result.push(...flattenCategories(node.children, level + 1));
    }
  });
  return result;
}

function loadCategories() {
  getArticleCategory().then((res) => {
    if (res.success) {
      categories.value = flattenCategories(res.result);
    }
  });
}

function resetSearch() {
  params.pageNumber = 1;
  getDataList();
}

function changePage(v) {
  params.pageNumber = v;
  getDataList();
}

function getDataList() {
  loading.value = true;
  const query = { ...params };
  if (!query.categoryId) delete query.categoryId;
  if (!query.title) delete query.title;
  getArticle(query)
    .then((res) => {
      if (res.success) {
        total.value = res.result.total;
        data.value = res.result.records || [];
        nextTick(syncTableSelection);
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

function syncTableSelection() {
  const table = tableRef.value;
  if (!table || !selectedArticle.value) return;
  data.value.forEach((row) => {
    table.toggleRowSelection(row, row.id === selectedArticle.value.id);
  });
}

function onSelectionChange(rows) {
  // 选择链接只能保留一篇文章，勾选新文章时自动取消上一篇
  if (!rows.length) {
    selectedArticle.value = null;
    emit("selected", []);
    return;
  }
  const row = rows[rows.length - 1];
  if (rows.length > 1) {
    tableRef.value?.clearSelection();
    tableRef.value?.toggleRowSelection(row, true);
  }
  selectedArticle.value = row;
  emit("selected", [
    { ...row, ___type: "pages", ___path: "/pages/passport/article" },
  ]);
}
</script>

<style lang="scss" scoped>
@import "../style.scss";
.content {
  overflow: hidden;
  flex: 1;
}
.pageration {
  margin-top: 12px;
  justify-content: flex-end;
}
</style>
