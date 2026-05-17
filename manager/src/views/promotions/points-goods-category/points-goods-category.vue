<template>
  <div>
    <Card>
      <div class="operation mb_10">
        <Button @click="addParent" type="primary" icon="md-add">添加积分商品分类</Button>
        <Button icon="md-refresh" @click="init">刷新</Button>
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
          <a
            style="color:#2d8cf0;cursor:pointer;text-decoration:none;margin-right:10px"
            @click.native="edit(scope.row)"
            >编辑</a>
          <span style="margin:0 8px;color:#dcdee2">|</span>
          <a
            style="color:#2d8cf0;cursor:pointer;text-decoration:none"
            @click.native="remove(scope.row)"
            >删除</a>
        </template>
      </tree-table>
      <Row type="flex" justify="end" class="mt_10">
        <Page
          :current="searchForm.pageNumber"
          :total="total"
          :page-size="searchForm.pageSize"
          @on-change="changePage"
          @on-page-size-change="changePageSize"
          :page-size-opts="[20, 50, 100]"
          size="small"
          show-total
          show-elevator
          show-sizer
        ></Page>
      </Row>
    </Card>
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
          <InputNumber v-model="formAdd.sortOrder" :min="0" clearable style="width: 100%" />
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
import TreeTable from "@/components/tree-table/Table/Table";

export default {
  name: "pointsGoodsCategory",
  components: {
    TreeTable
  },
  data() {
    return {
      submitLoading:false,
      loading: false, // 加载状态
      modalType: 0, // 添加或编辑标识
      modalVisible: false, // 添加或编辑显示
      modalTitle: "", // 添加或编辑标题
      showParent: false, // 是否展示上级菜单
      parentTitle: "", // 父级菜单名称
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "sortOrder",
        order: "asc"
      },
      formAdd: {
        // 添加或编辑表单对象初始化数据
        parentId: 0,
        name: "",
        deleteFlag: 0,
        level: 0,
        sortOrder:1
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
          title: "排序值",
          key: "sortOrder",
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
      tableData: [], // 表格数据
      total: 0
    };
  },
  methods: {
    // 初始化数据
    init() {
      this.getAllList();
    },
    // 编辑分类
    edit(v) {
      this.modalType = 1;
      this.modalTitle = "编辑";
      this.formAdd.id = v.id;
      this.formAdd.name = v.name;
      this.formAdd.sortOrder = v.sortOrder;
      this.showParent = false;
      this.modalVisible = true;
    },
    // 添加顶级分类
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
    // 提交
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
    // 删除
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
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
    // 获取所有分类
    getAllList() {
      this.loading = true;
      getPointsGoodsCategoryList(this.searchForm).then((res) => {
        this.loading = false;
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
    }
  },
  mounted() {
    this.init();
  },
};
</script>
<style lang="scss" scoped>


</style>
