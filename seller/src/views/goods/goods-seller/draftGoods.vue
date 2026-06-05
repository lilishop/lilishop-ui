<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchForm"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form mb_10"
        @keyup.enter="handleSearch"
      >
        <el-form-item label="商品名称" prop="goodsName">
          <el-input v-model="searchForm.goodsName" placeholder="请输入商品名称" clearable style="width: 240px" />
        </el-form-item>
        <el-form-item label="商品编号" prop="id">
          <el-input v-model="searchForm.id" placeholder="商品编号" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <el-table v-loading="loading" border :data="data" ref="table" class="mt_10" style="width: 100%">
        <el-table-column prop="id" label="编号" min-width="120" />
        <el-table-column label="商品原图" width="120" align="center">
          <template #default="{ row }">
            <img
              :src="row.original"
              alt="加载图片失败"
              style="cursor: pointer; width: 80px; height: 60px; margin: 10px 0; object-fit: contain"
            />
          </template>
        </el-table-column>
        <el-table-column prop="goodsName" label="商品名称" min-width="120" show-overflow-tooltip />
        <el-table-column label="商品价格" width="120">
          <template #default="{ row }">
            <priceColorScheme :value="row.price || 0" :color="$mainColor" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="120" />
        <el-table-column label="操作" align="center" width="150">
          <template #default="{ row }">
            <a class="link-text" @click="editGoods(row)">编辑</a>
            <span class="op-split">|</span>
            <a class="link-text" @click="removeDraft(row.id)">删除</a>
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
    </el-card>
  </div>
</template>

<script>
import { getDraftGoodsListData, deleteDraftGoods } from "@/api/goods";

export default {
  name: "goods",
  data() {
    return {
      loading: true,
      searchForm: {
        pageNumber: 1,
        pageSize: 10,
        sort: "create_time",
        order: "desc",
        saveType: "TEMPLATE",
      },
      data: [],
      total: 0,
    };
  },
  methods: {
    init() {
      this.getDataList();
    },
    editGoods(v) {
      this.$router.push({
        name: "goods-template-operation-edit",
        query: { draftId: v.id },
      });
    },
    removeDraft(id) {
      this.$Modal.confirm({
        title: "确认审核",
        content: "您确认要删除id为 " + id + " 的模版吗?",
        loading: true,
        onOk: () => {
          deleteDraftGoods(id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("删除成功");
              this.getDataList();
            }
          });
        },
      });
    },
    changePage() {
      this.getDataList();
    },
    changePageSize() {
      this.getDataList();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getDataList();
    },
    handleReset() {
      this.$refs.searchForm.resetFields();
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getDataList();
    },
    getDataList() {
      this.loading = true;
      getDraftGoodsListData(this.searchForm).then((res) => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.records;
          this.total = res.result.total;
        }
      });
    },
  },
  mounted() {
    this.init();
  },
  watch: {
    $route() {
      this.init();
    },
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
  color: #dcdee2;
}
</style>
