<template>
  <div class="search">
    <el-card>
      <el-form
        ref="searchFormRef"
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
        <el-form-item label="商品ID" prop="id">
          <el-input
            v-model="searchForm.id"
            placeholder="请输入商品ID"
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
        <el-form-item label="商品类型" prop="goodsType">
          <el-select
            v-model="searchForm.goodsType"
            placeholder="请选择"
            clearable
            style="width: 240px"
          >
            <el-option label="实物商品" value="PHYSICAL_GOODS" />
            <el-option label="虚拟商品" value="VIRTUAL_GOODS" />
            <!-- E_COUPON：卡密商品；平台无卡池管理权限（S-04） -->
            <el-option label="电子卡券" value="E_COUPON" />
            <el-option label="预约商品" value="APPOINTMENT_GOODS" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品分组" prop="groupId">
          <el-select
            v-model="searchForm.groupId"
            placeholder="请选择商品分组"
            clearable
            filterable
            style="width: 240px"
          >
            <el-option
              v-for="item in goodsGroupList"
              :key="item.id"
              :label="item.groupName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <div class="goods-tab">
        <el-tabs v-model="currentStatus" @tab-click="onStatusTabClick">
          <el-tab-pane
            v-for="item in goodsStatusWithCount"
            :key="item.value"
            :label="item.title"
            :name="item.value"
          />
        </el-tabs>
      </div>

      <div class="batch-operations" style="margin: 10px 0">
        <el-button
          type="primary"
          :disabled="selectedRows.length === 0"
          style="margin-right: 10px"
          @click="openSetGoodsGroup"
        >
          批量设置分组
        </el-button>
        <el-button
          type="success"
          :disabled="selectedRows.length === 0"
          style="margin-right: 10px"
          @click="batchUpper"
        >
          批量上架
        </el-button>
        <el-button
          type="warning"
          :disabled="selectedRows.length === 0"
          style="margin-right: 10px"
          @click="batchLower"
        >
          批量下架
        </el-button>
        <el-button
          v-if="currentStatus === 'TOBEAUDITED'"
          type="primary"
          :disabled="selectedRows.length === 0"
          @click="batchAudit"
        >
          批量审核
        </el-button>
      </div>

      <el-table
        ref="table"
        :key="currentStatus"
        v-loading="loading"
        :data="data"
        class="mt_10"
        row-key="id"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="100" align="center" />
        <el-table-column prop="id" label="商品ID" width="200" show-overflow-tooltip />
        <el-table-column label="商品图片" width="100" align="center">
          <template #default="{ row }">
            <img alt="商品图片"
              v-if="row && row.original"
              :src="row.original"
              style="height: 50px; width: 50px; object-fit: cover"
            />
          </template>
        </el-table-column>
        <el-table-column label="商品名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <a class="link-text" @click="linkTo(row.id, row.skuId)">{{ row.goodsName }}</a>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="200">
          <template #default="{ row }">
            <span :style="{ color: $mainColor }">{{ unitPrice(row.price, '￥') }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="buyCount" label="销量" width="150" />
        <el-table-column prop="quantity" label="库存" width="150" />
        <el-table-column label="商品类型" width="150">
          <template #default="{ row }">
            <span v-if="row">{{ goodsTypeText(row.goodsType) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="150">
          <template #default="{ row }">
            <span v-if="row">{{ marketEnableText(row.marketEnable) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" width="150">
          <template #default="{ row }">
            <span v-if="row">{{ authFlagText(row.authFlag) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="storeName" label="店铺名称" width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <template v-if="row.authFlag === 'TOBEAUDITED'">
              <a class="link-text" @click="openAuditModal(row)">审核</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="showDetail(row)">查看</a>
            </template>
            <template v-else-if="row.marketEnable === 'DOWN'">
              <a class="link-text" @click="upper(row)">上架</a>
              <span class="op-split">|</span>
              <a class="link-text" @click="showDetail(row)">查看</a>
            </template>
            <template v-else>
              <a class="link-text" @click="edit(row)">下架</a>
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
          @current-change="getDataList"
          @size-change="() => { searchForm.pageNumber = 1; getDataList(); }"
        />
      </div>
    </el-card>

    <el-dialog v-model="modalVisible" title="下架操作" width="500px" :close-on-click-modal="false">
      <el-form ref="underFormRef" :model="underForm" label-width="100px">
        <el-form-item label="下架原因" prop="reason">
          <el-input v-model="underForm.reason" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="modalVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="lower">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="auditModalVisible"
      title="商品审核"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="auditForm" :model="goodsAuditForm" label-width="100px">
        <el-form-item label="审核结果" prop="auth_flag">
          <el-radio-group v-model="goodsAuditForm.auth_flag">
            <el-radio :value="1">审核通过</el-radio>
            <el-radio :value="2">审核拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditModalVisible = false">取消</el-button>
        <el-button type="primary" :loading="auditSubmitLoading" @click="submitAudit">提交审核</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="batchAuditModalVisible"
      title="批量商品审核"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form ref="batchAuditFormRef" :model="batchAuditForm" label-width="100px">
        <el-form-item label="审核结果" prop="auth_flag">
          <el-radio-group v-model="batchAuditForm.auth_flag">
            <el-radio :value="1">审核通过</el-radio>
            <el-radio :value="2">审核拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-show="batchAuditForm.auth_flag === 2" label="审核备注" prop="reason">
          <el-input v-model="batchAuditForm.reason" type="textarea" :rows="3" placeholder="请输入拒绝原因" />
        </el-form-item>
        <el-form-item label="选中商品">
          <div style="max-height: 200px; overflow-y: auto">
            <el-tag v-for="item in selectedRows" :key="item.id" style="margin: 2px">{{ item.goodsName }}</el-tag>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchAuditModalVisible = false">取消</el-button>
        <el-button type="primary" :loading="batchAuditSubmitLoading" @click="submitBatchAudit">提交审核</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="goodsGroupFlag" title="批量设置商品分组" width="420px">
      <el-form ref="goodsGroupFormRef" :model="goodsGroupForm" :rules="goodsGroupRule" label-width="90px">
        <el-form-item label="商品分组" prop="groupId">
          <el-select v-model="goodsGroupForm.groupId" clearable filterable style="width: 240px">
            <el-option
              v-for="item in goodsGroupList"
              :key="item.id"
              :label="item.groupName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="goodsGroupFlag = false">取消</el-button>
        <el-button type="primary" :loading="goodsGroupLoading" @click="submitSetGoodsGroup">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import { useTable } from "@/utils/useTable";
import {
  getGoodsListData,
  getGoodsNumerData,
  upGoods,
  lowGoods,
  authGoods,
  getGoodsGroupByPage,
  addGoodsGroupItems
} from "@/api/goods";
import { ElMessage, ElMessageBox } from "element-plus";
import { unitPrice, customRouterPush } from "@/utils/filters";

defineOptions({ name: "goods" });

// 模板 ref（searchFormRef/underFormRef/batchAuditFormRef/goodsGroupFormRef 因与 data 同名改为 xxxRef）
const searchFormRef = ref(null);
const table = ref(null);
const underFormRef = ref(null);
const auditForm = ref(null);
const batchAuditFormRef = ref(null);
const goodsGroupFormRef = ref(null);

const id = ref("");
const modalVisible = ref(false);
const underForm = reactive({ reason: "" });
const goodsAuditForm = reactive({ auth_flag: 1 });
const auditModalVisible = ref(false);
const auditSubmitLoading = ref(false);
const currentAuditGoods = ref(null);
const submitLoading = ref(false);
const currentStatus = ref("ALL");

const { loading, data, total, searchForm, getDataList, handleSearch, resetSearch } = useTable(
  getGoodsListData,
  {
    pageSize: 20,
    sort: "create_time",
    order: "desc",
    immediate: false,
    form: {
      goodsName: "",
      id: "",
      storeName: "",
      goodsType: "",
      groupId: "",
    },
    beforeRequest: (p) => {
      const params = { ...p };
      if (currentStatus.value && currentStatus.value !== "ALL") {
        params.goodsStatus = currentStatus.value;
      } else {
        delete params.goodsStatus;
      }
      return params;
    },
    onSuccess: () => {
      getNumberData();
    },
  }
);

function handleReset() {
  currentStatus.value = "ALL";
  resetSearch();
}
const goodsNumerData = ref({});
const selectedRows = ref([]); // 选中的行数据
const selectAll = ref(false); // 全选状态
const batchAuditModalVisible = ref(false); // 批量审核弹框显示状态
const batchAuditSubmitLoading = ref(false);
const batchAuditForm = ref({
  auth_flag: 1,
  reason: ''
});
const goodsGroupFlag = ref(false);
const goodsGroupLoading = ref(false);
const goodsGroupList = ref([]);
const goodsGroupForm = ref({
  groupId: ""
});
const goodsGroupRule = reactive({
  groupId: [{ required: true, message: "请选择商品分组", trigger: "change" }]
});

const goodsStatusWithCount = computed(() => {
  return [
    {title: '全部', value: 'ALL'},
    {title: `出售中${goodsNumerData.value.upperGoodsNum ? '(' + goodsNumerData.value.upperGoodsNum + ')' : ''}`, value: 'UPPER'},
    {title: `仓库中${goodsNumerData.value.downGoodsNum ? '(' + goodsNumerData.value.downGoodsNum + ')' : ''}`, value: 'DOWN'},
    {title: `待审核${goodsNumerData.value.auditGoodsNum ? '(' + goodsNumerData.value.auditGoodsNum + ')' : ''}`, value: 'TOBEAUDITED'},
    {title: `审核未通过${goodsNumerData.value.refuseGoodsNum ? '(' + goodsNumerData.value.refuseGoodsNum + ')' : ''}`, value: 'REFUSE'}
  ];
});

function clearTableSelection() {
  table.value?.clearSelection?.();
}
function onStatusTabClick(tab) {
  const status = tab.paneName ?? tab.props?.name;
  goodsStatusClick(status);
}
function goodsTypeText(v) {
  if (v === "PHYSICAL_GOODS") return "实物商品";
  if (v === "VIRTUAL_GOODS") return "虚拟商品";
  if (v === "E_COUPON") return "电子卡券"; // 卡密商品
  if (v === "APPOINTMENT_GOODS") return "预约商品";
  return v || "—";
}
function marketEnableText(v) {
  if (v === "DOWN") return "下架";
  if (v === "UPPER") return "上架";
  return "";
}
function authFlagText(v) {
  if (v === "TOBEAUDITED") return "待审核";
  if (v === "PASS") return "通过";
  if (v === "REFUSE") return "拒绝";
  return "";
}
// 初始化数据
function init() {
  getDataList();
  getNumberData();
  loadGoodsGroupList();
}
// 分页 改变页码
// 分页 改变页数
// 搜索
// 获取数据
function getNumberData() {
  // 创建一个不包含goodsStatus字段的搜索参数
  const { goodsStatus, ...searchParams } = searchForm;
  getGoodsNumerData(searchParams).then((res) => {
    if (res.success) {
      goodsNumerData.value = res.result;
    }
  })
}
// 编辑
function edit(v) {
  id.value = v.id;
  if (v.underMessage) {
    underForm.reason = v.underMessage;
  } else {
    underForm.reason = "";
  }
  modalVisible.value = true;
}
// 下架
function lower() {
  const reason = underForm.reason ? underForm.reason.trim() : "";
  if (!reason) {
    ElMessage.error("下架原因不能为空");
    return;
  }
  let params = {
    goodsId: id.value,
    reason
  };
  lowGoods(params).then((res) => {
    if (res.success) {
      ElMessage.success("操作成功");
      modalVisible.value = false;
      getDataList();
      getNumberData(); // 添加这行
    }
  });
}
// 上架
function upper(v) {
  ElMessageBox.confirm("您确认要上架 " + v.goodsName + " ?", "确认上架", { type: "warning" }).then(() => {
    let params = {
      goodsId: v.id
    };
    return upGoods(params).then((res) => {
      if (res.success) {
        ElMessage.success("上架成功");
        getDataList();
        getNumberData(); // 添加这行
      }
    });
  }).catch(() => {});
}

//查看商品详情
function showDetail(v) {
  customRouterPush({
    name: "goods-detail",
    query: { id: v.id },
  });
}

// 商品状态筛选
function goodsStatusClick(name) {
  if (name === "ALL" || name === "" || name === undefined || name === null) {
    delete searchForm.goodsStatus;
    currentStatus.value = "ALL";
  } else {
    searchForm.goodsStatus = name;
    currentStatus.value = name;
  }
  selectedRows.value = [];
  clearTableSelection();
  getDataList();
}
function examine(v, authFlag) {
  // 审核商品
  let examine = "通过";
  goodsAuditForm.authFlag = "PASS";
  if (authFlag != 1) {
    examine = "拒绝";
    goodsAuditForm.authFlag = "REFUSE";
  }

  ElMessageBox.confirm("您确认要审核" + examine + " " + v.goodsName + " ?", "确认审核", { type: "warning" }).then(() => {
    goodsAuditForm.goodsIds=v.id;
    let formData = new FormData();
    formData.append('goodsIds', v.id);
    formData.append('authFlag', goodsAuditForm.authFlag);

    return authGoods(formData).then((res) => {
      if (res.success) {
        ElMessage.success("审核成功");
        getDataList();
        getNumberData();
      }
    });
  }).catch(() => {});
}

// 打开审核弹框
function openAuditModal(goods) {
  currentAuditGoods.value = goods;
  goodsAuditForm.auth_flag = 1;
  goodsAuditForm.reason = '';
  auditSubmitLoading.value = false;
  auditModalVisible.value = true;
}

// 提交审核
function submitAudit() {
  if (!currentAuditGoods.value) {
    return;
  }
  auditSubmitLoading.value = true;
  const formData = new FormData();
  formData.append('goodsIds', currentAuditGoods.value.id);
  formData.append('authFlag', goodsAuditForm.auth_flag === 1 ? 'PASS' : 'REFUSE');
  authGoods(formData).then((res) => {
    if (res.success) {
      ElMessage.success('审核成功');
      auditModalVisible.value = false;
      getDataList();
      getNumberData();
    }
  }).finally(() => {
    auditSubmitLoading.value = false;
  });
}

function onSelectionChange(selection) {
  selectedRows.value = selection;
}

// 批量上架
function batchUpper() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要上架的商品');
    return;
  }

  const goodsNames = selectedRows.value.map(item => item.goodsName).join('、');
  ElMessageBox.confirm(`您确认要上架以下商品吗？\n${goodsNames}`, "确认批量上架", { type: "warning" }).then(() => {
    const goodsIds = selectedRows.value.map(item => item.id);
    const params = {
      goodsId: goodsIds
    };

    return upGoods(params).then((res) => {
      if (res.success) {
        ElMessage.success('批量上架成功');
        selectedRows.value = [];
        selectAll.value = false;
        getDataList();
        getNumberData();
      }
    });
  }).catch(() => {});
}

// 批量下架
function batchLower() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要下架的商品');
    return;
  }

  const goodsNames = selectedRows.value.map(item => item.goodsName).join('、');
  ElMessageBox.confirm(`您确认要下架以下商品吗？\n${goodsNames}`, "确认批量下架", { type: "warning" }).then(() => {
    const goodsIds = selectedRows.value.map(item => item.id);
    const params = {
      goodsId: goodsIds,
      reason: '批量下架操作'
    };

    return lowGoods(params).then((res) => {
      if (res.success) {
        ElMessage.success('批量下架成功');
        selectedRows.value = [];
        selectAll.value = false;
        getDataList();
        getNumberData();
      }
    });
  }).catch(() => {});
}

// 批量审核
function batchAudit() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要审核的商品');
    return;
  }

  // 重置批量审核表单
  batchAuditForm.value = {
    auth_flag: 1,
    reason: ''
  };
  batchAuditModalVisible.value = true;
}

// 提交批量审核
function submitBatchAudit() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要审核的商品');
    return;
  }

  // 如果是拒绝审核，必须填写原因
  if (batchAuditForm.value.auth_flag === 2 && !batchAuditForm.value.reason.trim()) {
    ElMessage.warning('审核拒绝时必须填写拒绝原因');
    return;
  }

  const actionText = batchAuditForm.value.auth_flag === 1 ? '通过' : '拒绝';
  const goodsIds = selectedRows.value.map(item => item.id);
  const formData = new FormData();
  formData.append('goodsIds', goodsIds.join(','));
  formData.append('authFlag', batchAuditForm.value.auth_flag === 1 ? 'PASS' : 'REFUSE');
  if (batchAuditForm.value.reason) {
    formData.append('reason', batchAuditForm.value.reason);
  }

  batchAuditSubmitLoading.value = true;
  authGoods(formData).then((res) => {
    if (res.success) {
      ElMessage.success(`批量审核${actionText}成功`);
      selectedRows.value = [];
      selectAll.value = false;
      batchAuditModalVisible.value = false;
      clearTableSelection();
      getDataList();
      getNumberData();
    }
  }).finally(() => {
    batchAuditSubmitLoading.value = false;
  });
}
function loadGoodsGroupList() {
  getGoodsGroupByPage({ pageNumber: 1, pageSize: 1000 }).then((res) => {
    if (res && res.success && res.result) {
      goodsGroupList.value = res.result.records || [];
    }
  });
}
function openSetGoodsGroup() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请先选择商品");
    return;
  }
  goodsGroupFlag.value = true;
  goodsGroupLoading.value = false;
  goodsGroupForm.value = { groupId: "" };
  nextTick(() => {
    if (goodsGroupFormRef.value) goodsGroupFormRef.value.resetFields();
  });
  loadGoodsGroupList();
}
function submitSetGoodsGroup() {
  goodsGroupFormRef.value.validate((valid) => {
    if (!valid) return;
    const goodsIds = selectedRows.value.map((item) => item.id);
    goodsGroupLoading.value = true;
    addGoodsGroupItems(goodsGroupForm.value.groupId, goodsIds).then((res) => {
      goodsGroupLoading.value = false;
      if (res && res.success) {
        ElMessage.success("设置成功");
        goodsGroupFlag.value = false;
        selectedRows.value = [];
        selectAll.value = false;
        clearTableSelection();
        getDataList();
      } else if (res && res.message) {
        ElMessage.error(res.message);
      }
    }).catch(() => {
      goodsGroupLoading.value = false;
      ElMessage.error("设置失败，请检查权限或后端接口");
    });
  });
}

onMounted(() => {
  init();
});
</script>
<style lang="scss" scoped>
// Tab组件样式
.goods-tab {
  :deep(.el-tabs__item) {
    font-size: 14px;
  }
}
</style>
