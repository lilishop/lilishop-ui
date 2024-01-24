<template>
  <div>
    <Card>
      <Table :loading="loading" border :columns="columns" :data="data" ref="table" class="mt_10"></Table>
      <Row type="flex" justify="end" class="page padding-row">
        <Page :current="searchForm.pageNumber" :total="total" :page-size="searchForm.pageSize" @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[10,20,50]" size="small" show-total show-elevator show-sizer></Page>
      </Row>
    </Card>
  </div>
</template>

<script>
import {
  getDistributionCash,
  auditDistributionCash, getDistributionMember
} from "@/api/distribution";
import {cashStatusList} from './dataJson'
export default {
  name: "distributionMember",
  data() {
    return {
      id: "",//分销员id
      cashStatusList, // 状态列表
      loading: true, // 表单加载状态
      modalVisible: false, // 添加或编辑显示
      modalTitle: "", // 添加或编辑标题
      result: 'FAIL_AUDITING', // 是否通过
      searchForm: { // 搜索框初始化对象
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: "createTime", // 默认排序字段
        order: "desc", // 默认排序方式
      },
      handleStatus:'edit',// 判断是编辑还是查看
      form: { // 添加或编辑表单对象初始化数据
        sn: "",
        memberName: "",
        price: "",
      },
      submitLoading: false, // 添加或编辑提交状态
      columns: [
        {
          title: "客户昵称",
          key: "nickName",
          minWidth: 200
        },
        {
          title: "成交额",
          key: "orderPrice",
          minWidth: 120
        },
        {
          title: "佣金总额",
          key: "rebatePrice",
          minWidth: 120
        },
        {
          title: "订单数",
          key: "orderNum",
          minWidth: 130
        },
        {
          title: "最近下单时间",
          key: "lastLoginDate",
          minWidth: 130
        },
      ],
      data: [], // 表单数据
      total: 0 // 表单数据总数
    };
  },
  methods: {
    // 初始化数据
    init() {
      this.getDataList();
    },
    // 改变页码
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    // 改变页数
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    // 搜索
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getDataList();
    },
    // 获取列表数据
    getDataList() {
      this.loading = true;
      console.log(this.id);
      // 带多条件搜索参数获取表单数据 请自行修改接口
      getDistributionMember(this.id,this.searchForm).then(res => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
      this.total = this.data.length;
      this.loading = false;
    },
  },
  mounted() {
    this.id = this.$route.query.id;
    this.init();
  }
};
</script>
