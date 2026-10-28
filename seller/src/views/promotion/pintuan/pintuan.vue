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
        <el-form-item label="活动名称" prop="promotionName">
          <el-input
            v-model="searchForm.promotionName"
            placeholder="请输入活动名称"
            clearable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="活动状态" prop="promotionStatus">
          <el-select
            v-model="searchForm.promotionStatus"
            placeholder="请选择"
            clearable
            style="width: 240px"
          >
            <el-option label="未开始" value="NEW" />
            <el-option label="已开始/上架" value="START" />
            <el-option label="已结束/下架" value="END" />
            <el-option label="紧急关闭/作废" value="CLOSE" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动时间">
          <el-date-picker
            v-model="selectDate"
            type="daterange"
            clearable
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleSearch">搜索</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <div class="operation padding-row mb_10">
        <el-button type="primary" @click="newAct">添加</el-button>
      </div>
      <el-table
        ref="table"
        v-loading="loading"
        border
        :data="data"
        class="mt_10"
        style="width: 100%"
      >
        <el-table-column
          prop="promotionName"
          label="活动名称"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag v-if="row" :type="promotionStatusTagType(row.promotionStatus)">
              {{ promotionStatusText(row.promotionStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="storeName" label="所属店铺" min-width="120" show-overflow-tooltip />
        <el-table-column prop="startTime" label="活动开始时间" width="180" />
        <el-table-column prop="endTime" label="活动结束时间" width="180" />
        <el-table-column label="操作" width="220" align="right" fixed="right">
          <template #default="{ row }">
            <template v-if="row">
              <template v-if="row.promotionStatus === 'NEW'">
                <a class="link-text" @click="edit(row)">编辑</a>
                <span class="op-split">|</span>
                <a class="link-text" @click="manage(row, 'manager')">管理</a>
              </template>
              <template v-else-if="row.promotionStatus !== 'CLOSE'">
                <a class="link-text" @click="manage(row, 'view')">查看</a>
                <template v-if="row.promotionStatus === 'START'">
                  <span class="op-split">|</span>
                  <a class="link-text" @click="close(row)">关闭</a>
                </template>
              </template>
              <template v-else>
                <a class="link-text" @click="open(row)">开启</a>
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
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { getPintuanList, editPintuanStatus } from "@/api/promotion";
import { Message, Modal } from "@/utils/message";

defineOptions({ name: "pintuan" });

const router = useRouter();

const selectDate = ref([]);
const loading = ref(true);
const searchForm = reactive({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
  promotionName: "",
  promotionStatus: "",
});
const data = ref([]);
const total = ref(0);

// searchFormRef：模板 ref 改名避免与顶层变量互相覆盖
const searchFormRef = ref(null);

onMounted(() => {
  init();
});

function promotionStatusText(status) {
  const map = {
    NEW: "未开始",
    START: "已开始",
    END: "已结束",
    CLOSE: "已关闭",
  };
  return map[status] || "未知";
}
function promotionStatusTagType(status) {
  const map = {
    NEW: "info",
    START: "success",
    END: "danger",
    CLOSE: "danger",
  };
  return map[status] || "danger";
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
function getDataList() {
  loading.value = true;
  if (selectDate.value && selectDate.value[0] && selectDate.value[1]) {
    searchForm.startTime = new Date(selectDate.value[0]).getTime();
    searchForm.endTime = new Date(selectDate.value[1]).getTime();
  } else {
    searchForm.startTime = null;
    searchForm.endTime = null;
  }
  getPintuanList(searchForm)
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
function newAct() {
  router.push({ name: "pintuan-edit" });
}
function edit(v) {
  router.push({ name: "pintuan-edit", query: { id: v.id } });
}
function manage(v, status) {
  router.push({ name: "pintuan-goods", query: { id: v.id, status } });
}
function open(v) {
  const sTime = new Date();
  sTime.setMinutes(sTime.getMinutes() + 10);
  const eTime = new Date(new Date().setHours(0, 0, 0, 0) + 24 * 60 * 60 * 1000 - 1);
  const params = {
    startTime: sTime.getTime(),
    endTime: eTime.getTime(),
  };
  Modal.confirm({
    title: "确认开启",
    content: "您确认要开启此拼团活动？（默认为当前时间后十分钟至当天结束）",
    loading: true,
    onOk: () => {
      editPintuanStatus(v.id, params).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("开启活动成功");
          getDataList();
        }
      });
    },
  });
}
function close(v) {
  Modal.confirm({
    title: "确认关闭",
    content: "您确认要关闭此拼团活动?",
    loading: true,
    onOk: () => {
      editPintuanStatus(v.id).then((res) => {
        Modal.remove();
        if (res.success) {
          Message.success("关闭活动成功");
          getDataList();
        }
      });
    },
  });
}
</script>

<style lang="scss" scoped>
.mt_10 {
  margin-top: 10px;
}

.mb_10 {
  margin-bottom: 10px;
}

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
