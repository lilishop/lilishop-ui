<template>
    <div class="search">
      <div>
        <Card class="mt_10" >
          <Table :loading="loading" border :columns="columns" :data="data" ref="table" sortable="custom">
          </Table>
        </Card>
  
      </div>
    </div>
  </template> 
  <script>
  import * as API_Order from "@/api/order";
  export default {
    data () {
      return {
        searchForm: {
        // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc", // 默认排序方式
      },
        loading: true, // 表单加载状态
        outOrderNo:"",//分账单号
        columns: [ 
          {
            title: "二级商户号",
            key: "subMchid",
            minWidth: 200,
          },
          {
            title: "二级商户号名称",
            key: "subMchName",
            minWidth: 200,
          },
          {
            title: "商户分账单号",
            key: "outOrderNo",
            minWidth: 100,
          },
          {
            title: "分账金额",
            key: "amount",
            minWidth: 100,
          },
          {
            title: "订单状态",
            key: "result",
            minWidth: 100,
            render: (h, params) => {
              if (params.row.result == "PENDING") {
                return h("div", [h("span", {}, "待分账")]);
              } else if (params.row.result == "SUCCESS") {
                return h("div", [h("span", {}, "分账成功")]);
              } else if (params.row.result == "CLOSED") {
                return h("div", [h("span", {}, "已关闭")]);
              }
            },
          },
          {
            title: "分账明细单号",
            key: "detailId",
            minWidth: 100,
          },
  
        ],

        data: [], // 表单数据
      };
    },
    // watch: {
    //   $route (to, from) {
    //     this.$router.go(0);
    //   },
    // },
    methods: {
    //   gotoHomes () {
    //     return false
    //   },

      // 获取分账详情
      getDataList () {
        this.loading = true;
        API_Order.detailLog(this.outOrderNo).then((res) => {
          this.loading = false;
          if (res.success) {
            this.data = res.result;
          }
        });
      },
    },
    mounted () {
      this.outOrderNo = this.$route.query.outOrderNo;
      this.getDataList();
      if (this.groupSkuId) {
        API_Order.stagesDetail({ orderSn: this.sn }).then((res) => {
          console.log(res, 'res');
          if (res.success) {
            this.stagesData = res.result.records
          }
        });
      }
    },
  };
  </script>
  <style lang="scss">
  .time {
    font-size: 14px;
    font-weight: bold;
  }
  
  .content {
    padding-left: 5px;
  }
  
  .lineH30 {
    line-height: 30px;
  }
  
  .order-log-div {
    line-height: 30px;
    overflow-y: scroll;
  }
  
  .flex-card {
    display: flex;
    height: 600px;
  }
  
  .card-item {
    margin: 5px 0;
  }
  
  .flex-card-left {
    flex: 4;
    //background: #f8f8f8;
  }
  
  .flex-card-right {
    flex: 6;
  }
  
  .search {
    .operation {
      margin-bottom: 2vh;
    }
  
    .select-clear {
      margin-left: 10px;
    }
  
    .div-item {
      line-height: 35px;
      display: flex;
  
      >.div-item-left {
        width: 80px;
      }
  
      >.div-item-right {
        flex: 1;
        word-break: break-all;
      }
    }
  
    .div-status-right {
      margin-top: 20px;
      margin-left: 30px;
      font-size: 20px;
    }
  
    .page {
      margin-top: 2vh;
    }
  
    button {
      margin-left: 5px;
    }
  
    .goods-total {
      padding: 20px;
      height: 220px;
      width: 100%;
  
      ul {
        margin-right: 10px;
        display: block;
        float: right;
        list-style-type: none;
  
        li {
          text-align: -webkit-match-parent;
        }
      }
  
      .label {
        float: left;
        width: 500px;
        font-size: 14px;
        text-align: right;
      }
  
      .txt {
        float: left;
        font-size: 14px;
        width: 130px;
        text-align: right;
        font-family: verdana;
      }
  
      .flowPrice {
        color: #cc0000;
        font-size: 22px;
      }
    }
  }
  
  .f14 {
    font-size: 14px;
    color: #333;
  }
  
  .printgoodtitle {
    font-size: 14px;
    line-height: 1.5;
    margin-top: 15px;
    color: #333;
  }
  
  .printgoodinfo {
    // font-size: 14px;
    // background: #f2f2f2;
    // border-bottom:2px solid #333 ;
    padding: 10px;
    overflow: hidden;
    color: #333;
  
    .printgooditem {
      border-bottom: 1px solid #e8eaec;
      display: flex;
      align-items: flex-start;
      overflow: hidden;
      line-height: 30px;
      margin-bottom: 10px;
      padding-bottom: 10px;
  
      .printgoodname {
        flex: 1;
        overflow: hidden;
  
        .printgoodguid {
          font-size: 12px;
          color: #999999;
          line-height: 1.5;
  
          .printgoodguiditem {
            margin-right: 10px;
          }
        }
      }
  
      .printgoodprice {
        width: 135px;
        margin-left: 15px;
      }
  
      .printgoodnumber {
        width: 85px;
        margin-left: 15px;
      }
    }
  }
  
  @media print {
    @page {
      size: auto;
      margin: 3mm;
    }
  
    html,
    body {
      height: inherit;
    }
  }
  </style>
  