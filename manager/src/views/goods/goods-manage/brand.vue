<template>
  <div class="search">
    <Card>
      <Form ref="searchForm" @submit.native.prevent @keydown.enter.native="handleSearch" :model="searchForm" inline :label-width="70"
            class="search-form">
        <Form-item label="品牌名称">
          <Input type="text" v-model="searchForm.name" placeholder="请输入品牌名称" clearable style="width: 240px"/>
        </Form-item>
        <Button @click="handleSearch" type="primary">搜索</Button>
      </Form>
    </Card>
    <Card>
      <Row class="operation padding-row">
        <Button @click="add" type="primary">添加</Button>
      </Row>
      <Table :loading="loading" border :columns="columns" :data="data" ref="table"></Table>
      <Row type="flex" justify="end" class="mt_10">
        <Page :current="searchForm.pageNumber" :total="total" :page-size="searchForm.pageSize" @on-change="changePage"
              @on-page-size-change="changePageSize" :page-size-opts="[20, 50, 100]" size="small"
              show-total show-elevator show-sizer></Page>
      </Row>
    </Card>
    <Modal :title="modalTitle" v-model="modalVisible" :mask-closable="false" :width="500">
      <Form ref="form" :model="form" :label-width="100" :rules="formValidate">
        <FormItem label="品牌名称" prop="name">
          <Input v-model="form.name" clearable style="width: 100%"/>
        </FormItem>
        <FormItem label="品牌图标" prop="logo">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img
              :src="form.logo || defaultPic"
              alt="品牌图标"
              style="width: 80px; height: 60px; object-fit: contain; border: 1px solid #dcdee2; border-radius: 4px; background: #fff;"
            />
            <Button type="text" @click="openLogoPicker">修改</Button>
          </div>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="modalVisible = false">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="handleSubmit">提交</Button>
      </div>
    </Modal>

    <Modal width="1200px" v-model="picModelFlag" footer-hide>
      <ossManage @callback="callbackSelected" :isComponent="true" :initialize="picModelFlag" ref="ossManage" />
    </Modal>

    <Modal
      :title="categoryModalTitle"
      v-model="categoryModalVisible"
      :mask-closable="false"
      :width="700"
    >
      <div style="position: relative; max-height: 520px; overflow: auto;">
        <Spin size="large" fix v-if="categoryTreeLoading"></Spin>
        <Tree
          ref="categoryTree"
          :key="categoryTreeKey"
          :data="categoryTreeData"
          show-checkbox
          @on-check-change="onCategoryTreeCheckChange"
        ></Tree>
      </div>
      <div slot="footer">
        <Button type="text" @click="categoryModalVisible = false">取消</Button>
        <Button type="primary" :loading="categorySubmitLoading" @click="submitBrandCategory"
          >提交</Button
        >
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  getManagerBrandPage,
  addBrand,
  updateBrand,
  disableBrand,
  delBrand,
  getCategoryTree,
  getBrandCategoryListData,
  saveBrandCategory,
} from "@/api/goods";
import ossManage from "@/views/sys/oss-manage/ossManage";

import {regular} from "@/utils";

export default {
  name: "brand",
  components: {
    ossManage
  },
  data() {
    return {
      defaultPic: require("@/assets/default.png"),
      loading: true, // 表单加载状态
      modalType: 0, // 添加或编辑标识
      modalVisible: false, // 添加或编辑显示
      modalTitle: "", // 添加或编辑标题
      picModelFlag: false, // 图片选择器
      categoryModalVisible: false,
      categoryModalTitle: "关联分类",
      categoryTreeLoading: false,
      categoryTreeData: [],
      categoryTreeKey: 0,
      categorySubmitLoading: false,
      currentBrandId: "",
      selectedCategoryIds: [],
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 20, // 页面大小
        sort: "create_time", // 默认排序字段
        order: "desc", // 默认排序方式
      },
      form: {
        // 添加或编辑表单对象初始化数据
        name: "",
        logo: "",
        deleteFlag: "",
      },
      // 表单验证规则
      formValidate: {
        name: [
          regular.REQUIRED,
          regular.VARCHAR20
        ],
        logo: [
          regular.REQUIRED,
          regular.URL200
        ],
      },
      submitLoading: false, // 添加或编辑提交状态
      columns: [
        {
          title: "品牌名称",
          key: "name",
          width: 200,
          resizable: true,
          sortable: false,
        },
        {
          title: "品牌图标",
          key: "logo",
          align: "left",
          render: (h, params) => {
            return h("img", {
              attrs: {
                src: params.row.logo || '',
                alt: "加载图片失败",
              },
              style: {
                cursor: "pointer",
                width: "80px",
                height: "60px",
                margin: "10px 0",
                "object-fit": "contain",
              },
            });
          },
        },
        {
          title: "状态",
          key: "deleteFlag",
          align: "left",
          render: (h, params) => {
            return h(
              "i-switch",
              {
                props: {
                  value: params.row.deleteFlag == 0,
                  size: "large",
                },
                on: {
                  "on-change": (checked) => {
                    this.handleStatusSwitchChange(params.row, checked);
                  },
                },
              },
              [
                h("span", { slot: "open" }, "启用"),
                h("span", { slot: "close" }, "禁用"),
              ]
            );
          },
          filters: [
            {
              label: "启用",
              value: 0,
            },
            {
              label: "禁用",
              value: 1,
            },
          ],
          filterMultiple: false,
          filterMethod(value, row) {
            if (value == 0) {
              return row.deleteFlag == 0;
            } else if (value == 1) {
              return row.deleteFlag == 1;
            }
          },
        },
        {
          title: "操作",
          key: "action",
          width: 210,
          align: "center",
          fixed: "right",
          render: (h, params) => {
            return h("div", [
              h(
                "a",
                {
                  style: {
                    color: "#2d8cf0",
                    cursor: "pointer",
                    textDecoration: "none",
                  },
                  on: {
                    click: () => {
                      this.edit(params.row);
                    },
                  },
                },
                "编辑"
              ),
              h(
                "span",
                { style: { margin: "0 8px", color: "#dcdee2" } },
                "|"
              ),
              h(
                "a",
                {
                  style: {
                    color: "#2d8cf0",
                    cursor: "pointer",
                    textDecoration: "none",
                  },
                  on: {
                    click: () => {
                      this.openCategoryModal(params.row);
                    },
                  },
                },
                "关联分类"
              ),
              h(
                "span",
                { style: { margin: "0 8px", color: "#dcdee2" } },
                "|"
              ),
              h(
                "a",
                {
                  style: {
                    color: "#2d8cf0",
                    cursor: "pointer",
                    textDecoration: "none",
                  },
                  on: {
                    click: () => {
                      this.delBrand(params.row.id);
                    },
                  },
                },
                "删除"
              ),
            ]);
          },
        },
      ],
      data: [], // 表单数据
      total: 0, // 表单数据总数
    };
  },
  methods: {
    openLogoPicker() {
      this.$refs.ossManage.selectImage = true;
      this.picModelFlag = true;
    },
    callbackSelected(val) {
      this.picModelFlag = false;
      this.form.logo = val.url;
    },
    buildCategoryTreeNodes(list, selectedSet) {
      if (!Array.isArray(list) || list.length === 0) return [];
      return list.map((item) => {
        const children = this.buildCategoryTreeNodes(item.children || [], selectedSet);
        return {
          id: item.id,
          title: item.name,
          expand: true,
          checked: selectedSet.has(item.id),
          children,
        };
      });
    },
    async openCategoryModal(row) {
      this.currentBrandId = row.id;
      this.categoryModalTitle = "关联分类 - " + (row.name || "");
      this.categoryModalVisible = true;
      this.categoryTreeLoading = true;
      this.categoryTreeKey += 1;
      this.categoryTreeData = [];
      this.selectedCategoryIds = [];
      try {
        const [treeRes, bindRes] = await Promise.all([
          getCategoryTree(),
          getBrandCategoryListData(row.id),
        ]);
        const selectedIds = Array.isArray(bindRes?.result)
          ? bindRes.result
              .map((x) => (typeof x === "string" ? x : x && x.id))
              .filter(Boolean)
          : [];
        this.selectedCategoryIds = selectedIds;
        const selectedSet = new Set(selectedIds);
        this.categoryTreeData = treeRes && treeRes.success
          ? this.buildCategoryTreeNodes(treeRes.result || [], selectedSet)
          : [];
      } finally {
        this.categoryTreeLoading = false;
      }
    },
    onCategoryTreeCheckChange(checkedNodes) {
      if (!Array.isArray(checkedNodes)) {
        this.selectedCategoryIds = [];
        return;
      }
      this.selectedCategoryIds = checkedNodes
        .map((node) => node && node.id)
        .filter(Boolean);
    },
    submitBrandCategory() {
      if (!this.currentBrandId) return;
      this.categorySubmitLoading = true;
      saveBrandCategory(
        this.currentBrandId,
        (this.selectedCategoryIds || []).map((id) => String(id))
      ).then((res) => {
        this.categorySubmitLoading = false;
        if (res && res.success) {
          this.$Message.success("操作成功");
          this.categoryModalVisible = false;
          return;
        }
      }).catch(() => {
        this.categorySubmitLoading = false;
      });
    },
    handleStatusSwitchChange(row, checked) {
      const disable = !checked;
      this.$Modal.confirm({
        title: disable ? "确认禁用" : "确认启用",
        content: "您确认要" + (disable ? "禁用" : "启用") + "品牌 " + row.name + " ?",
        loading: true,
        onOk: () => {
          disableBrand(row.id, { disable }).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
            }
            this.getDataList();
          });
        },
        onCancel: () => {
          this.$nextTick(() => this.$forceUpdate());
        },
      });
    },
    // 删除品牌
    async delBrand(id) {
      let res = await delBrand(id);

      if (res.success) {
        this.$Message.success("品牌删除成功!");
        this.getDataList();
      }
    },
    // 初始化数据
    init() {
      this.getDataList();
    },
    // 分页 改变页码
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    // 分页 改变页数
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    // 搜索
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 20;
      this.getDataList();
    },
    // 获取数据
    getDataList() {
      this.loading = true;
      getManagerBrandPage(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    // 提交表单
    handleSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.submitLoading = true;
          if (this.modalType === 0) {
            // 添加 避免编辑后传入id等数据 记得删除
            delete this.form.id;
            addBrand(this.form).then((res) => {
              this.submitLoading = false;
              if (res.success) {
                this.$Message.success("操作成功");
                this.getDataList();
                this.modalVisible = false;
              }
            });
          } else {
            // 编辑
            updateBrand(this.form).then((res) => {
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
    // 添加
    add() {
      this.modalType = 0;
      this.modalTitle = "添加";
      this.$refs.form.resetFields();
      delete this.form.id;
      this.modalVisible = true;
    },
    
    // 编辑
    edit(v) {
      this.modalType = 1;
      this.modalTitle = "编辑";
      this.$refs.form.resetFields();
      // 转换null为""
      for (let attr in v) {
        if (v[attr] === null) {
          v[attr] = "";
        }
      }
      let str = JSON.stringify(v);
      let data = JSON.parse(str);
      this.form = data;
      this.modalVisible = true;
    },
  },
  mounted() {
    this.init();
  },
};
</script>
