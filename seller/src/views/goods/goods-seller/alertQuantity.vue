<template>
  <div class="search">
    <el-card class="search-card">
      <div @keyup.enter="handleSearch">
        <el-form ref="searchFormRef" :model="searchForm" inline label-width="70px" class="search-form">
          <el-form-item label="商品名称" prop="goodsName">
            <el-input v-model="searchForm.goodsName" placeholder="请输入商品名称" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="商品编号" prop="goodsId">
            <el-input v-model="searchForm.goodsId" placeholder="请输入商品编号" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="状态" prop="marketEnable">
            <el-select v-model="searchForm.marketEnable" placeholder="请选择" clearable style="width: 200px">
              <el-option label="下架" value="DOWN" />
              <el-option label="上架" value="UPPER" />
            </el-select>
          </el-form-item>
          <el-form-item label="商品分类">
            <el-cascader
              v-model="category"
              :options="categoryList"
              placeholder="请选择商品分类"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="SKU编码" prop="sn">
            <el-input v-model="searchForm.sn" placeholder="请输入SKU编码" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
            <el-button class="search-btn" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card>
      <div>
        <div class="operation">
          <el-button type="primary" class="export" @click="exportStock">批量导出</el-button>
          <el-button class="export" @click="openImportStock">批量导入</el-button>
        </div>
        <el-table ref="tableRef" v-loading="loading" border :data="stockAllData" class="mt_10" style="width: 100%">
          <el-table-column label="商品信息" min-width="220">
            <template #default="{ row }">
              <div class="goods-cell">
                <img :src="row.thumbnail" class="goods-thumb" alt="" />
                <div class="goods-title">{{ row.goodsName }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="SPU编码" min-width="170" show-overflow-tooltip>
            <template #default="{ row }">{{ row.goodsId }}</template>
          </el-table-column>
          <el-table-column label="SKU信息" min-width="160" show-overflow-tooltip>
            <template #default="{ row }">{{ row.simpleSpecs || "-" }}</template>
          </el-table-column>
          <el-table-column label="SKU编码" min-width="150" show-overflow-tooltip>
            <template #default="{ row }">{{ row.sn || row.id }}</template>
          </el-table-column>
          <el-table-column label="库存" width="100" align="right">
            <template #default="{ row }">{{ row.quantity || 0 }}</template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="right" fixed="right">
            <template #default="{ row }">
              <el-tooltip
                v-if="row.goodsType === 'E_COUPON'"
                content="电子卡券库存由卡密池自动同步，不可手动修改"
                placement="top"
              >
                <span class="disabled-link-text">修改库存</span>
              </el-tooltip>
              <a v-else class="link-text" @click="openUpdateStockModal(row)">修改库存</a>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="mt_10" style="display: flex; justify-content: flex-end">
        <el-pagination
          v-model:current-page="searchForm.pageNumber"
          v-model:page-size="searchForm.pageSize"
          :page-sizes="[20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
          @current-change="getDataList"
          @size-change="() => { searchForm.pageNumber = 1; getDataList(); }"
        />
      </div>
    </el-card>

    <el-dialog v-model="importModal" title="导入商品信息" :close-on-click-modal="false" width="520px">
      <div class="template-tip-bar">
        <span class="template-tip-text">请按标准模板格式整理库存数据后再上传</span>
        <el-button
          type="primary"
          link
          :loading="templateLoading"
          @click="handleDownloadTemplate"
        >
          <el-icon class="mr_5"><Download /></el-icon>下载导入模板
        </el-button>
      </div>
      <div v-loading="spinShow" style="text-align: center">
        <el-upload drag :before-upload="handleUpload" :show-file-list="false" accept=".xlsx,.xls">
          <div style="padding: 40px 0">
            <el-icon :size="48" style="color: #3399ff"><UploadFilled /></el-icon>
            <h2 style="font-size: 16px; margin-top: 10px">选择或拖拽文件上传</h2>
            <p style="font-size: 12px; color: #909399; margin-top: 8px">支持 .xlsx / .xls 格式文件</p>
          </div>
        </el-upload>
      </div>
      <template #footer>
        <el-button @click="importModal = false">取消</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="updateStockModalVisible"
      title="修改商品库存"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="stockFormRef"
        :model="stockForm"
        :rules="stockRules"
        label-width="100px"
      >
        <el-form-item label="商品名称">
          <div class="dialog-value-text">{{ selectedSku.goodsName || "-" }}</div>
        </el-form-item>
        <el-form-item label="SKU信息">
          <div class="dialog-value-text">{{ selectedSku.simpleSpecs || "-" }}</div>
        </el-form-item>
        <el-form-item label="当前库存">
          <div class="dialog-value-text">{{ selectedSku.quantity || 0 }}</div>
        </el-form-item>
        <el-form-item label="修改方向" prop="type">
          <el-radio-group v-model="stockForm.type" @change="handleStockTypeChange">
            <el-radio value="ADD">增</el-radio>
            <el-radio value="SUB">减</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="变更数量" prop="quantity">
          <el-input-number
            v-model="stockForm.quantity"
            :min="1"
            :max="99999999"
            :step="1"
            :precision="0"
            controls-position="right"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="变更后库存">
          <span :class="['preview-stock', { 'is-insufficient': previewStock < 0 }]">
            {{ previewStock }}
          </span>
          <span v-if="previewStock < 0" class="insufficient-tip">（库存不足以扣减）</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="updateStockModalVisible = false">取消</el-button>
        <el-button type="primary" :loading="updateStockLoading" @click="submitUpdateStock">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useTable } from "@/utils/useTable";
import { Download, UploadFilled } from "@element-plus/icons-vue";
import { downloadBlob } from "@/utils/downloadBlob";
import {
  downloadStockTemplate,
  getGoodsCategoryAll,
  getGoodsSkuListDataSeller,
  importStockExcel,
  queryExportStock,
  updateGoodsSkuStocks,
} from "@/api/goods";
import { Message } from "@/utils/message";

defineOptions({ name: "alertQuantity" });

const searchFormRef = ref(null);
const tableRef = ref(null);

const importModal = ref(false);
const spinShow = ref(false);
const categoryList = ref([]);
const category = ref([]);
const file = ref(null);
const templateLoading = ref(false);
const updateStockModalVisible = ref(false);
const updateStockLoading = ref(false);
const selectedSku = ref({});
const stockFormRef = ref(null);
const stockForm = ref({
  type: "ADD",
  quantity: 1,
});

const previewStock = computed(() => {
  const current = Number(selectedSku.value.quantity) || 0;
  const change = Number(stockForm.value.quantity) || 0;
  return stockForm.value.type === "ADD" ? current + change : current - change;
});

const stockRules = {
  type: [{ required: true, message: "请选择库存修改方向", trigger: "change" }],
  quantity: [
    { required: true, message: "请输入变更数量", trigger: "blur" },
    {
      validator: (_rule, value, callback) => {
        const num = Number(value);
        if (!Number.isInteger(num) || num <= 0) {
          callback(new Error("变更数量必须为正整数"));
          return;
        }
        if (stockForm.value.type === "SUB" && num > (Number(selectedSku.value.quantity) || 0)) {
          callback(new Error("扣减数量不能大于当前库存"));
          return;
        }
        callback();
      },
      trigger: ["blur", "change"],
    },
  ],
};

const { loading, data: stockAllData, total, searchForm, getDataList, handleSearch, resetSearch } = useTable(
  getGoodsSkuListDataSeller,
  {
    pageSize: 20,
    sort: "create_time",
    order: "desc",
    form: {
      goodsName: "",
      goodsId: "",
      marketEnable: "",
      sn: "",
    },
    beforeRequest: (p) => {
      const params = { ...p };
      params.categoryPath = category.value?.length ? category.value.join(",") : null;
      return params;
    },
  }
);

function handleReset() {
  category.value = [];
  resetSearch();
}

function deepGroup() {
  getGoodsCategoryAll().then((res) => {
    if (res.success) {
      categoryList.value = res.result.map((item) => ({
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
}

function exportStock() {
  let randomNumber = "";
  for (let i = 0; i < 10; i++) {
    randomNumber += Math.floor(Math.random() * 10);
  }
  const params = { ...searchForm };
  if (category.value?.length) {
    params.categoryPath = category.value.join(",");
  }
  queryExportStock(params)
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
    .catch(() => {});
}

function openImportStock() {
  importModal.value = true;
}

/** 打开单条商品库存增减弹窗 */
function openUpdateStockModal(row) {
  selectedSku.value = { ...row };
  stockForm.value = {
    type: "ADD",
    quantity: 1,
  };
  updateStockModalVisible.value = true;
  stockFormRef.value?.clearValidate();
}

/** 切换库存修改方向时重新校验数量 */
function handleStockTypeChange() {
  stockFormRef.value?.validateField("quantity", () => {});
}

/** 提交商品库存增减修改 */
function submitUpdateStock() {
  stockFormRef.value?.validate((valid) => {
    if (!valid) return;
    updateStockLoading.value = true;
    updateGoodsSkuStocks([
      {
        goodsId: selectedSku.value.goodsId,
        skuId: selectedSku.value.id,
        type: stockForm.value.type,
        quantity: Number(stockForm.value.quantity),
      },
    ])
      .then((res) => {
        if (res.success) {
          Message.success("修改库存成功");
          updateStockModalVisible.value = false;
          getDataList();
        }
      })
      .finally(() => {
        updateStockLoading.value = false;
      });
  });
}

/** 下载商品库存导入空白模板 */
function handleDownloadTemplate() {
  templateLoading.value = true;
  downloadStockTemplate()
    .then((res) => {
      downloadBlob(res, "商品库存导入模板.xlsx");
      Message.success("模板下载成功");
    })
    .catch(() => {
      Message.error("模板下载失败");
    })
    .finally(() => {
      templateLoading.value = false;
    });
}

function handleUpload(f) {
  file.value = f;
  upload();
  return false;
}

function upload() {
  const fd = new FormData();
  fd.append("files", file.value);
  spinShow.value = true;
  importStockExcel(fd).then((res) => {
    spinShow.value = false;
    if (res.success) {
      Message.success("导入成功");
      importModal.value = false;
      getDataList();
    }
  });
}

onMounted(() => {
  deepGroup();
});
</script>

<style lang="scss" scoped>
@import "@/styles/table-common.scss";

.search-card {
  margin-bottom: 16px;
}

.operation {
  margin-bottom: 10px;
}

.goods-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.goods-thumb {
  width: 50px;
  height: 50px;
  object-fit: cover;
  flex-shrink: 0;
}

.goods-title {
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.template-tip-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.template-tip-text {
  font-size: 13px;
  color: #606266;
}

.mr_5 {
  margin-right: 5px;
}

.disabled-link-text {
  color: #c0c4cc;
  cursor: not-allowed;
  font-size: 13px;
}

.dialog-value-text {
  color: #303133;
  line-height: 22px;
  word-break: break-all;
}

.preview-stock {
  font-weight: 600;
  color: #303133;

  &.is-insufficient {
    color: #f56c6c;
  }
}

.insufficient-tip {
  color: #f56c6c;
  font-size: 12px;
  margin-left: 4px;
}
</style>
