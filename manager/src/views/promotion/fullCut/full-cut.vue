<template>
  <div class="full-cut">
    <Card>
      <Row>
        <Form
          ref="searchForm"
          :model="searchForm"
          inline
          :label-width="70"
          class="search-form"
        >
          <Form-item label="活动名称" prop="promotionName">
            <Input
              type="text"
              v-model="searchForm.promotionName"
              placeholder="请输入活动名称"
              clearable
              style="width: 200px"
            />
          </Form-item>
          <Form-item label="活动状态" prop="promotionStatus">
            <Select
              v-model="searchForm.promotionStatus"
              placeholder="请选择"
              clearable
              style="width: 200px"
            >
              <Option value="NEW">未开始</Option>
              <Option value="START">已开始/上架</Option>
              <Option value="END">已结束/下架</Option>
              <Option value="CLOSE">紧急关闭/作废</Option>
            </Select>
          </Form-item>
          <Form-item label="活动时间">
            <DatePicker
              v-model="selectDate"
              type="daterange"
              clearable
              placeholder="选择起始时间"
              style="width: 200px"
            ></DatePicker>
          </Form-item>
          <Button @click="handleSearch" type="primary" class="search-btn" icon="ios-search">搜索</Button>
        </Form>
      </Row>
      <Table
        :loading="loading"
        border
        :columns="columns"
        :data="data"
        ref="table"
        sortable="custom"
      >
        <template slot-scope="{ row }" slot="applyEndTime">
          {{ unixDate(row.applyEndTime) }}
        </template>
        <template slot-scope="{ row }" slot="promotionType">
          {{ row.isFullMinus ? "满减" : "满折" }}
        </template>
        <template slot-scope="{ row }" slot="hours">
          <Tag v-for="item in unixHours(row.hours)" :key="item">{{
            item
          }}</Tag>
        </template>
        <template slot-scope="{ row }" slot="action">
          <div>
            <Button type="success" size="small" @click="view(row)"
              >查看</Button
            >&nbsp;
          </div>
        </template>
      </Table>
      <Row type="flex" justify="end" class="page operation">
        <Page
          :current="searchForm.pageNumber + 1"
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
import { getFullDiscountList } from "@/api/promotion.js";

export default {
  data() {
    return {
      loading: false, // 表单加载状态
      searchForm: { // 请求参数
        pageNumber: 0,
        pageSize: 10,
        sort: "startTime",
        order: "desc",
      },
      columns: [ // 表头
        {
          title: "活动名称",
          key: "promotionName",
          minWidth: 120,
        },
        {
          title: "开始时间",
          key: "startTime",
          width: 170,
        },
        {
          title: "结束时间",
          key: "endTime",
          width: 170,
        },
        {
          title: "店铺名称",
          key: "storeName",
          minWidth: 60,
        },
        {
          title: "活动类型",
          slot: "promotionType",
          minWidth: 60,
        },
        {
          title: "活动状态",
          key: "promotionStatus",
          minWidth: 60,
          render: (h, params) => {
            let text = "未知",
              color = "purple";
            if (params.row.promotionStatus == "NEW") {
              text = "未开始";
              color = "geekblue";
            } else if (params.row.promotionStatus == "START") {
              text = "已开始";
              color = "blue";
            } else if (params.row.promotionStatus == "END") {
              text = "已结束";
              color = "green";
            } else if (params.row.promotionStatus == "CLOSE") {
              text = "已关闭";
              color = "volcano";
            }
            return h("div", [
              h(
                "Tag",
                {
                  props: {
                    color: color,
                  },
                },
                text
              ),
            ]);
          },
        },
        {
          title: "操作",
          slot: "action",
          align: "center",
          width: 100,
        },
      ],
      data: [], // 列表数据
    };
  },
  methods: {
    init() {
      this.getDataList();
    },
    changePage(v) {
      // 改变页数
      this.searchForm.pageNumber = v - 1;
      this.getDataList();
    },
    changePageSize(v) {
      // 改变页码
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    handleSearch() {
      // 搜索
      this.searchForm.pageNumber = 0;
      this.searchForm.pageSize = 10;
      this.getDataList();
    },
    getDataList() {
      this.loading = true;
      if (this.selectDate && this.selectDate[0] && this.selectDate[1]) {
        this.searchForm.startTime = this.selectDate[0].getTime();
        this.searchForm.endTime = this.selectDate[1].getTime();
      } else {
        this.searchForm.startTime = null;
        this.searchForm.endTime = null;
      }
      getFullDiscountList(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    view(row) {
      // 查看
      this.$router.push({ name: "full-cut-detail", query: { id: row.id } });
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style lang="scss">
// 建议引入通用样式 可删除下面样式代码
@import "@/styles/table-common.scss";
</style>
