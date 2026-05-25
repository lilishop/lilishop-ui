<template>
  <div class="pintuan-goods">
    <el-card>
      <h4>活动详情</h4>
      <el-table border :data="data" style="width: 100%; margin: 10px 0">
        <el-table-column prop="promotionName" label="活动名称" min-width="120" />
        <el-table-column prop="startTime" label="活动开始时间" min-width="120" />
        <el-table-column prop="endTime" label="活动结束时间" min-width="120" />
        <el-table-column prop="requiredNum" label="成团人数" min-width="90" />
        <el-table-column prop="limitNum" label="限购数量" min-width="90" />
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag v-if="row" :type="promotionStatusTagType(row.promotionStatus)">
              {{ promotionStatusText(row.promotionStatus) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <h4>商品信息</h4>
      <el-table
        ref="table"
        v-loading="loading"
        border
        class="operation"
        :data="goodsData"
        style="width: 100%"
      >
        <el-table-column label="商品名称" min-width="120">
          <template #default="{ row }">
            <template v-if="row">
              <a class="link-text mr_10" @click="linkTo(row.goodsId, row.skuId)">{{ row.goodsName }}</a>
              <el-popover trigger="hover" title="扫码在手机中查看" placement="top" width="180">
                <template #reference>
                  <img
                    src="../../../assets/qrcode.svg"
                    style="vertical-align: middle"
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
        <el-table-column prop="quantity" label="库存" min-width="80" />
        <el-table-column label="拼团价格" min-width="100">
          <template #default="{ row }">
            <span v-if="row" :style="{ color: $mainColor }">
              {{ $filters.unitPrice(row.price, "￥") }}</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="page operation mt_10" style="display: flex; justify-content: flex-end">
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
import { getPintuanGoodsList, getPintuanDetail } from "@/api/promotion.js";
import vueQr from "vue-qr";

export default {
  components: { vueQr },
  data() {
    return {
      loading: false,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
      },
      data: [],
      total: 0,
      goodsData: [],
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
      this.getPintuanMsg();
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
      this.searchForm.pintuanId = this.$route.query.id;
      getPintuanGoodsList(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.goodsData = res.result.records;
          this.total = res.result.total;
        }
      });
    },
    getPintuanMsg() {
      getPintuanDetail(this.$route.query.id).then((res) => {
        if (res.success) this.data.push(res.result);
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style lang="scss" scoped>
h4 {
  margin: 20px 0;
  padding: 0 10px;
  font-weight: bold;
  color: #333;
  font-size: 14px;
  text-align: left;
  border-left: 3px solid red;
}

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
}

.mt_10 {
  margin-top: 10px;
}
</style>
