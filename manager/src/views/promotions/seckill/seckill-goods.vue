<template>
  <div class="seckill-goods">
    <el-card>
      <el-table border :data="data" style="width: 100%">
        <el-table-column prop="promotionName" label="活动名称" min-width="120" />
        <el-table-column prop="startTime" label="活动开始时间" min-width="160" />
        <el-table-column label="报名截止时间" min-width="160">
          <template #default="{ row }">
            <span v-if="row">{{ unixDate(row.applyEndTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="时间场次" min-width="160">
          <template #default="{ row }">
            <template v-if="row">
              <el-tag v-for="item in unixHours(row.hours)" :key="item" class="hour-tag">{{ item }}</el-tag>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="活动状态" min-width="100">
          <template #default="{ row }">
            <el-tag v-if="row" :type="seckillStatusTagType(row.promotionStatus)">
              {{ seckillStatusText(row.promotionStatus) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-table
        ref="table"
        v-loading="loading"
        border
        class="operation"
        :data="goodsList"
        style="width: 100%"
      >
        <el-table-column prop="goodsName" label="商品名称" min-width="120" show-overflow-tooltip />
        <el-table-column label="商品价格" width="110">
          <template #default="{ row }">
            <span v-if="row" :style="{ color: $mainColor }">
              {{ $filters.unitPrice(row.originalPrice, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="库存" width="90">
          <template #default="{ row }">
            <span v-if="row">{{ row.quantity }}</span>
          </template>
        </el-table-column>
        <el-table-column label="活动价格" width="100">
          <template #default="{ row }">
            <span v-if="row" :style="{ color: $mainColor }">
              {{ $filters.unitPrice(row.price, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="storeName" label="商家名称" min-width="100" show-overflow-tooltip />
        <el-table-column label="活动场次" width="100">
          <template #default="{ row }">
            <el-tag v-if="row">{{ row.timeLine + ":00" }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row, $index }">
            <a v-if="row" class="link-text" @click="delGoods($index, row)">删除</a>
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
import {
  seckillGoodsList,
  seckillDetail,
  delSeckillGoods,
} from "@/api/promotion.js";

export default {
  data() {
    return {
      promotionStatus: "",
      loading: false,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
      },
      total: 0,
      data: [],
      goodsList: [],
    };
  },
  methods: {
    seckillStatusText(status) {
      const map = {
        NEW: "新建",
        START: "开始",
        END: "结束",
        CLOSE: "废弃",
      };
      return map[status] || status || "-";
    },
    seckillStatusTagType(status) {
      const map = {
        NEW: "danger",
        START: "success",
        END: "danger",
        CLOSE: "danger",
      };
      return map[status] || "danger";
    },
    init() {
      this.getSeckillMsg();
    },
    changePage() {
      this.getDataList();
    },
    changePageSize() {
      this.searchForm.pageNumber = 1;
      this.getDataList();
    },
    getDataList() {
      this.loading = true;
      this.searchForm.seckillId = this.$route.query.id;
      seckillGoodsList(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success && res.result) {
          this.goodsList = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    getSeckillMsg() {
      seckillDetail(this.$route.query.id).then((res) => {
        if (res.success && res.result) {
          this.data = [];
          this.data.push(res.result);
          this.promotionStatus = res.result.promotionStatus;
          this.getDataList();
        }
      });
    },
    delGoods(index, row) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除该商品吗?删除后不可恢复",
        onOk: () => {
          const params = {
            seckillId: row.seckillId,
            id: row.id,
          };
          delSeckillGoods(params).then((res) => {
            if (res.success) {
              this.goodsList.splice(index, 1);
              this.$Message.success("删除成功！");
            }
          });
        },
      });
    },
    unixDate(time) {
      return this.$filters.unixToDate(new Date(time) / 1000);
    },
    unixHours(item) {
      const hourArr = item.split(",");
      for (let i = 0; i < hourArr.length; i++) {
        hourArr[i] += ":00";
      }
      return hourArr;
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style lang="scss" scoped>
.operation {
  margin: 10px 0;
}

.hour-tag {
  margin-right: 4px;
  margin-bottom: 4px;
}

.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}

.mt_10 {
  margin-top: 10px;
}
</style>
