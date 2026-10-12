<template>
  <div class="search seckill">
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
      <el-tabs v-model="activeTab" class="mt_10">
        <el-tab-pane label="秒杀活动列表" name="list">
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
              min-width="140"
              show-overflow-tooltip
            />
            <el-table-column prop="startTime" label="开始时间" width="180" />
            <el-table-column prop="applyEndTime" label="申请截止时间" width="180" />
            <el-table-column label="活动状态" width="110">
              <template #default="{ row }">
                <el-tag v-if="row" :type="promotionStatusTagType(row.promotionStatus)">
                  {{ promotionStatusText(row.promotionStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="seckillRule"
              label="申请规则"
              min-width="120"
              show-overflow-tooltip
            />
            <el-table-column label="操作" width="250" align="center" fixed="right">
              <template #default="{ row }">
                <template v-if="row">
                  <a
                    v-if="row.promotionStatus === 'CLOSE' || row.promotionStatus === 'NEW'"
                    class="link-text"
                    @click="edit(row)"
                  >
                    编辑
                  </a>
                  <a v-else class="link-text" @click="manage(row)">查看</a>
                  <span v-if="row.promotionStatus" class="op-split">|</span>
                  <a
                    v-if="row.promotionStatus == 'NEW'"
                    class="link-text"
                    @click="manage(row)"
                  >
                    管理
                  </a>
                  <span v-if="row.promotionStatus == 'NEW'" class="op-split">|</span>
                  <a
                    v-if="row.promotionStatus == 'START' || row.promotionStatus == 'NEW'"
                    class="link-text"
                    @click="off(row)"
                  >
                    关闭
                  </a>
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
        </el-tab-pane>
        <el-tab-pane label="秒杀活动设置" name="setup" lazy>
          <setupSeckill />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { getSeckillList, delSeckill, updateSeckillStatus } from "@/api/promotion";
import { Message, Modal } from "@/utils/message";
import setupSeckill from "@/views/promotions/seckill/seckill-setup";

defineOptions({ name: "seckill" });

const router = useRouter();

const searchFormRef = ref(null);
const table = ref(null);

const activeTab = ref("list");
const selectDate = ref([]);
const loading = ref(true);
const searchForm = ref({
  pageNumber: 1,
  pageSize: 20,
  sort: "createTime",
  order: "desc",
});
const data = ref([]);
const total = ref(0);

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
  searchForm.value.pageNumber = v;
  getDataList();
}
function changePageSize(v) {
  searchForm.value.pageNumber = 1;
  searchForm.value.pageSize = v;
  getDataList();
}
function handleSearch() {
  searchForm.value.pageNumber = 1;
  searchForm.value.pageSize = 20;
  getDataList();
}
function edit(v) {
  router.push({ name: "manager-seckill-add", query: { id: v.id } });
}
function manage(v) {
  router.push({ name: "seckill-goods", query: { id: v.id } });
}
function off(v) {
  Modal.confirm({
    title: "提示",
    content: "您确定要下架该活动吗？",
    onOk: () => {
      updateSeckillStatus(v.id).then((res) => {
        if (res.success) {
          Message.success("下架成功");
          getDataList();
        }
      });
    },
  });
}
function expire(v) {
  Modal.confirm({
    title: "提示",
    content: "您确定要作废该活动吗？",
    onOk: () => {
      delSeckill(v.id).then((res) => {
        if (res.success) {
          Message.success("作废成功");
          getDataList();
        }
      });
    },
  });
}
function getDataList() {
  loading.value = true;
  if (selectDate.value && selectDate.value[0] && selectDate.value[1]) {
    searchForm.value.startTime = new Date(selectDate.value[0]).getTime();
    searchForm.value.endTime = new Date(selectDate.value[1]).getTime();
  } else {
    searchForm.value.startTime = null;
    searchForm.value.endTime = null;
  }
  getSeckillList(searchForm.value)
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

onMounted(() => {
  init();
});
</script>

<style lang="scss" scoped>
.link-text {
  color: #409eff;
  cursor: pointer;
  text-decoration: none;
  margin-right: 5px;
}
.op-split {
  margin: 0 8px;
  color: #dcdee2;
}
.mt_10 {
  margin-top: 10px;
}
</style>
