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
        <el-form-item label="商品编号" prop="id">
          <el-input
            v-model="searchForm.id"
            placeholder="请输入商品编号"
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
      <el-table v-loading="loading" :data="data" ref="table" class="mt_10" style="width: 100%">
        <el-table-column label="商品名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div v-if="row" style="margin-top: 5px; height: 80px; display: flex; align-items: flex-start">
              <img
                v-if="row.original"
                :src="row.original"
                style="height: 60px; width: 60px; object-fit: cover; margin-top: 3px"
                alt=""
              />
              <div style="margin-left: 13px">
                <div class="div-zoom">
                  <a class="link-text">{{ row.goodsName }}</a>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="商品编号" min-width="120" show-overflow-tooltip />
        <el-table-column label="价格" min-width="120">
          <template #default="{ row }">
            <span v-if="row" :style="{ color: $mainColor }">{{ unitPrice(row.price, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" min-width="120">
          <template #default="{ row }">
            <el-tag v-if="row" :type="authFlagTagType(row.authFlag)">{{ authFlagText(row.authFlag) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="storeName" label="店铺名称" min-width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <a class="link-text" @click="examine(row, 1)">通过</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="examine(row, 2)">拒绝</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="showDetail(row)">查看</a>
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
import { authGoods, getAuthGoodsListData } from "@/api/goods";
import { ElMessage, ElMessageBox } from "element-plus";
import { unitPrice, customRouterPush } from "@/utils/filters";

export default {
  name: "goodsApply",
  data() {
    return {
      loading: true,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "create_time",
        order: "desc",
      },
      goodsAuditForm: {
        auth_flag: 1,
      },
      data: [],
      total: 0,
    };
  },
  methods: {
    unitPrice,
    authFlagText(v) {
      const map = {
        TOBEAUDITED: "待审核",
        PASS: "审核通过",
        REFUSE: "审核拒绝",
      };
      return map[v] || v || "-";
    },
    authFlagTagType(v) {
      const map = {
        TOBEAUDITED: "warning",
        PASS: "success",
        REFUSE: "danger",
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
      this.searchForm.authFlag = 0;
      getAuthGoodsListData(this.searchForm)
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
    examine(v, authFlag) {
      const examine = authFlag === 1 ? "通过" : "拒绝";
      this.goodsAuditForm.authFlag = authFlag === 1 ? "PASS" : "REFUSE";
      ElMessageBox.confirm(`您确认要审核${examine} ${v.goodsName} ?`, "确认审核", { type: "warning" }).then(() => {
        const formData = new FormData();
        formData.append("goodsIds", v.id);
        formData.append("authFlag", this.goodsAuditForm.authFlag);
        return authGoods(formData).then((res) => {
          if (res.success) {
            ElMessage.success("审核成功");
            this.getDataList();
          }
        });
      }).catch(() => {});
    },
    showDetail(v) {
      customRouterPush({
        name: "goods-detail",
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
.op-split {
  margin: 0 8px;
  color: #dcdee2;
}
.div-zoom {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
