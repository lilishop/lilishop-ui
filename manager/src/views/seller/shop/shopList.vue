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
        <el-form-item label="会员名称" prop="memberName">
          <el-input
            v-model="searchForm.memberName"
            placeholder="请输入会员名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="店铺名称" prop="storeName">
          <el-input
            v-model="searchForm.storeName"
            placeholder="请输入店铺名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="店铺状态">
          <el-select v-model="searchForm.storeDisable" clearable style="width: 240px">
            <el-option label="开启中" value="OPEN" />
            <el-option label="已关闭" value="CLOSED" />
            <el-option label="审核中" value="APPLYING" />
            <el-option label="审核拒绝" value="REFUSED" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间" prop="createTime">
          <el-date-picker
            v-model="selectDate"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            clearable
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 360px"
            @change="selectDateRange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <div class="operation padding-row">
        <el-button type="primary" @click="add">添加</el-button>
      </div>

      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        class="mt_10"
        style="width: 100%"
      >
        <el-table-column prop="storeName" label="店铺名称" min-width="120" align="left" />
        <el-table-column prop="memberName" label="会员名称" min-width="130" show-overflow-tooltip />
        <el-table-column label="店铺地址" width="300" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tag v-if="row" type="info">{{ row.storeAddressPath || "暂未填写" }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否自营" width="120" align="left">
          <template #default="{ row }">
            <span v-if="row">{{ row.selfOperated ? "自营" : "非自营" }}</span>
          </template>
        </el-table-column>
        <el-table-column label="店铺状态" width="130" align="left">
          <template #default="{ row }">
            <span v-if="row">{{ storeDisableText(row.storeDisable) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="goodsNum" label="上架商品数" width="110" align="center">
          <template #default="{ row }">
            <span v-if="row">{{ row.goodsNum ?? 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderNum" label="订单总数" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row">{{ row.orderNum ?? 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" align="left" />
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <template v-if="row.storeDisable === 'APPLYING'">
                <a class="link-text" @click="audit(row)">审核</a>
                <span class="op-split">|</span>
                <a class="link-text" @click="edit(row)">修改</a>
              </template>
              <template v-else>
                <a v-if="selectedShop" class="link-text" @click="callback(row)">选择</a>
                <span v-if="selectedShop" class="op-split">|</span>
                <a class="link-text" @click="detail(row)">查看</a>
                <span class="op-split">|</span>
                <a class="link-text" @click="edit(row)">修改</a>
                <template v-if="row.storeDisable === 'OPEN' || row.storeDisable === 'CLOSED'">
                  <span class="op-split">|</span>
                  <a v-if="row.storeDisable === 'OPEN'" class="link-text" @click="disable(row)">关闭</a>
                  <a v-else-if="row.storeDisable === 'CLOSED'" class="link-text" @click="enable(row)">开启</a>
                </template>
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
import { getShopListData, disableShop, enableBrand, shopAudit } from "@/api/shops";

export default {
  name: "shop",
  data() {
    return {
      loading: true,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "createTime",
        order: "desc",
        startDate: "",
        endDate: "",
      },
      selectDate: null,
      data: [],
      total: 0,
      selectedShop: false,
    };
  },
  methods: {
    storeDisableText(v) {
      const map = {
        OPEN: "开启中",
        CLOSED: "已关闭",
        APPLY: "申请中",
        APPLYING: "审核中",
        REFUSED: "审核拒绝",
      };
      return map[v] || v || "-";
    },
    callback(val) {
      this.$emit("callback", val);
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
    selectDateRange(v) {
      if (v && v.length === 2) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      } else {
        this.searchForm.startDate = "";
        this.searchForm.endDate = "";
      }
    },
    getDataList() {
      this.loading = true;
      getShopListData(this.searchForm)
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
    add() {
      this.$router.push({ path: "/shop-operation" });
    },
    edit(v) {
      this.$router.push({ path: "/shop-operation", query: { shopId: v.id } });
    },
    disable(v) {
      this.$Modal.confirm({
        title: "确认关闭",
        content: "您确认要关闭店铺 " + v.storeName + " ?",
        loading: true,
        onOk: () => {
          disableShop(v.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.getDataList();
            }
          });
        },
      });
    },
    detail(row) {
      this.$router.push({ name: "shop-detail", query: { id: row.id } });
    },
    audit(v) {
      this.$Modal.confirm({
        title: "审核店铺",
        content: "您确认要审核通过店铺 " + v.storeName + " ?",
        okText: "通过",
        cancelText: "驳回",
        loading: true,
        onOk: () => {
          shopAudit(v.id, 0).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.getDataList();
            }
          });
        },
        onCancel: () => {
          shopAudit(v.id, 1).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("操作成功");
              this.getDataList();
            }
          });
        },
      });
    },
    enable(v) {
      this.$Modal.confirm({
        title: "确认开启",
        content: "您确认要开启店铺 " + v.storeName + " ?",
        loading: true,
        onOk: () => {
          enableBrand(v.id).then((res) => {
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
