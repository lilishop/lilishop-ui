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

      <template v-if="!readonly">
        <div class="operation">
          <el-button type="primary" @click="openSkuList">选择商品</el-button>
        </div>
        <el-tabs v-model="tabCurrent" type="card" class="operation">
          <el-tab-pane
            v-for="(tab, tabIndex) in goodsList"
            :key="tabIndex"
            :label="tab.hour"
            :name="String(tabIndex)"
          >
            <el-table
              v-loading="loading"
              border
              :data="tab.list"
              style="width: 100%"
            >
              <el-table-column prop="goodsName" label="商品名称" min-width="140" show-overflow-tooltip />
              <el-table-column label="商品价格" width="110">
                <template #default="{ row }">
                  <span v-if="row" :style="{ color: $mainColor }">
                    {{ $filters.unitPrice(row.originalPrice, "￥") }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="库存" width="130">
                <template #default="{ row, $index }">
                  <el-input-number
                    v-if="row"
                    v-model="row.quantity"
                    :min="1"
                    :disabled="row.promotionApplyStatus === 'PASS'"
                    controls-position="right"
                    size="small"
                    @change="(val) => updateGoodsField(tabIndex, $index, 'quantity', val)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="活动价格" width="140">
                <template #default="{ row, $index }">
                  <el-input-number
                    v-if="row"
                    v-model="row.price"
                    :min="promotionPriceMin(row.goodsType)"
                    :precision="2"
                    :disabled="row.promotionApplyStatus === 'PASS'"
                    controls-position="right"
                    size="small"
                    @change="(val) => updateGoodsField(tabIndex, $index, 'price', val)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="状态" width="120">
                <template #default="{ row }">
                  <template v-if="row">
                    <el-tag :type="applyStatusTagType(row.promotionApplyStatus)" size="small">
                      {{ applyStatusText(row.promotionApplyStatus) }}
                    </el-tag>
                    <a
                      v-if="row.promotionApplyStatus === 'REFUSE' && row.failReason"
                      class="reason link-text"
                      @click="showReason(row.failReason)"
                    >
                      拒绝原因
                    </a>
                  </template>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="90" align="center">
                <template #default="{ row, $index }">
                  <a v-if="row" class="link-text" @click="delGoods(tabIndex, $index, row)">删除</a>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </template>

      <template v-else>
        <el-table
          ref="table"
          v-loading="loading"
          border
          class="operation"
          :data="readonlyGoodsList"
          style="width: 100%"
        >
          <el-table-column prop="goodsName" label="商品名称" min-width="140" show-overflow-tooltip />
          <el-table-column label="商品价格" width="110">
            <template #default="{ row }">
              <span v-if="row" :style="{ color: $mainColor }">
                {{ $filters.unitPrice(row.originalPrice, "￥") }}
              </span>
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
                {{ $filters.unitPrice(row.price, "￥") }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="活动场次" width="100">
            <template #default="{ row }">
              <el-tag v-if="row">{{ row.timeLine }}:00</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag v-if="row" :type="applyStatusTagType(row.promotionApplyStatus)" size="small">
                {{ applyStatusText(row.promotionApplyStatus) }}
              </el-tag>
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
      </template>

      <div class="foot-btn">
        <el-button @click="closeCurrentPage">返回</el-button>
        <el-button
          v-if="!readonly"
          type="primary"
          :loading="submitLoading"
          @click="save"
        >
          提交
        </el-button>
      </div>
    </el-card>

    <liliDialog ref="liliDialog" @selectedGoodsData="selectedGoodsData" />
  </div>
</template>

<script>
import {
  seckillGoodsList,
  seckillDetail,
  setSeckillGoods,
  delSeckillGoods,
} from "@/api/promotion.js";
import liliDialog from "@/views/lili-dialog";
import { promotionPriceMin } from "@/constants/goodsType";

export default {
  components: {
    liliDialog,
  },
  data() {
    return {
      tabCurrent: "0",
      promotionStatus: "",
      loading: false,
      submitLoading: false,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
      },
      total: 0,
      data: [],
      goodsList: [],
      readonlyGoodsList: [],
    };
  },
  computed: {
    readonly() {
      return this.$route.query.mode === "view" || this.promotionStatus !== "NEW";
    },
    tabIndex() {
      return Number(this.tabCurrent) || 0;
    },
  },
  methods: {
    promotionPriceMin,
    seckillStatusText(status) {
      const map = {
        NEW: "未开始",
        START: "已开始",
        END: "已结束",
        CLOSE: "已关闭",
      };
      return map[status] || status || "-";
    },
    seckillStatusTagType(status) {
      const map = {
        NEW: "info",
        START: "success",
        END: "danger",
        CLOSE: "danger",
      };
      return map[status] || "danger";
    },
    applyStatusText(status) {
      const map = {
        APPLY: "申请中",
        PASS: "已通过",
        REFUSE: "已拒绝",
      };
      return map[status] || "未申请";
    },
    applyStatusTagType(status) {
      const map = {
        APPLY: "warning",
        PASS: "success",
        REFUSE: "danger",
      };
      return map[status] || "info";
    },
    closeCurrentPage() {
      this.$router.back();
    },
    init() {
      this.getSeckillMsg();
    },
    changePage() {
      this.getReadonlyGoodsList();
    },
    changePageSize() {
      this.searchForm.pageNumber = 1;
      this.getReadonlyGoodsList();
    },
    getSeckillMsg() {
      seckillDetail(this.$route.query.id).then((res) => {
        if (res.success && res.result) {
          this.data = [res.result];
          this.promotionStatus = res.result.promotionStatus;
          if (this.readonly) {
            this.getReadonlyGoodsList();
          } else {
            this.getManageGoodsList();
          }
        }
      });
    },
    getManageGoodsList() {
      if (!this.data[0]?.hours) {
        return;
      }
      this.loading = true;
      const hourValues = this.data[0].hours.split(",");
      const hourLabels = this.unixHours(this.data[0].hours);
      this.goodsList = hourLabels.map((hour, index) => ({
        hour,
        timeLine: hourValues[index],
        list: [],
      }));

      seckillGoodsList({
        seckillId: this.$route.query.id,
        pageNumber: 1,
        pageSize: 1000,
      }).then((res) => {
        this.loading = false;
        if (res.success && res.result?.records?.length) {
          res.result.records.forEach((item) => {
            const slot = this.goodsList.find(
              (g) => String(g.timeLine) === String(item.timeLine)
            );
            if (slot) {
              slot.list.push(item);
            }
          });
        }
      });
    },
    getReadonlyGoodsList() {
      this.loading = true;
      this.searchForm.seckillId = this.$route.query.id;
      seckillGoodsList(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success && res.result) {
          this.readonlyGoodsList = res.result.records || [];
          this.total = res.result.total || 0;
        }
      });
    },
    openSkuList() {
      const existing = this.goodsList[this.tabIndex]?.list || [];
      this.$refs.liliDialog.goodsData = existing.map((item) => ({
        ...item,
        id: item.skuId || item.id,
      }));
      this.$refs.liliDialog.open("goods");
    },
    selectedGoodsData(selected) {
      const timeLine = this.goodsList[this.tabIndex]?.timeLine;
      if (timeLine === undefined) {
        return;
      }
      const existingMap = new Map(
        (this.goodsList[this.tabIndex].list || []).map((item) => [item.skuId, item])
      );
      const list = selected.map((item) => {
        const existed = existingMap.get(item.id);
        if (existed) {
          return existed;
        }
        return {
          goodsName: item.goodsName,
          price: item.price,
          originalPrice: item.price,
          promotionApplyStatus: item.promotionApplyStatus || "",
          quantity: item.quantity,
          seckillId: this.$route.query.id,
          storeId: item.storeId,
          storeName: item.storeName,
          skuId: item.id,
          timeLine,
          goodsType: item.goodsType,
        };
      });
      this.goodsList[this.tabIndex].list = list;
    },
    updateGoodsField(tabIndex, index, field, value) {
      if (this.goodsList[tabIndex]?.list?.[index]) {
        this.goodsList[tabIndex].list[index][field] = value;
      }
    },
    delGoods(tabIndex, index, row) {
      if (row.promotionApplyStatus === "PASS") {
        this.$Modal.confirm({
          title: "确认删除",
          content: "您确认要删除该商品吗？删除后不可恢复",
          onOk: () => {
            delSeckillGoods({
              seckillId: row.seckillId,
              id: row.id,
            }).then((res) => {
              if (res.success) {
                this.goodsList[tabIndex].list.splice(index, 1);
                this.$Message.success("删除成功");
              }
            });
          },
        });
        return;
      }
      this.goodsList[tabIndex].list.splice(index, 1);
      this.$Message.success("删除成功");
    },
    save() {
      const applyVos = [];
      this.goodsList.forEach((slot) => {
        slot.list.forEach((item) => {
          applyVos.push(item);
        });
      });
      if (!applyVos.length) {
        this.$Message.warning("请先选择活动商品");
        return;
      }
      this.submitLoading = true;
      setSeckillGoods({
        seckillId: this.$route.query.id,
        applyVos,
      }).then((res) => {
        this.submitLoading = false;
        if (res?.success) {
          this.$Message.success("提交活动商品成功");
          this.closeCurrentPage();
        }
      });
    },
    showReason(reason) {
      this.$Modal.info({
        title: "拒绝原因",
        content: reason,
      });
    },
    unixDate(time) {
      return this.$filters.unixToDate(new Date(time) / 1000);
    },
    unixHours(item) {
      if (!item) {
        return [];
      }
      return item.split(",").map((hour) => `${hour}:00`);
    },
  },
  mounted() {
    this.init();
  },
};
</script>

<style lang="scss" scoped>
.operation {
  margin: 16px 0 10px;
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

.reason {
  display: block;
  margin-top: 4px;
  font-size: 12px;
}

.foot-btn {
  margin-top: 16px;
  display: flex;
  gap: 10px;
}

.mt_10 {
  margin-top: 10px;
}
</style>
