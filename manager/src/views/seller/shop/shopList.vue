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
        ref="tableRef"
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

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getShopListData, disableShop, enableBrand, shopAudit } from "@/api/shops";
import { Message, Modal } from "@/utils/message";

defineOptions({ name: "shop" });

const emit = defineEmits(["callback"]);

const router = useRouter();

const loading = ref(true);
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
  startDate: "",
  endDate: "",
});
const selectDate = ref(null);
const data = ref([]);
const total = ref(0);
const selectedShop = ref(false);

// 模板 ref（原 ref="searchForm" / ref="table"，script 内未使用，仅改名避免与 data 同名覆盖）
const searchFormRef = ref(null);
const tableRef = ref(null);

function storeDisableText(v) {
  const map = {
    OPEN: "开启中",
    CLOSED: "已关闭",
    APPLY: "申请中",
    APPLYING: "审核中",
    REFUSED: "审核拒绝",
  };
  return map[v] || v || "-";
}

function callback(val) {
  emit("callback", val);
}

function init() {
  getDataList();
}

function changePage(v) {
  searchForm.pageNumber = v;
  getDataList();
}

function changePageSize(v) {
  searchForm.pageNumber = 1;
  searchForm.pageSize = v;
  getDataList();
}

function handleSearch() {
  searchForm.pageNumber = 1;
  searchForm.pageSize = 20;
  getDataList();
}

function selectDateRange(v) {
  if (v && v.length === 2) {
    searchForm.startDate = v[0];
    searchForm.endDate = v[1];
  } else {
    searchForm.startDate = "";
    searchForm.endDate = "";
  }
}

function getDataList() {
  loading.value = true;
  getShopListData(searchForm)
    .then((res) => {
      if (res.success) {
        data.value = res.result.records;
        total.value = res.result.total;
      }
    })
    .finally(() => {
      loading.value = false;
    });
}

function add() {
  router.push({ path: "/shop-operation" });
}

function edit(v) {
  router.push({ path: "/shop-operation", query: { shopId: v.id } });
}

function disable(v) {
  Modal.confirm({
    title: "确认关闭",
    content: "您确认要关闭店铺 " + v.storeName + " ?",
    loading: true,
    onOk: () => {
      disableShop(v.id).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("操作成功");
          getDataList();
        }
      });
    },
  });
}

function detail(row) {
  router.push({ name: "shop-detail", query: { id: row.id } });
}

function audit(v) {
  Modal.confirm({
    title: "审核店铺",
    content: "您确认要审核通过店铺 " + v.storeName + " ?",
    okText: "通过",
    cancelText: "驳回",
    loading: true,
    onOk: () => {
      shopAudit(v.id, 0).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("操作成功");
          getDataList();
        }
      });
    },
    onCancel: () => {
      shopAudit(v.id, 1).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("操作成功");
          getDataList();
        }
      });
    },
  });
}

function enable(v) {
  Modal.confirm({
    title: "确认开启",
    content: "您确认要开启店铺 " + v.storeName + " ?",
    loading: true,
    onOk: () => {
      enableBrand(v.id).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("操作成功");
          getDataList();
        }
      });
    },
  });
}

onMounted(() => {
  init();
});
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
