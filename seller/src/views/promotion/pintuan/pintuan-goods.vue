<template>
  <div class="pintuan-goods">
    <el-card>
      <h4>活动详情</h4>
      <el-table border :data="data" style="width: 100%; margin: 10px 0">
        <el-table-column prop="promotionName" label="活动名称" min-width="120" />
        <el-table-column prop="startTime" label="活动开始时间" min-width="160" />
        <el-table-column prop="endTime" label="活动结束时间" min-width="160" />
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

      <h4>活动商品</h4>
      <template v-if="!readonly">
        <div class="operation">
          <el-button type="primary" @click="openSkuList">选择商品</el-button>
          <el-button @click="delAll">批量删除</el-button>
          <el-button @click="getDataList">刷新</el-button>
        </div>
        <el-alert v-if="selectCount > 0" type="info" show-icon :closable="false" class="select-alert">
          已选择 <span>{{ selectCount }}</span> 项
          <a class="select-clear" @click="clearSelectAll">清空</a>
        </el-alert>
        <el-table
          ref="table"
          v-loading="loading"
          border
          :data="goodsData"
          style="width: 100%"
          @selection-change="changeSelect"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column prop="goodsName" label="商品名称" min-width="140" show-overflow-tooltip />
          <el-table-column prop="quantity" label="库存" width="90" />
          <el-table-column label="拼团价格" width="160">
            <template #default="{ row, $index }">
              <el-input-number
                v-if="row"
                v-model="row.price"
                :min="promotionPriceMin(row.goodsType)"
                :precision="2"
                controls-position="right"
                size="small"
                @change="(val) => updateGoodsPrice($index, val)"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90" align="center">
            <template #default="{ $index }">
              <a class="link-text" @click="delGoods($index)">删除</a>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <template v-else>
        <el-table
          ref="table"
          v-loading="loading"
          border
          :data="goodsData"
          style="width: 100%"
        >
          <el-table-column label="商品名称" min-width="140">
            <template #default="{ row }">
              <template v-if="row">
                <a class="link-text mr_10" @click="linkTo(row.goodsId, row.skuId)">{{ row.goodsName }}</a>
                <el-popover trigger="hover" title="扫码在手机中查看" placement="top" width="180">
                  <template #reference>
                    <img
                      src="../../../assets/qrcode.svg"
                      class="hover-pointer qrcode-icon"
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
          <el-table-column prop="quantity" label="库存" width="90" />
          <el-table-column label="拼团价格" width="120">
            <template #default="{ row }">
              <span v-if="row" :style="{ color: $mainColor }">
                {{ $filters.unitPrice(row.price, "￥") }}
              </span>
            </template>
          </el-table-column>
        </el-table>

        <div class="mt_10" style="display: flex; justify-content: flex-end">
          <el-pagination
            v-model:current-page="searchForm.pageNumber"
            v-model:page-size="searchForm.pageSize"
            :page-sizes="[10, 20, 50]"
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
        <el-button v-if="!readonly" type="primary" :loading="submitLoading" @click="save">
          提交
        </el-button>
      </div>
    </el-card>

    <liliDialog ref="liliDialog" @selectedGoodsData="selectedGoodsData" />
  </div>
</template>

<script>
import { getPintuanGoodsList, getPintuanDetail, editPintuan } from "@/api/promotion.js";
import liliDialog from "@/views/lili-dialog";
import vueQr from "vue-qr";
import { promotionPriceMin } from "@/constants/goodsType";

export default {
  components: { liliDialog, vueQr },
  data() {
    return {
      loading: false,
      submitLoading: false,
      promotionStatus: "",
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
      },
      data: [],
      total: 0,
      goodsData: [],
      selectList: [],
      selectCount: 0,
    };
  },
  computed: {
    readonly() {
      return this.$route.query.status === "view" || this.promotionStatus !== "NEW";
    },
  },
  methods: {
    promotionPriceMin,
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
    closeCurrentPage() {
      this.$router.back();
    },
    init() {
      this.getPintuanMsg();
    },
    changePage() {
      this.getDataList();
    },
    changePageSize() {
      this.searchForm.pageNumber = 1;
      this.getDataList();
    },
    getPintuanMsg() {
      getPintuanDetail(this.$route.query.id).then((res) => {
        if (res.success && res.result) {
          this.data = [res.result];
          this.promotionStatus = res.result.promotionStatus;
          this.getDataList();
        }
      });
    },
    getDataList() {
      this.loading = true;
      const params = {
        pintuanId: this.$route.query.id,
        pageNumber: this.readonly ? this.searchForm.pageNumber : 1,
        pageSize: this.readonly ? this.searchForm.pageSize : 1000,
      };
      getPintuanGoodsList(params).then((res) => {
        this.loading = false;
        if (res.success && res.result) {
          const serverRecords = res.result.records || [];
          this.goodsData = this.readonly
            ? serverRecords
            : this.mergeGoodsData(serverRecords);
          this.total = res.result.total || 0;
        }
      });
    },
    mergeGoodsData(serverRecords) {
      const localMap = new Map(this.goodsData.map((item) => [item.skuId, item]));
      const serverSkuIds = new Set(serverRecords.map((item) => item.skuId));

      const merged = serverRecords.map((serverItem) => {
        const local = localMap.get(serverItem.skuId);
        return local ? { ...serverItem, price: local.price } : serverItem;
      });

      const unsavedItems = this.goodsData.filter(
        (item) => item.skuId && !serverSkuIds.has(item.skuId)
      );
      return [...merged, ...unsavedItems];
    },
    openSkuList() {
      const data = JSON.parse(JSON.stringify(this.goodsData));
      data.forEach((e) => {
        e.id = e.skuId;
      });
      this.$refs.liliDialog.goodsData = data;
      this.$refs.liliDialog.open("goods");
    },
    selectedGoodsData(selected) {
      const existingMap = new Map(this.goodsData.map((item) => [item.skuId, item]));
      this.goodsData = selected.map((item) => {
        const existed = existingMap.get(item.id);
        if (existed) {
          return existed;
        }
        return {
          goodsName: item.goodsName,
          price: item.price,
          originalPrice: item.price,
          quantity: item.quantity,
          storeId: item.storeId,
          sellerName: item.sellerName,
          thumbnail: item.thumbnail,
          skuId: item.id,
          categoryPath: item.categoryPath,
          goodsId: item.goodsId,
          goodsType: item.goodsType,
        };
      });
      this.clearSelectAll();
    },
    updateGoodsPrice(index, value) {
      if (this.goodsData[index]) {
        this.goodsData[index].price = value;
      }
    },
    changeSelect(selection) {
      this.selectList = selection;
      this.selectCount = selection.length;
    },
    clearSelectAll() {
      this.$refs.table?.clearSelection();
      this.selectList = [];
      this.selectCount = 0;
    },
    delGoods(index) {
      this.goodsData.splice(index, 1);
      this.selectCount = 0;
    },
    delAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要删除的数据");
        return;
      }
      this.$Modal.confirm({
        title: "确认删除",
        content: `您确认要删除所选 ${this.selectCount} 项数据?`,
        onOk: () => {
          const ids = this.selectList.map((e) => e.skuId);
          this.goodsData = this.goodsData.filter((item) => !ids.includes(item.skuId));
          this.clearSelectAll();
        },
      });
    },
    save() {
      if (!this.goodsData.length) {
        this.$Message.warning("请选择活动商品");
        return;
      }
      for (const item of this.goodsData) {
        if (item.price === "" || item.price === null || item.price === undefined) {
          this.$Message.warning(`请填写【${item.goodsName}】的价格`);
          return;
        }
      }
      const params = JSON.parse(JSON.stringify(this.data[0]));
      params.promotionGoodsList = this.goodsData.map((item) => ({
        ...item,
        promotionId: params.id,
        startTime: params.startTime,
        endTime: params.endTime,
      }));
      this.submitLoading = true;
      editPintuan(params).then((res) => {
        this.submitLoading = false;
        if (res.success) {
          this.$Message.success("修改拼团商品成功");
          this.closeCurrentPage();
        }
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

.operation {
  margin-bottom: 10px;
  display: flex;
  gap: 10px;
}

.select-alert {
  margin-bottom: 10px;

  .select-clear {
    margin-left: 12px;
    color: #409eff;
    cursor: pointer;
  }
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

.qrcode-icon {
  vertical-align: middle;
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
