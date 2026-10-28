<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchFormRef"
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
        <el-form-item label="店铺分类" prop="storeCategoryPath">
          <el-cascader
            v-model="searchForm.storeCategoryPath"
            :options="shopCategoryList"
            :props="shopCategoryProps"
            clearable
            filterable
            placeholder="请选择店铺分类"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="商品类型" prop="goodsType">
          <el-select
            v-model="searchForm.goodsType"
            placeholder="请选择商品类型"
            clearable
            style="width: 240px"
          >
            <el-option label="实物商品" value="PHYSICAL_GOODS" />
            <el-option label="虚拟商品" value="VIRTUAL_GOODS" />
            <el-option label="电子卡券" value="E_COUPON" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="list-card">
      <el-tabs v-model="currentAuthStatus" class="auth-tabs" @tab-change="onAuthStatusChange">
        <el-tab-pane label="全部" name="ALL" />
        <el-tab-pane label="待审核" name="TOBEAUDITED" />
        <el-tab-pane label="已审核" name="PASS" />
        <el-tab-pane label="审核未通过" name="REFUSE" />
      </el-tabs>

      <div class="operation">
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
        <el-table-column prop="skuId" label="ID" min-width="180" show-overflow-tooltip />
        <el-table-column label="商品图片" width="90" align="center">
          <template #default="{ row }">
            <img v-if="row?.thumbnail" :src="row.thumbnail" class="goods-thumb" alt="" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="商品名称" min-width="180" class-name="goods-name-column">
          <template #default="{ row }">
            <span v-if="row" class="goods-name-text">{{ row.goodsName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="规格" min-width="140" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row?.specs || "-" }}
          </template>
        </el-table-column>
        <el-table-column label="商品类型" min-width="110">
          <template #default="{ row }">
            <span v-if="row">{{ goodsTypeText(row.goodsType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品金额" min-width="110">
          <template #default="{ row }">
            <span v-if="row" :style="{ color: $mainColor }">{{ $filters.unitPrice(row.price, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="佣金金额" min-width="110">
          <template #default="{ row }">
            <span v-if="row" :style="{ color: $mainColor }">
              {{ $filters.unitPrice(row.commission ?? 0, "￥") }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="库存" min-width="80" align="center" />
        <el-table-column label="审核状态" min-width="110" align="center">
          <template #default="{ row }">
            <span v-if="row">{{ authStatusText(row.authStatus) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="添加时间" min-width="160" />
        <el-table-column label="操作" min-width="120" align="right" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <a class="link-text" @click="edit(row)">编辑</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="remove(row)">删除</a>
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
          @current-change="getDataList"
          @size-change="() => { searchForm.pageNumber = 1; getDataList(); }"
        />
      </div>
    </el-card>

    <liliDialog ref="liliDialogRef" @selectedGoodsData="selectedGoodsData" />

    <el-dialog
      v-model="modalVisible"
      :title="modalTitle"
      width="900px"
      :close-on-click-modal="false"
      append-to-body
      class="add-distribution-goods-dialog"
    >
      <el-table :data="selectedGoodsList" border max-height="420">
        <el-table-column label="商品图片" width="90" align="center">
          <template #default="{ row }">
            <img v-if="row?.thumbnail" :src="row.thumbnail" class="goods-thumb" alt="" />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="商品名称" min-width="160" class-name="goods-name-column">
          <template #default="{ row }">
            <span class="goods-name-text">{{ row.goodsName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="规格" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.specs || "-" }}
          </template>
        </el-table-column>
        <el-table-column label="商品价格" width="110" align="right">
          <template #default="{ row }">
            <span :style="{ color: $mainColor }">{{ $filters.unitPrice(row.price, "￥") }}</span>
          </template>
        </el-table-column>
        <el-table-column label="分销佣金" width="160" align="center">
          <template #default="{ row, $index }">
            <el-input
              v-model="row.commission"
              clearable
              placeholder="请输入佣金"
              :class="{ 'commission-input-error': row.commissionError }"
              @blur="validateRowCommission(row, $index)"
              @input="row.commissionError = false"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="right">
          <template #default="{ $index }">
            <a
              v-if="selectedGoodsList.length > 1"
              class="link-text"
              @click="removeSelectedGoods($index)"
            >移除</a>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="editVisible"
      title="编辑分销商品"
      width="480px"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form ref="editFormRef" :model="editForm" label-width="100px">
        <el-form-item label="商品名称">
          <span>{{ editForm.goodsName }}</span>
        </el-form-item>
        <el-form-item label="分销佣金" prop="commission">
          <el-input
            v-model="editForm.commission"
            clearable
            placeholder="请输入分销佣金"
            :class="{ 'commission-input-error': editForm.commissionError }"
            @input="editForm.commissionError = false"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="editLoading" @click="handleEditSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useTable } from "@/utils/useTable";
import {
  getDistributionGoods,
  distributionGoodsCancel,
  distributionGoodsBatchCheck,
  updateDistributionGoodsCommission,
} from "@/api/distribution";
import { getShopGoodsLabelListSeller } from "@/api/goods";
import { Message, Modal } from "@/utils/message";

defineOptions({ name: "distributionGoods" });

const modalVisible = ref(false);
const modalTitle = ref("添加分销商品");
const editVisible = ref(false);
const editLoading = ref(false);
const submitLoading = ref(false);
const currentAuthStatus = ref('ALL');
const shopCategoryList = ref([]);
const shopCategoryProps = {
  value: 'value',
  label: 'label',
  children: 'children',
  checkStrictly: true,
  emitPath: false,
};
const selectedGoodsList = ref([]);
const editForm = ref({
  id: '',
  goodsName: '',
  commission: '',
  commissionError: false,
});
const commissionPattern = /^[1-9]\d{0,3}(\.\d{1,2})?$/;

const { loading, data, total, searchForm, getDataList, handleSearch, resetSearch } = useTable(
  getDistributionGoods,
  {
    pageSize: 20,
    sort: "createTime",
    order: "desc",
    form: { goodsName: "", storeCategoryPath: "", goodsType: "", authStatus: "" },
  }
);

// searchFormRef：模板 ref 改名避免与顶层变量互相覆盖
const searchFormRef = ref(null);
const liliDialogRef = ref(null);
const editFormRef = ref(null);

onMounted(() => {
  init();
});

function init() {
  loadFilterOptions();
  getDataList();
}

function loadFilterOptions() {
  getShopGoodsLabelListSeller()
    .then((res) => {
      if (res?.success) {
        shopCategoryList.value = formatShopCategory(res.result || []);
      }
    })
    .catch(() => {});
}

function formatShopCategory(list) {
  return (list || []).map((item) => ({
    value: item.id,
    label: item.labelName,
    children:
      item.children && item.children.length
        ? formatShopCategory(item.children)
        : undefined,
  }));
}

function goodsTypeText(value) {
  if (value === "PHYSICAL_GOODS") return "实物商品";
  if (value === "VIRTUAL_GOODS") return "虚拟商品";
  if (value === "E_COUPON") return "电子卡券";
  return "-";
}

function authStatusText(value) {
  if (value === "TOBEAUDITED") return "待审核";
  if (value === "REFUSE") return "审核未通过";
  return "已审核";
}

function onAuthStatusChange(name) {
  searchForm.authStatus = name === "ALL" ? "" : name;
  handleSearch();
}
function handleReset() {
  currentAuthStatus.value = "ALL";
  resetSearch();
}

function add() {
  liliDialogRef.value.goodsData = [];
  liliDialogRef.value.open("goods");
}

function selectedGoodsData(selected) {
  if (!selected?.length) return;
  selectedGoodsList.value = selected.map((item) => ({
    skuId: item.id,
    goodsId: item.goodsId,
    thumbnail: item.thumbnail,
    goodsName: item.goodsName,
    specs: item.simpleSpecs || "-",
    price: item.price,
    commission: "1",
    commissionError: false,
  }));
  modalVisible.value = true;
  modalTitle.value = `添加分销商品（已选${selectedGoodsList.value.length}项）`;
}

function validateRowCommission(row) {
  const valid = commissionPattern.test(String(row.commission || "").trim());
  row.commissionError = !valid;
  return valid;
}

function validateAllCommission() {
  let valid = true;
  selectedGoodsList.value.forEach((row) => {
    if (!validateRowCommission(row)) {
      valid = false;
    }
  });
  return valid;
}

function removeSelectedGoods(index) {
  selectedGoodsList.value.splice(index, 1);
  if (!selectedGoodsList.value.length) {
    modalVisible.value = false;
    return;
  }
  modalTitle.value = `添加分销商品（已选${selectedGoodsList.value.length}项）`;
}

function handleSubmit() {
  if (!selectedGoodsList.value.length) return;
  if (!validateAllCommission()) {
    Message.error("请为所有商品填写大于1且小于9999的合法佣金金额");
    return;
  }
  submitLoading.value = true;
  const items = selectedGoodsList.value.map((item) => ({
    skuId: item.skuId,
    commission: Number(item.commission),
  }));
  distributionGoodsBatchCheck(items)
    .then((res) => {
      if (res?.success || res?.message === "success") {
        const addedCount = Array.isArray(res?.result) ? res.result.length : 0;
        if (addedCount > 0) {
          Message.success(`成功添加${addedCount}个分销商品`);
        } else {
          Message.info("所选商品均已是分销商品，已跳过");
        }
      }
      modalVisible.value = false;
      selectedGoodsList.value = [];
      getDataList();
    })
    .finally(() => {
      submitLoading.value = false;
    });
}





function remove(row) {
  Modal.confirm({
    title: "确认删除",
    content: "您确认要删除此分销商品吗?",
    loading: true,
    onOk: () => {
      distributionGoodsCancel(row.id).then((res) => {
        Modal.remove();
        if (res?.success) {
          Message.success("删除成功");
          getDataList();
        }
      });
    },
  });
}

function edit(row) {
  editForm.value = {
    id: row.id,
    goodsName: row.goodsName,
    commission: row.commission != null ? String(row.commission) : "1",
    commissionError: false,
  };
  editVisible.value = true;
}

function handleEditSubmit() {
  const valid = commissionPattern.test(String(editForm.value.commission || "").trim());
  editForm.value.commissionError = !valid;
  if (!valid) {
    Message.error("请输入大于1且小于9999的合法佣金金额");
    return;
  }
  editLoading.value = true;
  updateDistributionGoodsCommission(editForm.value.id, {
    commission: Number(editForm.value.commission),
  })
    .then((res) => {
      if (res?.success || res?.message === "success") {
        Message.success("修改成功");
        editVisible.value = false;
        getDataList();
      }
    })
    .finally(() => {
      editLoading.value = false;
    });
}
</script>

<style lang="scss" scoped>
.operation {
  margin: 10px 0;
}

.goods-thumb {
  width: 48px;
  height: 48px;
  object-fit: contain;
  vertical-align: middle;
}

.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
}

.op-split {
  margin: 0 6px;
  color: #dcdfe6;
}

.goods-name-text {
  white-space: normal;
  word-break: break-word;
  line-height: 1.5;
}

:deep(.goods-name-column .cell) {
  white-space: normal;
  word-break: break-word;
  line-height: 1.5;
}

.mt_10 {
  margin-top: 10px;
}

.list-card {
  margin-top: 16px;
}

.auth-tabs {
  margin-bottom: 4px;
}

.commission-input-error {
  :deep(.el-input__wrapper) {
    box-shadow: 0 0 0 1px #f56c6c inset;
  }
}

.add-distribution-goods-dialog {
  :deep(.goods-name-column .cell) {
    white-space: normal;
    word-break: break-word;
    line-height: 1.5;
  }
}
</style>
