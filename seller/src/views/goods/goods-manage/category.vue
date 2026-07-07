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
        <el-table-column label="操作" min-width="220" fixed="right">
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
        <el-form ref="form" :model="formAdd" label-width="120px" :rules="formValidate">
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

<script>
import {
  addShopGoodsLabel,
  delCategdelShopGoodsLabel,
  editShopGoodsLabel,
  getShopGoodsLabelList,
} from "@/api/goods";
import uploadPicInput from "@/views/my-components/lili/upload-pic-input";
import { regular } from "@/utils";

export default {
  name: "goods-category",
  components: {
    uploadPicInput,
  },
  data() {
    return {
      submitLoading: false,
      categoryList: [],
      loading: false,
      modalType: 0,
      modalVisible: false,
      modalTitle: "",
      showParent: false,
      parentTitle: "",
      formAdd: this.createDefaultForm(),
      formValidate: {
        name: [regular.REQUIRED, regular.VARCHAR20],
        sortOrder: [regular.REQUIRED, regular.INTEGER],
      },
      tableData: [],
    };
  },
  methods: {
    createDefaultForm() {
      return {
        parentId: "",
        name: "",
        image: "",
        sortOrder: 0,
        level: 0,
      };
    },
    normalizeCategoryTree(list, parentId = 0, level = 0) {
      if (!Array.isArray(list) || list.length === 0) return;
      list.forEach((item) => {
        if (!item || typeof item !== "object") return;
        item.name = item.name || item.labelName;
        item.parentId = item.parentId ?? parentId;
        item.level = item.level ?? level;
        if (Array.isArray(item.children) && item.children.length) {
          this.normalizeCategoryTree(item.children, item.id, Number(item.level) + 1);
        }
      });
    },
    init() {
      this.getAllList();
    },
    addChildren(v) {
      this.modalType = 0;
      this.modalTitle = "添加子分类";
      this.parentTitle = v.name;
      this.formAdd = this.createDefaultForm();
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
      this.formAdd.name = v.name;
      this.formAdd.level = v.level;
      this.formAdd.parentId = v.parentId ?? 0;
      this.formAdd.sortOrder = v.sortOrder;
      this.formAdd.image = v.image;
      this.showParent = false;
      this.modalVisible = true;
    },
    addParent() {
      this.modalType = 0;
      this.modalTitle = "添加一级分类";
      this.parentTitle = "顶级分类";
      this.showParent = true;
      this.formAdd = this.createDefaultForm();
      delete this.formAdd.id;
      this.formAdd.parentId = 0;
      this.formAdd.level = 0;
      this.modalVisible = true;
    },
    Submit() {
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        this.submitLoading = true;
        const params = this.buildLabelParams(this.formAdd);
        if (this.modalType === 0) {
          delete params.id;
          addShopGoodsLabel(params).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success("添加成功");
              this.getAllList();
              this.modalVisible = false;
              this.$refs.form.resetFields();
            }
          });
        } else {
          editShopGoodsLabel(params).then((res) => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success("修改成功");
              this.getAllList();
              this.modalVisible = false;
              this.$refs.form.resetFields();
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
          delCategdelShopGoodsLabel(v.id).then((res) => {
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
      getShopGoodsLabelList()
        .then((res) => {
          this.loading = false;
          if (res.success) {
            this.normalizeCategoryTree(res.result);
            this.categoryList = JSON.parse(JSON.stringify(res.result));
            this.tableData = JSON.parse(JSON.stringify(res.result));
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    buildLabelParams(form) {
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
    },
  },
  mounted() {
    this.init();
  },
};
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
