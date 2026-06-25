<template>
  <div class="wrapper">
    <el-row :gutter="10">
      <el-col :span="4" style="height: 100%">
        <el-card class="article-category mr_10">
          <el-tree
            :data="treeData"
            :props="{ label: 'title', children: 'children' }"
            node-key="value"
            highlight-current
            default-expand-all
            @node-click="handleCateChange"
          />
        </el-card>
      </el-col>
      <el-col :span="20">
        <el-card class="article-detail">
          <el-form
            ref="searchForm"
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
      <el-form ref="form" :model="form" label-width="100px">
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

<script>
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

export default {
  components: {
    tinymec,
  },
  props: {
    selected: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      selectedIndex: 99999,
      loading: true,
      modalType: 0,
      modalVisible: false,
      modalTitle: "",
      treeDataDefault: [],
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
        categoryId: "",
      },
      searchTreeValue: "",
      form: {
        openStatus: false,
        title: "",
        categoryId: "",
        sort: 1,
        content: "",
        id: "",
      },
      list: [],
      treeValue: "",
      treeData: [],
      submitLoading: false,
      data: [],
      total: 0,
    };
  },
  watch: {
    "searchForm.categoryId": {
      handler() {
        this.handleSearch();
      },
      deep: true,
    },
    "searchForm.title": {
      handler() {
        this.handleSearch();
      },
      deep: true,
    },
  },
  methods: {
    init() {
      this.getDataList();
      this.getAllList(0);
    },
    selectRow(row, index) {
      this.selectedIndex = index;
      this.$emit("callbacked", row);
    },
    handleCateChange(data) {
      if (!data) return;
      const { value, title } = data;
      this.list.push({ value, title });
      this.searchForm.categoryId = value;
      this.searchTreeValue = title;
    },
    changeSwitch(v) {
      const params = { status: v.openStatus };
      updateArticleStatus(v.id, params).then((res) => {
        this.submitLoading = false;
        if (res.success) {
        }
      });
    },
    handleCategoryChange(value) {
      this.form.categoryId = value;
      const findTitle = (nodes, id) => {
        for (const node of nodes || []) {
          if (node.value === id) return node.title;
          const childTitle = findTitle(node.children, id);
          if (childTitle) return childTitle;
        }
        return "";
      };
      this.treeValue = findTitle(this.treeDataDefault, value);
    },
    handleCheckChange(data) {
      let value = "";
      let title = "";
      this.list = [];
      data.forEach((item) => {
        value += `${item.value},`;
        title += `${item.title},`;
      });
      value = value.substring(0, value.length - 1);
      title = title.substring(0, title.length - 1);
      this.list.push({ value, title });
      this.form.categoryId = value;
      this.treeValue = title;
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    changePageSize(v) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 20;
      this.getDataList();
    },
    getAllList(parent_id) {
      this.loading = true;
      getArticleCategory(parent_id).then((res) => {
        this.loading = false;
        if (res.success) {
          this.treeData = this.getTree(res.result);
          this.treeDataDefault = this.getTree(res.result);
          this.treeData.unshift({
            title: "全部",
            level: 0,
            children: [],
            id: "0",
            categoryId: 0,
            value: "0",
          });
        }
      });
    },
    getTree(tree = []) {
      const arr = [];
      if (!!tree && tree.length !== 0) {
        tree.forEach((item) => {
          const obj = {};
          obj.title = item.articleCategoryName;
          obj.value = item.id;
          obj.attr = item.articleCategoryName;
          obj.children = this.getTree(item.children);
          arr.push(obj);
        });
      }
      return arr;
    },
    getDataList(val) {
      if (val) this.form = {};
      this.loading = true;
      getArticle(this.searchForm)
        .then((res) => {
          if (res.success) {
            this.total = res.result.total;
            this.data = res.result.records?.length ? res.result.records : [];
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          if (this.modalType === 0) {
            delete this.form.id;
            saveArticle(this.form).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("操作成功");
                this.getDataList();
                this.modalVisible = false;
              }
            });
          } else {
            updateArticle(this.form).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("操作成功");
                this.getDataList();
                this.modalVisible = false;
              }
            });
          }
        }
      });
    },
    add() {
      this.modalType = 0;
      this.modalTitle = "添加文章";
      this.treeValue = "";
      this.form = {
        sort: 1,
        content: "",
      };
      this.$refs.form?.resetFields();
      delete this.form.id;
      this.modalVisible = true;
    },
    edit(data) {
      this.modalType = 1;
      this.modalTitle = "编辑文章";
      this.treeValue = "";
      this.form = { content: "" };
      this.$refs.form?.resetFields();
      seeArticle(data.id).then((res) => {
        if (res.result) {
          this.modalVisible = true;
          this.form.categoryId = res.result.categoryId;
          this.treeValue = data.articleCategoryName;
          this.form.id = data.id;
          this.form.content = res.result.content;
          this.form.title = res.result.title;
          this.form.sort = res.result.sort;
          this.form.openStatus = res.result.openStatus;
        }
      });
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除么?",
        loading: true,
        onOk: () => {
          delArticle(v.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.getDataList();
            }
          });
        },
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>
