<template>
  <div class="search">
    <Row>
      <Card>
        <Row @keydown.enter.native="handleSearch">
          <Form
            ref="searchForm"
            :model="searchForm"
            inline
            :label-width="70"
            class="search-form"
          >
            <Form-item label="会员名称" prop="username">
              <Input
                type="text"
                v-model="searchForm.memberName"
                placeholder="请输入会员名称"
                clearable
                style="width: 200px"
              />
              </Form-item>
            <Button @click="handleSearch" class="search-btn" type="primary" icon="ios-search">搜索</Button >
          </Form>
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
        >
        </Table>
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
    </Row>

  </div>
</template>

<script>
  import region from "@/views/lili-components/region";
  import * as API_Member from "@/api/member.js";
  import ossManage from "@/views/sys/oss-manage/ossManage";
  import * as RegExp from '@/libs/RegExp.js';

  export default {
    name: "point",
    components: {
      region,
      ossManage,
    },
    data() {
      return {
        descFlag: false, //编辑查看框
        loading: true, // 表单加载状态
        searchForm: { // 请求参数
          pageNumber: 1,
          pageSize: 10,
        },
        selectList: [], // 多选数据
        selectCount: 0, // 多选计数
        columns: [
          {
            title: "会员名称",
            key: "memberName",
            minWidth: 120,
            tooltip: true
          },
          {
            title: "操作内容",
            key: "content",
            minWidth: 180,
            tooltip: true
          },

          {
            title: "之前积分",
            key: "beforePoint",
            width: 110,
          },

          {
            title: "变动积分",
            key: "variablePoint",
            width: 110,
            render: (h, params) => {
              if (params.row.pointType == 'INCREASE') {
                return h('div', [
                  h('span', {
                    style: {
                      color: 'green'
                    }
                  }, "+" + params.row.variablePoint),
                ]);
              } else {
                return h('div', [
                  h('span', {
                    style: {
                      color: 'red'
                    }
                  }, "-" + params.row.variablePoint),
                ]);
              }

            }
          },
          {
            title: "当前积分",
            key: "point",
            width: 110,
          },
          {
            title: "操作时间",
            key: "createTime",
            width: 170
          },

        ],
        data: [], // 表单数据
        total: 0, // 表单数据总数
      };
    },
    methods: {
      // 回调给父级
      callback(val) {
        this.$emit("callback", val);
      },
      init() {
        this.getData();
      },
      changePage(v) {
        this.searchForm.pageNumber = v;
        this.getData();
      },
      changePageSize(v) {
        this.searchForm.pageSize = v;
        this.getData();
      },
      handleSearch() {
        this.searchForm.pageNumber = 1;
        this.searchForm.pageSize = 10;
        this.getData();
      },

      changeSort(e) {
        this.searchForm.sort = e.key;
        this.searchForm.order = e.order;
        if (e.order === "normal") {
          this.searchForm.order = "";
        }
        this.getData();
      },
      changeSelect(e) {
        this.selectList = e;
        this.selectCount = e.length;
      },
      selectDateRange(v) {
        if (v) {
          this.searchForm.startDate = v[0];
          this.searchForm.endDate = v[1];
        }
      },
      //查新积分列表
      getData() {
        this.loading = true;
        API_Member.getHistoryPointData(this.searchForm).then((res) => {
          this.loading = false;
          if (res.success) {
            this.data = res.result.records;
            this.total = res.result.total;
          }
        });
        this.loading = false;
      },
    },
    mounted() {
      this.init();
    },
  };
</script>
<style lang="scss" scoped>
  @import "@/styles/table-common.scss";

  .face {
    width: 60px;
    height: 60px;
    border-radius: 50%;
  }
</style>
