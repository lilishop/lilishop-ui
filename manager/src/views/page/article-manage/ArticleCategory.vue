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
        <el-table-column label="操作" width="320" align="center">
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

    <el-dialog
      v-model="modalVisible"
      :title="modalTitle"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="form" :model="formAdd" label-width="100px" :rules="formValidate">
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
    </el-dialog>
  </div>
</template>

<script>
import { saveArticleCategory, getArticleCategory, delArticleCategory, updateArticleCategory } from "@/api/pages";
import { regular } from "@/utils";

export default {
  name: "lili-components",
  data() {
    return {
      submitLoading: false,
      loading: false,
      expandLevel: 1,
      modalType: 0,
      modalVisible: false,
      modalTitle: "",
      showParent: false,
      parentTitle: "",
      formAdd: {
        parentId: "",
        sort: 1,
        level: 0,
        articleCategoryName: "",
      },
      formValidate: {
        articleCategoryName: [regular.REQUIRED],
        sort: [regular.REQUIRED, regular.INTEGER],
      },
      tableData: [],
    };
  },
  methods: {
    init() {
      this.getAllList();
    },
    addChildren(v) {
      this.modalType = 0;
      this.modalTitle = "添加子分类";
      this.formAdd.articleCategoryName = "";
      this.parentTitle = v.articleCategoryName;
      this.formAdd.level = Number(v.level) + 1;
      this.showParent = true;
      delete this.formAdd.id;
      this.formAdd.parentId = v.id;
      this.modalVisible = true;
    },
    edit(v) {
      this.modalType = 1;
      this.modalTitle = "编辑";
      this.formAdd.id = v.id;
      this.formAdd.articleCategoryName = v.articleCategoryName;
      this.formAdd.level = v.level;
      this.formAdd.parentId = v.parentId;
      this.formAdd.sort = v.sort;
      this.showParent = false;
      this.modalVisible = true;
    },
    addParent() {
      this.modalType = 0;
      this.modalTitle = "添加一级分类";
      this.parentTitle = "顶级分类";
      this.showParent = true;
      this.$refs.form?.resetFields();
      delete this.formAdd.id;
      this.formAdd.parentId = 0;
      this.modalVisible = true;
    },
    Submit() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        this.submitLoading = true;
        if (this.modalType === 0) {
          delete this.formAdd.id;
          saveArticleCategory(this.formAdd).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success("添加成功");
              this.formAdd = {
                parentId: "",
                sort: 1,
                level: 0,
                articleCategoryName: "",
              };
            }
            this.getAllList();
            this.modalVisible = false;
          });
        } else {
          updateArticleCategory(this.formAdd, this.formAdd.id).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success("修改成功");
            }
            this.getAllList();
            this.modalVisible = false;
            this.$refs.form.resetFields();
          });
        }
      });
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除 " + v.articleCategoryName + " ?",
        loading: true,
        onOk: () => {
          delArticleCategory(v.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.getAllList();
            }
          });
        },
      });
    },
    getAllList() {
      this.loading = true;
      getArticleCategory()
        .then((res) => {
          if (res.success) {
            this.tableData = res.result || [];
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
  mounted() {
    this.init();
  },
};
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
