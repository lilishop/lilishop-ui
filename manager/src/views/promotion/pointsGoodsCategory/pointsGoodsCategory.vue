<template>
  <div>
    <div class="operation">
      <Button @click="addParent" icon="md-add">添加积分商品分类</Button>
      <Button icon="md-refresh" @click="refresh">刷新</Button>
    </div>
    <tree-table
      ref="treeTable"
      size="default"
      :loading="loading"
      :data="tableData"
      :columns="columns"
      :border="true"
      :show-index="false"
      :is-fold="true"
      :expand-type="false"
      primary-key="id"
    >
      <template slot="action" slot-scope="scope">
        <Button @click.native="edit(scope.row)" style="margin-right:10px;" size="small">编辑</Button>
        <Button @click.native="remove(scope.row)" type="primary" size="small">删除</Button>

      </template>
    </tree-table>

    <Modal
      :title="modalTitle"
      v-model="modalVisible"
      :mask-closable="false"
      :width="500"
    >
      <Form
        ref="form"
        :model="formAdd"
        :label-width="100"
        :rules="formValidate"
      >
        <FormItem label="分类名称" prop="name">
          <Input v-model="formAdd.name" clearable style="width: 100%" />
        </FormItem>
        <FormItem label="排序值" prop="sortOrder">
          <Input v-model="formAdd.sortOrder" clearable style="width: 100%" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="modalVisible = false">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="Submit"
          >提交</Button
        >
      </div>
    </Modal>
  </div>
</template>
<script>
import {
  getPointsGoodsCategoryList,
  addPointsGoodsCategory,
  updatePointsGoodsCategory,
  deletePointsGoodsCategoryById,
} from "@/api/promotion";
import TreeTable from "@/views/my-components/tree-table/Table/Table";
import uploadPicInput from "@/views/my-components/lili/upload-pic-input";

export default {
  name: "pointsGoodsCategory",
  components: {
    TreeTable,
    uploadPicInput,
  },
  data() {
    return {
      loading: false, // 加载状态
      modalType: 0, // 添加或编辑标识
      modalVisible: false, // 添加或编辑显示
      modalTitle: "", // 添加或编辑标题
      showParent: false, // 是否展示上级菜单
      parentTitle: "", // 父级菜单名称
      formAdd: {
        // 添加或编辑表单对象初始化数据
        parentId: 0,
        name: "",
        deleteFlag: 0,
        level: 0,
      },
      // 表单验证规则
      formValidate: {
        name: [{ required: true, message: "商品分类名称不能为空" }],
      },
      columns: [
        {
          title: "分类名称",
          key: "name",
          minWidth: "120px",
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          headerAlign: "center",
          width: "400px",
          type: "template",
          template: "action",
        },
      ],
      tableData: [],
    };
  },
  methods: {
    init() {
      this.getAllList();
    },
    refresh() {
      this.loading = true;
      let that = this;
      setTimeout(function () {
        that.loading = false;
      }, 1000);
    },
    edit(v) {
      this.modalType = 1;
      this.modalTitle = "编辑";
      this.formAdd.id = v.id;
      this.formAdd.name = v.name;
      this.formAdd.sortOrder = v.sortOrder;
      this.showParent = false;
      this.modalVisible = true;
    },
    addParent() {
      this.modalType = 0;
      this.modalTitle = "添加积分商品分类";
      this.parentTitle = "顶级分类";
      this.showParent = true;
      this.$refs.form.resetFields();
      delete this.formAdd.id;
      this.formAdd.parentId = 0;
      this.modalVisible = true;
    },
    Submit() {
      this.$refs.form.validate((valid) => {
        console.log(valid);
        if (valid) {
          this.submitLoading = true;
          if (this.modalType === 0) {
            // 添加 避免编辑后传入id等数据 记得删除
            delete this.formAdd.id;
            addPointsGoodsCategory(this.formAdd).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("添加成功");
                this.getAllList();
                this.modalVisible = false;
                this.$refs.form.resetFields();
              }
            });
          } else {
            // 编辑
            updatePointsGoodsCategory(this.formAdd).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("修改成功");
                this.getAllList();
                this.modalVisible = false;
                this.$refs.form.resetFields();
              }
            });
          }
        }
      });
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        // 记得确认修改此处
        content: "您确认要删除 " + v.name + " ?",
        loading: true,
        onOk: () => {
          // 删除
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
      getPointsGoodsCategoryList().then((res) => {
        this.loading = false;
        if (res.success) {
          this.tableData = res.result.records;
        }
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style lang="scss" scoped>


</style>
