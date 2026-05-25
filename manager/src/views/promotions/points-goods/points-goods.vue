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
        <el-form-item label="商品名称">
          <el-input
            v-model="searchForm.goodsName"
            placeholder="请输入商品名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="积分区间">
          <el-input
            v-model="searchForm.pointsS"
            placeholder="请输入开始区间"
            clearable
            style="width: 110px"
          />
          <span style="margin: 0 6px">-</span>
          <el-input
            v-model="searchForm.pointsE"
            placeholder="请输入结束区间"
            clearable
            style="width: 110px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.promotionStatus" clearable style="width: 240px">
            <el-option
              v-for="item in statusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="SKU编码">
          <el-input
            v-model="searchForm.skuId"
            placeholder="请输入SKU编码"
            clearable
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
        <el-button type="primary" @click="addPointsGoods">添加积分商品</el-button>
      </div>

      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        class="mt_10"
        style="width: 100%"
      >
        <el-table-column label="商品名称" min-width="200" fixed="left" show-overflow-tooltip>
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
        <el-table-column label="市场价" width="110">
          <template #default="{ row }">
            <span v-if="row" :style="{ color: $mainColor }">
              {{ $filters.unitPrice(row.originalPrice, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结算价" width="110">
          <template #default="{ row }">
            <span v-if="row" :style="{ color: $mainColor }">
              {{ $filters.unitPrice(row.settlementPrice, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="库存数量" width="100">
          <template #default="{ row }">
            <span v-if="row">{{ row.activeStock }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="activeStock" label="活动剩余库存" width="130" />
        <el-table-column prop="points" label="兑换积分" width="100" />
        <el-table-column prop="storeName" label="所属店铺" width="120" show-overflow-tooltip />
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
        <el-table-column prop="pointsGoodsCategoryName" label="分类" width="100" show-overflow-tooltip />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <a
                v-if="row.promotionStatus === 'CLOSE' || row.promotionStatus === 'NEW'"
                class="link-text"
                @click="edit(row.id)"
              >
                编辑
              </a>
              <template v-if="row.promotionStatus === 'START' || row.promotionStatus === 'NEW'">
                <span class="op-split">|</span>
                <a class="link-text" @click="statusChanged(row.id, 'CLOSE')">关闭</a>
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
import {
  getPointsGoodsList,
  editPointsGoodsStatus,
  deletePointsGoodsStatus,
} from "@/api/promotion";
import vueQr from "vue-qr";

export default {
  name: "pointsGoods",
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
      statusList: [
        { label: "未开始", value: "NEW" },
        { label: "已开始", value: "START" },
        { label: "已结束", value: "END" },
        { label: "已关闭", value: "CLOSE" },
      ],
      data: [],
      total: 0,
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
    addPointsGoods() {
      this.$router.push({ name: "add-points-goods" });
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
      if (this.searchForm.pointsS) {
        this.searchForm.points =
          this.searchForm.pointsS + "_" + (this.searchForm.pointsE ? this.searchForm.pointsE : "");
      }
      this.getDataList();
    },
    getDataList() {
      this.loading = true;
      getPointsGoodsList(this.searchForm)
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
    edit(id) {
      this.$router.push({ name: "edit-points-goods", query: { id } });
    },
    statusChanged(id, status, startTime, endTime) {
      let text = "";
      let params = {};
      if (status == "START") {
        text = "开启";
        params = { startTime, endTime };
      } else if (status == "CLOSE") {
        text = "关闭";
      }
      this.$Modal.confirm({
        title: "确认" + text,
        content: "您确认要" + text + "此积分商品?",
        loading: true,
        onOk: () => {
          editPointsGoodsStatus(id, params).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success(text + "成功");
              this.getDataList();
            }
          });
        },
      });
    },
    close(id) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除此积分商品?",
        loading: true,
        onOk: () => {
          deletePointsGoodsStatus(id).then((res) => {
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
  vertical-align: middle;
}
.op-split {
  margin: 0 8px;
  color: #dcdee2;
}
.padding-row {
  margin-bottom: 10px;
}
.mt_10 {
  margin-top: 10px;
}
</style>
