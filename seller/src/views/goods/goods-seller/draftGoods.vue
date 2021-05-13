<template>
  <div class="search">
    <Row>
      <Col>
        <Card>
          <Row v-show="openSearch" @keydown.enter.native="handleSearch">
            <Form
              ref="searchForm"
              :model="searchForm"
              inline
              :label-width="70"
              class="search-form"
            >
              <Form-item label="商品名称" prop="goodsName">
                <Input
                  type="text"
                  v-model="searchForm.goodsName"
                  placeholder="请输入商品名称"
                  clearable
                  style="width: 200px"
                />
              </Form-item>
              <span v-if="drop">
                <Form-item label="状态" prop="status">
                  <Select
                    v-model="searchForm.marketEnable"
                    placeholder="请选择"
                    clearable
                    style="width: 200px"
                  >
                    <Option value="DOWN">下架</Option>
                    <Option value="UPPER">上架</Option>
                  </Select>
                </Form-item>
                <Form-item label="商品编号" prop="sn">
                  <Input
                    type="text"
                    v-model="searchForm.sn"
                    placeholder="商品编号"
                    clearable
                    style="width: 200px"
                  />
                </Form-item>
              </span>
              <Form-item style="margin-left: -35px" class="br">
                <Button @click="handleSearch" type="primary" icon="ios-search"
                  >搜索</Button
                >
                <Button @click="handleReset">重置</Button>
                <a class="drop-down" @click="dropDown">
                  {{ dropDownContent }}
                  <Icon :type="dropDownIcon"></Icon>
                </a>
              </Form-item>
            </Form>
          </Row>
          <Row>
            <Table
              :loading="loading"
              border
              :columns="columns"
              :data="data"
              ref="table"
              sortable="custom"
              @on-sort-change="changeSort"
              @on-selection-change="changeSelect"
            ></Table>
          </Row>
          <Row type="flex" justify="end" class="page">
            <Page
              :current="searchForm.pageNumber"
              :total="total"
              :page-size="searchForm.pageSize"
              @on-change="changePage"
              @on-page-size-change="changePageSize"
              :page-size-opts="[10, 20, 50]"
              size="small"
              show-total
              show-elevator
              show-sizer
            ></Page>
          </Row>
        </Card>
      </Col>
    </Row>
    <Modal
      :title="modalTitle"
      v-model="modalVisible"
      :mask-closable="false"
      :width="500"
    >
      <Form
        ref="underForm"
        :model="underForm"
        :label-width="100"
        :rules="formValidate"
      >
        <FormItem label="下架原因" prop="reason">
          <Input v-model="underForm.reason" clearable style="width: 100%" />
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="modalVisible = false">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="lower(form.id)"
          >提交</Button
        >
      </div>
    </Modal>
  </div>
</template>

<script>
import { getDraftGoodsListData, deleteDraftGoods } from "@/api/goods";
export default {
  name: "goods",
  components: {},
  data() {
    return {
      id: "", //要操作的id
      openSearch: true, // 显示搜索
      loading: true, // 表单加载状态
      modalVisible: false, // 添加或编辑显示
      modalTitle: "", // 添加或编辑标题
      drop: false,
      dropDownContent: "展开",
      dropDownIcon: "ios-arrow-down",
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "create_time", // 默认排序字段
        order: "desc", // 默认排序方式
      },
      underForm: { // 下架表单
        reason: "",
      },
      form: {
        // 添加或编辑表单对象初始化数据
        goodsName: "",
        sn: "",
        marketEnable: "",
        price: "",
        sellerName: "",
      },
      // 表单验证规则

      formValidate: {},
      submitLoading: false, // 添加或编辑提交状态
      selectList: [], // 多选数据
      selectCount: 0, // 多选计数
      columns: [ // 表头
        {
          title: "ID",
          key: "id",
          minWidth: 120
        },
        {
          title: "商品原图",
          key: "original",
          width: 150,
          align: "center",
          render: (h, params) => {
            return h("img", {
              attrs: {
                src: params.row.original,
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
          title: "商品名称",
          key: "goodsName",
          minWidth: 120
        },
        {
          title: "商品价格",
          key: "price",
          minWidth: 120
        },

        {
          title: "商品库存",
          key: "quantity",
          minWidth: 120
        },
        {
          title: "创建时间",
          key: "createTime",
          minWidth: 120
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          width: 200,
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small",
                  },
                  style: {
                    marginRight: "5px",
                  },
                  on: {
                    click: () => {
                      this.editGoods(params.row);
                    },
                  },
                },
                "编辑"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small",
                  },
                  style: {
                    marginRight: "5px",
                  },
                  on: {
                    click: () => {
                      this.removeDraft(params.row.id);
                    },
                  },
                },
                "删除"
              )
            ]);
          },
        },
      ],
      data: [], // 表单数据
      total: 0, // 表单数据总数
    };
  },
  methods: {
    init() {
      let here = this.$route.matched.find((v) => v.name === this.$route.name);
      this.pageType = here.props.default ? here.props.default.type : "";
      if (this.pageType === "TEMPLATE") {
        this.searchForm.saveType = "TEMPLATE";
      } else {
        this.searchForm.saveType = "DRAFT";
      }
      this.getDataList();
    },
    editGoods(v) {
      this.searchForm.saveType === "TEMPLATE" ?
        this.$router.push({ name: "goods-template-operation-edit", query: { draftId: v.id } }):
        this.$router.push({ name: "goods-draft-operation-edit", query: { draftId: v.id } });
    },
    removeDraft (id) {
      let showType = this.searchForm.saveType === "TEMPLATE" ? "模版" : "草稿";
      this.$Modal.confirm({
        title: "确认审核",
        content: "您确认要删除id为 " + id + " 的" + showType + "吗?",
        loading: true,
        onOk: () => {
          deleteDraftGoods(id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("删除成功");
              this.getDataList();
            }
          });
        },
      });
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
      this.clearSelectAll();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getDataList();
    },
    handleReset() {
      this.$refs.searchForm.resetFields();
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      // 重新加载数据
      this.getDataList();
    },
    changeSort(e) {
      this.searchForm.sort = e.key;
      this.searchForm.order = e.order;
      if (e.order === "normal") {
        this.searchForm.order = "";
      }
      this.getDataList();
    },
    clearSelectAll() {
      this.$refs.table.selectAll(false);
    },
    changeSelect(e) {
      this.selectList = e;
      this.selectCount = e.length;
    },
    dropDown() {
      if (this.drop) {
        this.dropDownContent = "展开";
        this.dropDownIcon = "ios-arrow-down";
      } else {
        this.dropDownContent = "收起";
        this.dropDownIcon = "ios-arrow-up";
      }
      this.drop = !this.drop;
    },
    getDataList() {
      this.loading = true;
      // 带多条件搜索参数获取表单数据
      getDraftGoodsListData(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
  },
  mounted() {
    this.init();
  },
  watch: {
    $route(to, from) {
      this.init();
    },
  },
};
</script>
<style lang="scss" scoped>
.search {
  .operation {
    margin-bottom: 2vh;
  }
  .select-count {
    font-weight: 600;
    color: #40a9ff;
  }
  .select-clear {
    margin-left: 10px;
  }
  .page {
    margin-top: 2vh;
  }
  .drop-down {
    margin-left: 5px;
  }
}
</style>
