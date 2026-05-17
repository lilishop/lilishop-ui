<template>
  <div class="search">
    <Card>
      <Row class="operation padding-row">
        <Button type="primary" @click="openAdd">添加分组</Button>
      </Row>
      <Table
        :loading="loading"
        border
        :columns="columns"
        :data="data"
        ref="table"
        class="mt_10"
      ></Table>
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
    <Modal v-model="addFlag" title="添加商品分组">
      <Form ref="addForm" :model="formAdd" :rules="rulesAdd" :label-width="90">
        <FormItem label="分组名称" prop="groupName" style="width: 90%;">
          <Input v-model="formAdd.groupName" maxlength="30" placeholder="请输入分组名称" />
        </FormItem>
        <FormItem label="分组描述" prop="description" style="width: 90%;">
          <Input v-model="formAdd.description" maxlength="200" placeholder="请输入分组描述" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="addFlag = false">取消</Button>
        <Button type="primary" :loading="submitAddLoading" @click="submitAdd">确定</Button>
      </div>
    </Modal>
    <Modal v-model="editFlag" title="编辑商品分组">
      <Form ref="editForm" :model="formEdit" :rules="rulesEdit" :label-width="90">
        <Input v-model="formEdit.id" v-show="false" />
        <FormItem label="分组名称" prop="groupName" style="width: 90%;">
          <Input v-model="formEdit.groupName" maxlength="30" placeholder="请输入分组名称" />
        </FormItem>
        <FormItem label="分组描述" prop="description" style="width: 90%;">
          <Input v-model="formEdit.description" maxlength="200" placeholder="请输入分组描述" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="editFlag = false">取消</Button>
        <Button type="primary" :loading="submitEditLoading" @click="submitEdit">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import * as API_Goods from "@/api/goods.js";

export default {
  name: "goodsGroup",
  data() {
    return {
      loading: true,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
      },
      columns: [
        {
          title: "分组名称",
          key: "groupName",
          minWidth: 160,
          tooltip: true,
        },
        {
          title: "分组描述",
          key: "description",
          minWidth: 240,
          tooltip: true,
        },
        {
          title: "创建时间",
          key: "createTime",
          width: 180,
        },
        {
          title: "更新时间",
          key: "updateTime",
          width: 180,
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 200,
          fixed: "right",
          render: (h, params) => {
            const linkStyle = {
              color: "#2d8cf0",
              cursor: "pointer",
              textDecoration: "none",
            };
            const sep = h(
              "span",
              { style: { margin: "0 8px", color: "#dcdee2" } },
              "|"
            );
            return h("div", { class: "ops", style: { display: "flex", justifyContent: "center" } }, [
              h("a", { style: linkStyle, on: { click: () => this.openEdit(params.row) } }, "编辑"),
              sep,
              h("a", { style: linkStyle, on: { click: () => this.remove(params.row) } }, "删除"),
            ]);
          },
        },
      ],
      data: [],
      total: 0,
      addFlag: false,
      editFlag: false,
      submitAddLoading: false,
      submitEditLoading: false,
      formAdd: {
        groupName: "",
        description: "",
      },
      formEdit: {
        id: "",
        groupName: "",
        description: "",
      },
      rulesAdd: {
        groupName: [{ required: true, message: "请输入分组名称" }],
      },
      rulesEdit: {
        groupName: [{ required: true, message: "请输入分组名称" }],
      },
    };
  },
  methods: {
    init() {
      this.getData();
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getData();
    },
    changePageSize(v) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.getData();
    },
    getData() {
      this.loading = true;
      API_Goods.getGoodsGroupByPage(this.searchForm)
        .then((res) => {
          this.loading = false;
          if (res && res.success && res.result) {
            this.data = res.result.records || [];
            this.total = res.result.total || 0;
          } else if (res && res.message) {
            this.$Message.error(res.message);
          }
        })
        .catch(() => {
          this.loading = false;
          this.$Message.error("加载商品分组失败");
        });
    },
    openAdd() {
      this.addFlag = true;
      this.$nextTick(() => {
        if (this.$refs.addForm) this.$refs.addForm.resetFields();
        this.formAdd = { groupName: "", description: "" };
      });
    },
    submitAdd() {
      this.$refs.addForm.validate((valid) => {
        if (!valid) return;
        this.submitAddLoading = true;
        API_Goods.addGoodsGroup(this.formAdd)
          .then((res) => {
            this.submitAddLoading = false;
            if (res && res.success) {
              this.$Message.success("添加成功");
              this.addFlag = false;
              this.getData();
            } else if (res && res.message) {
              this.$Message.error(res.message);
            }
          })
          .catch(() => {
            this.submitAddLoading = false;
            this.$Message.error("添加失败，请检查权限或后端接口");
          });
      });
    },
    openEdit(row) {
      this.editFlag = true;
      this.submitEditLoading = false;
      API_Goods.getGoodsGroup(row.id)
        .then((res) => {
          if (res && res.success && res.result) {
            this.formEdit = {
              id: res.result.id,
              groupName: res.result.groupName || "",
              description: res.result.description || "",
            };
          } else {
            this.formEdit = {
              id: row.id,
              groupName: row.groupName || "",
              description: row.description || "",
            };
          }
        })
        .catch(() => {
          this.$Message.error("获取分组详情失败");
        });
    },
    submitEdit() {
      this.$refs.editForm.validate((valid) => {
        if (!valid) return;
        this.submitEditLoading = true;
        const { id, groupName, description } = this.formEdit;
        API_Goods.updateGoodsGroup(id, { id, groupName, description })
          .then((res) => {
            this.submitEditLoading = false;
            if (res && res.success) {
              this.$Message.success("修改成功");
              this.editFlag = false;
              this.getData();
            } else if (res && res.message) {
              this.$Message.error(res.message);
            }
          })
          .catch(() => {
            this.submitEditLoading = false;
            this.$Message.error("修改失败，请检查权限或后端接口");
          });
      });
    },
    remove(row) {
      this.$Modal.confirm({
        title: "提示",
        content: "<p>确定删除该分组？</p>",
        onOk: () => {
          API_Goods.deleteGoodsGroup(row.id)
            .then((res) => {
              if (res && res.success) {
                this.$Message.success("删除成功");
                this.getData();
              } else if (res && res.message) {
                this.$Message.error(res.message);
              }
            })
            .catch(() => {
              this.$Message.error("删除失败，请检查权限或后端接口");
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
