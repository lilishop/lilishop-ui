<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchForm"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="订单号" prop="orderSn">
          <el-input
            v-model="searchForm.orderSn"
            placeholder="请输入订单号"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="会员名称" prop="buyerName">
          <el-input
            v-model="searchForm.buyerName"
            placeholder="请输入会员名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker
            v-model="selectDate"
            type="datetimerange"
            value-format="YYYY-MM-DD"
            clearable
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            placeholder="选择起始时间"
            style="width: 240px"
            @change="selectDateRange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <div class="order-tab">
        <el-tabs v-model="currentStatus" @tab-click="onStatusTabClick">
          <el-tab-pane
            v-for="(item, index) in orderStatus"
            :key="index"
            :label="item.title"
            :name="item.value"
          />
        </el-tabs>
      </div>

      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        class="mt_10"
        style="width: 100%"
        @sort-change="changeSort"
      >
        <el-table-column prop="sn" label="订单号" min-width="230" show-overflow-tooltip />
        <el-table-column prop="createTime" label="下单时间" width="200" />
        <el-table-column label="订单来源" width="95">
          <template #default="{ row }">
            <span v-if="row">
              <span v-if="row.clientType == 'H5'">移动端</span>
              <span v-else-if="row.clientType == 'PC'">PC端</span>
              <span v-else-if="row.clientType == 'WECHAT_MP'">小程序端</span>
              <span v-else-if="row.clientType == 'APP'">移动应用端</span>
              <span v-else>{{ row.clientType }}</span>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="memberName" label="会员名称" width="130" />
        <el-table-column label="订单金额" prop="flowPrice" min-width="120" sortable="custom">
          <template #default="{ row }">
            <priceColorScheme v-if="row" :value="row.flowPrice" :color="$mainColor" />
          </template>
        </el-table-column>
        <el-table-column label="订单状态" width="95">
          <template #default="{ row }">
            <template v-if="row">
              <el-tag v-if="row.orderStatus == 'UNPAID'" type="danger">未付款</el-tag>
              <el-tag v-else-if="row.orderStatus == 'PAID'" type="primary">已付款</el-tag>
              <el-tag v-else-if="row.orderStatus == 'COMPLETED'" type="success">已完成</el-tag>
              <el-tag v-else-if="row.orderStatus == 'TAKE'" type="warning">待核验</el-tag>
              <el-tag v-else-if="row.orderStatus == 'CANCELLED'" type="info">已关闭</el-tag>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <template v-if="row">
              <a
                class="link-text"
                :class="{ disabled: row.orderStatus != 'UNPAID' }"
                @click="row.orderStatus == 'UNPAID' && confirmPrice(row)"
              >收款</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="detail(row)">查看</a>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="changePage"
          @size-change="changePageSize"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import * as API_Order from "@/api/order";
export default {
  name: "fictitiousOrderList",
  data() {
    return {
      loading: true,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "",
        order: "",
        startDate: "",
        endDate: "",
        orderType: "VIRTUAL",
        orderSn: "",
        buyerName: "",
        orderStatus: "",
      },
      selectDate: null,
      data: [],
      total: 0,
      orderStatus: [
        { title: "全部", value: "" },
        { title: "未付款", value: "UNPAID" },
        { title: "已付款", value: "PAID" },
        { title: "待核验", value: "TAKE" },
        { title: "已完成", value: "COMPLETED" },
        { title: "已关闭", value: "CANCELLED" },
      ],
      currentStatus: "",
    };
  },
  methods: {
    init() {
      this.getDataList();
    },
    changePage() {
      this.getDataList();
    },
    changePageSize() {
      this.searchForm.pageNumber = 1;
      this.getDataList();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 20;
      this.getDataList();
    },
    changeSort(e) {
      this.searchForm.sort = e.prop;
      this.searchForm.order = e.order === "ascending" ? "asc" : e.order === "descending" ? "desc" : "";
      this.getDataList();
    },
    selectDateRange(v) {
      if (v) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      }
    },
    getDataList() {
      this.loading = true;
      API_Order.getOrderList(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    confirmPrice(v) {
      this.$Modal.confirm({
        title: "确认收款",
        content: "您确定要收款吗？",
        loading: true,
        onOk: () => {
          API_Order.orderPay(v.sn).then((res) => {
            if (res.success) {
              this.$Message.success("收款成功");
              this.getDataList();
            }
            this.$Modal.remove();
          });
        },
      });
    },
    detail(v) {
      let sn = v.sn;
      this.$filters.customRouterPush({
        name: "order-detail",
        query: { sn: sn, orderType: v.orderType },
      });
    },
    onStatusTabClick(tab) {
      const item = tab.paneName;
      this.currentStatus = item;
      this.searchForm.orderStatus = item;
      this.getDataList();
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style lang="scss" scoped>
.order-tab {
  margin-top: 20px;
}
</style>
