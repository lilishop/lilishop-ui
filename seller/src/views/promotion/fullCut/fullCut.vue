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
          <Form-item label="活动名称">
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
          <Button @click="handleReset" class="ml_10">重置</Button>
        </Form>
      </Row>
      <Row class="operation">
        <Button type="primary" @click="newAct">新增</Button>
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
            <Button
              type="primary"
              v-if="row.promotionStatus == 'NEW'"
              size="small"
              @click="edit(row)"
              >编辑</Button
            >&nbsp;
            <Button type="success" v-else size="small" @click="edit(row)"
              >查看</Button
            >&nbsp;
            <Button
              type="error"
              :disabled="row.promotionStatus == 'START'"
              ghost
              size="small"
              @click="del(row)"
              >删除</Button
            >
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
import { getFullDiscountList, delFullDiscount } from "@/api/promotion.js";
export default {
  name: 'full-cut',
  data() {
    return {
      loading: false, // 表单加载状态
      searchForm: { // 列表请求参数
        pageNumber: 0,
        pageSize: 10,
        sort: "startTime",
        order: "desc",
      },
      columns: [
        {
          title: "活动名称",
          key: "promotionName",
          minWidth: 120,
        },
        {
          title: "开始时间",
          key: "startTime",
          minWidth: 60,
        },
        {
          title: "结束时间",
          key: "endTime",
          minWidth: 60,
        },
        {
          title: "活动类型",
          slot: "promotionType",
          width: 100,
        },
        {
          title: "活动状态",
          key: "promotionStatus",
          width: 100,
          render: (h, params) => {
            let text = "未知",
              color = "default";
            if (params.row.promotionStatus == "NEW") {
              text = "未开始";
              color = "default";
            } else if (params.row.promotionStatus == "START") {
              text = "已开始";
              color = "green";
            } else if (params.row.promotionStatus == "END") {
              text = "已结束";
              color = "blue";
            } else if (params.row.promotionStatus == "CLOSE") {
              text = "已关闭";
              color = "red";
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
          width: 200,
        },
      ],
      data: [], // 表格数据
    };
  },
  methods: {
    newAct() {
      // 新增活动
      this.$router.push({ name: "full-cut-detail" });
    },
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
    handleReset() {
      this.selectDate = ''
      this.searchForm = {}
      this.searchForm.pageNumber = 0;
      this.searchForm.pageSize = 10;
      this.getDataList();
    },

    edit(row) {
      //  编辑
      this.$router.push({ name: "full-cut-detail", query: { id: row.id } });
    },
    del(row) {
      this.$Modal.confirm({
        title: "提示",
        // 记得确认修改此处
        content: "确认删除此活动吗?",
        loading: true,
        onOk: () => {
          // 删除
          delFullDiscount(row.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("删除成功");
              this.getDataList();
            }
          });
        },
      });
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
  },
  activated () {
    this.init();
  }
};
</script>
<style lang="scss" scoped>
.operation {
  margin: 10px 0;
}
</style>
