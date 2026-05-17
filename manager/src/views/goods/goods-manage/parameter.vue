<template>
  <div class="search">
    <Card>
      <Form
        ref="searchForm"
        @submit.native.prevent
        @keydown.enter.native="handleSearch"
        :model="searchForm"
        inline
        :label-width="70"
        class="search-form"
      >
        <Form-item label="参数名称">
          <Input
            type="text"
            v-model="searchForm.paramName"
            placeholder="请输入参数名称"
            clearable
            style="width: 240px"
          />
        </Form-item>
        <Button @click="handleSearch" type="primary">搜索</Button>
      </Form>
    </Card>

    <Card>
      <Row class="operation padding-row">
        <Button @click="goAdd" type="primary">添加</Button>
      </Row>
      <Table :loading="loading" border :columns="columns" :data="data" ref="table"></Table>
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
  </div>
</template>
<script>
import {
  deleteParams,
  getGoodsParamsPage,
} from "@/api/goods";

export default {
  name: "categoryParams",
  data() {
    return {
      submitLoading: false,
      loading: true,
      total: 0,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
        paramName: "",
      },
      data: [],
      columns: [
        {
          title: "参数名称",
          key: "paramName",
          width: 300,
          resizable: true,
          sortable: false,
        },
        {
          title: "参数值",
          key: "options",
          minWidth: 260,
          tooltip: true,
        },
        {
          title: "必填",
          key: "required",
          width: 300,
          align: "center",
          render: (h, params) => {
            const val = params.row.required;
            const on = val === 1 || val === "1" || val === true;
            return h("span", on ? "是" : "否");
          },
        },
        {
          title: "可索引",
          key: "isIndex",
          width: 300,
          align: "center",
          render: (h, params) => {
            const val = params.row.isIndex;
            const on = val === 1 || val === "1" || val === true;
            return h("span", on ? "是" : "否");
          },
        },
        {
          title: "操作",
          key: "action",
          width: 300,
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
                      this.goEdit(params.row);
                    },
                  },
                },
                "编辑"
              ),
              h("span", { style: { margin: "0 8px", color: "#dcdee2" } }, "|"),
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
    };
  },
  methods: {
    init() {
      this.getDataList();
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    changePageSize(v) {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 20;
      this.getDataList();
    },
    getDataList() {
      this.loading = true;
      getGoodsParamsPage(this.searchForm).then((res) => {
        this.loading = false;
        if (res && res.success) {
          this.data = (res.result && res.result.records) || [];
          this.total = (res.result && res.result.total) || 0;
        }
      });
    },
    goAdd() {
      this.$router.push({ name: "goods-parameter-edit" });
    },
    goEdit(row) {
      if (!row || !row.id) return;
      try {
        window.sessionStorage.setItem(`goods-parameter-edit:${row.id}`, JSON.stringify(row));
      } catch (e) {}
      this.$router.push({ name: "goods-parameter-edit", query: { id: row.id } });
    },
    remove(row) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除 " + (row.paramName || "") + " ?",
        loading: true,
        onOk: () => {
          deleteParams(row.id).then((res) => {
            this.$Modal.remove();
            if (res && res.success) {
              this.$Message.success("删除成功");
              this.getDataList();
            }
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
<style lang="scss"></style>
