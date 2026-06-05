<template>
  <div>
    <el-card>
      <el-form
        ref="searchForm"
        :model="searchForm"
        inline
        label-width="70px"
        class="search-form"
        @keyup.enter.prevent="handleSearch"
      >
        <el-form-item label="商品名称" prop="goodsName">
          <el-input
            v-model="searchForm.goodsName"
            placeholder="请输入商品名称"
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
      <div class="operation" style="margin: 10px 0">
        <el-button type="primary" @click="delAll">批量下架</el-button>
      </div>

      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        class="mt_10"
        style="width: 100%"
        @selection-change="changeSelect"
      >
        <el-table-column type="selection" width="55" align="center" fixed="left" />
        <el-table-column label="商品图片" width="120" align="center" fixed="left">
          <template #default="{ row }">
            <img
              v-if="row"
              :src="row.thumbnail || ''"
              alt="商品图"
              style="cursor: pointer; width: 80px; height: 60px; margin: 10px 0; object-fit: contain"
            />
          </template>
        </el-table-column>
        <el-table-column label="商品名称" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <template v-if="row">
              <div class="div-zoom">
                <a class="link-text" @click="linkTo(row.goodsId, row.skuId)">{{ row.goodsName }}</a>
              </div>
              <el-popover trigger="hover" title="扫码在手机中查看" placement="top" width="180">
                <template #reference>
                  <img
                    src="../../assets/qrcode.svg"
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
        <el-table-column label="商品价格" min-width="110">
          <template #default="{ row }">
            <span v-if="row" :style="{ color: $mainColor }">{{ $filters.unitPrice(row.price, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="库存" min-width="80" />
        <el-table-column prop="createTime" label="添加时间" min-width="160" />
        <el-table-column prop="storeName" label="店铺名称" min-width="120" show-overflow-tooltip />
        <el-table-column label="佣金金额" min-width="110">
          <template #default="{ row }">
            <span v-if="row" :style="{ color: $mainColor }">{{ $filters.unitPrice(row.commission, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="100" align="center" fixed="right">
          <template #default="{ row }">
            <a v-if="row" class="link-text" @click="remove(row)">下架</a>
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
import { delDistributionGoods, getDistributionGoods } from "@/api/distribution";
import vueQr from "vue-qr";

export default {
  name: "distributionGoods",
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
      selectList: [],
      selectCount: 0,
      data: [],
      total: 0,
    };
  },
  methods: {
    init() {
      this.getDataList();
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
      this.clearSelectAll();
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
    clearSelectAll() {
      this.$refs.table?.clearSelection();
    },
    changeSelect(e) {
      this.selectList = e;
      this.selectCount = e.length;
    },
    getDataList() {
      this.loading = true;
      getDistributionGoods(this.searchForm)
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
    remove(v) {
      this.$Modal.confirm({
        title: "确认下架",
        content: "您确认要下架么?",
        loading: true,
        onOk: () => {
          delDistributionGoods(v.id).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("下架成功");
              this.getDataList();
            }
          });
        },
      });
    },
    delAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要下架的数据");
        return;
      }
      this.$Modal.confirm({
        title: "确认下架",
        content: "您确认要下架所选的 " + this.selectCount + " 条数据?",
        loading: true,
        onOk: () => {
          const ids = this.selectList.map((item) => item.id);
          delDistributionGoods(ids.toString()).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("下架成功");
              this.clearSelectAll();
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
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}
.div-zoom {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}
.hover-pointer {
  cursor: pointer;
  vertical-align: middle;
}
.mt_10 {
  margin-top: 10px;
}
</style>
