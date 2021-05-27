<style lang="scss">
@import "@/styles/table-common.scss";
</style>
<template>
  <div class="search">
    <Card>
      <Row v-show="openSearch" @keydown.enter.native="handleSearch">
        <Form ref="searchForm" inline :label-width="90">
          <Form-item label="发送用户ID" prop="userId">
            <Input
              type="text"
              v-model="userId"
              placeholder="请输入发送用户完整ID"
              clearable
              style="width: 200px"
            />
          </Form-item>
          <Form-item label="发送状态" prop="status">
            <Select v-model="status" placeholder="请选择" style="width: 200px" clearable>
              <Option value="0">未读</Option>
              <Option value="1">已读</Option>
              <Option value="2">回收站</Option>
            </Select>
          </Form-item>
          <Form-item style="margin-left:-35px;" class="br">
            <Button @click="getDataList" type="primary" icon="ios-search">搜索</Button>
            <Button @click="handleReset">重置</Button>
          </Form-item>
        </Form>
      </Row>
      <Row class="operation">
        <Button v-hasRole="'ROLE_ADMIN'" @click="delAll" icon="md-trash">批量删除</Button>
        <Button @click="getDataList" icon="md-refresh">刷新</Button>
        <Button type="dashed" @click="openSearch=!openSearch">{{openSearch ? "关闭搜索" : "开启搜索"}}</Button>
        <Button type="dashed" @click="openTip=!openTip">{{openTip ? "关闭提示" : "开启提示"}}</Button>
      </Row>
      <Row v-show="openTip">
        <Alert show-icon>
          已选择
          <span class="select-count">{{selectCount}}</span> 项
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
          :current="pageNumber"
          :total="total"
          :page-size="pageSize"
          @on-change="changePage"
          @on-page-size-change="changePageSize"
          :page-size-opts="[10,20,50]"
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
import { getMessageSendData, deleteMessageSend } from "@/api/index";
export default {
  name: "message_send_detail",
  data() {
    return {
      openSearch: true, // 显示搜索项
      openTip: true, // 显示提示
      loading: true, // 表单加载状态
      messageId: "", // 信息id
      sortColumn: "createTime", // 排序字段
      sortType: "desc", // 排序方式
      status: "", // 发送状态
      selectList: [], // 多选数据
      selectCount: 0, // 多选计数
      columns: [
        // 表头
        {
          type: "selection",
          width: 60,
          align: "center"
        },
        {
          type: "index",
          width: 60,
          align: "center"
        },
        {
          title: "发送消息标题",
          key: "title"
        },
        {
          title: "发送用户",
          key: "username",
          sortable: true
        },
        {
          title: "状态",
          key: "status",
          align: "center",
          sortable: true,
          render: (h, params) => {
            if (params.row.status == 0) {
              return h("div", [
                h(
                  "Tag",
                  {
                    props: {
                      color: "default"
                    }
                  },
                  "未读"
                )
              ]);
            } else if (params.row.status == 1) {
              return h("div", [
                h(
                  "Tag",
                  {
                    props: {
                      color: "green"
                    }
                  },
                  "已读"
                )
              ]);
            } else if (params.row.status == 2) {
              return h("div", [
                h(
                  "Tag",
                  {
                    props: {
                      color: "orange"
                    }
                  },
                  "回收站"
                )
              ]);
            }
          }
        },
        {
          title: "创建时间",
          key: "createTime",
          sortable: true,
          sortType: "desc"
        },
        {
          title: "更新时间",
          key: "updateTime",
          sortable: true
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          render: (h, params) => {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: "error",
                      size: "small",
                      icon: "md-trash"
                    },
                    on: {
                      click: () => {
                        this.remove(params.row);
                      }
                    }
                  },
                  "删除"
                )
              ]);
            }
        }
      ],
      data: [], // 表单数据
      pageNumber: 1, // 当前页数
      pageSize: 10, // 页面大小
      total: 0, // 表单数据总数
      userId: ""
    };
  },
  methods: {
    init() {
      this.messageId = this.$route.query.id;
      this.getDataList();
    },
    changePage(v) {
      this.pageNumber = v;
      this.getDataList();
      this.clearSelectAll();
    },
    changePageSize(v) {
      this.pageSize = v;
      this.getDataList();
    },
    changeSort(e) {
      this.sortColumn = e.key;
      this.sortType = e.order;
      if (e.order == "normal") {
        this.sortType = "";
      }
      this.getDataList();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getDataList();
    },
    getDataList(v) {
      this.loading = true;
      if (v == 0) {
        this.userId = "";
      }
      let params = {
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        sort: this.sortColumn,
        order: this.sortType,
        messageId: this.messageId,
        status: this.status,
        userId: this.userId
      };
      // 避免后台默认值
      if (!params.status) {
        params.status = "";
      }
      getMessageSendData(params).then(res => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    handleReset() {
      this.userId = "";
      this.status = "";
      this.getDataList();
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        // 记得确认修改此处
        content: "您确认要删除该条数据?",
        loading: true,
        onOk: () => {
          // 删除
          deleteMessageSend(v.id).then(res => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.getDataList();
            }
          });
        }
      });
    },
    clearSelectAll() {
      this.$refs.table.selectAll(false);
    },
    changeSelect(e) {
      this.selectList = e;
      this.selectCount = e.length;
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
          this.selectList.forEach(function(e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);
          // 批量删除
          deleteMessageSend(ids).then(res => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.clearSelectAll();
              this.getDataList();
            }
          });
        }
      });
    }
  },
  watch: {
    // 监听路由变化通过id获取数据
    $route(to, from) {
      if (to.name == "message_send_detail") {
        this.messageId = this.$route.query.id;
        this.getDataList();
      }
    }
  },
  mounted() {
    this.init();
    this.$Modal.info({
      title: "提示",
      content: "该页面已根据用户角色隐藏操作按钮"
    });
  }
};
</script>
