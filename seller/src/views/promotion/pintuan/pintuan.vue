<template>
  <div class="search">
    <Card>
      <Row>
        <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
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
          <Button @click="handleSearch" type="primary" class="search-btn " icon="ios-search">搜索</Button>
          <Button @click="handleReset" class="search-btn">重置</Button>
        </Form>
      </Row>
      <Row class="operation padding-row">
        <Button @click="newAct" type="primary">添加</Button>
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
        <template slot-scope="{ row }" slot="action">
          <div  class="row">
          <Button
            type="primary"
            size="small"
            v-if="row.promotionStatus == 'NEW'"
            @click="edit(row)"
            >编辑</Button
          >&nbsp;
          <Button
            type="info"
            v-if="row.promotionStatus == 'NEW'"
            size="small"
            @click="manage(row, 'manager')"
            >管理</Button
          >&nbsp;
          <Button
            type="info"
            v-if="row.promotionStatus !== 'NEW'"
            size="small"
            @click="manage(row, 'view')"
            >查看</Button
          >&nbsp;
          <Button
            type="error"
            size="small"
            v-if="row.promotionStatus != 'START'"
            ghost
            @click="remove(row)"
            >删除</Button
          >&nbsp;
          <Button
            type="success"
            v-if="
              row.promotionStatus == 'NEW' || row.promotionStatus == 'CLOSE'
            "
            size="small"
            @click="open(row)"
            >开启</Button
          >
          <Button
            type="warning"
            v-if="row.promotionStatus == 'START'"
            size="small"
            @click="close(row)"
            >关闭</Button
          >
          </div>
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
import {
  getPintuanList,
  deletePintuan,
  openPintuan,
  closePintuan,
} from "@/api/promotion";
export default {
  name: "pintuan",
  components: {},
  data() {
    return {
      loading: true, // 表单加载状态
      searchForm: {
        // 搜索框初始化对象
        pageNumber: 0, // 当前页数
        pageSize: 10, // 页面大小
        sort: "startTime", // 默认排序字段
        order: "desc", // 默认排序方式
      },
      selectDate: null, // 选择的时间
      selectList: [], // 多选数据
      selectCount: 0, // 多选计数
      columns: [
        {
          title: "活动名称",
          key: "promotionName",
          minWidth: 120
        },
        {
          title: "活动开始时间",
          key: "startTime",
        },
        {
          title: "活动结束时间",
          key: "endTime",
        },
        {
          title: "状态",
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
            return h("div", [h("Tag", { props: { color: color } }, text)]);
          },
        },
        {
          title: "操作",
          slot: "action",
          align: "center",
          width: 250,
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
    handleReset() {
      this.searchForm = {}
      this.selectDate = ''
      this.searchForm.pageNumber = 0;
      this.searchForm.pageSize = 10;
      this.getDataList();
    },

    clearSelectAll() {
      this.$refs.table.selectAll(false);
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
    getDataList() {
      this.loading = true;
      if (this.selectDate && this.selectDate[0] && this.selectDate[1]) {
        this.searchForm.startTime = this.selectDate[0].getTime();
        this.searchForm.endTime = this.selectDate[1].getTime();
      } else {
        this.searchForm.startTime = null;
        this.searchForm.endTime = null;
      }
      // 带多条件搜索参数获取表单数据 请自行修改接口
      getPintuanList(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    newAct() {
      this.$router.push({ name: "new-pintuan" });
    },
    edit(v) {
      this.$router.push({ name: "new-pintuan", query: { id: v.id } });
    },
    manage(v, status) {
      this.$router.push({ name: "pintuan-goods", query: { id: v.id, status: status } });
    },
    open(v) {
      this.$Modal.confirm({
        title: "确认开启",
        content: "您确认要开启此拼团活动?",
        onOk: () => {
          let params = {
            startTime: this.openStartTime,
            endTime: this.openEndTime,
          };
          openPintuan(v.id, params).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("开启活动成功");
              this.getDataList();
            }
          });
        },
        render: (h) => {
          return h("div", [
            h("DatePicker", {
              props: {
                type: "datetimerange",
                placeholder: "请选择开始时间和结束时间",
              },
              style: {
                width: "350px",
              },
              on: {
                input: (val) => {
                  if (val[0]) {
                    this.openStartTime = val[0].getTime();
                  }
                  if (val[1]) {
                    this.openEndTime = val[1].getTime();
                  }
                },
              },
            }),
          ]);
        },
      });
    },
    close(v) {
      this.$Modal.confirm({
        title: "确认关闭",
        content: "您确认要关闭此拼团活动?",
        loading: true,
        onOk: () => {
          closePintuan(v.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("关闭活动成功");
              this.getDataList();
            }
          });
        },
      });
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除此拼团活动?",
        loading: true,
        onOk: () => {
          // 删除
          deletePintuan(v.id).then((res) => {
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
  activated() {
    this.init();
  },
};
</script>
<style lang="scss">
@import "pintuan.scss";
@import "@/styles/table-common.scss";
</style>
