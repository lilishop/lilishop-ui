<template>
  <div class="search">
    <Card>
      <Row @keydown.enter.native="handleSearch">
        <Form
          ref="searchForm"
          :model="searchForm"
          inline
          :label-width="70"
          class="search-form"
        >
          <Form-item label="标题" prop="title">
            <Input
              type="text"
              v-model="searchForm.title"
              placeholder="请输入标题"
              clearable
              style="width: 200px"
            />
          </Form-item>
          <Form-item label="消息内容" prop="content">
            <Input
              type="text"
              v-model="searchForm.content"
              placeholder="请输入消息内容"
              clearable
              style="width: 200px"
            />
          </Form-item>
          <span v-if="drop">
            <Form-item label="发送类型" prop="sendType">
              <Select
                v-model="searchForm.sendType"
                placeholder="请选择"
                clearable
                style="width: 200px"
              >
                <Option value="ALL">全站会员</Option>
                <Option value="SELECT">指定会员</Option>
              </Select>
            </Form-item>
            <Form-item label="创建人" prop="createBy">
              <Input
                type="text"
                v-model="searchForm.createBy"
                placeholder="请输入创建人"
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
      <Row class="operation">
        <Button @click="add" type="primary" icon="md-add">发送新消息</Button>
        <Button @click="delAll" icon="md-trash">批量删除</Button>
        <Button @click="getDataList" icon="md-refresh">刷新</Button>
      </Row>
      <Row v-show="openTip">
        <Alert show-icon>
          已选择 <span class="select-count">{{ selectCount }}</span> 项
          <a class="select-clear" @click="clearSelectAll">清空</a>
        </Alert>
      </Row>
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
  </div>
</template>

<script>
export default {
  name: "member-notice-sender",
  components: {},
  data() {
    return {
      openSearch: true, // 显示搜索
      openTip: true, // 显示提示
      loading: true, // 表单加载状态
      modalType: 0, // 添加或编辑标识
      modalVisible: false, // 添加或编辑显示
      modalTitle: "", // 添加或编辑标题
      drop: false, // 更多搜索项
      dropDownContent: "展开", // drop中文提示
      dropDownIcon: "ios-arrow-down", // drop图标
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc", // 默认排序方式
      },
      submitLoading: false, // 添加或编辑提交状态
      selectList: [], // 多选数据
      selectCount: 0, // 多选计数
      columns: [
        // 表头
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          type: "index",
          width: 60,
          align: "center",
        },
        {
          title: "标题",
          key: "title",
          minWidth: 120,
          sortable: false,
        },
        {
          title: "发送类型",
          key: "sendType",
          minWidth: 120,
          sortable: false,

          render: (h, params) => {
            if (params.row.sendType == "ALL") {
              return h("div", [
                h("Badge", {
                  props: {
                    status: "success",
                    text: "全部会员",
                  },
                }),
              ]);
            } else {
              return h("div", [
                h("Badge", {
                  props: {
                    status: "success",
                    text: "指定会员",
                  },
                }),
              ]);
            }
          },
        },
        {
          title: "创建人",
          key: "createBy",
          minWidth: 120,
          sortable: false,
        },
        {
          title: "创建时间",
          key: "createTime",
          minWidth: 120,
          sortable: true,
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
                    type: "error",
                    size: "small",
                    icon: "md-trash",
                  },
                  on: {
                    click: () => {
                      this.remove(params.row);
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
    init() {
      this.getDataList();
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
      // 带多条件搜索参数获取表单数据 请自行修改接口
      this.getRequest("/memberNoticeSenter/getByPage", this.searchForm).then(
        (res) => {
          this.loading = false;
          if (res.success) {
            this.data = res.result.records;
            this.total = res.result.total;
          }
        }
      );
      // 以下为模拟数据
      //this.data = [
      //];
      this.total = this.data.length;
      this.loading = false;
    },
    add() {
      let query = { type: 0, backRoute: this.$route.name };
      this.$router.push({
        name: "add_message",
        query: query,
      });
    },
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
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        // 记得确认修改此处
        content: "您确认要删除么?",
        loading: true,
        onOk: () => {
          // 删除
          this.deleteRequest("/memberNoticeSenter/delByIds/" + v.id).then(
            (res) => {
              this.$Modal.remove();
              if (res.success) {
                this.$Message.success("操作成功");
                this.getDataList();
              }
            }
          );
          // 模拟请求成功
          //this.$Message.success("操作成功");
          //this.$Modal.remove();
          //this.getDataList();
        },
      });
    },
    delAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要删除的数据");
        return;
      }
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除所选的 " + this.selectCount + " 条数据?",
        loading: true,
        onOk: () => {
          let ids = "";
          this.selectList.forEach(function (e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);
          // 批量删除
          this.deleteRequest("/memberNoticeSenter/delByIds/" + ids).then(
            (res) => {
              this.$Modal.remove();
              if (res.success) {
                this.$Message.success("操作成功");
                this.clearSelectAll();
                this.getDataList();
              }
            }
          );
          // 模拟请求成功
          //this.$Message.success("操作成功");
          //this.$Modal.remove();
          //this.clearSelectAll();
          //this.getDataList();
        },
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style lang="scss">
// 建议引入通用样式 可删除下面样式代码
// @import "@/styles/table-common.scss";
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
