<template>
  <div class="search full-cut">
    <el-card>
      <el-form
        ref="searchForm"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="活动名称" prop="promotionName">
          <el-input
            v-model="searchForm.promotionName"
            placeholder="请输入活动名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="活动状态" prop="promotionStatus">
          <el-select
            v-model="searchForm.promotionStatus"
            placeholder="请选择"
            clearable
            style="width: 240px"
          >
            <el-option label="未开始" value="NEW" />
            <el-option label="已开始/上架" value="START" />
            <el-option label="已结束/下架" value="END" />
            <el-option label="紧急关闭/作废" value="CLOSE" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动时间">
          <el-date-picker
            v-model="selectDate"
            type="daterange"
            clearable
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        class="mt_10"
        style="width: 100%"
      >
        <el-table-column prop="promotionName" label="活动名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="startTime" label="开始时间" width="170" />
        <el-table-column prop="endTime" label="结束时间" width="170" />
        <el-table-column prop="storeName" label="店铺名称" min-width="100" show-overflow-tooltip />
        <el-table-column label="活动类型" min-width="80">
          <template #default="{ row }">
            <span v-if="row">{{ row.fullMinusFlag ? "满减" : "满折" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="活动状态" min-width="100">
          <template #default="{ row }">
            <el-tag v-if="row" :type="promotionStatusTagType(row.promotionStatus)">
              {{ promotionStatusText(row.promotionStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="140" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <a class="link-text" @click="view(row)">查看</a>
              <template v-if="row.promotionStatus === 'NEW' || row.promotionStatus === 'START'">
                <span class="op-split">|</span>
                <a class="link-text" @click="openOrClose(row)">关闭</a>
              </template>
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
import { getFullDiscountList, updateFullDiscount } from "@/api/promotion.js";

export default {
  data() {
    return {
      selectDate: [],
      total: 0,
      loading: false,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
      },
      data: [],
    };
  },
  methods: {
    promotionStatusText(status) {
      const map = {
        NEW: "未开始",
        START: "已开始",
        END: "已结束",
        CLOSE: "已关闭",
      };
      return map[status] || "未知";
    },
    promotionStatusTagType(status) {
      const map = {
        NEW: "info",
        START: "success",
        END: "danger",
        CLOSE: "danger",
      };
      return map[status] || "danger";
    },
    init() {
      this.getDataList();
    },
    openOrClose(row) {
      let name = "开启";
      if (row.promotionStatus === "NEW" || row.promotionStatus === "START") {
        name = "关闭";
        this.$Modal.confirm({
          title: "提示",
          content: `确认${name}此活动吗?需要一定时间才能生效，请耐心等待`,
          loading: true,
          onOk: () => {
            updateFullDiscount(row.id).then((res) => {
              this.$Modal.remove();
              if (res.success) {
                this.$Message.success(`${name}成功`);
                this.getDataList();
              }
            });
          },
        });
      }
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
      this.$router.push({ name: "full-discount-detail", query: { id: row.id } });
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style lang="scss" scoped>
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}

.op-split {
  margin: 0 8px;
  color: #dcdfe6;
}

.mt_10 {
  margin-top: 10px;
}
</style>
