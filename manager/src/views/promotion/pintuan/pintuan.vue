<template>
  <div class="search">
    <Card>
      <Row v-show="openSearch">
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
          <Button @click="handleSearch" type="primary" class="search-btn"
            >搜索</Button
          >
        </Form>
      </Row>
        <Table
          :loading="loading"
          border
          :columns="columns"
          :data="data"
          ref="table"
        >
          <template slot-scope="{ row }" slot="action">
            <Button
              type="info"
              size="small"
              @click="view(row)"
              style="margin-right: 5px"
              >查看</Button
            >
            <Button
              type="error"
              size="small"
              :disabled="
                row.promotionStatus == 'END' || row.promotionStatus == 'CLOSE'
              "
              @click="close(row)"
              >关闭
            </Button>
          </template>
        </Table>
      <Row type="flex" justify="end" class="page">
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
import { getPintuanList, closePintuan } from "@/api/promotion";

export default {
  name: "pintuan",
  components: {},
  data() {
    return {
      loading: true, // 表单加载状态
      openSearch: true, // 显示搜索项
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 0, // 当前页数
        pageSize: 10, // 页面大小
        sort: "startTime",
        order: "desc", // 默认排序方式
      },
      columns: [ // 表头
        {
          title: "活动名称",
          key: "promotionName",
          minWidth: 150,
          tooltip: true,
        },
        {
          title: "状态",
          key: "promotionStatus",
          width: 110,
          render: (h, params) => {
            let text = "未知",
              color = "";
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
                  props: { color: color },
                },
                text
              ),
            ]);
          },
        },
        {
          title: "所属店铺",
          key: "storeName",
          minWidth: 120,
          tooltip: true,
        },

        {
          title: "活动开始时间",
          key: "startTime",
          width: 180
        },
        {
          title: "活动结束时间",
          key: "endTime",
          width: 180
        },

        {
          fixed: "right",
          title: "操作",
          slot: "action",
          align: "center",
          width: 200,
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
      this.searchForm.pageNumber = v - 1;
      this.getDataList();
      this.clearSelectAll();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    handleSearch() {
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
      getPintuanList(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    view(v) {
      this.$router.push({ name: "pintuan-goods", query: { id: v.id } });
    },
    close(v) {
      this.$Modal.confirm({
        title: "确认关闭",
        // 记得确认修改此处
        content: "您确认要关闭此拼团活动?",
        loading: true,
        onOk: () => {
          // 删除
          closePintuan(v.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
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
<style lang="scss" scoped>
@import "@/styles/table-common.scss";
.ivu-form-item{
  margin-bottom: 0  !important;
}
</style>
