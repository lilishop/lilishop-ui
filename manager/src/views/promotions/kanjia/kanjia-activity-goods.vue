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
        <el-form-item label="商品名称" prop="goodsName">
          <el-input
            v-model="searchForm.goodsName"
            placeholder="请输入商品名称"
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
      <div class="operation padding-row">
        <el-button type="primary" @click="add">添加砍价</el-button>
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
        <el-table-column label="商品名称" min-width="200" show-overflow-tooltip>
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
        <el-table-column label="库存数量" width="100">
          <template #default="{ row }">
            <span v-if="row">{{ row.stock }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="剩余活动库存" width="120" />
        <el-table-column label="每人最低砍" min-width="110">
          <template #default="{ row }">
            <span v-if="row">{{ $filters.unitPrice(row.lowestPrice, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="每人最高砍" min-width="110">
          <template #default="{ row }">
            <span v-if="row">{{ $filters.unitPrice(row.highestPrice, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结算价格" min-width="110">
          <template #default="{ row }">
            <span v-if="row" :style="{ color: $mainColor }">
              {{ $filters.unitPrice(row.settlementPrice, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="活动开始时间" min-width="160">
          <template #default="{ row }">
            <template v-if="row">
              <div>{{ row.startTime }}</div>
              <div>{{ row.endTime }}</div>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row" :type="promotionStatusTagType(row.promotionStatus)">
              {{ promotionStatusText(row.promotionStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <a
                v-if="row.promotionStatus === 'CLOSE' || row.promotionStatus === 'NEW'"
                class="link-text"
                @click="edit(row)"
              >
                编辑
              </a>
              <a v-else class="link-text" @click="edit(row, 'onlyView')">查看</a>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <div class="page mt_10" style="display: flex; justify-content: flex-end">
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
import { getKanJiaGoodsList, delKanJiaGoods } from "@/api/promotion";
import vueQr from "vue-qr";

export default {
  name: "kanjia-activity-goods",
  components: { vueQr },
  data() {
    return {
      selectDate: [],
      loading: true,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
        goodsName: "",
        promotionStatus: "",
      },
      data: [],
      total: 0,
      selectList: [],
      selectCoupon: [],
    };
  },
  watch: {
    $route(to) {
      if (to.fullPath == "/promotions/manager-coupon") {
        this.init();
      }
    },
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
    check() {
      this.$emit("selected", this.selectCoupon);
    },
    init() {
      this.getDataList();
    },
    add() {
      this.$router.push({ name: "add-kanJia-activity-goods" });
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
    changeSort({ prop, order }) {
      if (!order) {
        this.searchForm.sort = "createTime";
        this.searchForm.order = "desc";
      } else {
        this.searchForm.sort = prop;
        this.searchForm.order = order === "ascending" ? "asc" : "desc";
      }
      this.getDataList();
    },
    getDataList() {
      this.loading = true;
      if (this.selectDate && this.selectDate[0] && this.selectDate[1]) {
        this.searchForm.startTime = new Date(this.selectDate[0]).getTime();
        this.searchForm.endTime = new Date(this.selectDate[1]).getTime();
      } else {
        this.searchForm.startTime = null;
        this.searchForm.endTime = null;
      }
      getKanJiaGoodsList(this.searchForm)
        .then((res) => {
          if (res.success) {
            this.data = res.result.records;
            this.total = res.result.total;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    edit(v, type) {
      const data = { id: v.id };
      if (type) data.onlyView = true;
      this.$router.push({
        name: "edit-kanJia-activity-goods",
        query: data,
      });
    },
    delAll(row) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "确认需要删除此砍价商品",
        loading: true,
        onOk: () => {
          delKanJiaGoods(row.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("删除成功");
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
.mr_10 {
  margin-right: 10px;
}
.hover-pointer {
  cursor: pointer;
  vertical-align: middle;
}
.padding-row {
  margin-bottom: 10px;
}
.mt_10 {
  margin-top: 10px;
}
</style>
