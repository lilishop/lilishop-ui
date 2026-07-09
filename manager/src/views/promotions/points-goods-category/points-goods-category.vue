<template>
  <div>
    <el-card>
      <div class="operation mb_10">
        <el-button type="primary" @click="addParent">添加积分商品分类</el-button>
        <el-button @click="init">刷新</el-button>
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
        <el-table-column prop="name" label="分类名称" min-width="200" />
        <el-table-column prop="sortOrder" label="排序值" min-width="120" />
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <template v-if="row">
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

    <el-dialog
      v-model="modalVisible"
      :title="modalTitle"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="form" :model="formAdd" label-width="100px" :rules="formValidate">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formAdd.name" clearable />
        </el-form-item>
        <el-form-item label="排序值" prop="sortOrder">
          <el-input-number v-model="formAdd.sortOrder" :min="0" style="width: 100%" />
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
import {
  getPointsGoodsCategoryList,
  addPointsGoodsCategory,
  updatePointsGoodsCategory,
  deletePointsGoodsCategoryById,
} from "@/api/promotion";

const buildDefaultFormAdd = () => ({
  parentId: 0,
  name: "",
  deleteFlag: 0,
  level: 0,
  sortOrder: 1,
});

export default {
  name: "pointsGoodsCategory",
  data() {
    return {
      submitLoading: false,
      loading: false,
      modalType: 0,
      modalVisible: false,
      modalTitle: "",
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "sortOrder",
        order: "asc",
      },
      formAdd: buildDefaultFormAdd(),
      formValidate: {
        name: [{ required: true, message: "商品分类名称不能为空", trigger: "blur" }],
      },
      tableData: [],
      total: 0,
    };
  },
  methods: {
    init() {
      this.getAllList();
    },
    edit(v) {
      this.modalType = 1;
      this.modalTitle = "编辑";
      this.formAdd = {
        ...buildDefaultFormAdd(),
        id: v.id,
        name: v.name,
        sortOrder: v.sortOrder,
      };
      this.modalVisible = true;
    },
    addParent() {
      this.modalType = 0;
      this.modalTitle = "添加积分商品分类";
      this.formAdd = buildDefaultFormAdd();
      this.modalVisible = true;
      this.$nextTick(() => {
        this.$refs.form?.clearValidate();
      });
    },
    Submit() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        this.submitLoading = true;
        if (this.modalType === 0) {
          delete this.formAdd.id;
          addPointsGoodsCategory(this.formAdd).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success("添加成功");
              this.getAllList();
              this.modalVisible = false;
              this.formAdd = buildDefaultFormAdd();
            }
          });
        } else {
          updatePointsGoodsCategory(this.formAdd).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success("修改成功");
              this.getAllList();
              this.modalVisible = false;
              this.formAdd = buildDefaultFormAdd();
            }
          });
        }
      });
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除 " + v.name + " ?",
        loading: true,
        onOk: () => {
          deletePointsGoodsCategoryById(v.id).then((res) => {
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
      getPointsGoodsCategoryList(this.searchForm)
        .then((res) => {
          if (res.success) {
            const records = res.result.records || [];
            const sortFn = (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0);
            const sortRecursively = (list = []) => {
              list.sort(sortFn);
              list.forEach((item) => {
                if (Array.isArray(item.children) && item.children.length) {
                  sortRecursively(item.children);
                }
              });
              return list;
            };
            this.tableData = sortRecursively(records);
            this.total = res.result.total || 0;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getAllList();
    },
    changePageSize(v) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.getAllList();
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style scoped>
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
.mt_10 {
  margin-top: 10px;
}
</style>
