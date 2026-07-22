<template>
  <div class="search">
    <el-card>
      <div @keyup.enter="handleSearch">
        <el-form ref="searchForm" :model="searchForm" inline label-width="70px" class="search-form">
          <el-form-item label="商品名称" prop="goodsName">
            <el-input v-model="searchForm.goodsName" placeholder="请输入商品名称" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="商品编号" prop="goodsId">
            <el-input v-model="searchForm.goodsId" placeholder="请输入商品编号" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="searchForm.marketEnable" placeholder="请选择" clearable style="width: 200px">
              <el-option label="下架" value="DOWN" />
              <el-option label="上架" value="UPPER" />
            </el-select>
          </el-form-item>
          <el-form-item label="商品分类" prop="category">
            <el-cascader
              v-model="category"
              :options="categoryList"
              placeholder="请选择商品分类"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="货号" prop="sn">
            <el-input v-model="searchForm.sn" placeholder="请输入货号" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
            <el-button class="search-btn" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div>
        <div class="operation padding-row">
          <el-button type="primary" class="export" @click="exportStock">批量导出</el-button>
          <el-button class="export" @click="openImportStock">批量导入</el-button>
        </div>
        <el-table ref="table" v-loading="loading" border :data="stockAllData" class="mt_10" style="width: 100%">
          <el-table-column label="商品信息" min-width="400">
            <template #default="{ row }">
              <div style="margin-top: 5px; height: 90px; display: flex">
                <img :src="row.thumbnail" style="height: 80px; margin-top: 3px; width: 70px" alt="" />
                <div style="margin-left: 13px; margin-top: 5px">
                  <div class="div-zoom" style="color: black">{{ row.goodsName }}</div>
                  <div class="div-zoom" style="margin-top: 5px">ID: {{ row.goodsId }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="SKU信息" min-width="400">
            <template #default="{ row }">
              <div style="margin-top: 5px">
                <div class="div-zoom" style="color: black">{{ row.simpleSpecs }}</div>
                <div class="div-zoom" style="margin-top: 5px">ID: {{ row.id }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="上架状态" width="130">
            <template #default="{ row }">
              <el-tag :type="row.marketEnable === 'DOWN' ? 'danger' : 'success'">
                {{ row.marketEnable === "DOWN" ? "下架" : "上架" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="审核状态" width="120">
            <template #default="{ row }">
              <el-tag
                :type="
                  row.authFlag === 'PASS' ? 'success' : row.authFlag === 'TOBEAUDITED' ? 'warning' : 'danger'
                "
              >
                {{
                  row.authFlag === "PASS" ? "通过" : row.authFlag === "TOBEAUDITED" ? "待审核" : "审核拒绝"
                }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="库存" min-width="120">
            <template #default="{ row }">{{ row.quantity || 0 }}</template>
          </el-table-column>
        </el-table>
      </div>

      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="changePage"
          @size-change="changePageSize"
        />
      </div>
    </el-card>

    <el-dialog v-model="importModal" title="导入商品信息" :close-on-click-modal="false">
      <div v-loading="spinShow" style="text-align: center">
        <el-upload drag :before-upload="handleUpload" :show-file-list="false" accept=".xlsx,.xls">
          <div style="padding: 50px 0">
            <div style="font-size: 48px; color: #3399ff">↑</div>
            <h2>选择或拖拽文件上传</h2>
          </div>
        </el-upload>
      </div>
      <template #footer>
        <el-button type="primary" @click="importModal = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  getGoodsCategoryAll,
  getGoodsSkuListDataSeller,
  importStockExcel,
  queryExportStock,
} from "@/api/goods";

export default {
  name: "alertQuantity",
  data() {
    return {
      importModal: false,
      spinShow: false,
      loading: true,
      searchForm: {
        pageNumber: 1,
        pageSize: 20,
        sort: "create_time",
        order: "desc",
      },
      stockAllData: [],
      total: 0,
      categoryList: [],
      category: [],
      file: null,
    };
  },
  methods: {
    init() {
      this.getDataList();
      this.deepGroup();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getDataList();
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getDataList();
    },
    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.categoryPath = this.category?.length ? this.category.join(",") : null;
      this.getDataList();
    },
    handleReset() {
      this.searchForm = {
        pageNumber: 1,
        pageSize: 20,
        sort: "create_time",
        order: "desc",
      };
      this.category = [];
      this.getDataList();
    },
    getDataList() {
      this.loading = true;
      getGoodsSkuListDataSeller(this.searchForm).then((res) => {
        if (res.success) {
          this.stockAllData = res.result.records;
          this.total = res.result.total;
        }
        this.loading = false;
      });
    },
    deepGroup() {
      getGoodsCategoryAll().then((res) => {
        if (res.success) {
          this.categoryList = res.result.map((item) => ({
            value: item.id,
            label: item.name,
            children: (item.children || []).map((child) => ({
              value: child.id,
              label: child.name,
              children: (child.children || []).map((grandson) => ({
                value: grandson.id,
                label: grandson.name,
              })),
            })),
          }));
        }
      });
    },
    async exportStock() {
      let randomNumber = "";
      for (let i = 0; i < 10; i++) {
        randomNumber += Math.floor(Math.random() * 10);
      }
      queryExportStock(this.searchForm)
        .then((res) => {
          const blob = new Blob([res], { type: "application/vnd.ms-excel;charset=utf-8" });
          if ("download" in document.createElement("a")) {
            const link = document.createElement("a");
            link.download = randomNumber + ".xlsx";
            link.style.display = "none";
            link.href = URL.createObjectURL(blob);
            document.body.appendChild(link);
            link.click();
            URL.revokeObjectURL(link.href);
            document.body.removeChild(link);
          } else {
            navigator.msSaveBlob(blob, randomNumber + ".xlsx");
          }
        })
        .catch((err) => console.log(err));
    },
    openImportStock() {
      this.importModal = true;
    },
    handleUpload(file) {
      this.file = file;
      this.upload();
      return false;
    },
    upload() {
      const fd = new FormData();
      fd.append("files", this.file);
      this.spinShow = true;
      importStockExcel(fd).then((res) => {
        this.spinShow = false;
        if (res.success) {
          this.$Message.success("导入成功");
          this.importModal = false;
          this.getDataList();
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
@import "@/styles/table-common.scss";
</style>
