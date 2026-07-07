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
        <el-form-item label="订单编号" prop="orderSn">
          <el-input
            v-model="searchForm.orderSn"
            placeholder="请输入订单编号"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="会员名称" prop="memberName">
          <el-input
            v-model="searchForm.memberName"
            placeholder="请输入会员名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 240px">
            <el-option label="新投诉" value="NEW" />
            <el-option label="已撤销" value="CANCEL" />
            <el-option label="待申诉" value="WAIT_APPEAL" />
            <el-option label="对话中" value="COMMUNICATION" />
            <el-option label="等待仲裁" value="WAIT_ARBITRATION" />
            <el-option label="已完成" value="COMPLETE" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table v-loading="loading" border :data="data" ref="table" class="mt_10" style="width: 100%">
        <el-table-column prop="memberName" label="会员名称" width="200" />
        <el-table-column prop="orderSn" label="订单编号" min-width="120" show-overflow-tooltip />
        <el-table-column label="商品名称" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <template v-if="row">
              <a class="link-text mr_10" @click="linkTo(row.goodsId, row.skuId)">{{ row.goodsName }}</a>
              <el-popover trigger="hover" title="扫码在手机中查看" placement="top" width="180">
                <template #reference>
                  <img
                    src="../../../assets/qrcode.svg"
                    class="hover-pointer"
                    width="20"
                    height="20"
                    alt="qrcode"
                  />
                </template>
                <vue-qr
                  :text="wapLinkTo(row.goodsId, row.skuId)"
                  :margin="0"
                  color-dark="#000"
                  color-light="#fff"
                  :size="150"
                />
              </el-popover>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="complainTopic" label="投诉主题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="createTime" label="投诉时间" width="180" />
        <el-table-column label="投诉状态" width="110">
          <template #default="{ row }">
            <el-tag v-if="row" :type="complainStatusTagType(row.complainStatus)">
              {{ complainStatusText(row.complainStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <a v-if="row" class="link-text" @click="detail(row)">
              {{ row.complainStatus === "COMPLETE" ? "详情" : "处理" }}
            </a>
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
import vueQr from "vue-qr";

export default {
  name: "orderComplaint",
  components: { vueQr },
  data() {
    return {
      loading: true,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
      },
      data: [],
      total: 0,
    };
  },
  watch: {
    $route() {
      this.getDataList();
    },
  },
  methods: {
    complainStatusText(v) {
      const map = {
        NEW: "新投诉",
        CANCEL: "已撤销",
        WAIT_APPEAL: "待申诉",
        COMMUNICATION: "对话中",
        WAIT_ARBITRATION: "等待仲裁",
        COMPLETE: "已完成",
      };
      return map[v] || v || "-";
    },
    complainStatusTagType(v) {
      const map = {
        NEW: "primary",
        CANCEL: "info",
        WAIT_APPEAL: "warning",
        COMMUNICATION: "warning",
        WAIT_ARBITRATION: "",
        COMPLETE: "success",
      };
      return map[v] || "info";
    },
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
      API_Order.getOrderComplain(this.searchForm)
        .then((res) => {
          this.loading = false;
          if (res.success) {
            this.data = res.result.records;
            this.total = res.result.total;
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    detail(v) {
      this.$filters.customRouterPush({
        name: "order-complaint-detail",
        query: { id: v.id },
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style scoped>
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
.mr_10 {
  margin-right: 10px;
}
.hover-pointer {
  cursor: pointer;
  vertical-align: bottom;
}
</style>
