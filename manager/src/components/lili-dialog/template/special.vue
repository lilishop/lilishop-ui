<template>
  <div class="wrapper">
    <div class="content">
      <div >
        <div class="tables">
          <Table
           border
            height="350"
            tooltip
            :loading="loading"
            :columns="columns"
            :data="data"
          >
          </Table>

          <Page
            @on-change="
              (val) => {
                params.pageNumber = val;
              }
            "
            :current="params.pageNumber"
            :page-size="params.pageSize"
            class="mt_10"
            :total="Number(totals)"
            size="small"
            show-elevator
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { getHomeList }  from "@/api/other.js";
export default {
  data() {
    return {
      loading: true, //表格请求数据为true
      promotionList: "", // 活动列表
      selectedIndex: 0, //左侧菜单选择
      promotions: "", //选中的活动key
      index: 999, // 已选下标
      data:[],
      params: {
        sort: "createTime",
        order: "desc",
        pageClientType: "H5",
        pageNumber: 1,
        pageSize: 10,
        pageType: "SPECIAL",
      },
      total: 0, // 表单数据总数
      columns: [
        {
          title: "专题名称",
          key: "name",
          tooltip: true,
          // slot: 'name'
        //   width: 200,
        },
        {
          title: "操作",
          key: "action",
          fixed: "right",
          width: 100,
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: this.index == params.index ? "primary" : "",
                    size: "small",
                  },
                  on: {
                    click: () => {
                      this.index = params.index;
                      params.row = {...params.row,pageType:'special'}
                      this.$emit("selected", [params.row]);
                    },
                  },
                },
                this.index == params.index ? "已选" : "选择"
              ),
            ]);
          },
        },
      ],
    };
  },
  mounted() {
    this.init();
  },

  methods: {
    // 获取话题的标题
    async init() {
      let res = await getHomeList(this.params);
      if (res.success) {
        this.loading = false;
         this.data= res.result.records
      } else {
        this.loading = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
img {
  max-width: 100% !important;
}
.search {
  width: 300px;
}
.page {
  margin-top: 2vh;
  text-align: right;
}
.time {
  font-size: 12px;
}
.tables {
  height: 400px;
  margin-top: 20px;
  overflow: auto;
  width: 100%;
}
/deep/ .ivu-table-wrapper {
  width: 100%;
}
.list {
  margin: 0 1.5%;
  height: 400px;
  overflow: auto;
  > .list-item {
    padding: 10px;
    transition: 0.35s;
    cursor: pointer;
  }
  .list-item:hover {
    background: #ededed;
  }
}
.list {
  flex: 1;
  width: auto;
}
.content {
  overflow: hidden;
  flex: 4;
}
.active {
  background: #ededed;
}
.wrapper {
  overflow: hidden;
}
.search-views {
  display: flex;
  > * {
    margin: 0 4px;
  }
}
</style>
